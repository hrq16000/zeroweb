// Hub /bairros-bh — índice dos 30 bairros de Belo Horizonte atendidos.
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { BH_NEIGHBORHOODS } from "@/lib/bh-neighborhoods";

export const Route = createFileRoute("/bairros-bh/")({
  head: () => {
    const url = `${ORIGIN}/bairros-bh`;
    const title = "Agência de Marketing Digital em Belo Horizonte por Bairro | 0web";
    const description = "A 0web atende empresas de 30+ bairros de Belo Horizonte. Veja a página do seu bairro: Savassi, Lourdes, Buritis, Pampulha e mais.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "geo.region", content: "BR-MG" },
        { name: "geo.placename", content: "Belo Horizonte" },
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
              { name: "Áreas de Atendimento", path: "/areas-de-atendimento" },
              { name: "Bairros BH", path: "/bairros-bh" },
            ]),

          }),
        },
      ],
    };
  },
  component: HubPage,
});

function HubPage() {
  const byRegion = BH_NEIGHBORHOODS.reduce<Record<string, typeof BH_NEIGHBORHOODS>>((acc, n) => {
    (acc[n.region] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: "Áreas de Atendimento", path: "/areas-de-atendimento" }, { name: "Bairros BH", path: "/bairros-bh" }]} />
      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold font-display">
            Marketing Digital em <span className="text-gradient">Belo Horizonte</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Sua empresa onde seus clientes estão. Atendimento especializado em mais de 30 bairros de BH — escolha o seu.
          </p>
          <p className="mt-3 text-sm">
            <Link to="/areas-de-atendimento" className="text-primary font-semibold hover:underline">
              ← Ver todas as áreas de atendimento da 0web
            </Link>
          </p>


          <div className="mt-12 space-y-10">
            {Object.entries(byRegion).map(([region, items]) => (
              <section key={region}>
                <h2 className="text-xl font-display font-semibold text-muted-foreground uppercase tracking-wider">{region}</h2>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((n) => (
                    <Link
                      key={n.slug}
                      to="/bairros-bh/$slug"
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
