/**
 * Parser do marcador `{{contact_cta ...}}` usado no conteúdo do blog/CMS.
 *
 * Nunca injeta HTML: o marcador é convertido em segmentos tipados e
 * renderizado por um componente React (funnel-first). Campos e valores
 * fora da allowlist são ignorados.
 */
export const CTA_PURPOSES = [
  "diagnosis",
  "proposal",
  "commercial",
  "order-support",
  "lgpd",
] as const;

export type CtaPurpose = (typeof CTA_PURPOSES)[number];

export type BlogSegment =
  | { kind: "text"; text: string }
  | { kind: "cta"; label: string; purpose: CtaPurpose; source: string };

const MARKER_RE = /\{\{\s*contact_cta([^}]*)\}\}/g;
const ATTR_RE = /(\w+)\s*=\s*"([^"]{0,120})"/g;

const DEFAULT_LABEL = "Falar com a 0WEB";
const DEFAULT_PURPOSE: CtaPurpose = "diagnosis";

function sanitizeLabel(value: string): string {
  const clean = value.replace(/[<>{}]/g, "").trim();
  return clean.length > 0 ? clean.slice(0, 80) : DEFAULT_LABEL;
}

function sanitizeSource(value: string): string {
  const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 60);
  return clean || "blog_inline_cta";
}

/** Divide o conteúdo em texto puro + CTAs declarados via marcador. */
export function parseBlogContent(content: string, fallbackSource = "blog_inline_cta"): BlogSegment[] {
  const segments: BlogSegment[] = [];
  let lastIndex = 0;

  MARKER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKER_RE.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before.trim().length > 0) segments.push({ kind: "text", text: before });
    lastIndex = match.index + match[0].length;

    const attrs: Record<string, string> = {};
    const attrSource = match[1] ?? "";
    ATTR_RE.lastIndex = 0;
    let attr: RegExpExecArray | null;
    while ((attr = ATTR_RE.exec(attrSource)) !== null) {
      attrs[attr[1]!.toLowerCase()] = attr[2]!;
    }

    const purposeRaw = (attrs["purpose"] ?? "") as CtaPurpose;
    segments.push({
      kind: "cta",
      label: sanitizeLabel(attrs["label"] ?? ""),
      purpose: CTA_PURPOSES.includes(purposeRaw) ? purposeRaw : DEFAULT_PURPOSE,
      source: sanitizeSource(attrs["source"] ?? fallbackSource),
    });
  }

  const rest = content.slice(lastIndex);
  if (rest.trim().length > 0) segments.push({ kind: "text", text: rest });

  return segments;
}
