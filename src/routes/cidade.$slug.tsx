import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getCityCatalog } from "@/lib/marketplace.functions";
import { ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/cidade/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Profissionais em ${params.slug} | Marketplace 0WEB` },
      { name: "description", content: `Prestadores e empresas atendendo em ${params.slug}. Marketplace nacional 0WEB.` },
      { rel: "canonical", href: `${ORIGIN}/cidade/${params.slug}` } as never,
    ],
  }),
  component: CityPage,
});

function CityPage() {
  const { slug } = Route.useParams();
  const fetchCity = useServerFn(getCityCatalog);
  const [data, setData] = useState<any>(null);
  useEffect(() => { void fetchCity({ data: { slug } }).then(setData); }, [fetchCity, slug]);

  if (!data) return <div className="p-12 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <Link to="/marketplace" className="text-sm text-muted-foreground">← Marketplace</Link>
        <h1 className="text-3xl md:text-4xl font-display font-bold mt-4 capitalize">Profissionais em {data.city}</h1>
        <p className="text-muted-foreground mt-2">Empresas e prestadores verificados atendendo na região.</p>

        {data.companies.length > 0 && <h2 className="text-xl font-display mt-10 mb-4">Empresas</h2>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.companies.map((c: any) => (
            <Link key={c.id} to="/empresa/$slug" params={{ slug: c.slug }} className="rounded-xl border border-border p-5 hover:border-primary">
              <div className="font-semibold">{c.trade_name}</div>
              <div className="text-xs text-muted-foreground">{c.state}</div>
            </Link>
          ))}
        </div>

        {data.providers.length > 0 && <h2 className="text-xl font-display mt-10 mb-4">Profissionais</h2>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.providers.map((p: any) => (
            <Link key={p.id} to="/profissional/$slug" params={{ slug: p.slug }} className="rounded-xl border border-border p-5 hover:border-primary">
              <div className="font-semibold">{p.display_name}</div>
              <div className="text-xs text-muted-foreground">{p.state}</div>
            </Link>
          ))}
        </div>

        {data.companies.length === 0 && data.providers.length === 0 && (
          <p className="text-muted-foreground mt-8">Nenhum profissional cadastrado nesta cidade ainda. <Link to="/app/marketplace/provider" className="text-primary">Cadastre-se</Link> e seja o primeiro.</p>
        )}
      </div>
    </div>
  );
}
