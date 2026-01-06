"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { toast } from "@/store/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type MetricsSummary = {
  revenue: string | number;
  ticketAverage: string | number;
  comandas: {
    open: number;
    closed: number;
  };
};

type MetricsTopProduct = {
  productId?: string;
  name: string;
  revenue: string | number;
};

type MetricsByHour = {
  hour: string | number;
  ordersCount: number;
  revenue?: string | number;
};

type MetricsByWaiter = {
  waiterId: string;
  name: string;
  revenue: string | number;
  ordersCount: number;
};

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;

  if (err && typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return fallback;
}

export default function AdminDashboardPage() {
  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [topProducts, setTopProducts] = useState<MetricsTopProduct[]>([]);
  const [byHour, setByHour] = useState<MetricsByHour[]>([]);
  const [byWaiter, setByWaiter] = useState<MetricsByWaiter[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [s, tp, bh, bw] = await Promise.all([
        api.admin.metricsSummary(from, to),
        api.admin.metricsTopProducts(from, to),
        api.admin.metricsByHour(from, to),
        api.admin.metricsByWaiter(from, to)
      ]);

      // Se suas funções do api já retornam tipado, esses "as" não fazem diferença.
      // Se retornam unknown, eles evitam erro de atribuição nos setStates.
      setSummary(s as MetricsSummary);
      setTopProducts(tp as MetricsTopProduct[]);
      setByHour(bh as MetricsByHour[]);
      setByWaiter(bw as MetricsByWaiter[]);
    } catch (e) {
      toast.error("Dashboard", getErrorMessage(e, "Falha ao carregar métricas"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revenue = useMemo(() => summary?.revenue ?? "0", [summary]);
  const ticketAverage = useMemo(() => summary?.ticketAverage ?? "0", [summary]);
  const openCount = useMemo(() => summary?.comandas?.open ?? 0, [summary]);
  const closedCount = useMemo(() => summary?.comandas?.closed ?? 0, [summary]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <Input label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Input label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="pb-1">
          <button
            onClick={load}
            className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-sm font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="text-xs text-zinc-500">Faturamento</div>
              <div className="text-lg font-semibold mt-1">{formatBRL(revenue)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-zinc-500">Ticket médio</div>
              <div className="text-lg font-semibold mt-1">{formatBRL(ticketAverage)}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-zinc-500">Comandas abertas</div>
              <div className="text-lg font-semibold mt-1">{openCount}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-zinc-500">Comandas fechadas</div>
              <div className="text-lg font-semibold mt-1">{closedCount}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-sm font-semibold">Pedidos por hora</div>
              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={(v) => new Date(v).getHours().toString().padStart(2, "0") + "h"}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const key = String(name);
                        if (key === "revenue") return [formatBRL(String(value)), "revenue"];
                        return [value, key];
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleString("pt-BR")}
                    />
                    <Line type="monotone" dataKey="ordersCount" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-3">
              <div className="text-sm font-semibold">Top produtos (receita)</div>
              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => {
                        const key = String(name);
                        if (key === "revenue") return [formatBRL(String(value)), "revenue"];
                        return [value, key];
                      }}
                    />
                    <Bar dataKey="revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-zinc-500">Mostrando até 8 itens (mobile).</div>
            </Card>

            <Card className="p-3 md:col-span-2">
              <div className="text-sm font-semibold">Desempenho por garçom (receita)</div>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byWaiter.slice(0, 12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatBRL(String(value)), "revenue"]}
                    />
                    <Bar dataKey="revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {byWaiter.slice(0, 6).map((w) => (
                  <div
                    key={w.waiterId}
                    className="border border-zinc-100 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{w.name}</div>
                      <div className="text-xs text-zinc-500">{w.ordersCount} pedidos</div>
                    </div>
                    <div className="font-semibold">{formatBRL(w.revenue)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
