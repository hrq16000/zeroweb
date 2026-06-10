import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SKYSCRAPER_CALENDAR, SKYSCRAPER_TOTALS } from "@/lib/skyscraper-calendar";

export const Route = createFileRoute("/_authenticated/app/editorial/skyscraper")({
  head: () => ({ meta: [{ title: "Calendário Skyscraper · 0WEB" }] }),
  component: SkyscraperPage,
});

function SkyscraperPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-24 mx-auto max-w-6xl px-5">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            Sprint Skyscraper
          </p>
          <h1 className="mt-2 text-4xl font-bold font-display">
            Calendário Editorial — 24 artigos agressivos
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Blueprints prontos para produção (título, meta, outline, dados, tabelas,
            visuais e CTA). Pensados para superar o conteúdo top-3 da SERP.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-muted px-3 py-1">
              {SKYSCRAPER_TOTALS.articles} artigos
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              ~{SKYSCRAPER_TOTALS.totalWords.toLocaleString("pt-BR")} palavras totais
            </span>
            {Object.entries(SKYSCRAPER_TOTALS.byPillar).map(([k, v]) => (
              <span key={k} className="rounded-full bg-muted px-3 py-1">
                {k}: {v}
              </span>
            ))}
          </div>
        </header>

        <ol className="space-y-8">
          {SKYSCRAPER_CALENDAR.map((a) => (
            <li
              key={a.slug}
              className="rounded-3xl border border-border bg-card p-6 lg:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  Semana {a.week} · {a.pillar}
                </span>
                <span className="text-xs text-muted-foreground">
                  KW: <strong>{a.targetKeyword}</strong> · vol ~{a.estimatedVolume.toLocaleString("pt-BR")} · dif {a.difficulty}/5 · alvo {a.wordTarget} palavras
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold leading-tight">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground italic">Meta: {a.meta}</p>

              <section className="mt-5">
                <h3 className="font-semibold">Introdução polêmica</h3>
                <p className="mt-1 text-sm leading-relaxed">{a.intro}</p>
              </section>

              <section className="mt-5">
                <h3 className="font-semibold">Outline (H2/H3)</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  {a.outline.map((o, i) => (
                    <li key={i}>
                      <span className="font-medium">{o.h2}</span>
                      {o.h3 && (
                        <ul className="mt-1 list-[circle] pl-5 text-muted-foreground">
                          {o.h3.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-5 grid md:grid-cols-2 gap-5">
                <section>
                  <h3 className="font-semibold">Dados / fontes</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {a.data.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="font-semibold">Visuais</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {a.visuals.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="mt-5">
                <h3 className="font-semibold">Tabelas</h3>
                <div className="mt-2 space-y-3">
                  {a.tables.map((t) => (
                    <div key={t.title} className="rounded-2xl border border-border p-4">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Colunas: {t.columns.join(" · ")}
                      </p>
                      <p className="text-xs text-muted-foreground">Linhas: {t.rowsHint}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">CTA</h3>
                  <p className="text-sm">
                    <strong>{a.cta.primary}</strong>
                    {a.cta.secondary && <> · {a.cta.secondary}</>} →{" "}
                    <Link to={a.cta.href} className="text-primary underline">
                      {a.cta.href}
                    </Link>
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Links internos: {a.internalLinks.join(" · ")}
                </div>
              </section>
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </div>
  );
}
