import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";
import { renderSkyscraperArticle } from "@/lib/skyscraper-render";

type Status = "rascunho" | "agendado" | "publicado";
type PostState = { status: Status; scheduledAt?: string; notes?: string };

const STORAGE_KEY = "skyscraper-publish-state-v1";

function loadState(): Record<string, PostState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveState(s: Record<string, PostState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const Route = createFileRoute("/_authenticated/app/editorial/skyscraper-review")({
  head: () => ({ meta: [{ title: "Review Skyscraper · 0WEB" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const [state, setState] = useState<Record<string, PostState>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setState(loadState()), []);

  function update(slug: string, patch: Partial<PostState>) {
    const prev = state[slug] ?? { status: "rascunho" as Status };
    const next = { ...state, [slug]: { ...prev, ...patch } };
    setState(next);
    saveState(next);
  }

  function exportMeta() {
    const rows = SKYSCRAPER_CALENDAR.map((a) => {
      const r = state[a.slug] ?? { status: "rascunho" as Status };
      return {
        slug: a.slug,
        title: a.title,
        meta: a.meta,
        canonical: `https://0web.com.br/blog-skyscraper/${a.slug}`,
        og_title: a.title,
        og_description: a.meta,
        status: r.status,
        scheduledAt: r.scheduledAt ?? "",
      };
    });
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skyscraper-meta-tags.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const article = selected ? SKYSCRAPER_CALENDAR.find((a) => a.slug === selected) : null;
  const rendered = article ? renderSkyscraperArticle(article) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-24 mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Review e publicação · Skyscraper</h1>
            <p className="text-sm text-muted-foreground">
              24 posts · status local (rascunho / agendado / publicado) · exportação de meta tags em CSV.
            </p>
          </div>
          <button
            onClick={exportMeta}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold"
          >
            Exportar meta tags (CSV)
          </button>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {SKYSCRAPER_CALENDAR.map((a) => {
              const r = state[a.slug] ?? { status: "rascunho" as Status };
              const active = selected === a.slug;
              return (
                <li
                  key={a.slug}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${
                    active ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                  onClick={() => setSelected(a.slug)}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs text-primary font-semibold">Sem {a.week}</span>
                    <select
                      value={r.status}
                      onChange={(e) => update(a.slug, { status: e.target.value as Status })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs rounded bg-background border border-border px-2 py-1"
                    >
                      <option value="rascunho">rascunho</option>
                      <option value="agendado">agendado</option>
                      <option value="publicado">publicado</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.meta}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      value={r.scheduledAt ?? ""}
                      onChange={(e) => update(a.slug, { scheduledAt: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs rounded bg-background border border-border px-2 py-1"
                    />
                    <Link
                      to="/blog-skyscraper/$slug"
                      params={{ slug: a.slug }}
                      target="_blank"
                      className="text-xs text-primary underline ml-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir post →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-border bg-card p-5 max-h-[70vh] overflow-y-auto">
            {!article || !rendered ? (
              <p className="text-sm text-muted-foreground">
                Selecione um post à esquerda para revisar conteúdo, FAQ e prompts de imagem.
              </p>
            ) : (
              <div>
                <h2 className="text-xl font-bold">{rendered.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {rendered.wordCount} palavras · {rendered.readingTimeMinutes} min de leitura
                </p>

                <h3 className="mt-5 font-semibold">Meta tags</h3>
                <pre className="mt-2 text-xs bg-muted/30 p-3 rounded overflow-x-auto">{`<title>${rendered.title} · 0WEB</title>
<meta name="description" content="${rendered.meta}">
<link rel="canonical" href="https://0web.com.br/blog-skyscraper/${article.slug}">
<meta property="og:title" content="${rendered.title}">
<meta property="og:description" content="${rendered.meta}">
<meta property="og:url" content="https://0web.com.br/blog-skyscraper/${article.slug}">
<meta property="og:type" content="article">`}</pre>

                <h3 className="mt-5 font-semibold">Prompt de capa</h3>
                <textarea
                  readOnly
                  className="mt-2 w-full text-xs bg-muted/30 p-3 rounded h-24"
                  value={rendered.imagePrompts.cover}
                />

                <h3 className="mt-5 font-semibold">Prompts inline</h3>
                <ul className="mt-2 space-y-2 text-xs">
                  {rendered.imagePrompts.inline.map((i) => (
                    <li key={i.id} className="bg-muted/30 p-3 rounded">
                      <strong>{i.alt}</strong>
                      <p className="mt-1">{i.prompt}</p>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-5 font-semibold">FAQ ({rendered.faq.length})</h3>
                <dl className="mt-2 text-sm space-y-2">
                  {rendered.faq.map((f, i) => (
                    <div key={i} className="bg-muted/30 p-3 rounded">
                      <dt className="font-semibold">{f.q}</dt>
                      <dd className="text-muted-foreground">{f.a}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-5 font-semibold">Pré-visualização</h3>
                <div
                  className="mt-2 prose prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: rendered.bodyHtml }}
                />
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
