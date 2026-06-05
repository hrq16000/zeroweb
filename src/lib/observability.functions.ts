// Sprint 18 — observability: uptime metrics, cron history, CSV.
// Sprint 19 — hardening: rate-limit settings changes, break-glass, 2FA flag.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function canManage(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) =>
    r.role === "admin" || r.role === "admin_integrations",
  );
}

async function isAdmin(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

// ── Rate limit: max 20 settings changes per minute per user. ─────────
export async function enforceSettingsRateLimit(userId: string) {
  const sb = await getAdmin();
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await sb
    .from("settings_change_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("at", oneMinAgo);
  if ((count ?? 0) >= 20) {
    throw new Error("Limite de alterações excedido: máximo de 20/min. Aguarde 60 s.");
  }
  await sb.from("settings_change_log").insert({ user_id: userId, action: "settings_change" });
}

// ── Uptime metrics ────────────────────────────────────────────────────
export const getUptimeMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { data: rows } = await sb
      .from("integration_health_checks")
      .select("key,status,checked_at,latency_ms")
      .gte("checked_at", since7d)
      .order("checked_at", { ascending: false })
      .limit(20000);
    const by: Record<string, { ok24: number; tot24: number; ok7: number; tot7: number; lat: number[] }> = {};
    for (const r of (rows ?? []) as any[]) {
      const b = (by[r.key] ||= { ok24: 0, tot24: 0, ok7: 0, tot7: 0, lat: [] });
      b.tot7++;
      if (r.status === "ok") b.ok7++;
      if (r.checked_at >= since24h) {
        b.tot24++;
        if (r.status === "ok") b.ok24++;
      }
      if (typeof r.latency_ms === "number") b.lat.push(r.latency_ms);
    }
    return {
      metrics: Object.entries(by).map(([key, v]) => ({
        key,
        uptime_24h: v.tot24 > 0 ? Math.round((v.ok24 / v.tot24) * 10000) / 100 : null,
        uptime_7d: v.tot7 > 0 ? Math.round((v.ok7 / v.tot7) * 10000) / 100 : null,
        checks_24h: v.tot24,
        checks_7d: v.tot7,
        avg_latency_ms:
          v.lat.length > 0 ? Math.round(v.lat.reduce((a, b) => a + b, 0) / v.lat.length) : null,
      })),
    };
  });

// ── Cron history listing (last N) ─────────────────────────────────────
export const listCronHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        key: z.string().min(1).max(60).optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().min(1).max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    let q = sb
      .from("integration_health_checks")
      .select("id,key,status,message,latency_ms,checked_at,source")
      .order("checked_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.key) q = q.eq("key", data.key);
    if (data.from) q = q.gte("checked_at", data.from);
    if (data.to) q = q.lte("checked_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

// ── CSV export ───────────────────────────────────────────────────────
export const exportCronHistoryCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        key: z.string().min(1).max(60).optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.number().min(1).max(10000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    let q = sb
      .from("integration_health_checks")
      .select("checked_at,key,status,latency_ms,source,message")
      .order("checked_at", { ascending: false })
      .limit(data.limit ?? 5000);
    if (data.key) q = q.eq("key", data.key);
    if (data.from) q = q.gte("checked_at", data.from);
    if (data.to) q = q.lte("checked_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const esc = (v: any) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const header = "checked_at,key,status,latency_ms,source,message";
    const body = (rows ?? [])
      .map((r: any) => [r.checked_at, r.key, r.status, r.latency_ms ?? "", r.source, r.message ?? ""].map(esc).join(","))
      .join("\n");
    return { csv: `${header}\n${body}\n`, count: (rows ?? []).length };
  });

// ── Break-glass: request + reveal secret with audit ──────────────────
export const requestBreakGlass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        setting_key: z.string().min(1).max(120),
        reason: z.string().min(10).max(500),
        minutes: z.number().min(1).max(60).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await isAdmin(context.userId))) {
      throw new Error("Break-glass requer papel admin.");
    }
    const sb = await getAdmin();
    const minutes = data.minutes ?? 10;
    const expires = new Date(Date.now() + minutes * 60_000).toISOString();
    const { data: row, error } = await sb
      .from("break_glass_grants")
      .insert({
        user_id: context.userId,
        setting_key: data.setting_key,
        reason: data.reason,
        expires_at: expires,
      })
      .select("id,expires_at")
      .single();
    if (error) throw new Error(error.message);
    return { grant_id: row.id as string, expires_at: row.expires_at as string };
  });

export const revealSecretWithGrant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ grant_id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = await getAdmin();
    const { data: g, error } = await sb
      .from("break_glass_grants")
      .select("id,user_id,setting_key,expires_at,revoked_at,revealed_at")
      .eq("id", data.grant_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!g) throw new Error("Grant inexistente");
    if (g.user_id !== context.userId) throw new Error("Grant não pertence ao usuário");
    if (g.revoked_at) throw new Error("Grant revogado");
    if (new Date(g.expires_at).getTime() < Date.now()) throw new Error("Grant expirado");
    const { data: s } = await sb
      .from("app_settings")
      .select("value,is_secret")
      .eq("key", g.setting_key)
      .maybeSingle();
    await sb
      .from("break_glass_grants")
      .update({ revealed_at: new Date().toISOString() })
      .eq("id", g.id);
    return { value: (s?.value as string | null) ?? null, is_secret: !!s?.is_secret };
  });

export const listBreakGlassGrants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("break_glass_grants")
      .select("id,user_id,setting_key,reason,granted_at,expires_at,revealed_at,revoked_at")
      .order("granted_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

// ── 2FA flag (lightweight; full TOTP is a follow-up) ─────────────────
export const get2faStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await getAdmin();
    const { data } = await sb
      .from("profiles")
      .select("twofa_enabled,twofa_enabled_at")
      .eq("id", context.userId)
      .maybeSingle();
    return {
      enabled: !!data?.twofa_enabled,
      enabled_at: data?.twofa_enabled_at ?? null,
      is_admin: await isAdmin(context.userId),
    };
  });

export const set2faEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ enabled: z.boolean() }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = await getAdmin();
    await sb
      .from("profiles")
      .update({
        twofa_enabled: data.enabled,
        twofa_enabled_at: data.enabled ? new Date().toISOString() : null,
      })
      .eq("id", context.userId);
    return { ok: true };
  });

/** Server-side guard: admin must have 2FA enabled to perform sensitive ops. */
export async function require2faIfAdmin(userId: string) {
  const sb = await getAdmin();
  const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", userId);
  const isFullAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isFullAdmin) return;
  const { data: p } = await sb
    .from("profiles")
    .select("twofa_enabled")
    .eq("id", userId)
    .maybeSingle();
  if (!p?.twofa_enabled) {
    throw new Error("2FA obrigatório para admin. Ative em Admin → Segurança.");
  }
}
