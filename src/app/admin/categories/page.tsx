"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { AdminCategory } from "@/lib/types";
import { toast } from "@/store/ui";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const maybeWithMessage = error as Record<string, unknown>;
    const msg = maybeWithMessage["message"];
    if (typeof msg === "string") return msg;
  }

  return "Falha inesperada";
}

function hasSortOrder(value: AdminCategory["sortOrder"]): value is number {
  return value !== null && value !== undefined;
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [confirmDisable, setConfirmDisable] = useState<AdminCategory | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.admin.categoriesList();
      setRows(data);
    } catch (e: unknown) {
      toast.error("Categorias", getErrorMessage(e));
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
    setSortOrder("");
    setIsActive(true);
    setOpen(true);
  }

  function startEdit(r: AdminCategory) {
    setEditing(r);
    setName(r.name);
    setSortOrder(hasSortOrder(r.sortOrder) ? String(r.sortOrder) : "");
    setIsActive(r.isActive);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Validação", "Nome é obrigatório.");
      return;
    }

    const sortOrderTrimmed = sortOrder.trim();
    const soValue = sortOrderTrimmed ? Number(sortOrderTrimmed) : null;

    if (soValue !== null && (!Number.isFinite(soValue) || soValue < 0)) {
      toast.error("Validação", "Ordem inválida.");
      return;
    }

    try {
      if (editing) {
        await api.admin.categoriesUpdate(editing.id, {
          name: name.trim(),
          sortOrder: soValue ?? undefined,
          isActive,
        });
        toast.success("Categorias", "Atualizada.");
      } else {
        await api.admin.categoriesCreate({
          name: name.trim(),
          sortOrder: soValue ?? undefined,
          isActive,
        });
        toast.success("Categorias", "Criada.");
      }

      setOpen(false);
      await load();
    } catch (e: unknown) {
      toast.error("Categorias", getErrorMessage(e));
    }
  }

  async function disableConfirmed() {
    if (!confirmDisable) return;

    try {
      await api.admin.categoriesDelete(confirmDisable.id);
      toast.success("Categorias", "Desativada.");
      setConfirmDisable(null);
      await load();
    } catch (e: unknown) {
      toast.error("Categorias", getErrorMessage(e));
    }
  }

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="py-10 flex justify-center">
        <Spinner />
      </div>
    );
  } else if (filtered.length === 0) {
    content = <Card className="p-4 text-sm text-zinc-500">Nenhum registro.</Card>;
  } else {
    content = (
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-zinc-100">
          {filtered.map((r) => {
            const statusText = r.isActive ? "Ativa" : "Inativa";
            const orderText = hasSortOrder(r.sortOrder) ? ` • ordem: ${r.sortOrder}` : "";
            const metaText = `${statusText}${orderText}`;

            return (
              <div key={r.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-xs text-zinc-500">{metaText}</div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => startEdit(r)}>
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirmDisable(r)}
                    disabled={!r.isActive}
                  >
                    Desativar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <Input
          label="Buscar"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex: Bebidas"
        />
        <div className="pb-1">
          <Button onClick={startCreate}>Nova categoria</Button>
        </div>
      </div>

      {content}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
      >
        <div className="space-y-3">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Ordem (opcional)"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="Ex: 10"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Ativa</span>
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
        title="Desativar categoria?"
        description="Produtos continuarão existindo, mas a categoria não aparecerá no menu."
        confirmText="Desativar"
        danger
        onCancel={() => setConfirmDisable(null)}
        onConfirm={disableConfirmed}
      />
    </div>
  );
}
