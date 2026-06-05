import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Target, Flame, Snowflake, Thermometer } from "lucide-react";
import { getCampaignAnalytics } from "@/lib/campaigns.functions";

export const Route = createFileRoute("/_authenticated/app/campaigns")({
  component: CampaignsDashboard,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">Erro: {error.message}</div>
  ),
});

function CampaignsDashboard() {
  const fetchData = useServerFn(getCampaignAnalytics);
  const [data, setData] = useState<Awaited<ReturnType<typeof getCampaignAnalytics>> | null>(null);
  const [days, setDays] = useState(30);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchData({ data: { days } }).then(setData).catch((e: Error) => setErr(e.message));
  }, [fetchData, days]);

  if (err) return <div className="text-sm text-destructive">{err}</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Dashboard de Campanhas
          </h1>
          <p className="text-sm text-muted-foreground">Atribuição completa, score e funil por origem.</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="text-sm bg-card border border-border rounded-lg px-3 py-1.5">
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Leads" value={data.totals.leads} />
        <Kpi label="Eventos" value={data.totals.events} />
        <Kpi label="Gclid" value={data.totals.gclid} />
        <Kpi label="Fbclid" value={data.totals.fbclid} />
        <Kpi label="Conversões" value={data.totals.won} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Temp label="Frios" value={data.byTemperature.frio} icon={Snowflake} />
        <Temp label="Mornos" value={data.byTemperature.morno} icon={Thermometer} />
        <Temp label="Quentes" value={data.byTemperature.quente} icon={Flame} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Table title="Por origem (utm_source)" rows={data.bySource} />
        <Table title="Por campanha (utm_campaign)" rows={data.byCampaign} />
        <Table title="Por oferta" rows={data.byOffer} />
        <Table title="Por landing page" rows={data.byLanding} />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Ofertas ativas</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {data.offers.map((o) => (
            <div key={o.id} className="border border-border rounded-xl p-4 bg-card text-sm">
              <div className="font-semibold">{o.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{o.description}</div>
              <div className="mt-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{o.cta}</span>{" "}
                <span className="text-muted-foreground">→ {o.landing_page}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border rounded-xl p-3 bg-card">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}

function Temp({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Flame }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card flex items-center gap-3">
      <Icon className="w-5 h-5 text-primary" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

type Row = { key: string; count: number; won: number; conv: number; avgScore: number };
function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-2 text-xs font-semibold border-b border-border bg-muted/40">{title}</div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-2">Chave</th>
            <th className="text-right px-4 py-2">Leads</th>
            <th className="text-right px-4 py-2">Conv.</th>
            <th className="text-right px-4 py-2">%</th>
            <th className="text-right px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((r) => (
            <tr key={r.key} className="border-t border-border">
              <td className="px-4 py-2 truncate max-w-[200px]">{r.key}</td>
              <td className="px-4 py-2 text-right">{r.count}</td>
              <td className="px-4 py-2 text-right">{r.won}</td>
              <td className="px-4 py-2 text-right">{r.conv}%</td>
              <td className="px-4 py-2 text-right">{r.avgScore}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-xs text-muted-foreground">Sem dados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
