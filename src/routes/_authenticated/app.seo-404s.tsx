import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, RefreshCw } from "lucide-react";
import { listNotFound } from "@/lib/route-404.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/seo-404s")({
  component: SeoNotFoundPage,
});

type Row = {
  path: string;
  hits: number;
  referrer: string | null;
  user_agent: string | null;
  first_seen: string;
  last_seen: string;
};

function SeoNotFoundPage() {
  const listFn = useServerFn(listNotFound);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await listFn({ data: { limit: 200 } });
      setRows((res.rows ?? []) as Row[]);
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

  const total = filtered.reduce((sum, r) => sum + (r.hits ?? 0), 0);

  function exportCsv() {
    const header = ["path", "hits", "referrer", "user_agent", "first_seen", "last_seen"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      header.join(","),
      ...filtered.map((r) =>
        [r.path, r.hits, r.referrer ?? "", r.user_agent ?? "", r.first_seen, r.last_seen]
          .map(escape)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `404s-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Monitoramento de 404</h1>
          <p className="text-sm text-muted-foreground mt-1">
            URLs acessadas que não retornam página — útil para identificar rotas legadas, typos e links externos quebrados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </header>

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
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Path</th>
              <th className="px-3 py-2 text-right">Hits</th>
              <th className="px-3 py-2">Referrer</th>
              <th className="px-3 py-2">Visto pela última vez</th>
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
    </div>
  );
}
