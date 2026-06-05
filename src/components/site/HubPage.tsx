// Sprint 12 — HubPage reutilizável para rotas /blog/<cluster>
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { AuthorBio } from "@/components/site/AuthorBio";
import { CLUSTERS, CLUSTER_RELATIONS, type Cluster } from "@/lib/content-taxonomy";
import { posts as ALL_POSTS } from "@/lib/blog-data";

export function HubPage({ cluster }: { cluster: Cluster }) {
  const related = (CLUSTER_RELATIONS[cluster.slug] ?? [])
    .map((s) => CLUSTERS.find((c) => c.slug === s))
    .filter(Boolean) as Cluster[];

  const posts = ALL_POSTS.filter((p) => p.category.toLowerCase() === cluster.title.toLowerCase()).slice(0, 6);
  const bofu = cluster.subclusters.filter((s) => s.funnel === "bofu");
  const mofu = cluster.subclusters.filter((s) => s.funnel === "mofu");
  const tofu = cluster.subclusters.filter((s) => s.funnel === "tofu");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 lg:pt-40 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <nav className="text-sm text-muted-foreground" aria-label="breadcrumb">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{cluster.title}</span>
          </nav>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">
            Hub Temático — Autoridade em {cluster.title}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            {cluster.title}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-lg">{cluster.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {cluster.relatedServices.map((p) => (
              <a
                key={p}
                href={p}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              >
                Serviço: {p.replace("/", "").replace(/-/g, " ")} <ArrowRight className="w-4 h-4" />
              </a>
            ))}
          </div>

          {posts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold">Artigos publicados</h2>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((p) => (
                  <Link
                    key={p.slug}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition"
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.category}</p>
                    <h3 className="mt-2 font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {bofu.length > 0 && (
            <Section title="Decisão de compra (BOFU)" subtitle="Conteúdos com alta intenção comercial." items={bofu} />
          )}
          {mofu.length > 0 && (
            <Section title="Avaliação (MOFU)" subtitle="Aprofundamento técnico e comparativos." items={mofu} />
          )}
          {tofu.length > 0 && (
            <Section title="Descoberta (TOFU)" subtitle="Fundamentos e definições." items={tofu} />
          )}

          <AuthorBio className="mt-16" />

          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold">Hubs relacionados</h2>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map((c) => (
                  <a
                    key={c.slug}
                    href={c.hubPath}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition"
                  >
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  </a>
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

function Section({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Cluster["subclusters"];
}) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <div key={s.slug} id={s.slug} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5">{s.intent}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">P{s.priority}</span>
            </div>
            <h3 className="mt-3 font-semibold text-lg leading-snug">{s.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground">Valor comercial {s.commercialValue}/5</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function buildHubHead(cluster: Cluster) {
  const url = `https://0web.com.br${cluster.hubPath}`;
  const title = `${cluster.title} — Guia completo, artigos e serviços · 0WEB`;
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
}
