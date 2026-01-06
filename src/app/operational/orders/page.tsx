"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api";
import type { MenuCategory, OperationalWaiter, OverviewRow } from "@/lib/types";
import { useOperationalStore } from "@/store/operational";
import { toast } from "@/store/ui";
import { formatBRL } from "@/lib/format";

type Cart = Record<string, number>; // productId -> qty

export default function OperationalOrdersPage() {
  const {
    operationalWaiterId,
    operationalWaiterName,
    setOperationalWaiter,
    clearOperationalWaiter
  } = useOperationalStore();

  const [waiters, setWaiters] = useState<OperationalWaiter[]>([]);
  const [waitersLoading, setWaitersLoading] = useState(false);

  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [overviewRows, setOverviewRows] = useState<OverviewRow[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart>({});

  const [selectWaiterOpen, setSelectWaiterOpen] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sending, setSending] = useState(false);

  // waiter selection gate
  useEffect(() => {
    if (!operationalWaiterId) setSelectWaiterOpen(true);
  }, [operationalWaiterId]);

  async function loadWaiters() {
    setWaitersLoading(true);
    try {
      const data = await api.operational.waiters();
      setWaiters(data);
    } catch (e: any) {
      toast.error("Garçons", e?.message ?? "Falha ao carregar garçons");
    } finally {
      setWaitersLoading(false);
    }
  }

  async function loadMenu() {
    setMenuLoading(true);
    try {
      const data = await api.operational.menu();
      setMenu(data);
      setActiveCategoryId(data[0]?.id ?? null);
    } catch (e: any) {
      toast.error("Menu", e?.message ?? "Falha ao carregar menu");
    } finally {
      setMenuLoading(false);
    }
  }

  async function loadTablesFromOverview() {
    setTablesLoading(true);
    try {
      const rows = await api.operational.overview();
      setOverviewRows(rows);
      // se não selecionou mesa ainda, tenta default
      if (!selectedTableId && rows[0]?.table?.id) setSelectedTableId(rows[0].table.id);
    } catch (e: any) {
      toast.error("Mesas", e?.message ?? "Falha ao carregar mesas");
    } finally {
      setTablesLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
    loadTablesFromOverview();
  }, []);

  useEffect(() => {
    if (selectWaiterOpen) loadWaiters();
  }, [selectWaiterOpen]);

  const tablesOptions = useMemo(() => {
    return overviewRows.map((r) => ({
      value: r.table.id,
      label: `Mesa ${r.table.name}${r.comandaOpen?.id ? " (aberta)" : ""}`
    }));
  }, [overviewRows]);

  const activeCategory = useMemo(() => {
    return menu.find((c) => c.id === activeCategoryId) ?? null;
  }, [menu, activeCategoryId]);

  const visibleProducts = useMemo(() => {
    const products = (activeCategory?.products ?? []).slice();
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [activeCategory, search]);

  const cartItems = useMemo(() => {
    const map = new Map<string, { name: string; price: string }>();
    for (const c of menu) for (const p of c.products) map.set(p.id, { name: p.name, price: p.price });

    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const p = map.get(productId);
        return {
          productId,
          qty,
          name: p?.name ?? "Produto",
          price: p?.price ?? "0"
        };
      });

    const total = items.reduce((acc, it) => acc + Number(it.price) * it.qty, 0);

    return { items, total: total.toFixed(2) };
  }, [cart, menu]);

  function inc(productId: string) {
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  }
  function dec(productId: string) {
    setCart((c) => {
      const next = Math.max(0, (c[productId] ?? 0) - 1);
      return { ...c, [productId]: next };
    });
  }

  function clearOrderForm() {
    setCart({});
    setNote("");
    setSearch("");
  }

  async function sendOrder() {
    if (!operationalWaiterId) {
      setSelectWaiterOpen(true);
      return;
    }
    if (!selectedTableId) {
      toast.error("Pedido", "Selecione uma mesa.");
      return;
    }
    if (cartItems.items.length === 0) {
      toast.error("Pedido", "Selecione pelo menos 1 item.");
      return;
    }

    setSending(true);
    try {
      await api.operational.createOrder(selectedTableId, {
        operationalWaiterId,
        note: note.trim() ? note.trim() : undefined,
        items: cartItems.items.map((it) => ({ productId: it.productId, quantity: it.qty }))
      });

      toast.success("Pedido", "Pedido enviado para a cozinha.");
      clearOrderForm();
      setConfirmSend(false);
      await loadTablesFromOverview();
    } catch (e: any) {
      toast.error("Pedido", e?.message ?? "Falha ao enviar pedido");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pedidos</h2>
        <p className="text-xs text-zinc-500">
          {operationalWaiterName ? (
            <>
              Garçom: <span className="font-medium">{operationalWaiterName}</span>{" "}
              <button
                className="underline ml-1"
                onClick={() => setSelectWaiterOpen(true)}
              >
                Trocar
              </button>
            </>
          ) : (
            "Selecione o garçom operacional para começar."
          )}
        </p>
      </div>

      <Card className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Mesa</div>
          <Button variant="ghost" onClick={loadTablesFromOverview}>
            Atualizar
          </Button>
        </div>

        {tablesLoading ? (
          <div className="py-4 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Select
            label="Selecione a mesa"
            value={selectedTableId}
            onChange={(v) => setSelectedTableId(v)}
            options={tablesOptions}
          />
        )}
      </Card>

      <Card className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Menu</div>
          <Button variant="ghost" onClick={loadMenu}>
            Recarregar
          </Button>
        </div>

        {menuLoading ? (
          <div className="py-6 flex justify-center">
            <Spinner />
          </div>
        ) : menu.length === 0 ? (
          <div className="text-sm text-zinc-500">Sem categorias/produtos ativos.</div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menu.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategoryId(c.id)}
                  className={
                    "shrink-0 px-3 py-2 rounded-xl border text-sm " +
                    (c.id === activeCategoryId
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 border-zinc-200")
                  }
                >
                  {c.name}
                </button>
              ))}
            </div>

            <Input
              label="Buscar produto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite para filtrar"
            />

            <div className="grid grid-cols-1 gap-2">
              {visibleProducts.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <div key={p.id} className="border border-zinc-100 rounded-2xl p-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.name}</div>
                        {p.description ? (
                          <div className="text-xs text-zinc-500 line-clamp-2 mt-1">{p.description}</div>
                        ) : null}
                        <div className="text-sm mt-2 font-medium">{formatBRL(p.price)}</div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {qty > 0 ? <Badge>{qty}</Badge> : <Badge variant="muted">0</Badge>}
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => dec(p.id)}>
                            −
                          </Button>
                          <Button variant="primary" onClick={() => inc(p.id)}>
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card className="p-3 space-y-3">
        <div className="text-sm font-semibold">Resumo</div>
        {cartItems.items.length === 0 ? (
          <div className="text-sm text-zinc-500">Nenhum item selecionado.</div>
        ) : (
          <div className="space-y-1">
            {cartItems.items.map((it) => (
              <div key={it.productId} className="flex items-center justify-between text-sm">
                <div className="truncate">
                  {it.qty}x {it.name}
                </div>
                <div className="text-zinc-600">{formatBRL((Number(it.price) * it.qty).toFixed(2))}</div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-zinc-100 flex items-center justify-between">
              <div className="text-sm text-zinc-500">Total</div>
              <div className="text-sm font-semibold">{formatBRL(cartItems.total)}</div>
            </div>
          </div>
        )}

        <Input
          label="Observação (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: sem cebola"
        />

        <div className="flex gap-2">
          <Button variant="ghost" onClick={clearOrderForm} disabled={sending}>
            Limpar
          </Button>
          <Button
            full
            variant="primary"
            onClick={() => setConfirmSend(true)}
            disabled={sending || cartItems.items.length === 0}
          >
            {sending ? "Enviando…" : "Enviar pedido"}
          </Button>
        </div>
      </Card>

      {/* Modal obrigatório de seleção de garçom operacional */}
      <Modal
        open={selectWaiterOpen}
        onClose={() => (operationalWaiterId ? setSelectWaiterOpen(false) : null)}
        title="Selecione o garçom operacional"
        locked={!operationalWaiterId}
      >
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">
            Para lançar pedidos, selecione quem é o garçom (cadastro operacional).
          </p>

          {waitersLoading ? (
            <div className="py-6 flex justify-center">
              <Spinner />
            </div>
          ) : waiters.length === 0 ? (
            <Card className="p-3 text-sm text-zinc-500">
              Nenhum garçom ativo cadastrado. Peça ao gerente para cadastrar em Admin.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {waiters.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setOperationalWaiter(w.id, w.name);
                    toast.success("Garçom", `Selecionado: ${w.name}`);
                    setSelectWaiterOpen(false);
                  }}
                  className="text-left border border-zinc-100 rounded-2xl p-3 bg-white hover:bg-zinc-50"
                >
                  <div className="font-semibold">{w.name}</div>
                  <div className="text-xs text-zinc-500">{w.id}</div>
                </button>
              ))}
            </div>
          )}

          {operationalWaiterId ? (
            <div className="flex justify-between gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  clearOperationalWaiter();
                  toast.info("Garçom", "Seleção removida.");
                }}
              >
                Limpar seleção
              </Button>
              <Button variant="primary" onClick={() => setSelectWaiterOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmSend}
        title="Enviar pedido?"
        description="O pedido será enviado para a cozinha e entrará na fila de impressão."
        confirmText={sending ? "Enviando…" : "Confirmar"}
        onCancel={() => setConfirmSend(false)}
        onConfirm={sendOrder}
        disabled={sending}
      />
    </div>
  );
}
