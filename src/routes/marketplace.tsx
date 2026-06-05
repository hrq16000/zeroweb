import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listCatalog, listCategories } from "@/lib/marketplace.functions";
import { ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace de Prestadores e Empresas | 0WEB" },
      { name: "description", content: "Encontre profissionais e empresas verificadas em todo o Brasil para sites, SEO, Google Meu Negócio, tráfego pago e automação." },
      { property: "og:title", content: "Marketplace 0WEB" },
      { property: "og:description", content: "Catálogo nacional de prestadores e empresas verificadas." },
      { rel: "canonical", href: `${ORIGIN}/marketplace` } as never,
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const fetchCatalog = useServerFn(listCatalog);
  const fetchCats = useServerFn(listCategories);
  const [filters, setFilters] = useState({ q: "", city: "", state: "", category: "", verified: false, kind: "all" as "all" | "provider" | "company" });
  const [data, setData] = useState<{ providers: any[]; companies: any[] }>({ providers: [], companies: [] });
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { void fetchCats().then((r) => setCats((r as any).categories)); }, [fetchCats]);

  useEffect(() => {
    setLoading(true);
    void fetchCatalog({
      data: {
        kind: filters.kind, q: filters.q || undefined, city: filters.city || undefined,
        state: filters.state || undefined, category: filters.category || undefined,
        verified: filters.verified || undefined, page: 1, pageSize: 24,
      },
    }).then((r) => { setData(r as any); setLoading(false); });
  }, [fetchCatalog, filters]);

  const total = data.providers.length + data.companies.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Marketplace 0WEB</h1>
          <p className="text-muted-foreground max-w-2xl">
            Conecte-se com prestadores e empresas verificadas em todo o Brasil. Catálogo nacional de profissionais para sites, SEO, tráfego pago, Google Meu Negócio e automação.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/solicitar-orcamento" className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90">Solicitar orçamento</Link>
            <Link to="/app/marketplace/provider" className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted">Cadastrar como prestador</Link>
            <Link to="/app/marketplace/company" className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted">Cadastrar empresa</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid md:grid-cols-6 gap-3 mb-8">
          <input className="md:col-span-2 px-3 py-2 rounded-lg border border-border bg-card" placeholder="Buscar nome..." value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
          <input className="px-3 py-2 rounded-lg border border-border bg-card" placeholder="Cidade" value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))} />
          <input className="px-3 py-2 rounded-lg border border-border bg-card" placeholder="UF" maxLength={2} value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value.toUpperCase() }))} />
          <select className="px-3 py-2 rounded-lg border border-border bg-card" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">Todas categorias</option>
            {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-border bg-card" value={filters.kind} onChange={(e) => setFilters((f) => ({ ...f, kind: e.target.value as never }))}>
            <option value="all">Todos</option>
            <option value="provider">Profissionais</option>
            <option value="company">Empresas</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm mb-6">
          <input type="checkbox" checked={filters.verified} onChange={(e) => setFilters((f) => ({ ...f, verified: e.target.checked }))} />
          Apenas verificados
        </label>

        {loading && <p className="text-muted-foreground">Carregando...</p>}
        {!loading && total === 0 && (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Nenhum perfil encontrado com esses filtros.</p>
            <p className="text-sm text-muted-foreground mt-2">O catálogo está em construção. Cadastre-se para fazer parte da rede nacional.</p>
          </div>
        )}

        {data.companies.length > 0 && (
          <>
            <h2 className="text-xl font-display font-semibold mb-4 mt-8">Empresas</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {data.companies.map((c) => (
                <Link key={c.id} to="/empresa/$slug" params={{ slug: c.slug }} className="rounded-xl border border-border p-5 bg-card hover:border-primary transition">
                  <div className="flex items-center gap-3 mb-3">
                    {c.logo_url ? <img src={c.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-muted" />}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{c.trade_name} {c.verified && <span className="text-primary text-xs">✓</span>}</div>
                      <div className="text-xs text-muted-foreground truncate">{[c.city, c.state].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                  {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                  <div className="text-xs text-muted-foreground mt-3">★ {Number(c.rating_avg).toFixed(1)} ({c.rating_count})</div>
                </Link>
              ))}
            </div>
          </>
        )}

        {data.providers.length > 0 && (
          <>
            <h2 className="text-xl font-display font-semibold mb-4">Profissionais</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.providers.map((p) => (
                <Link key={p.id} to="/profissional/$slug" params={{ slug: p.slug }} className="rounded-xl border border-border p-5 bg-card hover:border-primary transition">
                  <div className="flex items-center gap-3 mb-3">
                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-muted" />}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.display_name} {p.verified && <span className="text-primary text-xs">✓</span>}</div>
                      <div className="text-xs text-muted-foreground truncate">{[p.city, p.state].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                  {p.headline && <p className="text-sm text-muted-foreground line-clamp-2">{p.headline}</p>}
                  <div className="text-xs text-muted-foreground mt-3">★ {Number(p.rating_avg).toFixed(1)} ({p.rating_count})</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
