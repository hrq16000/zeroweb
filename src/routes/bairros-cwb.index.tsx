// Hub /bairros-cwb — índice dos bairros de Curitiba e cidades-chave da RMC.
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { CWB_NEIGHBORHOODS } from "@/lib/curitiba-neighborhoods";

export const Route = createFileRoute("/bairros-cwb/")({
  head: () => {
    const url = `${ORIGIN}/bairros-cwb`;
    const title = "Agência de Marketing Digital em Curitiba e RMC por Bairro | 0web";
    const description = "A 0web atende empresas em 25+ bairros de Curitiba e cidades da RMC: Batel, Água Verde, Champagnat, Ecoville, São José dos Pinhais e mais.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "geo.region", content: "BR-PR" },
        { name: "geo.placename", content: "Curitiba" },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            ...breadcrumbLd([
              { name: "Início", path: "/" },
              { name: "Bairros Curitiba/RMC", path: "/bairros-cwb" },
            ]),
          }),
        },
      ],
    };
  },
  component: HubPage,
});

function HubPage() {
  const byCity = CWB_NEIGHBORHOODS.reduce<Record<string, typeof CWB_NEIGHBORHOODS>>((acc, n) => {
    (acc[n.city] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: "Bairros Curitiba/RMC", path: "/bairros-cwb" }]} />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-display">
            Marketing Digital em <span className="text-gradient">Curitiba e RMC</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Sua empresa onde seus clientes estão. Atendimento especializado em 25+ bairros de Curitiba e cidades da Região Metropolitana.
          </p>

          <div className="mt-12 space-y-10">
            {Object.entries(byCity).map(([city, items]) => (
              <section key={city}>
                <h2 className="text-xl font-display font-semibold text-muted-foreground uppercase tracking-wider">{city}</h2>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((n) => (
                    <Link
                      key={n.slug}
                      to="/bairros-cwb/$slug"
                      params={{ slug: n.slug }}
                      className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elegant transition"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{n.name}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.vibe}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
