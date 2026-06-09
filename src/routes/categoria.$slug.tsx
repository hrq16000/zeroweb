import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getCategoryBySlug } from "@/lib/marketplace.functions";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/categoria/$slug")({
  head: ({ params }) => {
    const url = `https://0web.com.br/categoria/${params.slug}`;
    const title = `${params.slug} | Categoria | Marketplace 0WEB`;
    const desc = `Profissionais e empresas da categoria ${params.slug} no marketplace nacional 0WEB.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": `${url}#collection`,
                url,
                name: title,
                description: desc,
                inLanguage: "pt-BR",
                isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
              },
              breadcrumbLd([
                { name: "Marketplace", path: "/servicos/marketplace" },
                { name: "Categorias", path: "/servicos/marketplace" },
                { name: params.slug, path: `/categoria/${params.slug}` },
              ]),
            ],
          }),
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const fetchCat = useServerFn(getCategoryBySlug);
  const [data, setData] = useState<any>(null);
  useEffect(() => { void fetchCat({ data: { slug } }).then(setData); }, [fetchCat, slug]);

  if (!data) return <div className="p-12 text-center text-muted-foreground">Carregando…</div>;
  if (!data.category) return <div className="p-12 text-center"><h1>Categoria não encontrada</h1><Link to="/servicos/marketplace" className="text-primary">Voltar</Link></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <Link to="/servicos/marketplace" className="text-sm text-muted-foreground">← Marketplace</Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold mt-4">{data.category.name}</h1>
        {data.category.description && <p className="text-muted-foreground mt-2 max-w-2xl">{data.category.description}</p>}

        {data.companies.length > 0 && <h2 className="text-xl font-display mt-10 mb-4">Empresas</h2>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.companies.map((c: any) => (
            <Link key={c.id} to="/empresa/$slug" params={{ slug: c.slug }} className="rounded-xl border border-border p-5 hover:border-primary">
              <div className="font-semibold">{c.trade_name} {c.verified && <span className="text-primary text-xs">✓</span>}</div>
              <div className="text-xs text-muted-foreground">{[c.city, c.state].filter(Boolean).join(", ")}</div>
            </Link>
          ))}
        </div>

        {data.providers.length > 0 && <h2 className="text-xl font-display mt-10 mb-4">Profissionais</h2>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.providers.map((p: any) => (
            <Link key={p.id} to="/profissional/$slug" params={{ slug: p.slug }} className="rounded-xl border border-border p-5 hover:border-primary">
              <div className="font-semibold">{p.display_name} {p.verified && <span className="text-primary text-xs">✓</span>}</div>
              <div className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(", ")}</div>
            </Link>
          ))}
        </div>

        {data.companies.length === 0 && data.providers.length === 0 && (
          <p className="text-muted-foreground mt-8">Nenhum perfil cadastrado nesta categoria ainda.</p>
        )}
      </div>
    </div>
  );
}
