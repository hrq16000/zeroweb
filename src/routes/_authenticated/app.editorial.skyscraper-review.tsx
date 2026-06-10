import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";
import { renderSkyscraperArticle } from "@/lib/skyscraper-render";
import { auditArticle } from "@/lib/skyscraper-seo-audit";
import {
  allowedTransitions,
  buildJsonLd,
  downloadText,
  ensureState,
  getRole,
  loadAll,
  saveAll,
  setRole as persistRole,
  toHtml,
  toMarkdown,
  transition,
  updateVariant,
  type Role,
  type WorkflowState,
} from "@/lib/skyscraper-workflow";

export const Route = createFileRoute("/_authenticated/app/editorial/skyscraper-review")({
  head: () => ({ meta: [{ title: "Review Skyscraper · 0WEB" }] }),
  component: ReviewPage,
});

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  em_revisao: "bg-amber-500/20 text-amber-300",
  aprovado: "bg-emerald-500/20 text-emerald-300",
  agendado: "bg-sky-500/20 text-sky-300",
  publicado: "bg-primary/20 text-primary",
  rejeitado: "bg-destructive/20 text-destructive",
};

function ReviewPage() {
  const [all, setAll] = useState<Record<string, WorkflowState>>({});
  const [role, setRoleState] = useState<Role>("autor");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"seo" | "workflow" | "ab" | "export">("seo");

  useEffect(() => {
    setAll(loadAll());
    setRoleState(getRole());
  }, []);

  function patch(slug: string, next: WorkflowState) {
    const merged = { ...all, [slug]: next };
    setAll(merged);
    saveAll(merged);
  }

  function changeRole(r: Role) {
    setRoleState(r);
    persistRole(r);
  }

  const article = selected ? SKYSCRAPER_CALENDAR.find((a) => a.slug === selected) ?? null : null;
  const rendered = useMemo(() => (article ? renderSkyscraperArticle(article) : null), [article]);
  const audit = useMemo(
    () => (article && rendered ? auditArticle(article, rendered) : null),
    [article, rendered],
  );
  const state = article ? ensureState(all, article) : null;

  function exportBulk(kind: "json" | "md" | "html") {
    const bundles = SKYSCRAPER_CALENDAR.map((a) => {
      const r = renderSkyscraperArticle(a);
      const w = ensureState(all, a);
      return { article: a, rendered: r, workflow: w };
    });

    if (kind === "json") {
      const payload = bundles.map((b) => ({
        slug: b.article.slug,
        canonical: `https://0web.com.br/blog-skyscraper/${b.article.slug}`,
        title: b.rendered.title,
        meta: b.rendered.meta,
        ogTitle: b.rendered.title,
        ogDescription: b.rendered.meta,
        jsonld: buildJsonLd(b.article, b.rendered),
        workflow: b.workflow,
        wordCount: b.rendered.wordCount,
      }));
      downloadText(
        "skyscraper-bundle.json",
        JSON.stringify(payload, null, 2),
        "application/json",
      );
      return;
    }

    if (kind === "md") {
      const md = bundles.map(toMarkdown).join("\n\n---\n\n");
      downloadText("skyscraper-bundle.md", md, "text/markdown");
      return;
    }

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Skyscraper bundle · 0WEB</title></head><body>
${bundles.map((b) => toHtml(b).replace(/^<!doctype[^>]*>|<\/?html[^>]*>|<\/?head>|<\/?body>/gi, "")).join('\n<hr style="margin:64px 0;border-color:#333">\n')}
</body></html>`;
    downloadText("skyscraper-bundle.html", html, "text/html");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-24 mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Review e publicação · Skyscraper</h1>
            <p className="text-sm text-muted-foreground">
              SEO score · workflow (autor → editor → admin) · A/B de CTAs · exportação em massa.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-muted-foreground">Papel:</label>
            <select
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
              className="text-xs rounded bg-background border border-border px-2 py-1"
            >
              <option value="autor">autor</option>
              <option value="editor">editor</option>
              <option value="admin">admin</option>
            </select>
            <div className="w-px h-6 bg-border mx-2" />
            <button onClick={() => exportBulk("json")} className="text-xs rounded-full bg-muted px-3 py-2">Exportar JSON</button>
            <button onClick={() => exportBulk("md")} className="text-xs rounded-full bg-muted px-3 py-2">Exportar MD</button>
            <button onClick={() => exportBulk("html")} className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-2 font-semibold">Exportar HTML</button>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_1.6fr] gap-6">
          <ul className="space-y-3 max-h-[78vh] overflow-y-auto pr-2">
            {SKYSCRAPER_CALENDAR.map((a) => {
              const w = ensureState(all, a);
              const r = renderSkyscraperArticle(a);
              const sc = auditArticle(a, r).score;
              const active = selected === a.slug;
              return (
                <li
                  key={a.slug}
                  className={`rounded-2xl border p-4 cursor-pointer transition ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                  onClick={() => setSelected(a.slug)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-primary font-semibold">Sem {a.week}</span>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status]}`}>
                      {w.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug">{a.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">SEO: <strong className={sc >= 80 ? "text-emerald-400" : sc >= 60 ? "text-amber-400" : "text-destructive"}>{sc}</strong></span>
                    <Link
                      to="/blog-skyscraper/$slug"
                      params={{ slug: a.slug }}
                      target="_blank"
                      className="text-primary underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      abrir →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-border bg-card p-5 max-h-[78vh] overflow-y-auto">
            {!article || !rendered || !audit || !state ? (
              <p className="text-sm text-muted-foreground">Selecione um post à esquerda.</p>
            ) : (
              <div>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-xl font-bold">{rendered.title}</h2>
                  <span className={`text-xs uppercase px-2 py-1 rounded ${STATUS_COLORS[state.status]}`}>{state.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rendered.wordCount} palavras · {rendered.readingTimeMinutes} min · KW: <strong>{article.targetKeyword}</strong>
                </p>

                <nav className="mt-4 flex gap-1 text-xs">
                  {(["seo", "workflow", "ab", "export"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {t === "seo" ? "SEO" : t === "workflow" ? "Workflow" : t === "ab" ? "A/B" : "Export"}
                    </button>
                  ))}
                </nav>

                {tab === "seo" && (
                  <section className="mt-5">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold">{audit.score}</div>
                      <div>
                        <p className="text-sm font-semibold">Nota {audit.grade}</p>
                        <p className="text-xs text-muted-foreground">
                          H1: {audit.headings.h1} · H2: {audit.headings.h2} · H3: {audit.headings.h3}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Densidade KW: {audit.density.occurrences}× ({audit.density.percent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                      {audit.checks.map((c) => (
                        <li key={c.id} className="flex items-start justify-between gap-3 border-b border-border pb-2">
                          <div>
                            <p className="font-medium">{c.label}</p>
                            <p className="text-xs text-muted-foreground">{c.detail}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${c.status === "ok" ? "bg-emerald-500/20 text-emerald-300" : c.status === "warn" ? "bg-amber-500/20 text-amber-300" : "bg-destructive/20 text-destructive"}`}>
                            {c.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs text-muted-foreground">Canonical: <code>{audit.canonical}</code></p>
                    <p className="text-xs text-muted-foreground">Schemas: {audit.schemas.join(" · ")}</p>
                  </section>
                )}

                {tab === "workflow" && (
                  <section className="mt-5">
                    <p className="text-xs text-muted-foreground">Logado como: <strong>{role}</strong></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {allowedTransitions(state.status, role).map((t) => (
                        <button
                          key={t.to}
                          onClick={() => {
                            const note = window.prompt(`Nota para ${t.to}?`) ?? undefined;
                            patch(article.slug, transition(state, t.to, role, note));
                          }}
                          className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-1.5 font-semibold"
                        >
                          → {t.to}
                        </button>
                      ))}
                      {allowedTransitions(state.status, role).length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Sem transições disponíveis para o papel atual.
                        </p>
                      )}
                    </div>

                    <h3 className="mt-5 font-semibold text-sm">Histórico ({state.history.length})</h3>
                    <ol className="mt-2 space-y-2 text-xs">
                      {[...state.history].reverse().map((h, i) => (
                        <li key={i} className="bg-muted/30 p-2 rounded">
                          <span className="text-muted-foreground">{new Date(h.at).toLocaleString("pt-BR")}</span>
                          {" · "}
                          <strong>{h.by}</strong>
                          {" · "}{h.action}
                          {h.note ? <p className="mt-1 italic">"{h.note}"</p> : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {tab === "ab" && (
                  <section className="mt-5 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Variante ativa: <strong>{state.activeVariantId}</strong>. Edite cópias e trilhas internas; pesos somam o split de tráfego.
                    </p>
                    {state.variants.map((v) => (
                      <div key={v.id} className="rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            value={v.label}
                            onChange={(e) => patch(article.slug, updateVariant(state, v.id, { label: e.target.value }, role))}
                            className="text-sm font-semibold bg-transparent border-b border-border flex-1"
                          />
                          <button
                            onClick={() => patch(article.slug, { ...state, activeVariantId: v.id })}
                            className={`text-xs px-2 py-1 rounded ${state.activeVariantId === v.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            {state.activeVariantId === v.id ? "ativa" : "ativar"}
                          </button>
                        </div>
                        <label className="block text-xs">
                          CTA primário
                          <input
                            value={v.ctaPrimary}
                            onChange={(e) => patch(article.slug, updateVariant(state, v.id, { ctaPrimary: e.target.value }, role))}
                            className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1"
                          />
                        </label>
                        <label className="block text-xs">
                          CTA href
                          <input
                            value={v.ctaHref}
                            onChange={(e) => patch(article.slug, updateVariant(state, v.id, { ctaHref: e.target.value }, role))}
                            className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1"
                          />
                        </label>
                        <label className="block text-xs">
                          Trilha interna (1 href por linha)
                          <textarea
                            value={v.internalLinks.join("\n")}
                            onChange={(e) => patch(article.slug, updateVariant(state, v.id, { internalLinks: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) }, role))}
                            className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1 h-20"
                          />
                        </label>
                        <div className="flex items-center gap-3 text-xs">
                          <label>
                            peso
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={v.weight}
                              onChange={(e) => patch(article.slug, updateVariant(state, v.id, { weight: Number(e.target.value) }, role))}
                              className="ml-2 w-16 bg-background border border-border rounded px-2 py-1"
                            />
                          </label>
                          <span className="text-muted-foreground">imp {v.impressions} · clk {v.clicks} · CTR {v.impressions ? ((v.clicks / v.impressions) * 100).toFixed(2) : "0.00"}%</span>
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {tab === "export" && (
                  <section className="mt-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Exporta apenas este post:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => downloadText(`${article.slug}.json`, JSON.stringify({ slug: article.slug, title: rendered.title, meta: rendered.meta, canonical: `https://0web.com.br/blog-skyscraper/${article.slug}`, jsonld: buildJsonLd(article, rendered), workflow: state }, null, 2), "application/json")}
                        className="text-xs rounded-full bg-muted px-3 py-2"
                      >
                        JSON + JSON-LD
                      </button>
                      <button
                        onClick={() => downloadText(`${article.slug}.md`, toMarkdown({ article, rendered, workflow: state }), "text/markdown")}
                        className="text-xs rounded-full bg-muted px-3 py-2"
                      >
                        Markdown
                      </button>
                      <button
                        onClick={() => downloadText(`${article.slug}.html`, toHtml({ article, rendered, workflow: state }), "text/html")}
                        className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-2 font-semibold"
                      >
                        HTML (com meta + schema)
                      </button>
                    </div>
                    <pre className="mt-3 text-[11px] bg-muted/30 p-3 rounded overflow-x-auto">{`<title>${rendered.title} · 0WEB</title>
<meta name="description" content="${rendered.meta}">
<link rel="canonical" href="https://0web.com.br/blog-skyscraper/${article.slug}">`}</pre>
                  </section>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
