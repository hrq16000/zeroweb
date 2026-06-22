import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VERTICAL_LIST } from "./sites.$vertical";
import { absUrl } from "@/lib/seo";

const TITLE = "Sites por segmento · Soluções por nicho · 0WEB";
const DESC =
  "Sites profissionais para restaurantes, advocacia, clínicas, imobiliárias, oficinas, lojas, comércios e prestadores de serviço. Soluções por segmento com SEO local incluso.";
const URL = absUrl("/sites");

export const Route = createFileRoute("/sites/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: SitesIndex,
});

function SitesIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="pt-page pb-12">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Sites por segmento</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
              Site sob medida para o seu segmento
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
              Cada nicho tem suas particularidades. Escolha seu segmento e veja a combinação de site, SEO local
              e tráfego pago que melhor funciona para você.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VERTICAL_LIST.map((v) => (
              <Link
                key={v.slug}
                to="/sites/$vertical"
                params={{ vertical: v.slug }}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-elegant transition"
              >
                <h2 className="text-lg font-bold">{v.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{v.subheadline}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Ver soluções <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
