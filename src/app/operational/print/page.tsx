"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { PrintJob } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { toast } from "@/store/ui";
import { formatBRL } from "@/lib/format";

export default function OperationalPrintPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.operational.printPending();
      setJobs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useInterval(() => {
    fetchJobs();
  }, 4000);

  async function markPrinted(id: string) {
    try {
      await api.operational.printMarkPrinted(id);
      toast.success("Impressão", "Marcado como impresso.");
      await fetchJobs();
    } catch (e: any) {
      toast.error("Impressão", e?.message ?? "Falha ao marcar impresso");
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cozinha / Impressão</h2>
          <p className="text-xs text-zinc-500">Fila de pedidos pendentes</p>
        </div>
        <Button variant="ghost" onClick={fetchJobs}>
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-4 text-sm text-zinc-500">Nenhum pedido pendente.</Card>
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <Card key={j.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">
                      Mesa {j.payload?.table?.name ?? "—"}
                    </div>
                    <Badge>Pendente</Badge>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Garçom: {j.payload?.operationalWaiter?.name ?? "—"} •{" "}
                    {j.createdAt ? new Date(j.createdAt).toLocaleString("pt-BR") : ""}
                  </div>
                </div>
                <Button onClick={() => markPrinted(j.id)} variant="primary">
                  Marcar impresso
                </Button>
              </div>

              {j.payload?.note ? (
                <div className="mt-2 text-xs text-zinc-600">
                  Obs: <span className="font-medium">{j.payload.note}</span>
                </div>
              ) : null}

              <div className="mt-3 space-y-1">
                {(j.payload?.items ?? []).map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="truncate">
                      {it.quantity}x {it.name}
                    </div>
                    <div className="text-zinc-600">{formatBRL(String(it.subtotal ?? "0"))}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
