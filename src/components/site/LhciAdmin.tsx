// LHCI admin: trends + table + RBAC + JSON/HTML report download.
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  decideLhciRun, getLhciRun, lhciTrends, listLhciRuns,
} from "@/lib/lhci.functions";
import { CheckCircle2, XCircle, RefreshCcw, Activity, Download, FileText } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

type Row = {
  id: string; environment: string; url: string;
  performance: number | null; seo: number | null;
  lcp_ms: number | null; cls: number | null; tbt_ms: number | null;
  status: string; decision: string | null; decision_reason: string | null;
  created_at: string;
};

const pct = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}`);
const ms = (n: number | null) => (n == null ? "—" : `${Math.round(n)}ms`);

function statusBadge(s: string) {
  return s === "passed" ? "bg-emerald-500/15 text-emerald-700"
    : s === "failed" ? "bg-red-500/15 text-red-700"
    : s === "approved" ? "bg-blue-500/15 text-blue-700"
    : s === "rejected" ? "bg-red-500/15 text-red-700"
    : "bg-muted text-muted-foreground";
}

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function reportHtml(run: any) {
  const errs: string[] = (run?.logs?.errors ?? []) as string[];
  const warns: string[] = (run?.logs?.warnings ?? []) as string[];
  const li = (a: string[]) => a.map((e) => `<li>${e.replace(/</g, "&lt;")}</li>`).join("") || "<li>—</li>";
  return `<!doctype html><meta charset="utf-8"><title>SEO report ${run.id}</title>
