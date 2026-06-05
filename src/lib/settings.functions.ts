// Admin-managed runtime settings (key/value). Sprint 17: declarative schema,
// required reason for critical changes, periodic health-check support.
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
    r.role === "admin" || r.role === "admin_integrations"
  );
}

// ── In-process cache for hot reads. 60s TTL. ──────────────────────────
const _cache = new Map<string, { v: string | null; exp: number }>();
const TTL = 60_000;

export async function getSettingValue(key: string): Promise<string | null> {
  const hit = _cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.v;
  const sb = await getAdmin();
  const { data } = await sb.from("app_settings").select("value").eq("key", key).maybeSingle();
  const v = (data?.value as string | null) ?? null;
  _cache.set(key, { v, exp: Date.now() + TTL });
  return v;
}

export function invalidateSettingsCache(keys?: string[]) {
  if (!keys) _cache.clear();
  else keys.forEach((k) => _cache.delete(k));
}

// ── Reason capture: stamp the most recent history row for this key. ───
async function stampReason(sb: AnyClient, key: string, reason: string | null) {
  if (!reason) return;
  const { data: latest } = await sb
    .from("app_settings_history")
    .select("id")
    .eq("key", key)
    .order("changed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id) {
    await sb.from("app_settings_history").update({ reason }).eq("id", latest.id);
  }
}

async function requireReasonIfCritical(
  sb: AnyClient,
  key: string,
  reason: string | null | undefined,
) {
  // Critical if the schema field marks it OR app_settings.is_critical is true.
  const { data: row } = await sb
    .from("app_settings")
    .select("is_critical")
    .eq("key", key)
    .maybeSingle();
  let critical = !!row?.is_critical;
  if (!critical) {
    const prefix = key.includes(".") ? key.split(".")[0] : key;
    const { data: schema } = await sb
      .from("integration_schemas")
      .select("fields")
      .eq("key", prefix)
      .maybeSingle();
    const f = (schema?.fields as any[] | null)?.find((x) => x.key === key);
    critical = !!f?.critical;
  }
  if (critical && (!reason || reason.trim().length < 5)) {
    throw new Error("Motivo obrigatório (mín. 5 caracteres) para chaves críticas.");
  }
  return critical;
}

// ── CRUD ──────────────────────────────────────────────────────────────

export const listSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("app_settings")
      .select("key,value,is_secret,is_critical,description,updated_at,updated_by")
      .order("key");
    if (error) throw new Error(error.message);
    const rows = (data ?? []).map((r: any) => ({
      key: r.key,
      description: r.description,
      is_secret: r.is_secret,
      is_critical: r.is_critical,
      has_value: !!r.value,
      value: r.is_secret ? null : r.value,
      updated_at: r.updated_at,
    }));
    return { rows };
  });

export const upsertSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        key: z.string().min(1).max(120).regex(/^[a-z0-9_.\-]+$/i),
        value: z.string().max(8192).nullable(),
        is_secret: z.boolean().optional(),
        is_critical: z.boolean().optional(),
        description: z.string().max(500).optional(),
        reason: z.string().max(500).nullable().optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const { enforceSettingsRateLimit, require2faIfAdmin } = await import(
      "@/lib/observability.functions"
    );
    await require2faIfAdmin(context.userId);
    await enforceSettingsRateLimit(context.userId);
    const sb = await getAdmin();
    await requireReasonIfCritical(sb, data.key, data.reason ?? null);
    const { error } = await sb.from("app_settings").upsert(
      {
        key: data.key,
        value: data.value,
        is_secret: data.is_secret ?? undefined,
        is_critical: data.is_critical ?? undefined,
        description: data.description ?? undefined,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      },
      { onConflict: "key" }
    );
    if (error) throw new Error(error.message);
    await stampReason(sb, data.key, data.reason ?? null);
    invalidateSettingsCache([data.key]);
    return { ok: true };
  });

