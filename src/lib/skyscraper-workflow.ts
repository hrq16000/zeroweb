// Fluxo de aprovação editorial + variações A/B + histórico, persistido em
// localStorage (client-only). Sem backend para manter escopo enxuto.

import type { SkyscraperArticle } from "./skyscraper-calendar";
import type { RenderedArticle } from "./skyscraper-render";

export type Role = "autor" | "editor" | "admin";
export type WorkflowStatus =
  | "rascunho"
  | "em_revisao"
  | "aprovado"
  | "agendado"
  | "publicado"
  | "rejeitado";

export type HistoryEntry = {
  at: string; // ISO
  by: Role;
  action: string;
  note?: string;
  from?: WorkflowStatus;
  to?: WorkflowStatus;
};

export type AbVariant = {
  id: string; // "A" | "B" | custom
  label: string;
  ctaPrimary: string;
  ctaHref: string;
  internalLinks: string[]; // hrefs
  weight: number; // 0-100
  impressions: number;
  clicks: number;
};

export type WorkflowState = {
  status: WorkflowStatus;
  scheduledAt?: string;
  assignee?: Role;
  history: HistoryEntry[];
  variants: AbVariant[];
  activeVariantId: string;
};

const KEY = "skyscraper-workflow-v1";
const ROLE_KEY = "skyscraper-current-role-v1";

export function loadAll(): Record<string, WorkflowState> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveAll(s: Record<string, WorkflowState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getRole(): Role {
  if (typeof window === "undefined") return "autor";
  return (localStorage.getItem(ROLE_KEY) as Role) ?? "autor";
}

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, r);
}

export function defaultState(article: SkyscraperArticle): WorkflowState {
  return {
    status: "rascunho",
    history: [
      {
        at: new Date().toISOString(),
        by: "autor",
        action: "created",
        to: "rascunho",
      },
    ],
    variants: [
      {
        id: "A",
        label: "Controle (CTA original)",
        ctaPrimary: article.cta.primary,
        ctaHref: article.cta.href,
        internalLinks: article.internalLinks,
        weight: 50,
        impressions: 0,
        clicks: 0,
      },
      {
        id: "B",
        label: "Variante agressiva",
        ctaPrimary: `Quero ${article.targetKeyword} com a 0web — diagnóstico grátis`,
        ctaHref: "/calculadora-orcamento",
        internalLinks: [...article.internalLinks, "/calculadora-orcamento", "/contato"],
        weight: 50,
        impressions: 0,
        clicks: 0,
      },
    ],
    activeVariantId: "A",
  };
}

export function ensureState(
  all: Record<string, WorkflowState>,
  article: SkyscraperArticle,
): WorkflowState {
  return all[article.slug] ?? defaultState(article);
}

// ---- permissions ------------------------------------------------------------

type Transition = { from: WorkflowStatus; to: WorkflowStatus; roles: Role[] };
const TRANSITIONS: Transition[] = [
  { from: "rascunho", to: "em_revisao", roles: ["autor", "editor", "admin"] },
  { from: "em_revisao", to: "aprovado", roles: ["editor", "admin"] },
  { from: "em_revisao", to: "rejeitado", roles: ["editor", "admin"] },
  { from: "rejeitado", to: "rascunho", roles: ["autor", "editor", "admin"] },
  { from: "aprovado", to: "agendado", roles: ["editor", "admin"] },
  { from: "aprovado", to: "publicado", roles: ["admin"] },
  { from: "agendado", to: "publicado", roles: ["admin"] },
  { from: "publicado", to: "rascunho", roles: ["admin"] },
];

export function allowedTransitions(status: WorkflowStatus, role: Role) {
  return TRANSITIONS.filter((t) => t.from === status && t.roles.includes(role));
}

export function transition(
  state: WorkflowState,
  to: WorkflowStatus,
  role: Role,
  note?: string,
): WorkflowState {
  const allowed = allowedTransitions(state.status, role).some((t) => t.to === to);
  if (!allowed) return state;
  return {
    ...state,
    status: to,
    history: [
      ...state.history,
      {
        at: new Date().toISOString(),
        by: role,
        action: `transition:${state.status}->${to}`,
        from: state.status,
        to,
        note,
      },
    ],
  };
}

