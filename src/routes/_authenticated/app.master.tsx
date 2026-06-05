import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Globe } from "lucide-react";
import { getMasterMetrics } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/app/master")({
  component: MasterDashboard,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Acesso negado ou erro: {error.message}</div>
  ),
});

function MasterDashboard() {
  const fetchMetrics = useServerFn(getMasterMetrics);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMasterMetrics>> | null>(null);
  const [days, setDays] = useState(30);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setErr(null);
    fetchMetrics({ data: { days } })
      .then((r) => setData(r))
      .catch((e: Error) => setErr(e.message));
  }, [fetchMetrics, days]);

  if (err) return <div className="text-sm text-destructive">{err}</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" /> Dashboard Master
          </h1>
          <p className="text-sm text-muted-foreground">Visão consolidada de todos os portais.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-sm bg-card border border-border rounded-lg px-3 py-1.5"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Leads totais" value={data.totals.leads} />
        <Kpi label="Conversões" value={data.totals.won} />
        <Kpi label="Eventos" value={data.totals.events} />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Portal</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-right px-4 py-2 font-medium">Leads</th>
              <th className="text-right px-4 py-2 font-medium">Ganho</th>
              <th className="text-right px-4 py-2 font-medium">Conv. %</th>
              <th className="text-right px-4 py-2 font-medium">Score Médio</th>
              <th className="text-right px-4 py-2 font-medium">Eventos</th>
            </tr>
          </thead>
          <tbody>
            {data.byPortal.map((r) => (
              <tr key={r.portal.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <div className="font-medium">{r.portal.name}</div>
                  <div className="text-xs text-muted-foreground">{r.portal.slug}</div>
                </td>
                <td className="px-4 py-2 text-xs">{r.portal.status}</td>
                <td className="px-4 py-2 text-right">{r.leads}</td>
                <td className="px-4 py-2 text-right">{r.won}</td>
                <td className="px-4 py-2 text-right">{r.conversionRate}%</td>
                <td className="px-4 py-2 text-right">{r.avgScore}</td>
                <td className="px-4 py-2 text-right">{r.events}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}
