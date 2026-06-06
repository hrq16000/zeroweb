import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listIndexIssues,
  indexIssuesSummary,
  upsertIndexIssue,
  resolveIndexIssue,
} from "@/lib/index-coverage.functions";
import { detectIndexCoverageAlerts, type CoverageAlert } from "@/lib/index-coverage-alerts.functions";
import { parseGscCsv } from "@/lib/gsc-csv";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertTriangle, ExternalLink, RefreshCw, CheckCircle2, Upload, TrendingDown, TrendingUp, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/indexacao")({
  component: IndexCoveragePage,
});

const TYPE_LABELS: Record<string, string> = {
  all: "Todos",
  "404": "404 (não encontrado)",
  soft_404: "Soft 404",
  redirect: "Redirecionamento",
  excluded: "Excluída",
  noindex: "Noindex",
  server_error: "Erro de servidor",
  blocked_robots: "Bloqueada por robots",
  other: "Outro",
};

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#06b6d4", "#64748b"];

function rangeDays(n: number) {
  const to = new Date().toISOString();
  const from = new Date(Date.now() - n * 86400000).toISOString();
  return { from, to };
}

function IndexCoveragePage() {
  const listFn = useServerFn(listIndexIssues);
  const summaryFn = useServerFn(indexIssuesSummary);
  const addFn = useServerFn(upsertIndexIssue);
  const resolveFn = useServerFn(resolveIndexIssue);
  const alertsFn = useServerFn(detectIndexCoverageAlerts);

  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [type, setType] = useState<string>("all");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [alerts, setAlerts] = useState<CoverageAlert[]>([]);
  const [alertsChecking, setAlertsChecking] = useState(false);
  const [csvBusy, setCsvBusy] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ byType: Record<string, number>; byDay: Record<string, number>; open: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Add-issue form
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState("404");
  const [newCode, setNewCode] = useState<string>("");
  const [newMsg, setNewMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const { from, to } = rangeDays(period);
      const [l, s] = await Promise.all([
        listFn({ data: { type, from, to, onlyOpen, limit: 300 } }),
        summaryFn({ data: { from, to } }),
      ]);
      setRows(l.rows as any[]);
      setSummary(s as any);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [period, type, onlyOpen]);

  const chartByDay = useMemo(() => {
    if (!summary) return [];
    const { from, to } = rangeDays(period);
    const start = new Date(from).getTime();
    const end = new Date(to).getTime();
    const days: { date: string; count: number }[] = [];
    for (let t = start; t <= end; t += 86400000) {
      const d = new Date(t).toISOString().slice(0, 10);
      days.push({ date: d.slice(5), count: summary.byDay[d] ?? 0 });
    }
    return days;
  }, [summary, period]);

  const chartByType = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byType).map(([name, value]) => ({ name: TYPE_LABELS[name] ?? name, value }));
  }, [summary]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await addFn({ data: {
        url: newUrl,
        issue_type: newType,
        status_code: newCode ? parseInt(newCode, 10) : undefined,
        message: newMsg || undefined,
        source: "manual",
      } as any });
      setNewUrl(""); setNewMsg(""); setNewCode("");
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const onResolve = async (id: string) => {
    try { await resolveFn({ data: { id } }); await load(); } catch (e: any) { setErr(e.message); }
  };

  const checkAlerts = async () => {
    setAlertsChecking(true); setErr(null);
    try {
      const { alerts } = await alertsFn({});
      setAlerts(alerts);
    } catch (e: any) { setErr(e.message); }
    finally { setAlertsChecking(false); }
  };

  useEffect(() => { void checkAlerts(); /* eslint-disable-next-line */ }, []);

  const onCsv = async (file: File) => {
    setErr(null);
    try {
      const text = await file.text();
      const rows = parseGscCsv(text);
      if (!rows.length) { setErr("Nenhuma linha válida no CSV."); return; }
      setCsvBusy({ done: 0, total: rows.length });
      // Sequential upserts keep this simple and avoid hammering the server fn.
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          await addFn({ data: { url: r.url, issue_type: r.issue_type, status_code: r.status_code, message: r.message, source: "gsc_csv" } as any });
        } catch { /* skip row, continue */ }
        setCsvBusy({ done: i + 1, total: rows.length });
      }
      setCsvBusy(null);
      await load();
      await checkAlerts();
    } catch (e: any) {
      setErr(e.message); setCsvBusy(null);
    }
  };
  const exportCsv = () => {
    const headers = ["url", "issue_type", "status_code", "message", "source", "detected_at", "resolved_at"];
    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(headers.map((h) => escape((r as any)[h])).join(","));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `indexacao-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPdf = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const rowsHtml = rows
      .map(
        (r) => `<tr>
          <td>${(r.url ?? "").replace(/</g, "&lt;")}</td>
          <td>${r.issue_type ?? ""}</td>
          <td>${r.status_code ?? ""}</td>
          <td>${(r.message ?? "").replace(/</g, "&lt;")}</td>
          <td>${new Date(r.detected_at).toLocaleString("pt-BR")}</td>
          <td>${r.resolved_at ? "resolvido" : "aberto"}</td>
        </tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cobertura de indexação — ${new Date().toLocaleDateString("pt-BR")}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}th{background:#f3f4f6}h1{font-size:18px;margin:0 0 16px}</style></head><body>
      <h1>Cobertura de indexação — ${rows.length} item(s)</h1>
      <table><thead><tr><th>URL</th><th>Tipo</th><th>HTTP</th><th>Mensagem</th><th>Detectado</th><th>Estado</th></tr></thead><tbody>${rowsHtml}</tbody></table>
      <script>window.onload=()=>window.print();</script></body></html>`);
    w.document.close();
  };


  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold font-display">Cobertura de indexação</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            URLs com problemas de indexação (404, soft 404, redirects, excluídas). Filtre por tipo e período.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onCsv(f); e.target.value = ""; }}
          />
          <button onClick={() => fileRef.current?.click()} disabled={!!csvBusy} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <Upload className="w-4 h-4" /> {csvBusy ? `Importando ${csvBusy.done}/${csvBusy.total}…` : "Importar CSV do GSC"}
          </button>
          <button onClick={checkAlerts} disabled={alertsChecking} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <AlertTriangle className={`w-4 h-4 ${alertsChecking ? "animate-pulse" : ""}`} /> Verificar alertas
          </button>
          <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportPdf} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>

        </div>
      </div>

      {err && <p className="text-sm text-destructive">{err}</p>}

      {/* Alerts banner */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 space-y-2">
          <h2 className="text-sm font-semibold inline-flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4" /> {alerts.length} alerta(s) de cobertura nas últimas 24h
          </h2>
          <ul className="text-xs space-y-1">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-2">
                {a.kind === "spike" ? <TrendingUp className="w-3 h-3 mt-0.5 text-red-600" /> : <TrendingDown className="w-3 h-3 mt-0.5 text-amber-600" />}
                <span>{a.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center rounded-xl border border-border bg-card p-4">
        <div>
          <label className="text-xs text-muted-foreground block">Período</label>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value) as 7 | 30 | 90)} className="mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm">
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm mt-5">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
          Apenas não resolvidos
        </label>
      </div>

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="Total no período" value={summary.total} tone="muted" />
          <KPI label="Abertos" value={summary.open} tone="warning" icon={<AlertTriangle className="w-4 h-4" />} />
          <KPI label="404" value={summary.byType["404"] ?? 0} tone="danger" />
          <KPI label="Redirects" value={summary.byType["redirect"] ?? 0} tone="info" />
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">Problemas por dia</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartByDay}>
                <XAxis dataKey="date" fontSize={10} tick={{ fill: "currentColor" }} />
                <YAxis allowDecimals={false} fontSize={10} tick={{ fill: "currentColor" }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">Distribuição por tipo</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartByType} dataKey="value" nameKey="name" outerRadius={70} label={(e) => e.name}>
                  {chartByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add new */}
      <form onSubmit={onAdd} className="rounded-xl border border-border bg-card p-4 grid md:grid-cols-[1fr,160px,120px,1fr,auto] gap-2 items-end">
        <div>
          <label className="text-xs text-muted-foreground block">URL</label>
          <input required type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://0web.com.br/pagina" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block">Tipo</label>
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            {Object.entries(TYPE_LABELS).filter(([k]) => k !== "all").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block">Status</label>
          <input type="number" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="404" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block">Mensagem</label>
          <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Detalhes opcionais" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {saving ? "…" : "Registrar"}
        </button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase">
            <tr>
              <th className="text-left p-3">URL</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Detectado em</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum problema no período selecionado.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 break-all">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 hover:underline">
                    {r.url} <ExternalLink className="w-3 h-3" />
                  </a>
                  {r.message && <div className="text-[11px] text-muted-foreground mt-0.5">{r.message}</div>}
                </td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-muted text-xs">{TYPE_LABELS[r.issue_type] ?? r.issue_type}</span></td>
                <td className="p-3 font-mono text-xs">{r.status_code ?? "—"}</td>
                <td className="p-3 text-xs">{new Date(r.detected_at).toLocaleString("pt-BR")}</td>
                <td className="p-3 text-xs">
                  {r.resolved_at
                    ? <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> resolvido</span>
                    : <span className="text-amber-600">aberto</span>}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Link
                    to="/app/indexacao/$urlId"
                    params={{ urlId: r.id }}
                    className="text-xs px-2 py-1 rounded border border-border hover:bg-muted mr-2 inline-block"
                  >
                    Detalhes
                  </Link>
                  {!r.resolved_at && (
                    <button onClick={() => onResolve(r.id)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">
                      Marcar resolvido
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Dica: integre via webhook em <code>/api/public/lead-webhook</code> ou conecte ao Search Console para alimentar esta lista automaticamente.
        Veja também a página <Link to="/app/admin" className="underline">Administração</Link>.
      </p>
    </div>
  );
}

function KPI({ label, value, tone, icon }: { label: string; value: number; tone: "muted" | "warning" | "danger" | "info"; icon?: React.ReactNode }) {
  const cls = tone === "danger" ? "text-destructive" : tone === "warning" ? "text-amber-600" : tone === "info" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground flex items-center gap-1">{icon} {label}</div>
      <div className={`mt-1 text-3xl font-bold font-display ${cls}`}>{value}</div>
    </div>
  );
}