export function updateVariant(
  state: WorkflowState,
  id: string,
  patch: Partial<AbVariant>,
  role: Role,
): WorkflowState {
  return {
    ...state,
    variants: state.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    history: [
      ...state.history,
      {
        at: new Date().toISOString(),
        by: role,
        action: `variant:update:${id}`,
        note: Object.keys(patch).join(","),
      },
    ],
  };
}

// ---- bulk export ------------------------------------------------------------

export type ExportBundle = {
  article: SkyscraperArticle;
  rendered: RenderedArticle;
  workflow: WorkflowState;
};

export function buildJsonLd(article: SkyscraperArticle, rendered: RenderedArticle) {
  const canonical = `https://0web.com.br/blog-skyscraper/${article.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: rendered.title,
      description: rendered.meta,
      mainEntityOfPage: canonical,
      wordCount: rendered.wordCount,
      keywords: article.targetKeyword,
      author: { "@type": "Organization", name: "0web" },
      publisher: { "@type": "Organization", name: "0web" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://0web.com.br/" },
        { "@type": "ListItem", position: 2, name: "Blog Skyscraper", item: "https://0web.com.br/blog-skyscraper" },
        { "@type": "ListItem", position: 3, name: rendered.title, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: rendered.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

export function toMarkdown(bundle: ExportBundle): string {
  const { article, rendered } = bundle;
  const canonical = `https://0web.com.br/blog-skyscraper/${article.slug}`;
  const body = rendered.bodyHtml
    .replace(/<h2[^>]*>/gi, "\n\n## ")
    .replace(/<\/h2>/gi, "\n")
    .replace(/<h3[^>]*>/gi, "\n\n### ")
    .replace(/<\/h3>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `---
title: ${rendered.title}
description: ${rendered.meta}
canonical: ${canonical}
keyword: ${article.targetKeyword}
status: ${bundle.workflow.status}
---

# ${rendered.title}

${body}
`;
}

export function toHtml(bundle: ExportBundle): string {
  const { article, rendered } = bundle;
  const canonical = `https://0web.com.br/blog-skyscraper/${article.slug}`;
  const jsonld = buildJsonLd(article, rendered);
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${rendered.title} · 0WEB</title>
  <meta name="description" content="${rendered.meta}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${rendered.title}">
  <meta property="og:description" content="${rendered.meta}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  ${jsonld
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join("\n  ")}
</head>
<body>
  <article>
    <h1>${rendered.title}</h1>
    ${rendered.bodyHtml}
  </article>
</body>
</html>`;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- snapshots (revisões para diff) ----------------------------------------

export type Snapshot = {
  id: string;
  at: string;
  by: Role;
  label?: string;
  title: string;
  meta: string;
  headingsH2: string[];
  headingsH3: string[];
  internalLinks: string[];
  faq: Array<{ q: string; a: string }>;
  jsonld: any[];
};

const SNAP_KEY = "skyscraper-snapshots-v1";

export function loadSnapshots(): Record<string, Snapshot[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(SNAP_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveSnapshots(s: Record<string, Snapshot[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SNAP_KEY, JSON.stringify(s));
}

export function extractHeadings(html: string, tag: "h2" | "h3"): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1].replace(/<[^>]+>/g, "").trim());
  return out;
}

export function buildSnapshot(
  article: SkyscraperArticle,
  rendered: RenderedArticle,
  by: Role,
  label?: string,
): Snapshot {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    by,
    label,
    title: rendered.title,
    meta: rendered.meta,
    headingsH2: extractHeadings(rendered.bodyHtml, "h2"),
    headingsH3: extractHeadings(rendered.bodyHtml, "h3"),
    internalLinks: rendered.internalLinks.map((l) => l.href),
    faq: rendered.faq,
    jsonld: buildJsonLd(article, rendered),
  };
}

export type DiffItem = { field: string; from: string; to: string };

export function diffSnapshots(a: Snapshot, b: Snapshot): DiffItem[] {
  const out: DiffItem[] = [];
  if (a.title !== b.title) out.push({ field: "title", from: a.title, to: b.title });
  if (a.meta !== b.meta) out.push({ field: "meta", from: a.meta, to: b.meta });
  const arrDiff = (field: string, x: string[], y: string[]) => {
    const ax = JSON.stringify(x);
    const ay = JSON.stringify(y);
    if (ax !== ay) out.push({ field, from: x.join(" | "), to: y.join(" | ") });
  };
  arrDiff("H2", a.headingsH2, b.headingsH2);
  arrDiff("H3", a.headingsH3, b.headingsH3);
  arrDiff("internalLinks", a.internalLinks, b.internalLinks);
  arrDiff("faq", a.faq.map((f) => f.q), b.faq.map((f) => f.q));
  const j1 = JSON.stringify(a.jsonld);
  const j2 = JSON.stringify(b.jsonld);
  if (j1 !== j2) out.push({ field: "jsonld", from: j1.slice(0, 200) + "…", to: j2.slice(0, 200) + "…" });
  return out;
}

// ---- A/B tracking events ---------------------------------------------------

export type AbEvent = {
  at: string;
  slug: string;
  variantId: string;
  kind: "impression" | "click";
  href?: string;
};

const EVENTS_KEY = "skyscraper-ab-events-v1";

export function loadEvents(): AbEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function pushEvent(ev: AbEvent) {
  if (typeof window === "undefined") return;
  const list = loadEvents();
  list.push(ev);
  // cap at 5000
  const capped = list.slice(-5000);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(capped));
}

export function clearEvents(slug?: string) {
  if (typeof window === "undefined") return;
  if (!slug) {
    localStorage.removeItem(EVENTS_KEY);
    return;
  }
  const filtered = loadEvents().filter((e) => e.slug !== slug);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
}

export type AbStats = {
  variantId: string;
  impressions: number;
  clicks: number;
  ctr: number;
};

export function aggregateEvents(
  events: AbEvent[],
  slug: string,
  range?: { from?: string; to?: string },
): AbStats[] {
  const filtered = events.filter((e) => {
    if (e.slug !== slug) return false;
    if (range?.from && e.at < range.from) return false;
    if (range?.to && e.at > range.to) return false;
    return true;
  });
  const map = new Map<string, AbStats>();
  for (const e of filtered) {
    const cur = map.get(e.variantId) ?? { variantId: e.variantId, impressions: 0, clicks: 0, ctr: 0 };
    if (e.kind === "impression") cur.impressions += 1;
    else cur.clicks += 1;
    map.set(e.variantId, cur);
  }
  for (const s of map.values()) s.ctr = s.impressions ? (s.clicks / s.impressions) * 100 : 0;
  return [...map.values()].sort((a, b) => a.variantId.localeCompare(b.variantId));
}

// ---- publish gate ----------------------------------------------------------

export type PublishGate = {
  canPublish: boolean;
  blockers: string[];
  warnings: string[];
};

export function evaluatePublishGate(opts: {
  state: WorkflowState;
  role: Role;
  seoScore: number;
  seoFailedCount: number;
  jsonldErrors: number;
}): PublishGate {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (opts.role !== "admin") blockers.push("Apenas o papel admin pode publicar.");
  if (opts.state.status !== "aprovado" && opts.state.status !== "agendado") {
    blockers.push(`Status atual é "${opts.state.status}" — precisa estar "aprovado" (revisão do editor) ou "agendado".`);
  }
  const hasEditorApproval = opts.state.history.some(
    (h) => (h.by === "editor" || h.by === "admin") && h.to === "aprovado",
  );
  if (!hasEditorApproval) blockers.push("Falta aprovação explícita do editor no histórico.");
  if (opts.seoScore < 80) blockers.push(`SEO score ${opts.seoScore} < 80 (mínimo exigido).`);
  if (opts.seoFailedCount > 0) blockers.push(`${opts.seoFailedCount} check(s) SEO em fail.`);
  if (opts.jsonldErrors > 0) blockers.push(`${opts.jsonldErrors} erro(s) de JSON-LD.`);

  if (opts.seoScore < 90 && opts.seoScore >= 80) warnings.push("SEO score < 90 — revisar quick wins.");

  return { canPublish: blockers.length === 0, blockers, warnings };
}
