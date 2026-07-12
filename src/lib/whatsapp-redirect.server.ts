/**
 * Server-only helpers for the tokenized WhatsApp redirect flow.
 *
 * Contract:
 *   submit → createWhatsAppRedirectToken → client navigates → /r/whatsapp/:token →
 *   resolveWhatsAppRedirectToken → buildWhatsAppLeadMessage → resolveOperationalWhatsAppContact →
 *   consumeWhatsAppRedirectToken → mark_visitor_funnel_redirected → 302
 *
 * New tokens do NOT persist destination_digits or message. Both are derived
 * server-side at consumption time from lead/session/product/answers. Legacy
 * rows (created before this refactor) may still carry destination_digits +
 * message; the resolver returns those in `legacy` mode for compatibility
 * until they expire.
 */
if (typeof window !== "undefined") {
  throw new Error("whatsapp-redirect.server.ts imported from client code");
}

import { randomBytes, createHash } from "node:crypto";
import { getOperationalContact } from "@/lib/contact.server";
import type { FunnelOption } from "@/lib/dynamic-funnel.functions";

// ============================================================================
// Constants
// ============================================================================

/** Duplo-toque: reusar token dentro dessa janela após o primeiro uso. */
export const WHATSAPP_REDIRECT_REUSE_WINDOW_MS = 60_000;

/** wa.me tolera URLs longas, mas limitamos por segurança/UX. */
export const WHATSAPP_MESSAGE_MAX_LENGTH = 1400;

/** TTL do token de redirect (curto para reduzir superfície de ataque). */
export const WHATSAPP_TOKEN_TTL_MS = 15 * 60 * 1000;

/** Limite de tamanho por resposta individual. */
const ANSWER_VALUE_MAX = 240;

/** Rate limit para criação de token. Chave = lead_id. */
export const CREATE_TOKEN_RATE_WINDOW_S = 60;
export const CREATE_TOKEN_RATE_MAX = 3;

/** Rate limit para consumo. Chave = token. */
export const CONSUME_TOKEN_RATE_WINDOW_S = 60;
export const CONSUME_TOKEN_RATE_MAX = 10;

// ============================================================================
// Small helpers
// ============================================================================

export function generateRedirectToken(): string {
  return randomBytes(16).toString("hex");
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "0web-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function makeProtocol(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `0W-${ymd}-${rand}`;
}

/** Sanitizes free-form text: strip HTML/scripts/control chars, normalize whitespace, cap length. */
export function sanitizeText(input: unknown, maxLen = ANSWER_VALUE_MAX): string {
  if (input === null || input === undefined) return "";
  const raw = String(input);
  // Remove tags, control chars, CR/LF collapsed to spaces to avoid header injection.
  const stripped = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
}

function buildWaMeUrl(digits: string, message: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// ============================================================================
// (1) resolveOperationalWhatsAppContact
// ============================================================================

export type OperationalWhatsAppContact = {
  digits: string;
};

/**
 * Reads operational number from server env. Rejects invalid values.
 * Never returned to the client; used only inside consumeWhatsAppRedirectToken.
 */
export function resolveOperationalWhatsAppContact(): OperationalWhatsAppContact | null {
  const { whatsappNumber } = getOperationalContact();
  const digits = (whatsappNumber ?? "").replace(/\D/g, "");
  // Plausível: 10 a 15 dígitos (E.164).
  if (!digits || digits.length < 10 || digits.length > 15) return null;
  return { digits };
}

// ============================================================================
// (2) buildWhatsAppLeadMessage
// ============================================================================

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
};

/**
 * Builds the WhatsApp message from persisted data only.
 * Never includes IP, UA, session ids, visitor ids or admin/telemetry fields.
 * Truncates safely preserving protocol + product + city + cart.
 */
