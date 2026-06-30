import { createFileRoute, Link } from "@tanstack/react-router";
import { Map as MapIcon, ExternalLink } from "lucide-react";
import { listServicesPublic } from "@/lib/services-public.functions";

export const Route = createFileRoute("/mapa-do-site")({
  loader: async () => {
    try {
      const r = await listServicesPublic();
      const services: Svc[] = (r?.services ?? [])
        .filter((s) => !!s && typeof s.slug === "string")
        .map((s) => ({ slug: s.slug, title: s.title, category: s.category ?? null }));

    } catch (err) {
      console.error("[mapa-do-site] loader failed", err);
      return { services: [] as Svc[] };
    }
  },
  head: () => ({
    meta: [
      { title: "Mapa do site · 0WEB" },
      {
        name: "description",
        content:
          "Mapa hierárquico de todas as páginas e serviços do site 0WEB para facilitar a navegação humana e o rastreamento de buscadores.",
      },
      { property: "og:title", content: "Mapa do site · 0WEB" },
      {
        property: "og:description",
        content: "Índice completo de páginas, serviços e seções do 0WEB.",
      },
      { property: "og:url", content: "https://0web.com.br/mapa-do-site" },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/mapa-do-site" }],
  }),
  errorComponent: () => (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-2xl font-bold">Mapa do site temporariamente indisponível</h1>
      <p className="mt-2 text-muted-foreground">
        Tente novamente em instantes ou visite o <a className="text-primary underline" href="/sitemap.xml">sitemap.xml</a>.
      </p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Página não encontrada.</div>,
  component: SiteMapPage,
});

type Svc = { slug: string; title: string; category?: string | null };

const MAIN_SECTIONS: Array<{ title: string; items: { to: string; label: string }[] }> = [
  {
    title: "Principal",
    items: [
      { to: "/", label: "Início" },
      { to: "/servicos", label: "Catálogo de serviços" },
      { to: "/planos", label: "Planos e mensalidades" },
      { to: "/marketplace", label: "Marketplace de profissionais" },
      { to: "/parceiros", label: "Programa de parceiros" },
      { to: "/cases", label: "Cases de sucesso" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { to: "/blog", label: "Blog" },
      { to: "/blog/seo", label: "Blog · SEO" },
      { to: "/blog/trafego-pago", label: "Blog · Tráfego pago" },
      { to: "/blog/sites", label: "Blog · Sites" },
      { to: "/blog/google-meu-negocio", label: "Blog · Google Meu Negócio" },
      { to: "/blog/automacao", label: "Blog · Automação" },
      { to: "/blog/ia", label: "Blog · IA" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Empresa",
    items: [
      { to: "/sobre", label: "Sobre" },
      { to: "/contato", label: "Contato" },
      { to: "/solicitar-orcamento", label: "Solicitar orçamento" },
      { to: "/solicitar-diagnostico", label: "Solicitar diagnóstico" },
    ],
  },
  {
    title: "Cobertura geográfica",
    items: [
      { to: "/estados", label: "Estados atendidos" },
      { to: "/cidades", label: "Cidades atendidas" },
    ],
  },
  {
    title: "Legal",
    items: [
      { to: "/politica-privacidade", label: "Política de privacidade" },
      { to: "/privacidade", label: "Privacidade" },
      { to: "/termos", label: "Termos de uso" },
    ],
  },
];

function SiteMapPage() {
  const { services } = Route.useLoaderData();

  const byCategory = new Map<string, Svc[]>();
  for (const s of services) {
    const k = s.category || "Outros serviços";
    if (!byCategory.has(k)) byCategory.set(k, []);
    byCategory.get(k)!.push(s);
  }
  const categories = Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <MapIcon className="w-7 h-7 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-display">Mapa do site</h1>
        </div>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Índice navegável de todas as páginas públicas. Use esta página para encontrar
          rapidamente um serviço, conteúdo ou seção da 0WEB.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {MAIN_SECTIONS.map((sec) => (
          <section key={sec.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-lg mb-3">{sec.title}</h2>
            <ul className="space-y-1.5 text-sm">
              {sec.items.map((it) => (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    className="text-foreground hover:text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-primary" /> Serviços ({services.length})
        </h2>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço publicado.</p>
        ) : (
          <div className="space-y-6">
            {categories.map(([cat, items]) => (
              <div key={cat}>
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  {cat}
                </h3>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {items
                    .slice()
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((s) => (
                      <li key={s.slug}>
                        <Link
                          to="/servicos/$slug"
                          params={{ slug: s.slug }}
                          className="text-foreground hover:text-primary hover:underline"
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="mt-12 text-xs text-muted-foreground border-t border-border pt-4">
        <p>
          Veja também o{" "}
          <a href="/sitemap.xml" className="text-primary hover:underline">
            sitemap.xml
          </a>{" "}
          para crawlers automatizados.
        </p>
      </footer>
    </div>
  );
}
