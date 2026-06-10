import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";
import { renderSkyscraperArticle } from "@/lib/skyscraper-render";
import { auditArticle } from "@/lib/skyscraper-seo-audit";
import { validateJsonLd } from "@/lib/skyscraper-jsonld-validator";
import {
  aggregateEvents,
  allowedTransitions,
  buildJsonLd,
  buildSnapshot,
  clearEvents,
  diffSnapshots,
  downloadText,
  ensureState,
  evaluatePublishGate,
  getRole,
  loadAll,
  loadEvents,
  loadSnapshots,
  pushEvent,
  saveAll,
  saveSnapshots,
  setRole as persistRole,
  toHtml,
  toMarkdown,
  transition,
  updateVariant,
  type AbEvent,
  type Role,
  type Snapshot,
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

type Tab = "seo" | "workflow" | "ab" | "diff" | "export";

function ReviewPage() {
  const [all, setAll] = useState<Record<string, WorkflowState>>({});
  const [snaps, setSnaps] = useState<Record<string, Snapshot[]>>({});
  const [events, setEvents] = useState<AbEvent[]>([]);
  const [role, setRoleState] = useState<Role>("autor");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("seo");
  const [diffPair, setDiffPair] = useState<{ a?: string; b?: string }>({});
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  useEffect(() => {
    setAll(loadAll());
    setSnaps(loadSnapshots());
    setEvents(loadEvents());
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
  const jsonldReport = useMemo(
    () => (article && rendered ? validateJsonLd(buildJsonLd(article, rendered)) : null),
    [article, rendered],
  );
  const state = article ? ensureState(all, article) : null;
  const articleSnaps = article ? snaps[article.slug] ?? [] : [];

  const gate = useMemo(() => {
    if (!state || !audit || !jsonldReport) return null;
    return evaluatePublishGate({
      state,
      role,
      seoScore: audit.score,
      seoFailedCount: audit.checks.filter((c) => c.status === "fail").length,
      jsonldErrors: jsonldReport.errors,
    });
  }, [state, role, audit, jsonldReport]);

  function recordSnapshot(label?: string) {
    if (!article || !rendered) return;
    const snap = buildSnapshot(article, rendered, role, label);
    const next = { ...snaps, [article.slug]: [...(snaps[article.slug] ?? []), snap] };
    setSnaps(next);
    saveSnapshots(next);
  }

  function simulateEvent(slug: string, variantId: string, kind: AbEvent["kind"]) {
    const ev: AbEvent = { at: new Date().toISOString(), slug, variantId, kind };
    pushEvent(ev);
    setEvents((prev) => [...prev, ev]);
  }

  async function exportZip() {
    const zip = new JSZip();
    const index: any[] = [];
    for (const a of SKYSCRAPER_CALENDAR) {
      const r = renderSkyscraperArticle(a);
      const w = ensureState(all, a);
      const jsonld = buildJsonLd(a, r);
      const canonical = `https://0web.com.br/blog-skyscraper/${a.slug}`;
      const folder = zip.folder(a.slug)!;
      folder.file("article.html", toHtml({ article: a, rendered: r, workflow: w }));
      folder.file("article.md", toMarkdown({ article: a, rendered: r, workflow: w }));
      folder.file("jsonld.json", JSON.stringify(jsonld, null, 2));
      folder.file(
        "meta.json",
        JSON.stringify(
          {
            title: r.title,
            description: r.meta,
            canonical,
            ogTitle: r.title,
            ogDescription: r.meta,
            ogUrl: canonical,
            ogType: "article",
            twitterCard: "summary_large_image",
            keyword: a.targetKeyword,
            wordCount: r.wordCount,
            status: w.status,
          },
          null,
          2,
        ),
      );
      folder.file(
        "assets-prompts.json",
        JSON.stringify(
          {
            cover: { filename: `${a.slug}-cover.png`, prompt: r.imagePrompts.cover },
            inline: r.imagePrompts.inline.map((i) => ({
              filename: `${a.slug}-${i.id}.png`,
              alt: i.alt,
              prompt: i.prompt,
            })),
          },
          null,
          2,
        ),
      );
      folder.file(
        "assets-prompts.txt",
        [
          `# Capa\n${r.imagePrompts.cover}\n`,
          ...r.imagePrompts.inline.map((i) => `## ${i.id} — ${i.alt}\n${i.prompt}\n`),
        ].join("\n"),
      );
      index.push({ slug: a.slug, title: r.title, canonical, status: w.status });
    }
    zip.file("index.json", JSON.stringify(index, null, 2));
    zip.file(
      "README.md",
      `# Skyscraper bundle (${SKYSCRAPER_CALENDAR.length} posts)\n\nCada pasta contém: article.html, article.md, jsonld.json, meta.json, assets-prompts.{json,txt}.\nGerado em ${new Date().toISOString()}.\n`,
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skyscraper-bundle-${new Date().toISOString().slice(0, 10)}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportSingle(kind: "json" | "md" | "html") {
    if (!article || !rendered || !state) return;
    if (kind === "json")
      downloadText(
        `${article.slug}.json`,
        JSON.stringify(
          { slug: article.slug, title: rendered.title, meta: rendered.meta, canonical: `https://0web.com.br/blog-skyscraper/${article.slug}`, jsonld: buildJsonLd(article, rendered), workflow: state },
          null,
          2,
        ),
        "application/json",
      );
    if (kind === "md")
      downloadText(`${article.slug}.md`, toMarkdown({ article, rendered, workflow: state }), "text/markdown");
    if (kind === "html")
      downloadText(`${article.slug}.html`, toHtml({ article, rendered, workflow: state }), "text/html");
  }

  // diff
  const snapA = articleSnaps.find((s) => s.id === diffPair.a);
  const snapB = articleSnaps.find((s) => s.id === diffPair.b);
  const diffs = snapA && snapB ? diffSnapshots(snapA, snapB) : [];

  // AB stats (range)
  const stats = article
    ? aggregateEvents(events, article.slug, {
        from: range.from ? new Date(range.from).toISOString() : undefined,
        to: range.to ? new Date(range.to + "T23:59:59").toISOString() : undefined,
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-24 mx-auto max-w-7xl px-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Review e publicação · Skyscraper</h1>
            <p className="text-sm text-muted-foreground">
              SEO + JSON-LD validator · workflow com gate de publicação · A/B com tracking · diff de revisões · export ZIP.
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
            <button onClick={exportZip} className="text-xs rounded-full bg-primary text-primary-foreground px-4 py-2 font-semibold">
              Exportar ZIP (24 posts + assets)
            </button>
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
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_COLORS[w.status]}`}>{w.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    SEO: <strong className={sc >= 80 ? "text-emerald-400" : sc >= 60 ? "text-amber-400" : "text-destructive"}>{sc}</strong>
                    {" · "}
                    revisões: {snaps[a.slug]?.length ?? 0}
                  </p>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-border bg-card p-5 max-h-[78vh] overflow-y-auto">
            {!article || !rendered || !audit || !state || !jsonldReport || !gate ? (
              <p className="text-sm text-muted-foreground">Selecione um post à esquerda.</p>
            ) : (
              <div>
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h2 className="text-xl font-bold">{rendered.title}</h2>
                  <span className={`text-xs uppercase px-2 py-1 rounded ${STATUS_COLORS[state.status]}`}>{state.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rendered.wordCount} palavras · KW: <strong>{article.targetKeyword}</strong> · <Link to="/blog-skyscraper/$slug" params={{ slug: article.slug }} target="_blank" className="text-primary underline">abrir post →</Link>
                </p>

                {/* Publish gate banner */}
                <div className={`mt-4 rounded-xl border p-3 text-xs ${gate.canPublish ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
                  <p className="font-semibold">{gate.canPublish ? "✓ Pronto para publicar" : "✗ Publicação bloqueada"}</p>
                  {gate.blockers.length > 0 && (
                    <ul className="mt-1 list-disc pl-5 space-y-0.5">
                      {gate.blockers.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                  {gate.warnings.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 space-y-0.5 text-amber-300">
                      {gate.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  )}
                </div>

                <nav className="mt-4 flex gap-1 text-xs flex-wrap">
                  {(["seo", "workflow", "ab", "diff", "export"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-full ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {t === "seo" ? "SEO + JSON-LD" : t === "workflow" ? "Workflow" : t === "ab" ? "A/B + Tracking" : t === "diff" ? "Diff revisões" : "Export"}
                    </button>
                  ))}
                </nav>

                {tab === "seo" && (
                  <section className="mt-5">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold">{audit.score}</div>
                      <div className="text-xs text-muted-foreground">
                        Nota {audit.grade} · H2 {audit.headings.h2} · H3 {audit.headings.h3} · KW {audit.density.occurrences}× ({audit.density.percent.toFixed(2)}%)
                      </div>
                    </div>

                    <h3 className="mt-5 font-semibold text-sm">Checklist SEO</h3>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {audit.checks.map((c) => (
                        <li key={c.id} className="flex items-start justify-between gap-3 border-b border-border pb-1.5">
                          <div>
                            <p className="font-medium">{c.label}</p>
                            <p className="text-xs text-muted-foreground">{c.detail}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${c.status === "ok" ? "bg-emerald-500/20 text-emerald-300" : c.status === "warn" ? "bg-amber-500/20 text-amber-300" : "bg-destructive/20 text-destructive"}`}>{c.status}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="mt-5 font-semibold text-sm">
                      Validação JSON-LD —{" "}
                      <span className={jsonldReport.ok ? "text-emerald-400" : "text-destructive"}>
                        {jsonldReport.errors} erro(s) · {jsonldReport.warnings} aviso(s)
                      </span>
                    </h3>
                    {jsonldReport.issues.length === 0 ? (
                      <p className="text-xs text-muted-foreground mt-1">Tudo válido (Article, BreadcrumbList, FAQPage).</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-xs">
                        {jsonldReport.issues.map((i, idx) => (
                          <li key={idx} className="flex items-start gap-2 border-b border-border pb-1">
                            <span className={`px-2 py-0.5 rounded ${i.level === "error" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-300"}`}>{i.level}</span>
                            <span><strong>{i.schema}</strong>.{i.path}: {i.message}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {tab === "workflow" && (
                  <section className="mt-5">
                    <div className="flex flex-wrap gap-2">
                      {allowedTransitions(state.status, role).map((t) => {
                        const isPublish = t.to === "publicado";
                        const disabled = isPublish && !gate.canPublish;
                        return (
                          <button
                            key={t.to}
                            disabled={disabled}
                            title={disabled ? gate.blockers.join("\n") : ""}
                            onClick={() => {
                              const note = window.prompt(`Nota para ${t.to}?`) ?? undefined;
                              patch(article.slug, transition(state, t.to, role, note));
                              if (t.to === "em_revisao" || t.to === "aprovado" || t.to === "publicado") recordSnapshot(`auto:${t.to}`);
                            }}
                            className={`text-xs rounded-full px-3 py-1.5 font-semibold ${disabled ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground"}`}
                          >
                            → {t.to}{disabled ? " (bloqueado)" : ""}
                          </button>
                        );
                      })}
                      {allowedTransitions(state.status, role).length === 0 && (
                        <p className="text-xs text-muted-foreground">Sem transições para este papel.</p>
                      )}
                      <button onClick={() => recordSnapshot(window.prompt("Label da revisão?") ?? undefined)} className="text-xs rounded-full bg-muted px-3 py-1.5">
                        Salvar revisão (snapshot)
                      </button>
                    </div>

                    <h3 className="mt-5 font-semibold text-sm">Histórico ({state.history.length})</h3>
                    <ol className="mt-2 space-y-1 text-xs">
                      {[...state.history].reverse().map((h, i) => (
                        <li key={i} className="bg-muted/30 p-2 rounded">
                          <span className="text-muted-foreground">{new Date(h.at).toLocaleString("pt-BR")}</span> · <strong>{h.by}</strong> · {h.action}
                          {h.note ? <p className="mt-1 italic">"{h.note}"</p> : null}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {tab === "ab" && (
                  <section className="mt-5 space-y-4">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs font-semibold">Performance por período</p>
                      <div className="mt-2 flex flex-wrap items-end gap-2 text-xs">
                        <label>De <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className="ml-1 bg-background border border-border rounded px-2 py-1" /></label>
                        <label>Até <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className="ml-1 bg-background border border-border rounded px-2 py-1" /></label>
                        <button onClick={() => { clearEvents(article.slug); setEvents(loadEvents()); }} className="ml-auto rounded bg-muted px-2 py-1">Limpar eventos</button>
                      </div>
                      <table className="mt-3 w-full text-xs">
                        <thead><tr className="text-left text-muted-foreground"><th>Variante</th><th>Imp</th><th>Clicks</th><th>CTR</th></tr></thead>
                        <tbody>
                          {stats.length === 0 ? <tr><td colSpan={4} className="py-2 text-muted-foreground">Sem eventos no período.</td></tr> :
                            stats.map((s) => (
                              <tr key={s.variantId} className="border-t border-border">
                                <td className="py-1 font-semibold">{s.variantId}</td>
                                <td>{s.impressions}</td>
                                <td>{s.clicks}</td>
                                <td>{s.ctr.toFixed(2)}%</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {state.variants.map((v) => (
                      <div key={v.id} className="rounded-xl border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input value={v.label} onChange={(e) => patch(article.slug, updateVariant(state, v.id, { label: e.target.value }, role))} className="text-sm font-semibold bg-transparent border-b border-border flex-1" />
                          <button onClick={() => patch(article.slug, { ...state, activeVariantId: v.id })} className={`text-xs px-2 py-1 rounded ${state.activeVariantId === v.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{state.activeVariantId === v.id ? "ativa" : "ativar"}</button>
                        </div>
                        <label className="block text-xs">CTA primário
                          <input value={v.ctaPrimary} onChange={(e) => patch(article.slug, updateVariant(state, v.id, { ctaPrimary: e.target.value }, role))} className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1" />
                        </label>
                        <label className="block text-xs">CTA href
                          <input value={v.ctaHref} onChange={(e) => patch(article.slug, updateVariant(state, v.id, { ctaHref: e.target.value }, role))} className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1" />
                        </label>
                        <label className="block text-xs">Trilha interna (1 href por linha)
                          <textarea value={v.internalLinks.join("\n")} onChange={(e) => patch(article.slug, updateVariant(state, v.id, { internalLinks: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) }, role))} className="mt-1 w-full text-sm bg-background border border-border rounded px-2 py-1 h-20" />
                        </label>
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <label>peso <input type="number" min={0} max={100} value={v.weight} onChange={(e) => patch(article.slug, updateVariant(state, v.id, { weight: Number(e.target.value) }, role))} className="ml-2 w-16 bg-background border border-border rounded px-2 py-1" /></label>
                          <button onClick={() => simulateEvent(article.slug, v.id, "impression")} className="rounded bg-muted px-2 py-1">+ impressão</button>
                          <button onClick={() => simulateEvent(article.slug, v.id, "click")} className="rounded bg-primary text-primary-foreground px-2 py-1">+ click</button>
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {tab === "diff" && (
                  <section className="mt-5">
                    <p className="text-xs text-muted-foreground">Compare duas revisões salvas para ver exatamente o que mudou (título, meta, headings, links, FAQ, JSON-LD).</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <select value={diffPair.a ?? ""} onChange={(e) => setDiffPair((d) => ({ ...d, a: e.target.value || undefined }))} className="bg-background border border-border rounded px-2 py-1">
                        <option value="">Revisão A…</option>
                        {articleSnaps.map((s) => <option key={s.id} value={s.id}>{new Date(s.at).toLocaleString("pt-BR")} · {s.by}{s.label ? ` · ${s.label}` : ""}</option>)}
                      </select>
                      <select value={diffPair.b ?? ""} onChange={(e) => setDiffPair((d) => ({ ...d, b: e.target.value || undefined }))} className="bg-background border border-border rounded px-2 py-1">
                        <option value="">Revisão B…</option>
                        {articleSnaps.map((s) => <option key={s.id} value={s.id}>{new Date(s.at).toLocaleString("pt-BR")} · {s.by}{s.label ? ` · ${s.label}` : ""}</option>)}
                      </select>
                    </div>

                    {articleSnaps.length === 0 && <p className="text-xs text-muted-foreground mt-3">Nenhuma revisão salva ainda. Use a aba Workflow para registrar uma.</p>}

                    {snapA && snapB && (
                      diffs.length === 0
                        ? <p className="mt-4 text-sm text-emerald-400">Sem diferenças detectadas entre as duas revisões.</p>
                        : <ul className="mt-4 space-y-3 text-xs">
                            {diffs.map((d, i) => (
                              <li key={i} className="rounded border border-border p-3">
                                <p className="font-semibold text-sm">{d.field}</p>
                                <div className="mt-1 grid grid-cols-2 gap-2">
                                  <div className="bg-destructive/10 p-2 rounded"><p className="text-[10px] uppercase text-destructive">A</p><p className="break-words">{d.from || <em className="text-muted-foreground">vazio</em>}</p></div>
                                  <div className="bg-emerald-500/10 p-2 rounded"><p className="text-[10px] uppercase text-emerald-400">B</p><p className="break-words">{d.to || <em className="text-muted-foreground">vazio</em>}</p></div>
                                </div>
                              </li>
                            ))}
                          </ul>
                    )}
                  </section>
                )}

                {tab === "export" && (
                  <section className="mt-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Este post:</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => exportSingle("json")} className="text-xs rounded-full bg-muted px-3 py-2">JSON + JSON-LD</button>
                      <button onClick={() => exportSingle("md")} className="text-xs rounded-full bg-muted px-3 py-2">Markdown</button>
                      <button onClick={() => exportSingle("html")} className="text-xs rounded-full bg-primary text-primary-foreground px-3 py-2 font-semibold">HTML completo</button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">Tudo (24 posts em ZIP estruturado): use o botão no topo. Inclui HTML, Markdown, jsonld.json, meta.json e assets-prompts (capa + inline).</p>
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
