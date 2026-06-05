// Admin panel: list latest LHCI builds, drill into logs, approve/reject.
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { decideLhciRun, getLhciRun, listLhciRuns } from "@/lib/lhci.functions";
import { CheckCircle2, XCircle, RefreshCcw, Activity } from "lucide-react";

type Row = {
  id: string;
  environment: string;
  url: string;
  commit_sha: string | null;
  branch: string | null;
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  best_practices: number | null;
  lcp_ms: number | null;
  cls: number | null;
  tbt_ms: number | null;
  fcp_ms: number | null;
  status: string;
  decision: string | null;
  decision_reason: string | null;
  decided_at: string | null;
  created_at: string;
};

function pct(n: number | null) {
  return n == null ? "—" : `${Math.round(n * 100)}`;
}
function ms(n: number | null) {
  return n == null ? "—" : `${Math.round(n)}ms`;
}

export function LhciAdmin() {
  const list = useServerFn(listLhciRuns);
  const get = useServerFn(getLhciRun);
  const decide = useServerFn(decideLhciRun);
  const [env, setEnv] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<any>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await list({ data: { environment: env || undefined, limit: 30 } });
      setRows((r.rows ?? []) as Row[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env]);

  const openDetail = async (id: string) => {
    setOpenId(id);
    setDetail(null);
    const r = await get({ data: { id } });
    setDetail(r.row);
  };

  const onDecide = async (id: string, d: "approved" | "rejected") => {
    const reason = window.prompt(d === "approved" ? "Motivo da aprovação (opcional)" : "Motivo da reprovação") ?? "";
    if (d === "rejected" && !reason.trim()) return;
    await decide({ data: { id, decision: d, reason } });
    await refresh();
    if (openId === id) await openDetail(id);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Lighthouse CI · últimos builds
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="">Todos</option>
            <option value="dev">dev</option>
            <option value="staging">staging</option>
            <option value="prod">prod</option>
          </select>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs"
          >
            <RefreshCcw className="w-3 h-3" /> {loading ? "..." : "Atualizar"}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 px-2">Quando</th>
              <th className="py-2 px-2">Env</th>
              <th className="py-2 px-2">URL</th>
              <th className="py-2 px-2 text-right">Perf</th>
              <th className="py-2 px-2 text-right">SEO</th>
              <th className="py-2 px-2 text-right">LCP</th>
              <th className="py-2 px-2 text-right">CLS</th>
              <th className="py-2 px-2 text-right">TBT</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Decisão</th>
              <th className="py-2 px-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={11} className="py-4 text-center text-muted-foreground">Sem builds registrados.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2 px-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="py-2 px-2"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{r.environment}</span></td>
                <td className="py-2 px-2 max-w-[18rem] truncate" title={r.url}>
                  <button className="underline-offset-2 hover:underline" onClick={() => openDetail(r.id)}>{r.url}</button>
                </td>
                <td className="py-2 px-2 text-right tabular-nums">{pct(r.performance)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{pct(r.seo)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{ms(r.lcp_ms)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{r.cls == null ? "—" : r.cls.toFixed(3)}</td>
                <td className="py-2 px-2 text-right tabular-nums">{ms(r.tbt_ms)}</td>
                <td className="py-2 px-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    r.status === "passed" ? "bg-emerald-500/15 text-emerald-700"
                    : r.status === "failed" ? "bg-red-500/15 text-red-700"
                    : r.status === "approved" ? "bg-blue-500/15 text-blue-700"
                    : r.status === "rejected" ? "bg-red-500/15 text-red-700"
                    : "bg-muted text-muted-foreground"
                  }`}>{r.status}</span>
                </td>
                <td className="py-2 px-2 text-xs">{r.decision ?? "—"}</td>
                <td className="py-2 px-2">
                  <div className="flex gap-1">
                    <button title="Aprovar" onClick={() => onDecide(r.id, "approved")} className="p-1 rounded hover:bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></button>
                    <button title="Reprovar" onClick={() => onDecide(r.id, "rejected")} className="p-1 rounded hover:bg-red-500/10 text-red-600"><XCircle className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && (
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Logs do build</div>
            <button onClick={() => { setOpenId(null); setDetail(null); }} className="text-xs text-muted-foreground">fechar</button>
          </div>
          {!detail ? (
            <p className="mt-2 text-xs text-muted-foreground">Carregando…</p>
          ) : (
            <>
              {detail.decision_reason && (
                <p className="mt-2 text-xs text-foreground">Motivo: {detail.decision_reason}</p>
              )}
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
