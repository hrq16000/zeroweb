import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, RefreshCw } from "lucide-react";
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

function toCsv(rows: Row[]): string {
  const head = [
    "created_at",
    "status",
    "visitor_id",
    "user_id",
    "user_ref",
    "stitched_count",
    "source",
    "actor",
    "error_message",
  ];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) =>
    [r.created_at, r.status, r.visitor_id, r.user_id, r.user_ref, r.stitched_count, r.source, r.actor, r.error_message]
      .map(esc)
      .join(","),
  );
  return [head.join(","), ...body].join("\n");
}

function IdentityAudit() {
  const fetchLog = useServerFn(listIdentityStitchLog);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"all" | "ok" | "noop" | "error">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const payload: Record<string, unknown> = { status, limit: 1000 };
    if (dateFrom) payload.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) payload.dateTo = new Date(dateTo + "T23:59:59").toISOString();
    if (search.trim()) payload.search = search.trim();
    void fetchLog({ data: payload as never })
      .then((r) => {
        setRows((r as { rows: Row[] }).rows);
        setErr(null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [status, dateFrom, dateTo, search, tick, fetchLog]);

  const counts = useMemo(() => {
    const c = { ok: 0, noop: 0, error: 0 };
    rows.forEach((r) => {
      c[r.status] += 1;
    });
    return c;
  }, [rows]);

  const downloadCsv = () => {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `identity-stitch-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = (s: Row["status"]) =>
    s === "ok"
      ? "bg-emerald-500/10 text-emerald-600"
      : s === "error"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Auditoria de Identidade</h1>
          <p className="text-sm text-muted-foreground">
            Costuras visitor_id → user_ref. {rows.length} registros •{" "}
            <span className="text-emerald-600">{counts.ok} ok</span> •{" "}
            <span className="text-destructive">{counts.error} erro</span> • {counts.noop} noop
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-border hover:bg-muted"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">Todos</option>
            <option value="ok">OK</option>
            <option value="noop">Noop</option>
            <option value="error">Erro</option>
          </select>
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">De</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">Até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
        </label>
        <label className="text-xs space-y-1">
          <span className="text-muted-foreground">Buscar (visitor_id / user_ref)</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="USR-… ou visitor"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
        </label>
      </div>

      {err && (
        <div className="p-3 rounded-md border border-destructive/40 bg-destructive/5 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
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
            {loading && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Sem registros para os filtros atuais.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                  {r.error_message && (
                    <div className="text-xs text-destructive mt-1 max-w-xs truncate" title={r.error_message}>
                      {r.error_message}
                    </div>
                  )}
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
