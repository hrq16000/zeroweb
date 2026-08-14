import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { CITIES, STATES } from "@/lib/geo-data";
import { GEO_SERVICE_SLUGS, SERVICES } from "@/lib/services-data";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

export const Route = createFileRoute("/cidades")({
  head: () => {
    const url = absUrl("/cidades");
    const title = "Cidades atendidas pela 0WEB · Marketing Digital, SEO e Sites";
    const desc = "Veja todas as cidades brasileiras atendidas pela 0WEB para criação de sites, SEO, landing pages, e-commerce e marketing digital.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: DEFAULT_OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
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
                "@id": url,
                url,
                name: title,
                description: desc,
                inLanguage: "pt-BR",
                isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
              },
              breadcrumbLd([{ name: "Cidades", path: "/cidades" }]),
            ],
          }),
        },
      ],
    };
  },
  component: CidadesHub,
});

function CidadesHub() {
  const grouped = Object.values(STATES).map((s) => ({
    state: s,
    cities: s.cities.map((slug) => CITIES[slug]),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Cidades", path: "/cidades" }]} />
      <main className="pt-6">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Cobertura nacional
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              Cidades <span className="text-gradient">atendidas</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Atendemos remotamente todo o Brasil. Selecione sua cidade para ver os serviços disponíveis com contexto local.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8 space-y-12">
            {grouped.map(({ state, cities }) => (
              <div key={state.code}>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {state.name}{" "}
                    <span className="text-muted-foreground font-normal text-base">· {state.region}</span>
                  </h2>
                  <Link to="/estados/$state" params={{ state: state.slug }} className="text-sm text-primary story-link">
                    Ver hub de {state.code}
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      to="/$city/$service"
                      params={{ city: c.slug, service: GEO_SERVICE_SLUGS[0] }}
                      className="block p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                    >
                      <p className="font-semibold text-lg">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.state} · DDD {c.ddd}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{c.flavor}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                        Ver serviços <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-muted-foreground">Sua cidade não está listada?</p>
            <FunnelCTAButton
              intent={{ purpose: "diagnosis", source: "cidades_nao_listada", pagePath: "/cidades", placement: "section" }}
              label="Entre em contato — atendemos remoto em todo o Brasil"
              location="cidades_nao_listada"
              className="mt-2 inline-flex items-center gap-2 text-primary font-semibold story-link"
            />
          </div>
        </section>

        {/* Quick access — services */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Serviços disponíveis em todas as cidades</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GEO_SERVICE_SLUGS.map((slug) => {
                const s = SERVICES[slug];
                return (
                  <Link
                    key={slug}
                    to="/servicos/$slug"
                    params={{ slug }}
                    className="block p-4 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-primary font-semibold">{s.category}</p>
                    <h3 className="mt-1 font-semibold">{s.name}</h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
