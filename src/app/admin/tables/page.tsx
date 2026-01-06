"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { AdminTable } from "@/lib/types";
import { toast } from "@/store/ui";

export default function AdminTablesPage() {
  const [rows, setRows] = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTable | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [confirmDisable, setConfirmDisable] = useState<AdminTable | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.admin.tablesList();
      setRows(data);
    } catch (e: any) {
      toast.error("Mesas", e?.message ?? "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(qq));
  }, [rows, q]);

  function startCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setOpen(true);
  }

  function startEdit(r: AdminTable) {
    setEditing(r);
    setName(r.name);
    setDescription(r.description ?? "");
    setIsActive(r.isActive);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Validação", "Nome/número é obrigatório.");
      return;
    }

    try {
      if (!editing) {
        await api.admin.tablesCreate({
          name: name.trim(),
          description: description.trim() ? description.trim() : undefined,
          isActive
        });
        toast.success("Mesas", "Criada.");
      } else {
        await api.admin.tablesUpdate(editing.id, {
          name: name.trim(),
          description: description.trim() ? description.trim() : "",
          isActive
        });
        toast.success("Mesas", "Atualizada.");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error("Mesas", e?.message ?? "Falha ao salvar");
    }
  }

  async function disableConfirmed() {
    if (!confirmDisable) return;
    try {
      await api.admin.tablesDelete(confirmDisable.id);
      toast.success("Mesas", "Desativada.");
      setConfirmDisable(null);
      await load();
    } catch (e: any) {
      toast.error("Mesas", e?.message ?? "Falha ao desativar");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <Input label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: 10" />
        <div className="pb-1">
          <Button onClick={startCreate}>Nova mesa</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-4 text-sm text-zinc-500">Nenhum registro.</Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {filtered.map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">Mesa {r.name}</div>
                  <div className="text-xs text-zinc-500">
                    {r.isActive ? "Ativa" : "Inativa"} {r.description ? `• ${r.description}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => startEdit(r)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setConfirmDisable(r)} disabled={!r.isActive}>
                    Desativar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar mesa" : "Nova mesa"}>
        <div className="space-y-3">
          <Input label="Nome/Número" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: casal de jovens" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
            Ativa
          </label>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} full>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDisable}
        title="Desativar mesa?"
        description="A mesa não aparecerá no operacional."
        confirmText="Desativar"
        danger
        onCancel={() => setConfirmDisable(null)}
        onConfirm={disableConfirmed}
      />
    </div>
  );
}
