// Sprint 12 — Mapa editorial público (/blog/mapa)
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CTA } from "@/components/site/CTA";
import { THEMES, CLUSTERS } from "@/lib/content-taxonomy";

const TITLE = "Mapa de Conteúdo — Autoridade Temática · 0WEB";
const DESC = "Árvore temática completa: temas, clusters e tópicos cobertos pelo conteúdo da 0WEB.";

export const Route = createFileRoute("/blog/mapa")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://0web.com.br/blog/mapa" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/blog/mapa" }],
  }),
  component: TopicMap,
});

function TopicMap() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 lg:pt-40 pb-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Autoridade Temática</p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Mapa de conteúdo
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
            Cada tema é um pilar. Cada cluster aprofunda. Cada tópico responde uma intenção real.
          </p>

          {THEMES.map((t) => (
            <section key={t.slug} className="mt-16">
              <h2 className="text-3xl font-bold">{t.title}</h2>
              <p className="mt-2 text-muted-foreground">{t.description}</p>

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {t.clusters
                  .map((s) => CLUSTERS.find((c) => c.slug === s))
                  .filter(Boolean)
                  .map((c) => (
                    <Link
                      key={c!.slug}
                      to="/blog/cluster/$cluster"
                      params={{ cluster: c!.slug }}
                      className="rounded-2xl border border-border bg-card p-5 hover:shadow-elegant transition"
                    >
                      <h3 className="font-semibold text-lg">{c!.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c!.description}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {c!.subclusters.length} tópicos
                      </p>
                    </Link>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <CTA />
      <Footer />
    </div>
  );
}
