import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { listNotFound, listRedirects, listIndexCoverage } from "@/lib/route-404.functions";
import { auditLegacyLinks } from "@/lib/legacy-audit.functions";
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
  const [period, setPeriod] = useState<7 | 30 | 90 | 0>(30);

  async function load() {
    setLoading(true);
    try {
      const periodArg = period === 0 ? {} : { sinceDays: period };
      const [a, b, c] = await Promise.all([
        listFn({ data: { limit: 200, ...periodArg } }),
        redirFn({ data: periodArg }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const filtered = useMemo(
    () => rows.filter((r) => !filter || r.path.toLowerCase().includes(filter.toLowerCase())),
    [rows, filter],
  );

  const topAlerts = useMemo(
    () => rows.filter((r) => (r.hits ?? 0) >= ALERT_THRESHOLD).slice(0, 10),
    [rows],
  );

  const hotRedirects = useMemo(
    () =>
      [...redirects]
        .filter((r) => (r.hits ?? 0) > 0)
        .sort((a, b) => (b.hits ?? 0) - (a.hits ?? 0))
        .slice(0, 10),
    [redirects],
  );

  // Alerta automático: rota legada que voltou a receber tráfego no período
  const legacyResurfaced = useMemo(() => {
    if (!period) return hotRedirects;
    const since = Date.now() - period * 86400_000;
    return redirects.filter(
      (r) => r.last_hit_at && new Date(r.last_hit_at).getTime() >= since && (r.hits ?? 0) > 0,
    );
  }, [redirects, period, hotRedirects]);

  const total = filtered.reduce((sum, r) => sum + (r.hits ?? 0), 0);
  const periodLabel = period === 0 ? "todo o período" : `últimos ${period}d`;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">SEO · 404s, Redirects e Indexação</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Painel para acompanhar rotas quebradas, redirecionamentos legados e cobertura de
            indexação do site · {periodLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value) as 7 | 30 | 90 | 0)}
            className="border border-input bg-background rounded-md px-3 py-2 text-sm"
            aria-label="Período"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={0}>Tudo</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
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

      {legacyResurfaced.length > 0 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h2 className="font-semibold text-sm">
                Rotas legadas com tráfego no período ({legacyResurfaced.length})
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadCsv(
                  `legacy-redirects-${period || "all"}d-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`,
                  legacyResurfaced as unknown as Array<Record<string, unknown>>,
                  ["from_path", "to_path", "status_code", "hits", "last_hit_at", "notes"],
                )
              }
            >
              <Download className="h-4 w-4 mr-2" /> CSV legacy
            </Button>
          </div>
          <ul className="text-sm space-y-1">
            {legacyResurfaced.map((r) => (
              <li key={r.from_path} className="flex justify-between gap-4">
                <code className="text-xs">
                  {r.from_path} → {r.to_path}
                </code>
                <span className="text-muted-foreground text-xs">
                  {r.hits} hits ·{" "}
                  {r.last_hit_at ? new Date(r.last_hit_at).toLocaleDateString("pt-BR") : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hotRedirects.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <h2 className="font-semibold text-sm mb-2">🔥 Redirects mais quentes</h2>
          <ul className="text-sm space-y-1">
            {hotRedirects.map((r) => (
              <li key={`hot-${r.from_path}`} className="flex justify-between gap-4">
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
          <TabsTrigger value="legacy">Links legacy</TabsTrigger>
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

        <TabsContent value="legacy" className="space-y-3">
          <LegacyLinksPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LegacyLinksPanel() {
  const fn = useServerFn(auditLegacyLinks);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof fn>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      setData(await fn());
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold">Auditoria de links legacy</h3>
          <p className="text-xs text-muted-foreground">
            Referências a rotas legacy (<code>/seo</code>, <code>/criacao-sites</code>, etc.) em rotas, conteúdo rico e CTAs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={run} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Varrendo…" : "Re-varrer"}
          </Button>
          {data && data.hits.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `legacy-links-${new Date().toISOString().slice(0, 10)}.csv`,
                  data.hits as unknown as Array<Record<string, unknown>>,
                  ["source", "location", "path", "context"],
                )
              }
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              CSV
            </Button>
          )}
        </div>
      </div>
      {err && <p className="text-sm text-destructive">Erro: {err}</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.byPath.map((b) => (
              <span key={b.path} className="text-xs px-2 py-1 rounded-md bg-muted border border-border">
                <code>{b.path}</code> · {b.count}
              </span>
            ))}
            {data.byPath.length === 0 && (
              <span className="text-xs text-emerald-600">Nenhum link legacy encontrado 🎉</span>
            )}
          </div>
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-2 py-1.5">Origem</th>
                  <th className="px-2 py-1.5">Local</th>
                  <th className="px-2 py-1.5">Path</th>
                  <th className="px-2 py-1.5">Contexto</th>
                </tr>
              </thead>
              <tbody>
                {data.hits.map((h, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-2 py-1.5">{h.source}</td>
                    <td className="px-2 py-1.5 font-mono">{h.location}</td>
                    <td className="px-2 py-1.5"><code>{h.path}</code></td>
                    <td className="px-2 py-1.5 text-muted-foreground">{h.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