export function buildWhatsAppLeadMessage(ctx: LeadMessageContext): string {
  const HIDDEN_KEYS = new Set(["email", "telefone", "phone", "whatsapp"]);
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
    if (HIDDEN_KEYS.has(q.key)) continue;
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

  const origin: string[] = [];
  push(origin, ctx.pageTitle ? `Página: ${sanitizeText(ctx.pageTitle, 180)}` : ctx.pageUrl ? `Página: ${sanitizeText(ctx.pageUrl, 180)}` : "");
  push(origin, ctx.utmCampaign ? `Campanha: ${sanitizeText(ctx.utmCampaign, 120)}` : "");

  const sections: { title: string; lines: string[]; priority: number }[] = [
    { title: "SERVIÇO OU PRODUTO", lines: service, priority: 1 },
    { title: "MINHA SOLICITAÇÃO", lines: answersLines, priority: 2 },
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
    // Drop lowest-priority sections first (higher priority number = lower).
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

// ============================================================================
// (3) createWhatsAppRedirectToken
// ============================================================================

export type CreateWhatsAppRedirectTokenInput = {
  leadId: string;
  funnelSessionId?: string | null;
  ipHash?: string | null;
};

export type CreateWhatsAppRedirectTokenResult =
  | { ok: true; redirectPath: string; expiresAt: string; reused: boolean }
  | { ok: false; reason: "lead_not_found" | "session_mismatch" | "rate_limited" | "db_error"; message?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createWhatsAppRedirectToken(
  input: CreateWhatsAppRedirectTokenInput,
): Promise<CreateWhatsAppRedirectTokenResult> {
  if (!UUID_RE.test(input.leadId)) return { ok: false, reason: "lead_not_found" };
  if (input.funnelSessionId && !UUID_RE.test(input.funnelSessionId)) {
    return { ok: false, reason: "session_mismatch" };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Rate limit por lead + ip_hash.
  const rlKey = `wa_token_create:${input.leadId}`;
  const rlHash = (input.ipHash ?? input.leadId).slice(0, 64);
  const { data: rlOk } = await supabaseAdmin.rpc("check_and_record_rate_limit", {
    p_scope: rlKey,
    p_ip_hash: rlHash,
    p_window_seconds: CREATE_TOKEN_RATE_WINDOW_S,
    p_max_hits: CREATE_TOKEN_RATE_MAX,
  });
  if (rlOk === false) return { ok: false, reason: "rate_limited" };

  // Confirmar que o lead existe.
  const { data: lead } = await supabaseAdmin
    .from("dynamic_form_leads")
    .select("id")
    .eq("id", input.leadId)
    .maybeSingle();
  if (!lead) return { ok: false, reason: "lead_not_found" };

  // Reutilizar token ativo existente para este lead (idempotência).
  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabaseAdmin as any)
    .from("whatsapp_redirect_tokens")
    .select("token, expires_at, used_at")
    .eq("lead_id", input.leadId)
    .gt("expires_at", new Date(now).toISOString())
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.token) {
    return {
      ok: true,
      redirectPath: `/r/whatsapp/${existing.token}`,
      expiresAt: existing.expires_at,
      reused: true,
    };
  }

  // Criar novo token, SEM destination_digits e SEM message.
  const token = generateRedirectToken();
  const expiresAt = new Date(now + WHATSAPP_TOKEN_TTL_MS).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseAdmin as any)
    .from("whatsapp_redirect_tokens")
    .insert({
      token,
      lead_id: input.leadId,
      funnel_session_id: input.funnelSessionId ?? null,
      expires_at: expiresAt,
      ip_hash: input.ipHash ?? null,
      // destination_digits and message intentionally NOT set (nullable).
    });

  if (error) {
    console.error("[createWhatsAppRedirectToken] insert failed", error.message);
    return { ok: false, reason: "db_error", message: error.message };
  }

  return { ok: true, redirectPath: `/r/whatsapp/${token}`, expiresAt, reused: false };
}

// ============================================================================
// (4) resolveWhatsAppRedirectToken — read only, no mutations
// ============================================================================

export type ResolvedTokenRow = {
  id: string;
  token: string;
  lead_id: string | null;
  funnel_session_id: string | null;
  destination_digits: string | null; // legacy
  message: string | null; // legacy
  expires_at: string;
  used_at: string | null;
  use_count: number;
  isLegacy: boolean; // true if destination_digits+message are set (old format)
};

export type ResolveTokenResult =
  | { ok: true; row: ResolvedTokenRow }
  | { ok: false; reason: "invalid_format" | "not_found" };

export async function resolveWhatsAppRedirectToken(token: string): Promise<ResolveTokenResult> {
  if (!/^[a-f0-9]{16,64}$/.test(token)) return { ok: false, reason: "invalid_format" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin as any)
    .from("whatsapp_redirect_tokens")
    .select(
      "id, token, lead_id, funnel_session_id, destination_digits, message, expires_at, used_at, use_count",
    )
    .eq("token", token)
    .maybeSingle();

  if (!data) return { ok: false, reason: "not_found" };
  return {
    ok: true,
    row: {
      id: data.id,
      token: data.token,
      lead_id: data.lead_id,
      funnel_session_id: data.funnel_session_id,
      destination_digits: data.destination_digits,
      message: data.message,
      expires_at: data.expires_at,
      used_at: data.used_at,
      use_count: data.use_count ?? 0,
      isLegacy: Boolean(data.destination_digits && data.message),
    },
  };
}

// ============================================================================
// (5) consumeWhatsAppRedirectToken — atomic
// ============================================================================

export type ConsumeStatus =
  | "ok_first"
  | "ok_reuse"
  | "expired"
  | "used_out_of_window"
  | "not_found";

export type ConsumeResult = {
  status: ConsumeStatus;
  leadId: string | null;
  funnelSessionId: string | null;
  legacyDestinationDigits: string | null;
  legacyMessage: string | null;
  useCount: number;
};

/**
 * Atomically consumes the token via SQL RPC. Idempotent within the reuse
 * window; blocks reuse after. Returns the persisted row-level context but
 * NOT the final message/URL — those are built by the caller from live data.
 */
export async function consumeWhatsAppRedirectToken(token: string): Promise<ConsumeResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabaseAdmin as any).rpc("consume_whatsapp_redirect_token", {
    p_token: token,
    p_reuse_window_ms: WHATSAPP_REDIRECT_REUSE_WINDOW_MS,
  });
  if (error || !data || !data.length) {
    return {
      status: "not_found",
      leadId: null,
      funnelSessionId: null,
      legacyDestinationDigits: null,
      legacyMessage: null,
      useCount: 0,
    };
  }
  const row = data[0];
  return {
    status: row.status as ConsumeStatus,
    leadId: row.lead_id ?? null,
    funnelSessionId: row.funnel_session_id ?? null,
    legacyDestinationDigits: row.destination_digits ?? null,
    legacyMessage: row.message ?? null,
    useCount: row.use_count ?? 0,
  };
}

// ============================================================================
// Server-side status marker (idempotent) for the funnel session
// ============================================================================

export async function markVisitorFunnelRedirectedBySessionId(
  sessionId: string,
): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin as any).rpc("mark_visitor_funnel_redirected", {
    p_session_id: sessionId,
  });
  return Boolean(data);
}

// ============================================================================
// Final wa.me URL assembly (server-only, never exported to client)
// ============================================================================

export function assembleWaMeUrl(digits: string, message: string): string {
  return buildWaMeUrl(digits, message);
}

// ---------------------------------------------------------------------------
// Legacy compatibility (temporary) — retained for pre-existing tokens with
// destination_digits + message. Drop once no legacy valid tokens remain and
// the columns can be removed by a follow-up migration.
// ---------------------------------------------------------------------------

/** @deprecated legacy alias for buildWhatsAppLeadMessage */
export const buildFunnelWhatsAppMessage = buildWhatsAppLeadMessage;

/** @deprecated legacy — do NOT use for new writes; kept for compat */
export function getWhatsAppDestinationDigits(): string | null {
  return resolveOperationalWhatsAppContact()?.digits ?? null;
}
