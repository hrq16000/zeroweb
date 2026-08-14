// Sprint 12 — HubPage reutilizável para rotas /blog/<cluster>
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { AuthorBio } from "@/components/site/AuthorBio";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CLUSTERS, CLUSTER_RELATIONS, type Cluster } from "@/lib/content-taxonomy";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { posts as ALL_POSTS } from "@/lib/blog-data";

// Mapeamento cluster → slug de serviço (Bloco 3 da reorganização IA).
// Quando o cluster tem um serviço comercial equivalente, exibimos banner
// "Conheça nosso serviço de [tema]" no topo do hub.
const CLUSTER_TO_SERVICE: Record<string, { slug: string; label: string }> = {
  seo: { slug: "seo", label: "SEO" },
  "google-meu-negocio": { slug: "google-meu-negocio", label: "Google Meu Negócio" },
  sites: { slug: "criacao-de-sites", label: "criação de sites" },
  "landing-pages": { slug: "landing-pages", label: "Landing Pages" },
  ia: { slug: "automacao-com-ia", label: "IA e automação" },
  automacao: { slug: "automacao-com-ia", label: "automação com IA" },
  "trafego-pago": { slug: "trafego-pago", label: "tráfego pago" },
  "marketing-local": { slug: "trafego-pago-local", label: "tráfego pago local" },
  conversao: { slug: "landing-pages", label: "Landing Pages de conversão" },
  vendas: { slug: "consultoria", label: "consultoria estratégica" },
};

export const HUB_PAGE_SIZE = 6;

/** Artigos publicados de um cluster (fonte: blog-data). */
export function clusterPosts(cluster: Cluster) {
  return ALL_POSTS.filter((p) => p.category.toLowerCase() === cluster.title.toLowerCase());
}

export function hubTotalPages(cluster: Cluster) {
  return Math.max(1, Math.ceil(clusterPosts(cluster).length / HUB_PAGE_SIZE));
}

export function HubPage({ cluster, page = 1 }: { cluster: Cluster; page?: number }) {
  const related = (CLUSTER_RELATIONS[cluster.slug] ?? [])
    .map((s) => CLUSTERS.find((c) => c.slug === s))
    .filter(Boolean) as Cluster[];

  const allPosts = clusterPosts(cluster);
  const totalPages = hubTotalPages(cluster);
  const current = Math.min(Math.max(1, page), totalPages);
  const posts = allPosts.slice((current - 1) * HUB_PAGE_SIZE, current * HUB_PAGE_SIZE);
  const bofu = cluster.subclusters.filter((s) => s.funnel === "bofu");
  const mofu = cluster.subclusters.filter((s) => s.funnel === "mofu");
  const tofu = cluster.subclusters.filter((s) => s.funnel === "tofu");

  const heroService = CLUSTER_TO_SERVICE[cluster.slug];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: cluster.title, path: cluster.hubPath },
        ]}
      />
      <main className="pt-6 lg:pt-8 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          {/* Banner: Serviço relacionado a este tema */}
          {heroService && (
            <Link
              to="/servicos/$slug"
              params={{ slug: heroService.slug }}
              className="block rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 lg:p-6 mb-10 hover:shadow-elegant transition group"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Serviço relacionado
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg lg:text-xl font-bold">
                  Conheça nosso serviço de <span className="text-gradient">{heroService.label}</span>
                </h2>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-0.5 transition">
                  Ver serviço <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          )}

          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
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
              <h2 className="text-2xl font-bold">
                Artigos publicados{totalPages > 1 ? ` — página ${current} de ${totalPages}` : ""}
              </h2>
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

              {totalPages > 1 && (
                <nav aria-label="Paginação de artigos" className="mt-8 flex flex-wrap items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      to={cluster.hubPath}
                      search={n === 1 ? {} : { page: n }}
                      aria-current={n === current ? "page" : undefined}
                      className={
                        n === current
                          ? "rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
                          : "rounded-full border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary transition-colors"
                      }
                    >
                      {n}
                    </Link>
                  ))}
                </nav>
              )}
            </section>
          )}

          <section className="mt-16 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold">
              Quer um diagnóstico de {cluster.title.toLowerCase()} do seu projeto?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Analisamos seu cenário atual e mostramos, em poucos minutos, onde estão as maiores
              oportunidades de tráfego e conversão. Sem compromisso.
            </p>
            <div className="mt-6 flex justify-center">
              <FunnelCTAButton
                pageType="post"
                intent={{
                  purpose: "diagnosis",
                  source: `hub_${cluster.slug}_diagnostico`,
                  pagePath: cluster.hubPath,
                  placement: "section",
                }}
                label="Solicitar diagnóstico gratuito"
                location={`hub_${cluster.slug}_diagnostico`}
              />
            </div>
          </section>

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

export function buildHubHead(cluster: Cluster, page = 1) {
  const base = `https://0web.com.br${cluster.hubPath}`;
  const totalPages = hubTotalPages(cluster);
  const current = Math.min(Math.max(1, page), totalPages);
  const pageUrl = (n: number) => (n <= 1 ? base : `${base}?page=${n}`);
  const url = pageUrl(current);
  const title =
    current > 1
      ? `${cluster.title} — artigos (página ${current}) · 0WEB`
      : `${cluster.title} — Guia completo, artigos e serviços · 0WEB`;
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
    links: [
      { rel: "canonical", href: url },
      ...(current > 1 ? [{ rel: "prev", href: pageUrl(current - 1) }] : []),
      ...(current < totalPages ? [{ rel: "next", href: pageUrl(current + 1) }] : []),
    ],
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
