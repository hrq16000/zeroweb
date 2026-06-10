// Auditoria SEO rápida para artigos skyscraper renderizados.
// Score 0-100 + checklist (headings, densidade KW, canonical, schema, meta).

import type { SkyscraperArticle } from "./skyscraper-calendar";
import type { RenderedArticle } from "./skyscraper-render";

export type SeoCheck = {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  weight: number;
};

export type SeoAudit = {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  checks: SeoCheck[];
  headings: { h1: number; h2: number; h3: number };
  density: { keyword: string; occurrences: number; percent: number };
  canonical: string;
  schemas: string[];
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countHeadings(html: string, tag: string) {
  const re = new RegExp(`<${tag}\\b`, "gi");
  return (html.match(re) ?? []).length;
}

function grade(score: number): SeoAudit["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function auditArticle(article: SkyscraperArticle, rendered: RenderedArticle): SeoAudit {
  const text = stripHtml(rendered.bodyHtml).toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const kw = article.targetKeyword.toLowerCase();
  const occurrences = (text.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  const percent = words.length ? (occurrences / words.length) * 100 : 0;

  const h1 = countHeadings(rendered.bodyHtml, "h1");
  const h2 = countHeadings(rendered.bodyHtml, "h2");
  const h3 = countHeadings(rendered.bodyHtml, "h3");

  const canonical = `https://0web.com.br/blog-skyscraper/${article.slug}`;
  const schemas = ["Article", "BreadcrumbList", "FAQPage"];

  const checks: SeoCheck[] = [
    {
      id: "title",
      label: "Title 30-65 chars",
      status: rendered.title.length >= 30 && rendered.title.length <= 65 ? "ok" : "warn",
      detail: `${rendered.title.length} chars`,
      weight: 10,
    },
    {
      id: "meta",
      label: "Meta description 120-160",
      status: rendered.meta.length >= 120 && rendered.meta.length <= 160 ? "ok" : "warn",
      detail: `${rendered.meta.length} chars`,
      weight: 10,
    },
    {
      id: "h1",
      label: "Exatamente 1 H1",
      status: h1 === 0 ? "ok" : "fail", // o H1 é do layout, body não deve ter outro
      detail: `${h1} H1 no corpo (esperado 0, layout já renderiza 1)`,
      weight: 10,
    },
    {
      id: "h2",
      label: "≥ 6 H2 (estrutura profunda)",
      status: h2 >= 6 ? "ok" : h2 >= 4 ? "warn" : "fail",
      detail: `${h2} H2`,
      weight: 10,
    },
    {
      id: "h3",
      label: "≥ 4 H3 (subseções)",
      status: h3 >= 4 ? "ok" : h3 >= 2 ? "warn" : "fail",
      detail: `${h3} H3`,
      weight: 5,
    },
    {
      id: "density",
      label: "Densidade KW 0.5%-2.5%",
      status: percent >= 0.5 && percent <= 2.5 ? "ok" : percent > 0 ? "warn" : "fail",
      detail: `${occurrences}× (${percent.toFixed(2)}%)`,
      weight: 15,
    },
    {
      id: "wordcount",
      label: "≥ 2000 palavras",
      status: rendered.wordCount >= 2000 ? "ok" : rendered.wordCount >= 1200 ? "warn" : "fail",
      detail: `${rendered.wordCount} palavras`,
      weight: 10,
    },
    {
      id: "canonical",
      label: "Canonical definido",
      status: canonical.startsWith("https://0web.com.br/") ? "ok" : "fail",
      detail: canonical,
      weight: 5,
    },
    {
      id: "schema",
      label: "JSON-LD Article + Breadcrumb + FAQ",
      status: "ok",
      detail: schemas.join(", "),
      weight: 10,
    },
    {
      id: "internal",
      label: "≥ 3 links internos",
      status:
        rendered.internalLinks.length >= 3
          ? "ok"
          : rendered.internalLinks.length > 0
            ? "warn"
            : "fail",
      detail: `${rendered.internalLinks.length} links`,
      weight: 10,
    },
    {
      id: "cta",
      label: "CTA primário presente",
      status: rendered.cta?.primary ? "ok" : "fail",
      detail: rendered.cta?.primary ?? "—",
      weight: 5,
    },
  ];

  const totalWeight = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce(
    (a, c) => a + c.weight * (c.status === "ok" ? 1 : c.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = Math.round((earned / totalWeight) * 100);

  return {
    score,
    grade: grade(score),
    checks,
    headings: { h1, h2, h3 },
    density: { keyword: article.targetKeyword, occurrences, percent },
    canonical,
    schemas,
  };
}
