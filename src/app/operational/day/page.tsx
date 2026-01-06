"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { DayComandaRow } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export default function OperationalDayPage() {
  const [rows, setRows] = useState<DayComandaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [q, setQ] = useState("");

  async function fetchDay() {
    setLoading(true);
    try {
      const data = await api.operational.dayComandas();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDay();
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (filter === "ALL" ? true : r.status === filter))
      .filter((r) => {
        const s = `${r.table.name}`.toLowerCase();
        return q.trim() ? s.includes(q.trim().toLowerCase()) : true;
      });
  }, [rows, filter, q]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Comandas do dia</h2>
          <p className="text-xs text-zinc-500">Abertas e fechadas</p>
        </div>
        <Button variant="ghost" onClick={fetchDay}>
          Atualizar
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "ALL" ? "primary" : "ghost"} onClick={() => setFilter("ALL")}>
          Todas
        </Button>
        <Button variant={filter === "OPEN" ? "primary" : "ghost"} onClick={() => setFilter("OPEN")}>
          Abertas
        </Button>
        <Button variant={filter === "CLOSED" ? "primary" : "ghost"} onClick={() => setFilter("CLOSED")}>
          Fechadas
        </Button>
      </div>

      <Input
        label="Buscar mesa"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ex: 1"
      />

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-4 text-sm text-zinc-500">Nada por aqui hoje.</Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Mesa {r.table.name}</div>
                {r.status === "OPEN" ? <Badge>Aberta</Badge> : <Badge variant="muted">Fechada</Badge>}
              </div>
              <div className="mt-2 text-sm flex items-center justify-between">
                <div className="text-zinc-500">Total</div>
                <div className="font-medium">{formatBRL(r.total)}</div>
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                {r.openedAt ? `Abertura: ${new Date(r.openedAt).toLocaleString("pt-BR")}` : ""}
                {r.closedAt ? ` • Fechamento: ${new Date(r.closedAt).toLocaleString("pt-BR")}` : ""}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
