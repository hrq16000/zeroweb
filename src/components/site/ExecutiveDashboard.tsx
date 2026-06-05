import { useEffect, useState } from "react";
import {
  getDashboardKpis,
  getPagesAnalysis,
  getAttribution,
  getAbAnalysis,
  getWaFunnel,
  getLeads,
  updateLeadStatus,
  getAlerts,
  exportData,
} from "@/lib/dashboard.functions";
import * as XLSX from "xlsx";

type Tab = "overview" | "pages" | "attribution" | "ab" | "wa" | "leads" | "roi" | "alerts" | "export";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "pages", label: "Páginas" },
  { id: "attribution", label: "Atribuição" },
  { id: "ab", label: "A/B Hero × CTA" },
  { id: "wa", label: "Funil WhatsApp" },
  { id: "leads", label: "Leads" },
  { id: "roi", label: "ROI" },
  { id: "alerts", label: "Alertas" },
  { id: "export", label: "Exportar" },
];

const RANGES = [
  { v: 7, label: "7d" },
  { v: 30, label: "30d" },
  { v: 90, label: "90d" },
  { v: 365, label: "12m" },
];

export function ExecutiveDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState(30);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              tab === t.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-xs">
          <span className="text-muted-foreground mr-1">Período:</span>
          {RANGES.map((r) => (
            <button
              key={r.v}
              onClick={() => setDays(r.v)}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                days === r.v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab days={days} />}
        {tab === "pages" && <PagesTab days={days} />}
        {tab === "attribution" && <AttributionTab days={days} />}
        {tab === "ab" && <AbTab days={days} />}
        {tab === "wa" && <WaTab days={days} />}
        {tab === "leads" && <LeadsTab days={days} />}
        {tab === "roi" && <RoiTab days={days} />}
        {tab === "alerts" && <AlertsTab />}
        {tab === "export" && <ExportTab days={days} />}
      </div>
    </div>
  );
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | null; loading: boolean; error: string | null } {
  const [s, setS] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });
  useEffect(() => {
    let cancelled = false;
    setS((x) => ({ ...x, loading: true, error: null }));
    fn()
      .then((d) => !cancelled && setS({ data: d, loading: false, error: null }))
      .catch((e) => !cancelled && setS({ data: null, loading: false, error: String(e?.message ?? e) }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}

function Loading() {
  return <div className="text-sm text-muted-foreground py-8">Carregando…</div>;
}
function ErrorBox({ msg }: { msg: string }) {
  return <div className="text-sm text-red-600 py-8">Erro: {msg}</div>;
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold font-display tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function OverviewTab({ days }: { days: number }) {
  const { data, loading, error } = useAsync(() => getDashboardKpis({ data: { days } }), [days]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  if (!data) return null;
  const k = data.kpis;
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <Kpi label="Visitantes únicos" value={k.visitors} />
        <Kpi label="Sessões" value={k.sessions} />
        <Kpi label="Leads" value={k.leads} />
        <Kpi label="Conversões" value={k.conversions} hint="form + funil concluído" />
        <Kpi label="Taxa de conversão" value={`${k.conversion_rate_pct}%`} />
        <Kpi label="Cliques WhatsApp" value={k.whatsapp_clicks} />
        <Kpi label="Cliques CTA" value={k.cta_clicks} />
        <Kpi label="Formulários" value={k.form_submits} />
        <Kpi label="Funil WA iniciado" value={k.wa_funnel_started} />
        <Kpi label="Funil WA concluído" value={k.wa_funnel_completed} />
        <Kpi label="Tempo médio" value={`${k.avg_session_seconds}s`} />
        <Kpi label="Páginas / sessão" value={k.pages_per_session} />
      </div>
    </div>
  );
}

function PagesTab({ days }: { days: number }) {
  const { data, loading, error } = useAsync(() => getPagesAnalysis({ data: { days } }), [days]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  const rows = data?.rows ?? [];
  const topConv = [...rows].sort((a, b) => b.conversions - a.conversions).slice(0, 10);
  const topRate = [...rows].filter((r) => r.visitors >= 5).sort((a, b) => b.conversion_rate_pct - a.conversion_rate_pct).slice(0, 10);
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <PageTable title="Mais visitadas" rows={rows.slice(0, 15)} />
      <PageTable title="Mais convertidas" rows={topConv} />
      <PageTable title="Melhor taxa de conversão (≥5 visitas)" rows={topRate} />
      <PageTable title="Maior engajamento (scroll 75%+)" rows={[...rows].sort((a, b) => b.engagement - a.engagement).slice(0, 15)} />
    </div>
  );
}

function PageTable({ title, rows }: { title: string; rows: { path: string; visitors: number; conversions: number; conversion_rate_pct: number; engagement: number }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold font-display">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Página</th>
              <th className="py-2 text-right">Visitas</th>
              <th className="py-2 text-right">Conv.</th>
              <th className="py-2 text-right">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-muted-foreground">Sem dados.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.path} className="border-t border-border">
                <td className="py-2 truncate max-w-[16rem] font-mono text-xs">{r.path}</td>
                <td className="py-2 text-right tabular-nums">{r.visitors}</td>
                <td className="py-2 text-right tabular-nums">{r.conversions}</td>
                <td className="py-2 text-right tabular-nums">{r.conversion_rate_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttributionTab({ days }: { days: number }) {
  const { data, loading, error } = useAsync(() => getAttribution({ data: { days } }), [days]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  if (!data) return null;
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <AttrTable title="Por origem (utm_source / first-touch)" rows={data.bySource} />
      <AttrTable title="Por campanha (utm_campaign)" rows={data.byCampaign} />
      <AttrTable title="Por meio (utm_medium)" rows={data.byMedium} />
      <AttrTable title="Por referenciador" rows={data.byReferrer} />
    </div>
  );
}

function AttrTable({ title, rows }: { title: string; rows: { key: string; sessions: number; leads: number; conversion_rate_pct: number }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold font-display">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Chave</th>
              <th className="py-2 text-right">Sessões</th>
              <th className="py-2 text-right">Leads</th>
              <th className="py-2 text-right">Conv.</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 15).map((r) => (
              <tr key={r.key} className="border-t border-border">
                <td className="py-2 truncate max-w-[14rem] font-mono text-xs">{r.key}</td>
                <td className="py-2 text-right tabular-nums">{r.sessions}</td>
                <td className="py-2 text-right tabular-nums">{r.leads}</td>
                <td className="py-2 text-right tabular-nums">{r.conversion_rate_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbTab({ days }: { days: number }) {
  const { data, loading, error } = useAsync(() => getAbAnalysis({ data: { days } }), [days]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  if (!data) return null;
  const w = data.winner;
  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Kpi label="Vencedor (taxa)" value={w?.key ?? "—"} />
        <Kpi label="Conversão vencedor" value={`${w?.rate_pct ?? 0}%`} />
        <Kpi
          label="Confiança estatística"
          value={data.significance_confidence !== null ? `${(data.significance_confidence * 100).toFixed(1)}%` : "—"}
          hint="z-test vs 2º melhor"
        />
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Combinação</th>
              <th className="py-2 text-right">Impressões</th>
              <th className="py-2 text-right">CTA</th>
              <th className="py-2 text-right">WhatsApp</th>
              <th className="py-2 text-right">Form</th>
              <th className="py-2 text-right">Conv.</th>
              <th className="py-2 text-right">Taxa</th>
            </tr>
          </thead>
          <tbody>
            {data.variants.map((v, i) => (
              <tr key={v.key} className={`border-t border-border ${i === 0 ? "bg-emerald-500/5" : ""}`}>
                <td className="py-2 font-mono text-xs">{v.key}{i === 0 && <span className="ml-2 rounded-full bg-emerald-500 text-white text-[10px] px-2 py-0.5">TOP</span>}</td>
                <td className="py-2 text-right tabular-nums">{v.impressions}</td>
                <td className="py-2 text-right tabular-nums">{v.cta}</td>
                <td className="py-2 text-right tabular-nums">{v.wa}</td>
                <td className="py-2 text-right tabular-nums">{v.form}</td>
                <td className="py-2 text-right tabular-nums">{v.conversions}</td>
                <td className="py-2 text-right tabular-nums font-semibold">{v.rate_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WaTab({ days }: { days: number }) {
  const { data, loading, error } = useAsync(() => getWaFunnel({ data: { days } }), [days]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  if (!data) return null;
  return (
    <div>
      <div className="grid sm:grid-cols-4 gap-3">
        <Kpi label="Sessões" value={data.total} />
        <Kpi label="Concluídas" value={data.completed} />
        <Kpi label="Taxa conclusão" value={`${data.completion_rate_pct}%`} />
        <Kpi label="Tempo médio" value={`${data.avg_completion_seconds}s`} />
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold font-display">Funil por passo</h3>
        <div className="mt-3 space-y-2">
          {data.steps.map((s) => (
            <div key={s.step} className="flex items-center gap-3 text-sm">
              <div className="w-20 text-muted-foreground">Passo {s.step}</div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(s.reached / Math.max(1, data.steps[0].reached)) * 100}%` }} />
              </div>
              <div className="w-20 text-right tabular-nums">{s.reached}</div>
              <div className="w-20 text-right tabular-nums text-red-600">-{s.drop_pct}%</div>
            </div>
          ))}
        </div>
        {data.critical_step && (
          <div className="mt-4 text-xs text-muted-foreground">
            Passo crítico: <strong className="text-red-600">passo {data.critical_step.step}</strong> ({data.critical_step.drop_pct}% de abandono)
          </div>
        )}
      </div>
    </div>
  );
}

function LeadsTab({ days }: { days: number }) {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useAsync(() => getLeads({ data: { days } }), [days, reload]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  if (!data) return null;
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(data.byStatus).map(([k, v]) => (
          <Kpi key={k} label={k} value={v as number} />
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Data</th>
              <th className="py-2">Nome</th>
              <th className="py-2">Contato</th>
              <th className="py-2">Origem</th>
              <th className="py-2">Campanha</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 && <tr><td colSpan={6} className="py-6 text-muted-foreground">Nenhum lead no período.</td></tr>}
            {data.rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="py-2">{r.name ?? "—"}</td>
                <td className="py-2 font-mono text-xs">{r.email ?? r.phone ?? "—"}</td>
                <td className="py-2 text-xs">{r.utm_source ?? r.source ?? "—"}</td>
                <td className="py-2 text-xs">{r.utm_campaign ?? "—"}</td>
                <td className="py-2">
                  <select
                    value={r.status}
                    onChange={async (e) => {
                      await updateLeadStatus({ data: { id: r.id, status: e.target.value as "new" } });
                      setReload((x) => x + 1);
                    }}
                    className="text-xs rounded border border-border bg-background px-2 py-1"
                  >
                    {["new", "contacted", "qualified", "won", "lost"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">PII mascarado em tela. Exporte para dados completos (use a aba Exportar).</p>
    </div>
  );
}

function RoiTab({ days }: { days: number }) {
  const { data } = useAsync(() => getDashboardKpis({ data: { days } }), [days]);
  const [investment, setInvestment] = useState(() => +(localStorage.getItem("0web_roi_invest") || "0"));
  const [revenue, setRevenue] = useState(() => +(localStorage.getItem("0web_roi_revenue") || "0"));
  const [sales, setSales] = useState(() => +(localStorage.getItem("0web_roi_sales") || "0"));
  useEffect(() => {
    localStorage.setItem("0web_roi_invest", String(investment));
    localStorage.setItem("0web_roi_revenue", String(revenue));
    localStorage.setItem("0web_roi_sales", String(sales));
  }, [investment, revenue, sales]);
  const leads = data?.kpis.leads ?? 0;
  const cac = sales > 0 ? investment / sales : 0;
  const cpl = leads > 0 ? investment / leads : 0;
  const ticket = sales > 0 ? revenue / sales : 0;
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0;
  const roas = investment > 0 ? revenue / investment : 0;
  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-5 grid sm:grid-cols-3 gap-3">
        <NumberField label="Investimento (R$)" value={investment} onChange={setInvestment} />
        <NumberField label="Vendas (qtd)" value={sales} onChange={setSales} />
        <NumberField label="Receita (R$)" value={revenue} onChange={setRevenue} />
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi label="Leads (período)" value={leads} />
        <Kpi label="CPL" value={`R$ ${cpl.toFixed(2)}`} />
        <Kpi label="CAC" value={`R$ ${cac.toFixed(2)}`} />
        <Kpi label="Ticket médio" value={`R$ ${ticket.toFixed(2)}`} />
        <Kpi label="ROI" value={`${roi.toFixed(1)}%`} />
        <Kpi label="ROAS" value={`${roas.toFixed(2)}x`} />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function AlertsTab() {
  const { data, loading, error } = useAsync(() => getAlerts(), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox msg={error} />;
  return (
    <div className="space-y-2">
      {(data?.alerts ?? []).map((a, i) => (
        <div
          key={i}
          className={`rounded-xl border p-3 text-sm ${
            a.level === "error"
              ? "border-red-500/30 bg-red-500/5 text-red-700"
              : a.level === "warn"
              ? "border-amber-500/30 bg-amber-500/5 text-amber-800"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          <span className="font-mono text-[10px] uppercase mr-2">{a.level}</span>
          <span className="font-mono text-[10px] mr-2">{a.code}</span>
          {a.message}
        </div>
      ))}
    </div>
  );
}

function ExportTab({ days }: { days: number }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [mask, setMask] = useState(true);

  const run = async (dataset: "leads" | "events" | "wa_sessions" | "experiments", fmt: "csv" | "xlsx" | "json") => {
    setBusy(`${dataset}-${fmt}`);
    try {
      const { rows } = await exportData({ data: { dataset, days, mask } });
      if (rows.length === 0) {
        alert("Sem dados no período.");
        return;
      }
      const filename = `0web-${dataset}-${days}d.${fmt}`;
      if (fmt === "json") {
        download(filename, JSON.stringify(rows, null, 2), "application/json");
      } else if (fmt === "csv") {
        const headers = Object.keys(rows[0]);
        const csv = [
          headers.join(","),
          ...rows.map((r: Record<string, unknown>) =>
            headers
              .map((h) => {
                const v = r[h];
                if (v == null) return "";
                const s = typeof v === "object" ? JSON.stringify(v) : String(v);
                return `"${s.replace(/"/g, '""')}"`;
              })
              .join(",")
          ),
        ].join("\n");
        download(filename, csv, "text/csv");
      } else {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, dataset);
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        download(filename, new Blob([buf]), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={mask} onChange={(e) => setMask(e.target.checked)} />
        Mascarar PII (nome / email / telefone)
      </label>
      {(["leads", "events", "wa_sessions", "experiments"] as const).map((ds) => (
        <div key={ds} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 flex-wrap">
          <div className="font-semibold flex-1">{ds}</div>
          {(["csv", "xlsx", "json"] as const).map((f) => (
            <button
              key={f}
              disabled={busy === `${ds}-${f}`}
              onClick={() => run(ds, f)}
              className="rounded-full bg-foreground text-background px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {busy === `${ds}-${f}` ? "..." : f.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function download(filename: string, content: string | Blob, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