export const deleteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ key: z.string().min(1), reason: z.string().max(500).nullable().optional() }).parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const { enforceSettingsRateLimit, require2faIfAdmin } = await import(
      "@/lib/observability.functions"
    );
    await require2faIfAdmin(context.userId);
    await enforceSettingsRateLimit(context.userId);
    const sb = await getAdmin();
    await requireReasonIfCritical(sb, data.key, data.reason ?? null);
    await sb.from("app_settings").delete().eq("key", data.key);
    await stampReason(sb, data.key, data.reason ?? null);
    invalidateSettingsCache([data.key]);
    return { ok: true };
  });


// ── History / rollback ────────────────────────────────────────────────

export const listSettingHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ key: z.string().min(1), limit: z.number().min(1).max(100).optional() }).parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: rows, error } = await sb
      .from("app_settings_history")
      .select("id,key,old_value,new_value,action,changed_at,changed_by,reason")
      .eq("key", data.key)
      .order("changed_at", { ascending: false })
      .limit(data.limit ?? 20);
    if (error) throw new Error(error.message);
    const { data: setting } = await sb
      .from("app_settings")
      .select("is_secret")
      .eq("key", data.key)
      .maybeSingle();
    const mask = (v: string | null) =>
      v == null ? null : setting?.is_secret ? `••• (${v.length} chars)` : v;
    return {
      rows: (rows ?? []).map((r: any) => ({
        ...r,
        old_value: mask(r.old_value),
        new_value: mask(r.new_value),
      })),
    };
  });

export const rollbackSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        history_id: z.string().uuid(),
        reason: z.string().max(500).nullable().optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: snap, error: e1 } = await sb
      .from("app_settings_history")
      .select("id,key,new_value")
      .eq("id", data.history_id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!snap) throw new Error("Versão não encontrada");

    await requireReasonIfCritical(sb, snap.key, data.reason ?? null);

    const { error: e2 } = await sb.from("app_settings").upsert(
      {
        key: snap.key,
        value: snap.new_value,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      },
      { onConflict: "key" }
    );
    if (e2) throw new Error(e2.message);

    const { data: latest } = await sb
      .from("app_settings_history")
      .select("id")
      .eq("key", snap.key)
      .order("changed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) {
      await sb
        .from("app_settings_history")
        .update({
          action: "rollback",
          rolled_back_from_id: snap.id,
          reason: data.reason ?? null,
        })
        .eq("id", latest.id);
    }
    invalidateSettingsCache([snap.key]);
    return { ok: true };
  });

// ── Declarative integration schemas ──────────────────────────────────

export const listIntegrationSchemas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("integration_schemas")
      .select("key,label,description,testable,fields,sort_order,enabled")
      .eq("enabled", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const upsertIntegrationSchema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        key: z.string().min(1).max(60).regex(/^[a-z0-9_]+$/),
        label: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
        testable: z.boolean().optional(),
        fields: z.array(z.record(z.any())).max(20).optional(),
        sort_order: z.number().int().optional(),
        enabled: z.boolean().optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb
      .from("integration_schemas")
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Integration status + connection tests ────────────────────────────

export const listIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("integration_status")
      .select("key,last_status,last_message,last_tested_at,last_tested_by,last_alert_at")
      .order("key");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

async function writeStatus(
  key: string,
  status: "ok" | "error",
  message: string,
  userId: string | null,
) {
  const sb = await getAdmin();
  await sb.from("integration_status").upsert(
    {
      key,
      last_status: status,
      last_message: message.slice(0, 500),
      last_tested_at: new Date().toISOString(),
      last_tested_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
}

async function testUazapi(): Promise<{ ok: boolean; message: string }> {
  const base = (await getSettingValue("uazapi.base_url")) || process.env.UAZAPI_BASE_URL;
  const token = (await getSettingValue("uazapi.token")) || process.env.UAZAPI_TOKEN;
  if (!base || !token) return { ok: false, message: "Faltam uazapi.base_url ou uazapi.token" };
  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/instance/status`, {
      method: "GET",
      headers: { token, Accept: "application/json" },
    });
    const text = await r.text().catch(() => "");
    if (!r.ok) return { ok: false, message: `HTTP ${r.status}: ${text.slice(0, 200)}` };
    return { ok: true, message: `OK (${r.status}) ${text.slice(0, 120)}` };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Erro de rede" };
  }
}

async function testSupabase(): Promise<{ ok: boolean; message: string }> {
  try {
    const sb = await getAdmin();
    const { error, count } = await sb
      .from("app_settings")
      .select("key", { count: "exact", head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Conectado. ${count ?? 0} configuração(ões).` };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Falha" };
  }
}

async function testLovableAi(): Promise<{ ok: boolean; message: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return { ok: false, message: "LOVABLE_API_KEY ausente" };
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return { ok: false, message: `HTTP ${r.status}: ${t.slice(0, 200)}` };
    }
    return { ok: true, message: "Gateway respondendo" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Erro de rede" };
  }
}

