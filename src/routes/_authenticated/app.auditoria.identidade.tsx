import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listIdentityStitchLog } from "@/lib/identity-audit.functions";

export const Route = createFileRoute("/_authenticated/app/auditoria/identidade")({
  component: IdentityAudit,
  errorComponent: ({ error }) => <div className="p-6 text-sm text-destructive">Erro: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Não encontrado.</div>,
});

type Row = {
  id: string;
  visitor_id: string | null;
  user_id: string | null;
  user_ref: string | null;
  stitched_count: number;
  status: "ok" | "noop" | "error";
  error_message: string | null;
  source: string | null;
  actor: string | null;
  created_at: string;
};

function IdentityAudit() {
  const fetchLog = useServerFn(listIdentityStitchLog);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"all" | "ok" | "noop" | "error">("all");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    void fetchLog({ data: { status, limit: 300 } })
      .then((r) => setRows((r as { rows: Row[] }).rows))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status, fetchLog]);

  const statusColor = (s: Row["status"]) =>
    s === "ok"
      ? "bg-emerald-500/10 text-emerald-600"
      : s === "error"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Auditoria de Identidade</h1>
          <p className="text-sm text-muted-foreground">Costuras visitor_id → user_ref (últimas 300).</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="ok">OK</option>
          <option value="noop">Noop</option>
          <option value="error">Erro</option>
        </select>
      </header>

      {err && <div className="p-3 rounded-md border border-destructive/40 bg-destructive/5 text-sm text-destructive">{err}</div>}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Status</th>
              <th className="p-3">Visitor</th>
              <th className="p-3">User Ref</th>
              <th className="p-3 text-right">Registros</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>)}
            {!loading && rows.length === 0 && (<tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Sem registros.</td></tr>)}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                  {r.error_message && <div className="text-xs text-destructive mt-1 max-w-xs truncate" title={r.error_message}>{r.error_message}</div>}
                </td>
                <td className="p-3 font-mono text-xs">{r.visitor_id?.slice(0, 16) ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{r.user_ref ?? "—"}</td>
                <td className="p-3 text-right">{r.stitched_count}</td>
                <td className="p-3 text-xs text-muted-foreground">{r.source ?? "—"}</td>
                <td className="p-3 font-mono text-xs">{r.actor?.slice(0, 8) ?? "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
