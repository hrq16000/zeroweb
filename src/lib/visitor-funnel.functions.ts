import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Persistência anônima do pré-lead / funnel session.
 *
 * Uma sessão é criada quando o funil abre (session_created / funnel_opened)
 * e atualizada nas transições (funnel_started, form_submitted,
 * whatsapp_redirected, abandoned). O `session_id` é gerado no cliente
 * (`newFunnelSessionId`) e é a chave idempotente — o mesmo id NÃO gera
 * dois registros (usa ON CONFLICT DO UPDATE).
 *
 * NUNCA aceitar `lead_id` do cliente: o vínculo com lead_submissions só
 * acontece quando o próprio submitFunnel completar (server-side) — este
 * módulo só cobre o pré-lead. `updateVisitorFunnelSession` aceita
 * apenas os campos que o cliente legítimo tem: status/partial_answers/
 * cart_snapshot/last_step/etc.
 */

const originSnapshotSchema = z
  .object({
    page_path: z.string().max(2000).optional(),
    page_url: z.string().max(2000).optional(),
    referrer: z.string().max(2000).optional(),
    utm_source: z.string().max(255).optional(),
    utm_medium: z.string().max(255).optional(),
    utm_campaign: z.string().max(255).optional(),
    utm_content: z.string().max(255).optional(),
    utm_term: z.string().max(255).optional(),
    gclid: z.string().max(255).optional(),
    fbclid: z.string().max(255).optional(),
    funnel_slug: z.string().max(120).optional(),
    service_slug: z.string().max(120).optional(),
    product_slug: z.string().max(120).optional(),
    city_slug: z.string().max(120).optional(),
    intent_purpose: z.string().max(60).optional(),
    intent_source: z.string().max(255).optional(),
    placement: z.string().max(60).optional(),
  })
  .strict();

const createSchema = z.object({
  visitor_id: z.string().min(4).max(120),
  session_id: z.string().min(4).max(120),
  funnel_slug: z.string().max(120).optional(),
  origin: originSnapshotSchema,
  technical_context: z.record(z.string(), z.unknown()).optional(),
  consent_state: z.record(z.string(), z.unknown()).optional(),
  cart_snapshot_open: z.array(z.record(z.string(), z.unknown())).max(50).optional(),
});

const updateStatus = z.enum([
  "funnel_started",
  "cart_suggested",
  "cart_accepted",
  "cart_declined",
  "form_submitted",
  "whatsapp_redirected",
  "abandoned",
]);

const updateSchema = z.object({
  session_id: z.string().min(4).max(120),
  status: updateStatus.optional(),
  partial_answers: z.record(z.string(), z.unknown()).optional(),
  cart_snapshot_final: z.array(z.record(z.string(), z.unknown())).max(50).optional(),
  last_step: z.number().int().min(0).max(500).optional(),
  protocol: z.string().max(40).optional(),
});

async function pickNetworkContext(): Promise<{ ip_hash: string | null; user_agent: string | null; accept_language: string | null }> {
  let ip: string | null = null;
  let user_agent: string | null = null;
  let accept_language: string | null = null;
  try {
    ip = getRequestIP({ xForwardedFor: true }) ?? null;
    const req = getRequest();
    user_agent = req.headers.get("user-agent");
    accept_language = getRequestHeader("accept-language") ?? null;
  } catch { /* SSR only */ }
  let ip_hash: string | null = null;
  if (ip) {
    try {
      const nodeCrypto = await import("crypto");
      ip_hash = nodeCrypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
    } catch { ip_hash = null; }
  }
  return { ip_hash, user_agent, accept_language };
}

export const createVisitorFunnelSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const net = await pickNetworkContext();

    // Rate limit por visitor_id + ip_hash — evita spam de criação de sessão.
    const rlHash = (net.ip_hash ?? data.visitor_id).slice(0, 64);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rlOk } = await (supabaseAdmin as any).rpc("check_and_record_rate_limit", {
      p_scope: `vfs_create:${data.visitor_id.slice(0, 40)}`,
      p_ip_hash: rlHash,
      p_window_seconds: 60,
      p_max_hits: 20,
    });
    if (rlOk === false) {
      return { ok: false as const, error: "rate_limited" };
    }

    const row = {
      visitor_id: data.visitor_id,
      session_id: data.session_id,
      status: "funnel_opened" as const,
      funnel_slug: data.funnel_slug ?? null,
      origin_snapshot: data.origin,
      partial_answers: {},
      cart_snapshot_open: data.cart_snapshot_open ?? null,
      technical_context: data.technical_context ?? {},
      network_context: net,
      consent_state: data.consent_state ?? { necessary: true },
      utm_source: data.origin.utm_source ?? null,
      utm_medium: data.origin.utm_medium ?? null,
      utm_campaign: data.origin.utm_campaign ?? null,
      utm_content: data.origin.utm_content ?? null,
      utm_term: data.origin.utm_term ?? null,
      gclid: data.origin.gclid ?? null,
      fbclid: data.origin.fbclid ?? null,
      referrer: data.origin.referrer ?? null,
      page_path: data.origin.page_path ?? null,
      page_url: data.origin.page_url ?? null,
      service_slug: data.origin.service_slug ?? null,
      product_slug: data.origin.product_slug ?? null,
      city_slug: data.origin.city_slug ?? null,
    };

    const { data: existing } = await supabaseAdmin
      .from("visitor_funnel_sessions" as never)
      .select("id, status")
      .eq("session_id", data.session_id)
      .maybeSingle();

    if (existing) {
      return { ok: true as const, id: (existing as { id: string }).id, existed: true as const };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("visitor_funnel_sessions" as never)
      .insert(row as never)
      .select("id")
      .single();
    if (error) {
      console.error("[createVisitorFunnelSession] insert error", error.message);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const, id: (inserted as { id: string }).id, existed: false as const };
  });

