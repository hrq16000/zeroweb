// Página pública /solucoes — lista serviços marcados como "solução" (via
// flag manual is_solution OU fallback automático quando preço é vazio/0).
// 100% gerenciada pelo painel administrativo: mesma tela de "Serviços", basta
// marcar/desmarcar a flag em Visibilidade → Tipo no catálogo.
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ServiceCTA } from "@/components/site/ServiceCTA";
import { ServiceImageFallback } from "@/components/site/ServiceImageFallback";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/solucoes")({
  loader: async () => {
    const { listServicesPublic } = await import("@/lib/services-public.functions");
    const { services: all } = await listServicesPublic();
    // Fallback consistente: se a query falhar, listServicesPublic já cai
    // para o catálogo do arquivo (todos sem preço → todos viram soluções).
    const solutions = all.filter((s) => s.isSolution);
    return { solutions };
  },
  head: ({ loaderData }) => {
    const url = absUrl("/solucoes");
    const title = "Soluções 0WEB · Estratégias sob medida para crescer no digital";
    const desc =
      "Soluções consultivas da 0WEB — projetos sob medida sem preço fechado. SEO, presença digital, automação com IA, sistemas, marketing e parcerias estratégicas.";
    const items = loaderData?.solutions ?? [];
    const itemList = {
      "@type": "ItemList",
      "@id": `${url}#solutions`,
      name: "Soluções 0WEB",
      numberOfItems: items.length,
      itemListElement: items.map((s, i) => {
        const sUrl = absUrl(`/servicos/${s.slug}`);
        return {
          "@type": "ListItem",
          position: i + 1,
          url: sUrl,
          item: {
            "@type": "Service",
            "@id": `${sUrl}#solution`,
            name: s.name,
            serviceType: s.serviceType,
            description: s.description,
            category: s.category,
            url: sUrl,
            areaServed: { "@type": "Country", name: "Brasil" },
            provider: { "@id": `${ORIGIN}/#org` },
          },
        };
      }),
    };
    const graph = [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        description: desc,
        inLanguage: "pt-BR",
        isPartOf: { "@type": "WebSite", "@id": `${ORIGIN}/#website` },
        publisher: { "@id": `${ORIGIN}/#org` },
        mainEntity: { "@id": `${url}#solutions` },
      },
      breadcrumbLd([{ name: "Soluções", path: "/solucoes" }]),
      itemList,
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: "soluções digitais, consultoria, projeto sob medida, SEO, IA, sistemas, marketing, 0WEB" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "0WEB" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: DEFAULT_OG_IMAGE },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
        },
      ],
    };
  },
  component: SolucoesPage,
});

function SolucoesPage() {
  const { solutions } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Soluções", path: "/solucoes" }]} />
      <main className="pt-6">
        <section className="px-5 py-12 sm:py-20">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Soluções consultivas
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight">
              Projetos sob medida para problemas reais
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Quando o caminho não é uma prateleira pronta, montamos um plano dedicado.
              Estratégia, execução e métricas — sob um único time.
            </p>
          </div>
        </section>

        <section className="px-3 sm:px-5 pb-20">
          <div className="mx-auto max-w-6xl">
            {solutions.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                <p>Nenhuma solução publicada no momento.</p>
                <Link to="/servicos" className="mt-3 inline-block text-primary font-semibold">
                  Ver catálogo de serviços →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {solutions.map((s, i) => (
                  <motion.article
                    key={s.slug}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: (i % 6) * 0.04 }}
                    className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary hover:shadow-elegant transition-all"
                  >
                    <Link
                      to="/servicos/$slug"
                      params={{ slug: s.slug }}
                      className="block aspect-[4/3] overflow-hidden bg-muted"
                    >
                      {s.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.imageUrl}
                          alt={s.imageAlt ?? s.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ServiceImageFallback name={s.name} category={s.category} />
                      )}
                    </Link>
                    <div className="p-3 sm:p-4">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.category}
                      </span>
                      <h2 className="mt-1 text-sm sm:text-base font-bold leading-tight line-clamp-2">
                        <Link to="/servicos/$slug" params={{ slug: s.slug }} className="hover:text-primary">
                          {s.name}
                        </Link>
                      </h2>
                      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {s.description}
                      </p>
                      <div className="mt-3">
                        <ServiceCTA
                          serviceSlug={s.slug}
                          funnels={s.funnels}
                          location="card"
                          label="Falar com especialista"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2 transition-all"
                          showArrow
                        />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="mx-auto max-w-3xl text-center rounded-3xl border border-border bg-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Não achou sua solução?</h2>
            <p className="mt-2 text-muted-foreground">
              Cada negócio é único. Conte seu desafio e desenhamos uma proposta dedicada.
            </p>
            <Link
              to="/contato"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition-opacity"
            >
              Falar com a 0WEB <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
