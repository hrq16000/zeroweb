/**
 * Checklist de publicação para serviços.
 * Puro / determinístico — sem I/O. Usado no admin (gating do botão Publicar)
 * e potencialmente em CI.
 */
import type { ServiceRow } from "./services-crud.functions";

export type CheckStatus = "ok" | "warn" | "fail";
export type CheckItem = {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
};

export type PublishReport = {
  items: CheckItem[];
  score: number; // 0..100
  blocking: number; // count of "fail"
  canPublish: boolean;
};

function len(s: string | null | undefined) {
  return (s ?? "").trim().length;
}

function isValidJsonLd(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every((o) => {
    if (!o || typeof o !== "object") return false;
    const r = o as Record<string, unknown>;
    return typeof r["@context"] === "string" && typeof r["@type"] === "string";
  });
}

export function checkServiceForPublish(s: Partial<ServiceRow>): PublishReport {
  const items: CheckItem[] = [];

  // Title
  const t = len(s.seo_title) > 0 ? s.seo_title! : s.title ?? "";
  const tLen = t.trim().length;
  items.push({
    id: "title",
    label: "Title (30–60 chars)",
    status: tLen >= 30 && tLen <= 60 ? "ok" : tLen >= 20 && tLen <= 80 ? "warn" : "fail",
    message: tLen === 0 ? "Title em branco" : `${tLen} caracteres`,
  });

  // Description
  const d = len(s.seo_description) > 0 ? s.seo_description! : s.description ?? "";
  const dLen = d.trim().length;
  items.push({
    id: "description",
    label: "Description (80–160 chars)",
    status: dLen >= 80 && dLen <= 160 ? "ok" : dLen >= 60 && dLen <= 200 ? "warn" : "fail",
    message: dLen === 0 ? "Descrição em branco" : `${dLen} caracteres`,
  });

  // OG / image
  const hasImage = !!(s.image_path || s.og_image_path || s.image_url || s.og_image_url);
  items.push({
    id: "og_image",
    label: "Imagem (capa / OG)",
    status: hasImage ? "ok" : "fail",
    message: hasImage ? "Imagem definida" : "Faça upload de uma capa antes de publicar",
  });

  // Canonical (derived from slug)
  const slugOk = !!s.slug && /^[a-z0-9-]+$/.test(s.slug);
  items.push({
    id: "canonical",
    label: "Canonical (slug)",
    status: slugOk ? "ok" : "fail",
    message: slugOk ? `/servicos/${s.slug}` : "Slug inválido ou ausente",
  });

  // JSON-LD
  const jsonOk = isValidJsonLd(s.schema_jsonld);
  items.push({
    id: "jsonld",
    label: "Schema.org JSON-LD",
    status: jsonOk ? "ok" : (s.schema_jsonld && (s.schema_jsonld as unknown[]).length === 0 ? "warn" : "fail"),
    message: jsonOk
      ? `${(s.schema_jsonld as unknown[]).length} bloco(s)`
      : "Gere o JSON-LD (use 'Reconstruir SEO')",
  });

  // rich_html
  const richLen = len(s.rich_html);
  items.push({
    id: "rich_html",
    label: "Conteúdo rico (rich_html)",
    status: richLen >= 400 ? "ok" : richLen > 0 ? "warn" : "fail",
    message: richLen === 0 ? "Sem conteúdo rico" : `${richLen} caracteres`,
  });

  // CTA
  const hasCta = !!(s.cta_label && s.cta_target);
  items.push({
    id: "cta",
    label: "CTA configurado",
    status: hasCta ? "ok" : "warn",
    message: hasCta ? `${s.cta_label} → ${s.cta_target}` : "Defina rótulo e destino do CTA",
  });

  const total = items.length;
  const okCount = items.filter((i) => i.status === "ok").length;
  const blocking = items.filter((i) => i.status === "fail").length;
  return {
    items,
    score: Math.round((okCount / total) * 100),
    blocking,
    canPublish: blocking === 0,
  };
}
