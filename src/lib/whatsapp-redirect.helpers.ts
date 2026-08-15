/**
 * Pure helpers reused by whatsapp-redirect.server.ts. Split out so unit tests
 * can import them without hitting the .server import guard. No side effects,
 * no env reads, no db calls.
 */
import type { FunnelOption } from "@/lib/dynamic-funnel.functions";

/** Janela em que o mesmo token pode ser reaproveitado (duplo clique, voltar). */
export const WHATSAPP_REDIRECT_REUSE_WINDOW_MS = 30 * 60 * 1000;
export const WHATSAPP_MESSAGE_MAX_LENGTH = 1400;
/** TTL do link de redirecionamento — 24h. */
export const WHATSAPP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const ANSWER_VALUE_MAX = 240;

export function sanitizeText(input: unknown, maxLen = ANSWER_VALUE_MAX): string {
  if (input === null || input === undefined) return "";
  const raw = String(input);
  const stripped = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
}

export type LeadMessageContext = {
  protocol: string;
  funnelName?: string | null;
  productName?: string | null;
  productPriceLabel?: string | null;
  serviceName?: string | null;
  billingDescription?: string | null;
  answers: Record<string, unknown>;
  questions: { key: string; label: string; options: FunnelOption[] }[];
  citySlug?: string | null;
  neighborhoodSlug?: string | null;
  serviceMode?: string | null;
  cartSummary?: string | null;
  pageTitle?: string | null;
  pageUrl?: string | null;
  utmCampaign?: string | null;
  /** Linhas de contexto sintetizadas da página/CTA de origem. */
  contextLines?: string[] | null;
};


/**
 * Origem de cada campo candidato à mensagem. A sanitização é feita POR ORIGEM
 * (e por chave), nunca por formato textual — telefone/e-mail preenchidos pelo
 * visitante são dados comerciais legítimos e DEVEM ser preservados.
 */
export type MessageFieldSource =
  | "visitor_answer"
  | "product"
  | "cart"
  | "location"
  | "page"
  | "attribution"
  | "internal_telemetry"
  | "operational_contact";

export type MessageField = {
  key: string;
  label: string;
  value: string;
  source: MessageFieldSource;
};

/** Origens que podem compor o conteúdo enviado ao WhatsApp. */
const ALLOWED_SOURCES: ReadonlySet<MessageFieldSource> = new Set([
  "visitor_answer",
  "product",
  "cart",
  "location",
  "page",
  "attribution",
]);

/** Chaves sempre tratadas como telemetria interna / contato operacional. */
const INTERNAL_TELEMETRY_KEYS = new Set([
  "ip",
  "ip_hash",
  "asn",
  "isp",
  "provider",
  "user_agent",
  "ua_browser",
  "ua_os",
  "ua_device",
  "screen_resolution",
  "viewport",
  "consent",
  "consents",
  "session_id",
  "visitor_id",
  "funnel_session_id",
  "lead_id",
  "token",
  "api_key",
  "secret",
]);
const OPERATIONAL_CONTACT_KEYS = new Set([
  "operational_phone",
  "operational_email",
  "admin_contact",
  "destination_digits",
]);

export function classifyAnswerSource(key: string): MessageFieldSource {
  if (INTERNAL_TELEMETRY_KEYS.has(key)) return "internal_telemetry";
  if (OPERATIONAL_CONTACT_KEYS.has(key)) return "operational_contact";
  return "visitor_answer";
}

export function isFieldAllowedInMessage(field: Pick<MessageField, "source">): boolean {
  return ALLOWED_SOURCES.has(field.source);
}

