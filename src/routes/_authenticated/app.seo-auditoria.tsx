import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listSeoAuditHistory, type SeoAuditRow } from "@/lib/seo-audit.functions";

export const Route = createFileRoute("/_authenticated/app/seo-auditoria")({
  head: () => ({ meta: [{ title: "SEO Auditoria · 0WEB" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SeoAuditoriaPage,
});

function statusColor(s: string) {
  switch (s) {
    case "approved": return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
    case "rejected": return "text-rose-600 bg-rose-500/10 border-rose-500/30";
    case "pending":  return "text-amber-600 bg-amber-500/10 border-amber-500/30";
    default:         return "text-muted-foreground bg-muted border-border";
  }
}

function SeoAuditoriaPage() {
  const fn = useServerFn(listSeoAuditHistory);
  const [kind, setKind] = useState<"all" | "legacy_links" | "seo_diff">("all");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["seo-audit", kind],
    queryFn: () => fn({ data: { limit: 100, kind: kind === "all" ? undefined : kind } }),
    staleTime: 30_000,
  });

  const rows: SeoAuditRow[] = useMemo(() => data?.rows ?? [], [data]);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Auditoria</h1>
          <p className="text-sm text-muted-foreground">Últimos snapshots e diffs registrados em <code>seo_audit_history</code>.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">Todos os tipos</option>
            <option value="legacy_links">legacy_links</option>
            <option value="seo_diff">seo_diff</option>
          </select>
          <button
            onClick={() => refetch()}
            className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Atualizar
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2">Quando</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Δ %</th>
              <th className="text-left px-4 py-2">Notas</th>
              <th className="text-right px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Carregando…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>
            )}
            {rows.map((r) => {
              const expanded = openId === r.id;
              return (
                <>
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 whitespace-nowrap font-mono text-xs">{new Date(r.ran_at).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2"><code className="text-xs">{r.kind}</code></td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs">{r.delta_pct ?? "—"}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground max-w-[280px] truncate">{r.notes ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => setOpenId(expanded ? null : r.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        {expanded ? "Fechar" : "Detalhes"}
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${r.id}-d`} className="border-t border-border bg-muted/20">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">summary</p>
                            <pre className="text-[11px] bg-background border border-border rounded-md p-2 max-h-72 overflow-auto">
{JSON.stringify(r.summary, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">details</p>
                            <pre className="text-[11px] bg-background border border-border rounded-md p-2 max-h-72 overflow-auto">
{JSON.stringify(r.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