async function testGoogleSearchConsole(): Promise<{ ok: boolean; message: string }> {
  const lk = process.env.LOVABLE_API_KEY;
  const ck = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lk || !ck) {
    return {
      ok: false,
      message: "Conector não autorizado. Habilite Google Search Console em Conectores.",
    };
  }
  try {
    const r = await fetch(
      "https://connector-gateway.lovable.dev/google_search_console/webmasters/v3/sites",
      { headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": ck } },
    );
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return { ok: false, message: `HTTP ${r.status}: ${t.slice(0, 200)}` };
    }
    return { ok: true, message: "Search Console conectado" };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Erro de rede" };
  }
}

const TESTERS: Record<string, () => Promise<{ ok: boolean; message: string }>> = {
  uazapi: testUazapi,
  supabase: testSupabase,
  lovable_ai: testLovableAi,
  google_search_console: testGoogleSearchConsole,
};

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ key: z.string().min(1).max(60) }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const fn = TESTERS[data.key];
    if (!fn) throw new Error(`Integração desconhecida: ${data.key}`);
    const r = await fn();
    await writeStatus(data.key, r.ok ? "ok" : "error", r.message, context.userId);
    return r;
  });

/**
 * Runs every testable integration. Used by the periodic cron health-check
 * endpoint. Returns the per-integration result and alerts (via WhatsApp) when
 * an integration transitions to / stays in error — dedup window: 1h.
 */
export async function runHealthChecks(): Promise<
  { key: string; ok: boolean; message: string; alerted: boolean; latency_ms: number }[]
> {

  const sb = await getAdmin();
  const { data: schemas } = await sb
    .from("integration_schemas")
    .select("key")
    .eq("enabled", true)
    .eq("testable", true);
  const keys = (schemas ?? []).map((r: any) => r.key as string).filter((k: string) => !!TESTERS[k]);

  const out: { key: string; ok: boolean; message: string; alerted: boolean; latency_ms: number }[] = [];
  for (const key of keys) {
    const t0 = Date.now();
    const r = await TESTERS[key]();
    const latency = Date.now() - t0;
    await writeStatus(key, r.ok ? "ok" : "error", r.message, null);
    await sb.from("integration_health_checks").insert({
      key,
      status: r.ok ? "ok" : "error",
      message: r.message.slice(0, 500),
      latency_ms: latency,
      source: "cron",
    });
    let alerted = false;
    if (!r.ok) {
      const { data: st } = await sb
        .from("integration_status")
        .select("last_alert_at")
        .eq("key", key)
        .maybeSingle();
      const last = st?.last_alert_at ? new Date(st.last_alert_at).getTime() : 0;
      if (Date.now() - last > 60 * 60 * 1000) {
        const { sendWhatsAppAlert } = await import("@/lib/alerts.functions");
        const send = await sendWhatsAppAlert(
          `⚠️ 0WEB — Integração em erro: ${key}\n${r.message}`,
        );
        if (send.ok) {
          await sb
            .from("integration_status")
            .update({ last_alert_at: new Date().toISOString() })
            .eq("key", key);
          alerted = true;
        }
      }
    }
    out.push({ key, ...r, alerted, latency_ms: latency });
  }
  return out;
}

