// Sprint 12 — Hub de cluster temático (/blog/$cluster)
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { findCluster, CLUSTERS, CLUSTER_RELATIONS } from "@/lib/content-taxonomy";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog/cluster/$cluster")({
  loader: ({ params }) => {
    const cluster = findCluster(params.cluster);
    if (!cluster) throw notFound();
    return { cluster };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Hub não encontrado · 0WEB" }] };
    const { cluster } = loaderData;
    const url = `https://0web.com.br/blog/cluster/${params.cluster}`;
    const title = `${cluster.title} — Guia completo, conteúdos e serviços · 0WEB`;
    return {
      meta: [
        { title },
        { name: "description", content: cluster.description },
        { property: "og:title", content: title },
        { property: "og:description", content: cluster.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
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
                "@id": `${url}#hub`,
                url,
                name: title,
                description: cluster.description,
                inLanguage: "pt-BR",
                about: { "@type": "Thing", name: cluster.title },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                  { "@type": "ListItem", position: 2, name: "Blog", item: "https://0web.com.br/blog" },
                  { "@type": "ListItem", position: 3, name: cluster.title, item: url },
                ],
              },
              {
                "@type": "ItemList",
                itemListElement: cluster.subclusters.map((s, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: s.title,
                  url: `${url}#${s.slug}`,
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-40 pb-24 mx-auto max-w-3xl px-5 text-center">
        <h1 className="text-4xl font-bold">Hub não encontrado</h1>
        <Link to="/blog" className="mt-8 inline-block text-primary font-semibold">Voltar para o blog</Link>
      </main>
      <Footer />
    </div>
  ),
  component: ClusterHub,
});

function ClusterHub() {
  const { cluster } = Route.useLoaderData();
  const related = (CLUSTER_RELATIONS[cluster.slug] ?? [])
    .map((s: string) => CLUSTERS.find((c) => c.slug === s))
    .filter(Boolean);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 lg:pt-40 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{cluster.title}</span>
          </nav>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">Hub Temático</p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            {cluster.title}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-lg">{cluster.description}</p>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Tópicos cobertos</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cluster.subclusters.map((s: typeof cluster.subclusters[number]) => (
                <div
                  key={s.slug}
                  id={s.slug}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5">{s.funnel}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{s.intent}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-lg leading-snug">{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Prioridade {s.priority} · Valor comercial {s.commercialValue}/5
                  </p>
                </div>
              ))}
            </div>
          </section>

          {cluster.relatedServices.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold">Serviços relacionados</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {cluster.relatedServices.map((p: string) => (
                  <a
                    key={p}
                    href={p}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold"
                  >
                    {p.replace("/", "")} <ArrowRight className="w-4 h-4" />
                  </a>
                ))}
              </div>

            </section>
          )}

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold">Hubs relacionados</h2>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((c) => (
                  <Link
                    key={c!.slug}
                    to="/blog/cluster/$cluster"
                    params={{ cluster: c!.slug }}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition"
                  >
                    <h3 className="font-semibold">{c!.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c!.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <CTA />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
