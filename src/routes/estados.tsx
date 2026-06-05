import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { STATES, type Region, type StateInfo } from "@/lib/geo-data";

export const Route = createFileRoute("/estados")({
  head: () => {
    const url = absUrl("/estados");
    const title = "Estados atendidos · 0WEB Marketing Digital e Tecnologia";
    const desc = "Conheça os estados brasileiros com cobertura ativa da 0WEB para sites, SEO, marketing digital e tecnologia.";
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
              breadcrumbLd([{ name: "Estados", path: "/estados" }]),
            ],
          }),
        },
      ],
    };
  },
  component: EstadosHub,
});

function EstadosHub() {
  const byRegion = Object.values(STATES).reduce<Record<Region, StateInfo[]>>((acc, s) => {
    (acc[s.region] ||= [] as StateInfo[]).push(s);
    return acc;
  }, {} as Record<Region, StateInfo[]>);

  const regions = Object.keys(byRegion) as Region[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Estados", path: "/estados" }]} />
      <main className="pt-6">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> Cobertura por estado
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              Estados <span className="text-gradient">atendidos</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Cobertura ativa em capitais e regiões metropolitanas estratégicas. Selecione seu estado.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8 space-y-12">
            {regions.map((region) => (
              <div key={region}>
                <h2 className="text-2xl font-bold mb-4">{region}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {byRegion[region].map((s) => (
                    <Link
                      key={s.code}
                      to="/estados/$state"
                      params={{ state: s.slug }}
                      className="block p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                    >
                      <p className="text-xs uppercase tracking-wider text-primary font-semibold">{s.code}</p>
                      <h3 className="mt-1 font-semibold text-lg">{s.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.cities.length} cidade(s) ativa(s)</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                        Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