export function buildWhatsAppLeadMessage(ctx: LeadMessageContext): string {
  // Preserve visitor-provided contact/data (name, phone, email, city, budget…)
  // and block only internal telemetry / operational contact keys. Sanitization
  // still strips HTML, control chars and enforces length limits per value.
  const push = (arr: string[], line: string) => {
    if (line) arr.push(line);
  };

  const header: string[] = [];
  header.push("Olá! Acabei de preencher uma solicitação na 0WEB.");
  header.push("");
  push(header, `PROTOCOLO`);
  push(header, ctx.protocol);
  header.push("");

  const service: string[] = [];
  push(service, ctx.productName ? `Produto: ${sanitizeText(ctx.productName, 120)}` : "");
  push(service, ctx.billingDescription ? `Plano: ${sanitizeText(ctx.billingDescription, 120)}` : "");
  push(service, ctx.productPriceLabel ? `Valor: ${sanitizeText(ctx.productPriceLabel, 60)}` : "");
  push(service, ctx.serviceName ? `Serviço: ${sanitizeText(ctx.serviceName, 120)}` : "");
  push(service, ctx.funnelName ? `Funil: ${sanitizeText(ctx.funnelName, 120)}` : "");

  const answersLines: string[] = [];
  for (const q of ctx.questions) {
    if (!isFieldAllowedInMessage({ source: classifyAnswerSource(q.key) })) continue;
    const raw = ctx.answers[q.key];
    if (raw === undefined || raw === null || raw === "") continue;
    const display = Array.isArray(raw)
      ? raw.map((v) => q.options.find((o) => o.value === v)?.label ?? String(v)).join(", ")
      : q.options.find((o) => o.value === raw)?.label ?? String(raw);
    const safeLabel = sanitizeText(q.label, 80);
    const safeVal = sanitizeText(display, ANSWER_VALUE_MAX);
    if (safeLabel && safeVal) answersLines.push(`• ${safeLabel}: ${safeVal}`);
  }

  const local: string[] = [];
  push(local, ctx.citySlug ? `Cidade: ${sanitizeText(ctx.citySlug, 80)}` : "");
  push(local, ctx.neighborhoodSlug ? `Bairro: ${sanitizeText(ctx.neighborhoodSlug, 80)}` : "");
  push(local, ctx.serviceMode ? `Modalidade: ${sanitizeText(ctx.serviceMode, 40)}` : "");

  const cartLines: string[] = [];
  if (ctx.cartSummary) push(cartLines, sanitizeText(ctx.cartSummary, 400));

  const contextSection: string[] = [];
  for (const line of ctx.contextLines ?? []) {
    const safe = sanitizeText(line, 200);
    if (safe) contextSection.push(safe.startsWith("•") ? safe : `• ${safe}`);
  }

  const origin: string[] = [];
  push(origin, ctx.pageTitle ? `Página: ${sanitizeText(ctx.pageTitle, 180)}` : ctx.pageUrl ? `Página: ${sanitizeText(ctx.pageUrl, 180)}` : "");
  push(origin, ctx.utmCampaign ? `Campanha: ${sanitizeText(ctx.utmCampaign, 120)}` : "");

  const sections: { title: string; lines: string[]; priority: number }[] = [
    { title: "SERVIÇO OU PRODUTO", lines: service, priority: 1 },
    { title: "MINHA SOLICITAÇÃO", lines: answersLines, priority: 2 },
    { title: "CONTEXTO DA PÁGINA", lines: contextSection, priority: 1 },
    { title: "LOCALIDADE", lines: local, priority: 1 },
    { title: "CARRINHO", lines: cartLines, priority: 1 },
    { title: "ORIGEM", lines: origin, priority: 3 },
  ];


  const assemble = (secs: typeof sections): string => {
    const out = [...header];
    for (const s of secs) {
      if (!s.lines.length) continue;
      out.push(s.title);
      out.push(...s.lines);
      out.push("");
    }
    return out.join("\n").trim();
  };

  let msg = assemble(sections);
  if (msg.length > WHATSAPP_MESSAGE_MAX_LENGTH) {
    const trimmed = [...sections].sort((a, b) => b.priority - a.priority);
    for (const s of trimmed) {
      s.lines = [];
      msg = assemble(sections);
      if (msg.length <= WHATSAPP_MESSAGE_MAX_LENGTH) break;
    }
  }
  if (msg.length > WHATSAPP_MESSAGE_MAX_LENGTH) {
    msg = `${msg.slice(0, WHATSAPP_MESSAGE_MAX_LENGTH - 40)}…\n\nPROTOCOLO\n${ctx.protocol}`;
  }
  return msg;
}

export function buildWaMeUrl(digits: string, message: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
