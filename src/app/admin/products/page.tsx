"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { AdminCategory, AdminProduct } from "@/lib/types";
import { toast } from "@/store/ui";
import { formatBRL } from "@/lib/format";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [confirmDisable, setConfirmDisable] = useState<AdminProduct | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.admin.productsList(), api.admin.categoriesList()]);
      setRows(p);
      setCategories(c);
    } catch (e: any) {
      toast.error("Produtos", e?.message ?? "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categoryOptions = useMemo(() => {
    return categories
      .filter((c) => c.isActive)
      .map((c) => ({ value: c.id, label: c.name }));
  }, [categories]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(qq));
  }, [rows, q]);

  function startCreate() {
    setEditing(null);
    setCategoryId(categoryOptions[0]?.value ?? "");
    setName("");
    setDescription("");
    setPrice("0");
    setImageUrl("");
    setIsActive(true);
    setOpen(true);
  }

  function startEdit(r: AdminProduct) {
    setEditing(r);
    setCategoryId(r.categoryId);
    setName(r.name);
    setDescription(r.description ?? "");
    setPrice(String(r.price ?? "0"));
    setImageUrl(r.imageUrl ?? "");
    setIsActive(r.isActive);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Validação", "Nome é obrigatório.");
      return;
    }
    if (!categoryId) {
      toast.error("Validação", "Categoria é obrigatória.");
      return;
    }
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) {
      toast.error("Validação", "Preço inválido.");
      return;
    }

    try {
      if (!editing) {
        await api.admin.productsCreate({
          categoryId,
          name: name.trim(),
          description: description.trim() ? description.trim() : undefined,
          price: p,
          imageUrl: imageUrl.trim() ? imageUrl.trim() : undefined,
          isActive
        });
        toast.success("Produtos", "Criado.");
      } else {
        await api.admin.productsUpdate(editing.id, {
          categoryId,
          name: name.trim(),
          description: description.trim() ? description.trim() : "",
          price: p,
          imageUrl: imageUrl.trim() ? imageUrl.trim() : "",
          isActive
        });
        toast.success("Produtos", "Atualizado.");
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      toast.error("Produtos", e?.message ?? "Falha ao salvar");
    }
  }

  async function disableConfirmed() {
    if (!confirmDisable) return;
    try {
      await api.admin.productsDelete(confirmDisable.id);
      toast.success("Produtos", "Desativado.");
      setConfirmDisable(null);
      await load();
    } catch (e: any) {
      toast.error("Produtos", e?.message ?? "Falha ao desativar");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <Input label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: Hambúrguer" />
        <div className="pb-1">
          <Button onClick={startCreate}>Novo produto</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-4 text-sm text-zinc-500">Nenhum registro.</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-xs text-zinc-500">
                    {r.isActive ? "Ativo" : "Inativo"} • {formatBRL(String(r.price))}
                  </div>
                  {r.description ? <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{r.description}</div> : null}
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
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar produto" : "Novo produto"}>
        <div className="space-y-3">
          <Select
            label="Categoria"
            value={categoryId}
            onChange={(v) => setCategoryId(v)}
            options={categoryOptions}
          />
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Preço" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="Imagem URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

          {imageUrl.trim() ? (
            <div className="text-xs text-zinc-500">
              Preview (se a URL for válida, o Next pode carregar via imagens remotas).
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
            Ativo
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
        title="Desativar produto?"
        description="O produto não aparecerá no menu operacional."
        confirmText="Desativar"
        danger
        onCancel={() => setConfirmDisable(null)}
        onConfirm={disableConfirmed}
      />
    </div>
  );
}