<style>body{font:14px system-ui;padding:24px;max-width:880px;margin:auto}h1{font-size:20px}h2{margin-top:24px;font-size:16px}code{background:#f3f4f6;padding:2px 4px;border-radius:4px}.err{color:#b91c1c}.warn{color:#a16207}</style>
<h1>LHCI build ${run.id}</h1>
<p><strong>URL:</strong> ${run.url}<br><strong>Env:</strong> ${run.environment}<br><strong>Status:</strong> ${run.status} · ${run.decision ?? "sem decisão"}<br><strong>Quando:</strong> ${new Date(run.created_at).toLocaleString("pt-BR")}</p>
<p>Perf <strong>${pct(run.performance)}</strong> · SEO <strong>${pct(run.seo)}</strong> · LCP <strong>${ms(run.lcp_ms)}</strong> · CLS <strong>${run.cls ?? "—"}</strong> · TBT <strong>${ms(run.tbt_ms)}</strong></p>
<h2 class="err">Erros do validador SEO (${errs.length})</h2><ul>${li(errs)}</ul>
<h2 class="warn">Avisos (${warns.length})</h2><ul>${li(warns)}</ul>`;
}

export function LhciAdmin() {
  const list = useServerFn(listLhciRuns);
  const get = useServerFn(getLhciRun);
  const decide = useServerFn(decideLhciRun);
  const trends = useServerFn(lhciTrends);

  const [env, setEnv] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [canDecide, setCanDecide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [r, t] = await Promise.all([
        list({ data: { environment: env || undefined, limit: 30 } }),
        trends({ data: { environment: env || undefined, limit: 50 } }),
      ]);
      setRows((r.rows ?? []) as Row[]);
      setCanDecide(!!r.canDecide);
      setTrend(t.rows ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); /* eslint-disable-next-line */ }, [env]);

  const openDetail = async (id: string) => {
    setOpenId(id); setDetail(null);
    const r = await get({ data: { id } });
    setDetail(r.row);
  };

  const onDecide = async (id: string, d: "approved" | "rejected") => {
    if (!canDecide) return alert("Você não tem permissão para decidir builds.");
    const reason = window.prompt(d === "approved" ? "Motivo (opcional)" : "Motivo da reprovação") ?? "";
    if (d === "rejected" && !reason.trim()) return;
    await decide({ data: { id, decision: d, reason } });
    await refresh();
    if (openId === id) await openDetail(id);
  };

  const hasTrend = useMemo(() => trend.length > 1, [trend]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Lighthouse CI · builds & tendências
        </h3>
        <div className="flex items-center gap-2">
          <select value={env} onChange={(e) => setEnv(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-sm">
            <option value="">Todos</option><option value="dev">dev</option>
            <option value="staging">staging</option><option value="prod">prod</option>
          </select>
          <button onClick={refresh} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs">
            <RefreshCcw className="w-3 h-3" /> {loading ? "..." : "Atualizar"}
          </button>
        </div>
      </div>

      {!canDecide && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Modo somente leitura — apenas usuários <strong>admin</strong> podem aprovar/reprovar builds.
        </p>
      )}

      {/* Trends */}
      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <ChartCard title="Performance & SEO (%)">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="perf" stroke="hsl(var(--primary))" dot={false} name="Perf" />
                <Line type="monotone" dataKey="seo" stroke="#10b981" dot={false} name="SEO" />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>
        <ChartCard title="LCP (ms) & TBT (ms)">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="lcp" stroke="#ef4444" dot={false} name="LCP" />
                <Line type="monotone" dataKey="tbt" stroke="#8b5cf6" dot={false} name="TBT" />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>
        <ChartCard title="CLS">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="cls" stroke="#f59e0b" dot={false} name="CLS" />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 px-2">Quando</th><th className="py-2 px-2">Env</th>
              <th className="py-2 px-2">URL</th>
              <th className="py-2 px-2 text-right">Perf</th><th className="py-2 px-2 text-right">SEO</th>
              <th className="py-2 px-2 text-right">LCP</th><th className="py-2 px-2 text-right">CLS</th>
              <th className="py-2 px-2">Status</th><th className="py-2 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (<tr><td colSpan={9} className="py-4 text-center text-muted-foreground">Sem builds.</td></tr>)}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2 px-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="py-2 px-2"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.environment}</span></td>
                <td className="py-2 px-2 max-w-[16rem] truncate" title={r.url}>
                  <button className="hover:underline" onClick={() => openDetail(r.id)}>{r.url}</button>
                </td>
                <td className="py-2 px-2 text-right tabular-nums">{pct(r.performance)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{pct(r.seo)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{ms(r.lcp_ms)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{r.cls == null ? "—" : r.cls.toFixed(3)}</td>
                <td className="py-2 px-2"><span className={`rounded-full px-2 py-0.5 text-xs ${statusBadge(r.status)}`}>{r.status}</span></td>
                <td className="py-2 px-2">
                  <div className="flex gap-1">
                    <button title="Aprovar" disabled={!canDecide} onClick={() => onDecide(r.id, "approved")}
                      className="p-1 rounded hover:bg-emerald-500/10 text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button title="Reprovar" disabled={!canDecide} onClick={() => onDecide(r.id, "rejected")}
                      className="p-1 rounded hover:bg-red-500/10 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed">
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button title="Detalhes" onClick={() => openDetail(r.id)} className="p-1 rounded hover:bg-muted">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && (
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm font-semibold">Logs do build</div>
            <div className="flex gap-2">
              {detail && (
                <>
                  <button onClick={() => download(`lhci-${detail.id}.json`, JSON.stringify(detail, null, 2), "application/json")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs">
                    <Download className="w-3 h-3" /> JSON
                  </button>
                  <button onClick={() => download(`lhci-${detail.id}.html`, reportHtml(detail), "text/html")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs">
                    <Download className="w-3 h-3" /> HTML
                  </button>
                </>
              )}
              <button onClick={() => { setOpenId(null); setDetail(null); }} className="text-xs text-muted-foreground">fechar</button>
            </div>
          </div>
          {!detail ? <p className="mt-2 text-xs text-muted-foreground">Carregando…</p> : (
            <>
              {detail.decision_reason && <p className="mt-2 text-xs">Motivo: {detail.decision_reason}</p>}
              <pre className="mt-2 max-h-80 overflow-auto rounded bg-background p-3 text-[11px] leading-snug whitespace-pre-wrap break-all">
                {JSON.stringify(detail.logs ?? detail.raw ?? {}, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
function Empty() {
  return <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">Sem dados suficientes.</div>;
}
