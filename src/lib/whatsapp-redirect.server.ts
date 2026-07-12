/**
 * Server-only helpers for the tokenized WhatsApp redirect flow.
 *
 * Contract:
 *   submit → createWhatsAppRedirectToken → client navigates → /r/whatsapp/:token →
 *   resolveWhatsAppRedirectToken → buildWhatsAppLeadMessage → resolveOperationalWhatsAppContact →
 *   consumeWhatsAppRedirectToken → mark_visitor_funnel_redirected → 302
 *
 * New tokens do NOT persist destination_digits or message. Both are derived
 * server-side at consumption time. Legacy rows (created before this refactor)
 * may still carry destination_digits + message; the resolver returns those
 * in `isLegacy` mode for compatibility until they expire.
 */
if (typeof window !== "undefined") {
  throw new Error("whatsapp-redirect.server.ts imported from client code");
}

import { randomBytes, createHash } from "node:crypto";
import { getOperationalContact } from "@/lib/contact.server";
import {
  WHATSAPP_TOKEN_TTL_MS,
  WHATSAPP_REDIRECT_REUSE_WINDOW_MS,
  buildWhatsAppLeadMessage as _buildLead,
} from "./whatsapp-redirect.helpers";

export {
  WHATSAPP_REDIRECT_REUSE_WINDOW_MS,
  WHATSAPP_MESSAGE_MAX_LENGTH,
  WHATSAPP_TOKEN_TTL_MS,
  sanitizeText,
  buildWhatsAppLeadMessage,
  buildWaMeUrl,
} from "./whatsapp-redirect.helpers";
export type { LeadMessageContext } from "./whatsapp-redirect.helpers";

/** Rate limits (server-only). */
export const CREATE_TOKEN_RATE_WINDOW_S = 60;
export const CREATE_TOKEN_RATE_MAX = 3;
export const CONSUME_TOKEN_RATE_WINDOW_S = 60;
export const CONSUME_TOKEN_RATE_MAX = 10;

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

// ============================================================================
// (1) resolveOperationalWhatsAppContact
// ============================================================================

export type OperationalWhatsAppContact = { digits: string };

export function resolveOperationalWhatsAppContact(): OperationalWhatsAppContact | null {
  const { whatsappNumber } = getOperationalContact();
  const digits = (whatsappNumber ?? "").replace(/\D/g, "");
  if (!digits || digits.length < 10 || digits.length > 15) return null;
  return { digits };
}

// ============================================================================
// (2) createWhatsAppRedirectToken
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

  const rlHash = (input.ipHash ?? input.leadId).slice(0, 64);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rlOk } = await (supabaseAdmin as any).rpc("check_and_record_rate_limit", {
    p_scope: `wa_token_create:${input.leadId}`,
    p_ip_hash: rlHash,
    p_window_seconds: CREATE_TOKEN_RATE_WINDOW_S,
    p_max_hits: CREATE_TOKEN_RATE_MAX,
  });
  if (rlOk === false) return { ok: false, reason: "rate_limited" };

  const { data: lead } = await supabaseAdmin
    .from("dynamic_form_leads")
    .select("id")
    .eq("id", input.leadId)
    .maybeSingle();
  if (!lead) return { ok: false, reason: "lead_not_found" };

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
// (3) resolveWhatsAppRedirectToken — read only
// ============================================================================

export type ResolvedTokenRow = {
  id: string;
  token: string;
  lead_id: string | null;
  funnel_session_id: string | null;
  destination_digits: string | null;
  message: string | null;
  expires_at: string;
  used_at: string | null;
  use_count: number;
  isLegacy: boolean;
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
// (4) consumeWhatsAppRedirectToken — atomic via SQL RPC
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
// (5) Server-side session status marker
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

export function assembleWaMeUrl(digits: string, message: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Legacy compat — will be removed once no legacy valid tokens remain.
// ---------------------------------------------------------------------------
/** @deprecated legacy alias — use buildWhatsAppLeadMessage */
export const buildFunnelWhatsAppMessage = _buildLead;
/** @deprecated legacy — new writes must NOT persist number in the token row */
export function getWhatsAppDestinationDigits(): string | null {
  return resolveOperationalWhatsAppContact()?.digits ?? null;
}
