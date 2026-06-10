// Validador JSON-LD client-side (sem deps). Cobre Article, BreadcrumbList e
// FAQPage produzidos pelo render skyscraper. Retorna erros e avisos.

export type JsonLdIssue = {
  level: "error" | "warning";
  schema: string;
  path: string;
  message: string;
};

export type JsonLdReport = {
  ok: boolean;
  errors: number;
  warnings: number;
  issues: JsonLdIssue[];
};

function isStr(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}
function isUrl(v: unknown) {
  return typeof v === "string" && /^https?:\/\//.test(v);
}

function validateArticle(obj: any): JsonLdIssue[] {
  const out: JsonLdIssue[] = [];
  const required = ["headline", "description", "mainEntityOfPage", "author", "publisher"];
  for (const f of required) {
    if (!obj[f]) out.push({ level: "error", schema: "Article", path: f, message: `Campo obrigatório ausente: ${f}` });
  }
  if (obj.headline && obj.headline.length > 110) {
    out.push({ level: "warning", schema: "Article", path: "headline", message: `headline > 110 chars (${obj.headline.length})` });
  }
  if (obj.mainEntityOfPage && !isUrl(obj.mainEntityOfPage)) {
    out.push({ level: "error", schema: "Article", path: "mainEntityOfPage", message: "deve ser URL absoluta" });
  }
  if (!obj.image) {
    out.push({ level: "warning", schema: "Article", path: "image", message: "image recomendado (≥1200×630)" });
  }
  if (!obj.datePublished) {
    out.push({ level: "warning", schema: "Article", path: "datePublished", message: "datePublished recomendado (ISO 8601)" });
  }
  if (obj.author && !obj.author["@type"]) {
    out.push({ level: "error", schema: "Article", path: "author.@type", message: "author precisa de @type" });
  }
  return out;
}

function validateBreadcrumb(obj: any): JsonLdIssue[] {
  const out: JsonLdIssue[] = [];
  if (!Array.isArray(obj.itemListElement) || obj.itemListElement.length < 2) {
    out.push({ level: "error", schema: "BreadcrumbList", path: "itemListElement", message: "≥ 2 itens" });
    return out;
  }
  obj.itemListElement.forEach((it: any, i: number) => {
    if (it["@type"] !== "ListItem") out.push({ level: "error", schema: "BreadcrumbList", path: `[${i}].@type`, message: "deve ser ListItem" });
    if (typeof it.position !== "number") out.push({ level: "error", schema: "BreadcrumbList", path: `[${i}].position`, message: "position numérico obrigatório" });
    if (!isStr(it.name)) out.push({ level: "error", schema: "BreadcrumbList", path: `[${i}].name`, message: "name obrigatório" });
    if (!isUrl(it.item)) out.push({ level: "error", schema: "BreadcrumbList", path: `[${i}].item`, message: "item deve ser URL absoluta" });
    if (it.position !== i + 1) out.push({ level: "warning", schema: "BreadcrumbList", path: `[${i}].position`, message: `position deve ser ${i + 1}` });
  });
  return out;
}

function validateFaq(obj: any): JsonLdIssue[] {
  const out: JsonLdIssue[] = [];
  if (!Array.isArray(obj.mainEntity) || obj.mainEntity.length === 0) {
    out.push({ level: "error", schema: "FAQPage", path: "mainEntity", message: "≥ 1 Question" });
    return out;
  }
  if (obj.mainEntity.length < 3) {
    out.push({ level: "warning", schema: "FAQPage", path: "mainEntity", message: "Google recomenda ≥ 3 Q&A" });
  }
  obj.mainEntity.forEach((q: any, i: number) => {
    if (q["@type"] !== "Question") out.push({ level: "error", schema: "FAQPage", path: `mainEntity[${i}].@type`, message: "@type Question" });
    if (!isStr(q.name)) out.push({ level: "error", schema: "FAQPage", path: `mainEntity[${i}].name`, message: "name (pergunta) obrigatório" });
    const a = q.acceptedAnswer;
    if (!a || a["@type"] !== "Answer") out.push({ level: "error", schema: "FAQPage", path: `mainEntity[${i}].acceptedAnswer`, message: "acceptedAnswer com @type Answer" });
    if (a && !isStr(a.text)) out.push({ level: "error", schema: "FAQPage", path: `mainEntity[${i}].acceptedAnswer.text`, message: "text obrigatório" });
    if (a && isStr(a.text) && a.text.length < 50) out.push({ level: "warning", schema: "FAQPage", path: `mainEntity[${i}].acceptedAnswer.text`, message: "resposta < 50 chars" });
  });
  return out;
}

export function validateJsonLd(blocks: any[]): JsonLdReport {
  const issues: JsonLdIssue[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") {
      issues.push({ level: "error", schema: "?", path: "root", message: "bloco inválido" });
      continue;
    }
    if (b["@context"] !== "https://schema.org") {
      issues.push({ level: "error", schema: b["@type"] ?? "?", path: "@context", message: "deve ser https://schema.org" });
    }
    switch (b["@type"]) {
      case "Article":
        issues.push(...validateArticle(b));
        break;
      case "BreadcrumbList":
        issues.push(...validateBreadcrumb(b));
        break;
      case "FAQPage":
        issues.push(...validateFaq(b));
        break;
      default:
        issues.push({ level: "warning", schema: String(b["@type"]), path: "@type", message: "tipo não validado" });
    }
  }
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warning").length;
  return { ok: errors === 0, errors, warnings, issues };
}