export const updateVisitorFunnelSession = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const net = await pickNetworkContext();

    // Rate limit permissivo (fluxo normal de wizard).
    const rlHash = (net.ip_hash ?? data.session_id).slice(0, 64);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rlOk } = await (supabaseAdmin as any).rpc("check_and_record_rate_limit", {
      p_scope: `vfs_update:${data.session_id.slice(0, 40)}`,
      p_ip_hash: rlHash,
      p_window_seconds: 60,
      p_max_hits: 60,
    });
    if (rlOk === false) {
      return { ok: false as const, error: "rate_limited" };
    }

    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.partial_answers) patch.partial_answers = data.partial_answers;
    if (data.cart_snapshot_final) patch.cart_snapshot_final = data.cart_snapshot_final;
    if (typeof data.last_step === "number") patch.last_step = data.last_step;
    if (data.protocol) patch.protocol = data.protocol;

    const now = new Date().toISOString();
    if (data.status === "funnel_started") patch.started_at = now;
    if (data.status === "form_submitted") patch.submitted_at = now;
    if (data.status === "whatsapp_redirected") patch.redirected_at = now;
    if (data.status === "abandoned") patch.abandoned_at = now;

    const { error } = await supabaseAdmin
      .from("visitor_funnel_sessions" as never)
      .update(patch as never)
      .eq("session_id", data.session_id);
    if (error) {
      console.error("[updateVisitorFunnelSession] update error", error.message);
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });

// ============================================================================
// Server-only named transitions (importable by other server functions).
// These bypass createServerFn so they can be called from submitFunnel /
// the redirect route directly, without incurring another HTTP hop.
// ============================================================================

/**
 * Marks the session form_submitted. Idempotent. Does NOT set lead_id on
 * the session row: visitor_funnel_sessions.lead_id has FK to
 * lead_submissions (not dynamic_form_leads); this correlation is left
 * to protocol+session_id until a future normalization migration.
 */
export async function completeVisitorFunnelSession(
  sessionId: string,
  protocol: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!sessionId || sessionId.length < 4) return { ok: false, error: "invalid_session_id" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("visitor_funnel_sessions" as never)
    .update({
      status: "form_submitted",
      submitted_at: now,
      protocol,
    } as never)
    .eq("session_id", sessionId)
    // Idempotent: don't downgrade whatsapp_redirected → form_submitted.
    .in("status", [
      "session_created",
      "funnel_opened",
      "funnel_started",
      "cart_suggested",
      "cart_accepted",
      "cart_declined",
      "form_submitted",
    ] as never);
  if (error) {
    console.error("[completeVisitorFunnelSession]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Server-only. Marks session whatsapp_redirected via SQL function
 * (atomic, idempotent, refuses to overwrite abandoned).
 */
export async function markVisitorFunnelRedirected(
  sessionId: string,
): Promise<boolean> {
  if (!sessionId || sessionId.length < 4) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabaseAdmin as any).rpc("mark_visitor_funnel_redirected", {
    p_session_id: sessionId,
  });
  return Boolean(data);
}

/**
 * Server-only. Marks session abandoned. Refuses to overwrite
 * form_submitted or whatsapp_redirected (those are terminal wins).
 */
export async function markVisitorFunnelAbandoned(
  sessionId: string,
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!sessionId || sessionId.length < 4) return { ok: false };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("visitor_funnel_sessions" as never)
    .update({
      status: "abandoned",
      abandoned_at: new Date().toISOString(),
    } as never)
    .eq("session_id", sessionId)
    .not("status", "in", "(form_submitted,whatsapp_redirected,abandoned)" as never)
    .select("id");
  const rows = (data ?? []) as { id: string }[];
  return { ok: true, skipped: rows.length === 0 };
}
