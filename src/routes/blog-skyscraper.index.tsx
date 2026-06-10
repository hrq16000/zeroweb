import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";

export const Route = createFileRoute("/blog-skyscraper/")({
  head: () => ({
    meta: [
      { title: "Skyscraper · 24 guias definitivos · 0WEB" },
      {
        name: "description",
        content:
          "24 guias skyscraper sobre marketing digital, redes sociais, gráfica e soluções web — versão sênior do que está top-3 hoje no Google.",
      },
      { property: "og:title", content: "Skyscraper · 24 guias definitivos · 0WEB" },
      { property: "og:url", content: "https://0web.com.br/blog-skyscraper" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/blog-skyscraper" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-24 mx-auto max-w-6xl px-5">
        <h1 className="text-4xl font-bold">Skyscraper · 24 guias agressivos</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Cluster de conteúdo desenhado para superar o que está em top-3 no Google
          em 2026 — marketing digital, redes sociais, gráfica e soluções web.
        </p>
        <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKYSCRAPER_CALENDAR.map((a) => (
            <li
              key={a.slug}
              className="rounded-2xl bg-card border border-border p-5 hover:shadow-elegant transition"
            >
              <p className="text-xs text-primary uppercase tracking-wider">
                Sem {a.week} · {a.pillar}
              </p>
              <h2 className="mt-2 font-semibold leading-snug">
                <Link
                  to="/blog-skyscraper/$slug"
                  params={{ slug: a.slug }}
                  className="hover:underline"
                >
                  {a.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.meta}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
