// Página admin: compara o SEO servido em /servicos/<slug> (rota literal ou
// dinâmica, o que estiver ativo) com o SEO derivado do banco — antes de
// apagar as rotas literais. Lê services do CRUD admin e o diff vem do
// server fn dedicado.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listServicesAdmin } from "@/lib/services-crud.functions";
import { getServiceSeoDiff, type SeoSnapshot } from "@/lib/seo-diff.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/servicos/seo-diff")({
  head: () => ({ meta: [{ title: "Diff SEO de serviços · 0WEB" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: SeoDiffPage,
});

type DiffResult = Awaited<ReturnType<typeof getServiceSeoDiff>>;

function SeoDiffPage() {
  const fetchList = useServerFn(listServicesAdmin);
  const runDiff = useServerFn(getServiceSeoDiff);
  const [services, setServices] = useState<{ slug: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [data, setData] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchList()
      .then((r) => {
        const list = (r.services ?? []).map((s) => ({ slug: s.slug, name: s.name }));
        setServices(list);
        if (list.length && !selected) setSelected(list[0].slug);
      })
      .catch(() => setServices([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchList]);

  const load = async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    setData(null);
    try {
      const r = await runDiff({ data: { slug } });
      setData(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) void load(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Diff de SEO — rota servida vs. banco</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare o que está sendo renderizado em <code>/servicos/&lt;slug&gt;</code> agora
          (rota literal ainda em vigor, se existir) com o que o banco produziria
          após a remoção dessa rota.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-card">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Serviço</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-9 px-2 rounded-md border border-input bg-background text-sm min-w-[260px]"
        >
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name} ({s.slug})</option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={() => load(selected)} disabled={loading || !selected}>
          {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
          Recarregar
        </Button>
        {data && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Fonte do banco:</span>
            <Badge variant={data.source === "db" ? "default" : "secondary"}>{data.source}</Badge>
            <span className="text-muted-foreground">URL:</span>
            <a href={data.url} target="_blank" rel="noreferrer" className="underline">{data.url}</a>
          </div>
        )}
      </div>

      {data?.fetchError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          Falha ao buscar a página servida: {data.fetchError}
        </div>
      )}

      {data && <DiffTable live={data.live} db={data.db} />}
    </div>
  );
}

function DiffTable({ live, db }: { live: SeoSnapshot; db: SeoSnapshot }) {
  const rows: { key: keyof SeoSnapshot; label: string }[] = useMemo(
    () => [
      { key: "title", label: "Title" },
      { key: "description", label: "Meta description" },
      { key: "ogTitle", label: "og:title" },
      { key: "ogDescription", label: "og:description" },
      { key: "ogType", label: "og:type" },
      { key: "ogImage", label: "og:image" },
      { key: "canonical", label: "Canonical" },
    ],
    [],
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr>
            <th className="text-left px-3 py-2 w-40">Campo</th>
            <th className="text-left px-3 py-2">Rota servida (live)</th>
            <th className="text-left px-3 py-2">Derivado do banco</th>
            <th className="text-left px-3 py-2 w-24">Match</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const a = (live[r.key] as string | null) ?? "";
            const b = (db[r.key] as string | null) ?? "";
            const match = (a || "").trim() === (b || "").trim();
            return (
              <tr key={r.key} className="border-t border-border align-top">
                <td className="px-3 py-2 font-semibold">{r.label}</td>
                <td className="px-3 py-2 whitespace-pre-wrap break-words text-xs font-mono">{a || <em className="opacity-50">vazio</em>}</td>
                <td className="px-3 py-2 whitespace-pre-wrap break-words text-xs font-mono">{b || <em className="opacity-50">vazio</em>}</td>
                <td className="px-3 py-2">
                  {match ? (
                    <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> ok
                    </Badge>
                  ) : (
                    <Badge variant="destructive">divergente</Badge>
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-border align-top bg-muted/10">
            <td className="px-3 py-2 font-semibold">JSON-LD (qtd)</td>
            <td className="px-3 py-2 text-xs font-mono">{live.jsonLd.length} bloco(s)</td>
            <td className="px-3 py-2 text-xs font-mono">{db.jsonLd.length} bloco(s) extras (+ auto)</td>
            <td className="px-3 py-2 text-xs text-muted-foreground">manual</td>
          </tr>
        </tbody>
      </table>

      <div className="grid lg:grid-cols-2 gap-3 p-3">
        <JsonBlock title="JSON-LD da rota servida" value={live.jsonLd} />
        <JsonBlock title="JSON-LD extra cadastrado no banco" value={db.jsonLd} />
      </div>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
      <pre className="text-[11px] font-mono bg-muted/30 p-3 rounded-md overflow-auto max-h-80 whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
