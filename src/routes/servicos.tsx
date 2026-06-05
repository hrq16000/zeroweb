import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absUrl, ORIGIN, breadcrumbLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SERVICES, type ServiceCategory, type ServiceData } from "@/lib/services-data";

export const Route = createFileRoute("/servicos")({
  head: () => {
    const url = absUrl("/servicos");
    const title = "Serviços da 0WEB · Sites, SEO, IA, Marketing Digital e Sistemas";
    const desc = "Catálogo completo de serviços da 0WEB: criação de sites, landing pages, e-commerce, SEO, marketing digital, automação com IA, chatbot WhatsApp, SaaS e sistemas web sob medida.";
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
              breadcrumbLd([{ name: "Serviços", path: "/servicos" }]),
            ],
          }),
        },
      ],
    };
  },
  component: ServicosHub,
});

function ServicosHub() {
  const byCategory = Object.values(SERVICES).reduce<Record<string, ServiceData[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});
  const categories = Object.keys(byCategory) as ServiceCategory[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Serviços", path: "/servicos" }]} />
      <main className="pt-6">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Catálogo completo
            </p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              Serviços <span className="text-gradient">0WEB</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo o que sua empresa precisa para crescer no digital — em um único parceiro.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8 space-y-12">
            {categories.map((cat) => (
              <div key={cat}>
                <h2 className="text-2xl font-bold mb-4">{cat}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {byCategory[cat].map((s) => (
                    <Link
                      key={s.slug}
                      to="/$service"
                      params={{ service: s.slug }}
                      className="block p-5 rounded-2xl border border-border bg-card hover:border-primary transition-colors"
                    >
                      <h3 className="font-semibold text-lg">{s.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</p>
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

        <section className="py-12 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-muted-foreground">Procura serviço por cidade?</p>
            <Link to="/cidades" className="mt-2 inline-flex items-center gap-2 text-primary font-semibold story-link">
              Ver cidades atendidas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
