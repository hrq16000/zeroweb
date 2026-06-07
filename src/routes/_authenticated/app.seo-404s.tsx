import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { listNotFound, listRedirects, listIndexCoverage } from "@/lib/route-404.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/app/seo-404s")({
  component: SeoNotFoundPage,
});

type Row404 = {
  path: string;
  hits: number;
  referrer: string | null;
  user_agent: string | null;
  first_seen: string;
  last_seen: string;
};

type RowRedirect = {
  from_path: string;
  to_path: string;
  status_code: number;
  enabled: boolean;
  hits: number;
  last_hit_at: string | null;
  notes: string | null;
};

type RowCoverage = {
  day: string;
  issue_type: string;
  count: number;
  open_count: number;
};

const ALERT_THRESHOLD = 5;

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>, header: string[]) {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    header.join(","),
    ...rows.map((r) => header.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SeoNotFoundPage() {
  const listFn = useServerFn(listNotFound);
  const redirFn = useServerFn(listRedirects);
  const coverageFn = useServerFn(listIndexCoverage);

  const [rows, setRows] = useState<Row404[]>([]);
  const [redirects, setRedirects] = useState<RowRedirect[]>([]);
  const [coverage, setCoverage] = useState<RowCoverage[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [a, b, c] = await Promise.all([
        listFn({ data: { limit: 200 } }),
        redirFn(),
        coverageFn(),
      ]);
      setRows((a.rows ?? []) as Row404[]);
      setRedirects((b.rows ?? []) as RowRedirect[]);
      setCoverage((c.rows ?? []) as RowCoverage[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => !filter || r.path.toLowerCase().includes(filter.toLowerCase())),
    [rows, filter],
  );

  const topAlerts = useMemo(
    () => rows.filter((r) => (r.hits ?? 0) >= ALERT_THRESHOLD).slice(0, 10),
    [rows],
  );

  const legacyHits = useMemo(
    () => redirects.filter((r) => (r.hits ?? 0) > 0).slice(0, 10),
    [redirects],
  );

  const total = filtered.reduce((sum, r) => sum + (r.hits ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">SEO · 404s, Redirects e Indexação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Painel para acompanhar rotas quebradas, redirecionamentos legados e cobertura de
            indexação do site.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </header>

      {topAlerts.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="font-semibold text-sm">
              Alerta — {topAlerts.length} path(s) com ≥{ALERT_THRESHOLD} hits 404
            </h2>
          </div>
          <ul className="text-sm space-y-1">
            {topAlerts.map((r) => (
              <li key={r.path} className="flex justify-between gap-4">
                <code className="text-xs">{r.path}</code>
                <span className="text-muted-foreground text-xs">{r.hits} hits</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {legacyHits.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-sm">
              Rotas legadas ainda recebendo tráfego ({legacyHits.length})
            </h2>
          </div>
          <ul className="text-sm space-y-1">
            {legacyHits.map((r) => (
              <li key={r.from_path} className="flex justify-between gap-4">
                <code className="text-xs">
                  {r.from_path} → {r.to_path}
                </code>
                <span className="text-muted-foreground text-xs">{r.hits} hits</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Tabs defaultValue="404s">
        <TabsList>
          <TabsTrigger value="404s">404s ({rows.length})</TabsTrigger>
          <TabsTrigger value="redirects">Redirects ({redirects.length})</TabsTrigger>
          <TabsTrigger value="coverage">Indexação ({coverage.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="404s" className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrar por path…"
              className="border border-input bg-background rounded-md px-3 py-2 text-sm w-full max-w-md"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {filtered.length} paths · {total} hits
            </span>
            <Button
              size="sm"
              onClick={() =>
                downloadCsv(
                  `404s-${new Date().toISOString().slice(0, 10)}.csv`,
                  filtered as unknown as Array<Record<string, unknown>>,
                  ["path", "hits", "referrer", "user_agent", "first_seen", "last_seen"],
                )
              }
              disabled={!filtered.length}
            >
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Path</th>
                  <th className="px-3 py-2 text-right">Hits</th>
                  <th className="px-3 py-2">Referrer</th>
                  <th className="px-3 py-2">Última vez</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                      {loading ? "Carregando…" : "Nenhum 404 registrado."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.path} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{r.path}</td>
                      <td className="px-3 py-2 text-right font-medium">{r.hits}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[280px]">
                        {r.referrer || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(r.last_seen).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="redirects" className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                downloadCsv(
                  `redirects-${new Date().toISOString().slice(0, 10)}.csv`,
                  redirects as unknown as Array<Record<string, unknown>>,
                  ["from_path", "to_path", "status_code", "enabled", "hits", "last_hit_at", "notes"],
                )
              }
              disabled={!redirects.length}
            >
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">De</th>
                  <th className="px-3 py-2">Para</th>
                  <th className="px-3 py-2 text-right">Status</th>
                  <th className="px-3 py-2 text-right">Hits</th>
                  <th className="px-3 py-2">Último hit</th>
                </tr>
              </thead>
              <tbody>
                {redirects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      {loading ? "Carregando…" : "Nenhum redirect cadastrado."}
                    </td>
                  </tr>
                ) : (
                  redirects.map((r) => (
                    <tr key={r.from_path} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{r.from_path}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.to_path}</td>
                      <td className="px-3 py-2 text-right text-xs">{r.status_code}</td>
                      <td className="px-3 py-2 text-right font-medium">{r.hits}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {r.last_hit_at ? new Date(r.last_hit_at).toLocaleString("pt-BR") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-3">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                downloadCsv(
                  `coverage-${new Date().toISOString().slice(0, 10)}.csv`,
                  coverage as unknown as Array<Record<string, unknown>>,
                  ["day", "issue_type", "count", "open_count"],
                )
              }
              disabled={!coverage.length}
            >
              <Download className="h-4 w-4 mr-2" /> CSV
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Dia</th>
                  <th className="px-3 py-2">Tipo de issue</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Em aberto</th>
                </tr>
              </thead>
              <tbody>
                {coverage.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                      {loading ? "Carregando…" : "Sem snapshots de indexação ainda."}
                    </td>
                  </tr>
                ) : (
                  coverage.map((r, i) => (
                    <tr key={`${r.day}-${r.issue_type}-${i}`} className="border-t">
                      <td className="px-3 py-2 text-xs whitespace-nowrap">{r.day}</td>
                      <td className="px-3 py-2 text-xs">{r.issue_type}</td>
                      <td className="px-3 py-2 text-right">{r.count}</td>
                      <td className="px-3 py-2 text-right font-medium">{r.open_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
