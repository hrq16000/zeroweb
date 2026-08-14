// Hub de categoria da loja: /servicos/categoria/$slug
// Listagem SEO com CollectionPage + ItemList + BreadcrumbList e CTA de diagnóstico.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  SERVICE_CATEGORY_HUBS,
  findServiceCategoryHub,
  matchesCategory,
} from "@/lib/service-categories";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const ORIGIN = "https://0web.com.br";

export const Route = createFileRoute("/servicos/categoria/$slug")({
  loader: async ({ params }) => {
    const hub = findServiceCategoryHub(params.slug);
    if (!hub) throw notFound();
    const { listServicesPublic } = await import("@/lib/services-public.functions");
    const { services } = await listServicesPublic();
    const items = services
      .filter((s) => matchesCategory(hub, s.category))
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        category: s.category,
        price: s.price ?? null,
      }));
    return { hub, items };
  },
  head: ({ loaderData, params }) => {
    const url = `${ORIGIN}/servicos/categoria/${params.slug}`;
    if (!loaderData) {
      return { meta: [{ title: "Categoria não encontrada · 0WEB" }, { name: "robots", content: "noindex" }] };
    }
    const { hub, items } = loaderData;
    return {
      meta: [
        { title: hub.title },
        { name: "description", content: hub.description },
        { property: "og:title", content: hub.title },
        { property: "og:description", content: hub.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: hub.title },
        { name: "twitter:description", content: hub.description },
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
                name: hub.title,
                description: hub.description,
                inLanguage: "pt-BR",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Início", item: `${ORIGIN}/` },
                  { "@type": "ListItem", position: 2, name: "Serviços", item: `${ORIGIN}/servicos` },
                  { "@type": "ListItem", position: 3, name: hub.name, item: url },
                ],
              },
              {
                "@type": "ItemList",
                itemListElement: items.map((s, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: s.name,
                  url: `${ORIGIN}/servicos/${s.slug}`,
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: CategoryHub,
});

function CategoryHub() {
  const { hub, items } = Route.useLoaderData();
  const others = SERVICE_CATEGORY_HUBS.filter((c) => c.slug !== hub.slug);

  return (
    <main className="pb-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <header className="pt-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{hub.name}</p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">{hub.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{hub.intro}</p>
          <div className="mt-6">
            <FunnelCTAButton
              pageType="category"
              intent={{
                purpose: "diagnosis",
                source: `categoria_${hub.slug}_hero`,
                pagePath: `/servicos/categoria/${hub.slug}`,
                placement: "hero",
              }}
              label="Quero um diagnóstico gratuito"
              location={`categoria_${hub.slug}_hero`}
            />
          </div>
        </header>

        {items.length > 0 && (
          <section className="mt-14" aria-labelledby="itens">
            <h2 id="itens" className="text-2xl font-bold">
              Serviços de {hub.name.toLowerCase()}
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((s) => (
                <Link
                  key={s.slug}
                  to="/servicos/$slug"
                  params={{ slug: s.slug }}
                  className="group block rounded-2xl border border-border bg-card p-5 hover:border-primary hover:-translate-y-1 hover:shadow-elegant transition-all"
                >
                  <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{s.category}</p>
                  <h3 className="mt-1 font-semibold">{s.name}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
                  {s.price != null && s.price > 0 && (
                    <p className="mt-3 text-sm font-semibold">
                      A partir de R$ {Number(s.price).toLocaleString("pt-BR")}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 grid gap-6 lg:grid-cols-3">
          {hub.h2.map((b) => (
            <article key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold">{b.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold">Outras categorias</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                to="/servicos/categoria/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/servicos"
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
            >
              Catálogo completo
            </Link>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Não sabe por onde começar?</h2>
          <p className="mt-2 text-muted-foreground">
            Fazemos um diagnóstico gratuito do seu cenário e indicamos o caminho com melhor retorno.
          </p>
          <div className="mt-6 flex justify-center">
            <FunnelCTAButton
              pageType="category"
              intent={{
                purpose: "diagnosis",
                source: `categoria_${hub.slug}_footer`,
                pagePath: `/servicos/categoria/${hub.slug}`,
                placement: "footer",
              }}
              label="Solicitar diagnóstico gratuito"
              location={`categoria_${hub.slug}_footer`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
