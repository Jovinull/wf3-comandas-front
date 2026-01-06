"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import type { ComandaDetail, OverviewRow } from "@/lib/types";
import { toast } from "@/store/ui";
import { useInterval } from "@/hooks/useInterval";

export default function OperationalOverviewPage() {
  const [rows, setRows] = useState<OverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OverviewRow | null>(null);

  const [detail, setDetail] = useState<ComandaDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await api.operational.overview();
      setRows(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Falha ao carregar overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // polling leve
  useInterval(() => {
    fetchOverview();
  }, 4000);

  const activeCount = useMemo(() => rows.filter((r) => !!r.comandaOpen).length, [rows]);

  async function openTable(row: OverviewRow) {
    setSelected(row);
    setOpen(true);
    setDetail(null);

    if (!row.comandaOpen?.id) return;

    setDetailLoading(true);
    try {
      const d = await api.operational.comandaDetail(row.comandaOpen.id);
      setDetail(d);
    } catch (e: any) {
      toast.error("Comanda", e?.message ?? "Falha ao carregar detalhes");
    } finally {
      setDetailLoading(false);
    }
  }

  async function closeComanda() {
    if (!selected?.comandaOpen?.id) return;

    setClosing(true);
    try {
      const res = await api.operational.closeComanda(selected.comandaOpen.id);
      toast.success("Comanda", `Comanda fechada. Total: ${formatBRL(res.totalAmount ?? "0")}`);
      setConfirmClose(false);
      setOpen(false);
      await fetchOverview();
    } catch (e: any) {
      toast.error("Fechar comanda", e?.message ?? "Falha ao fechar comanda");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Visão Geral</h2>
          <p className="text-xs text-zinc-500">
            Mesas ativas • {activeCount} comanda(s) aberta(s)
          </p>
        </div>
        <Button variant="ghost" onClick={fetchOverview}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <Card>
          <div className="text-sm text-red-600">{error}</div>
          <div className="mt-3">
            <Button onClick={fetchOverview}>Tentar novamente</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((r) => {
            const open = !!r.comandaOpen?.id;
            const total = r.comandaOpen?.partialTotal ?? "0";
            return (
              <button
                key={r.table.id}
                onClick={() => openTable(r)}
                className="text-left"
              >
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Mesa {r.table.name}</div>
                    {open ? <Badge>Aberta</Badge> : <Badge variant="muted">Livre</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {r.table.description ? r.table.description : "—"}
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-zinc-500">Total: </span>
                    <span className="font-medium">{formatBRL(total)}</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={selected ? `Mesa ${selected.table.name}` : "Mesa"}
      >
        {!selected ? null : (
          <div className="space-y-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Status</div>
                {selected.comandaOpen?.id ? <Badge>Comanda aberta</Badge> : <Badge variant="muted">Sem comanda</Badge>}
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {selected.table.description ? selected.table.description : "Sem descrição"}
              </div>
              <div className="mt-3 text-sm">
                <span className="text-zinc-500">Total parcial: </span>
                <span className="font-medium">{formatBRL(selected.comandaOpen?.partialTotal ?? "0")}</span>
              </div>
            </Card>

            {selected.comandaOpen?.id ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Itens</div>
                  <Button
                    variant="danger"
                    onClick={() => setConfirmClose(true)}
                    disabled={closing}
                  >
                    Fechar comanda
                  </Button>
                </div>

                {detailLoading ? (
                  <div className="py-8 flex justify-center">
                    <Spinner />
                  </div>
                ) : detail ? (
                  <Card className="p-3">
                    <div className="text-xs text-zinc-500 mb-2">
                      Comanda: {detail.comanda.id}
                    </div>

                    <div className="space-y-3">
                      {detail.orders.length === 0 ? (
                        <div className="text-sm text-zinc-500">Sem pedidos ainda.</div>
                      ) : (
                        detail.orders.map((o) => (
                          <div key={o.id} className="border border-zinc-100 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold">Pedido</div>
                              <div className="text-xs text-zinc-500">
                                {o.operationalWaiter?.name ? `Garçom: ${o.operationalWaiter.name}` : "—"}
                              </div>
                            </div>
                            {o.note ? (
                              <div className="mt-1 text-xs text-zinc-600">Obs: {o.note}</div>
                            ) : null}
                            <div className="mt-2 space-y-1">
                              {o.items.map((it) => (
                                <div key={it.id} className="flex items-center justify-between text-sm">
                                  <div className="truncate">
                                    {it.quantity}x {it.productName ?? "Produto"}
                                  </div>
                                  <div className="text-zinc-600">{formatBRL(it.subtotal)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-3 text-sm text-zinc-500">
                    Não foi possível carregar os detalhes.
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-3 text-sm text-zinc-500">
                Esta mesa está livre. Crie um pedido em <span className="font-medium">Pedidos</span> para abrir a comanda automaticamente.
              </Card>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmClose}
        title="Fechar comanda?"
        description="Isso fecha a comanda e bloqueia novos pedidos nessa mesa."
        confirmText={closing ? "Fechando…" : "Confirmar"}
        danger
        onCancel={() => setConfirmClose(false)}
        onConfirm={closeComanda}
        disabled={closing}
      />
    </div>
  );
}
