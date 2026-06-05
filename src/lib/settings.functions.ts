// Admin-managed runtime settings (key/value). Allows the admin panel to
// configure integrations (e.g. uazapi WhatsApp alerts) without touching env.
// Sprint 16: audit + versioning + rollback + connection tests + granular role.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

/** admin OR admin_integrations may manage settings. */
async function canManage(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) =>
    r.role === "admin" || r.role === "admin_integrations"
  );
}

// ── In-process cache for hot reads (alerts loop). 60s TTL. ────────────
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

// ── Admin RPCs ────────────────────────────────────────────────────────

export const listSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("app_settings")
      .select("key,value,is_secret,description,updated_at,updated_by")
      .order("key");
    if (error) throw new Error(error.message);
    const rows = (data ?? []).map((r: any) => ({
      key: r.key,
      description: r.description,
      is_secret: r.is_secret,
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
        description: z.string().max(500).optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb.from("app_settings").upsert(
      {
        key: data.key,
        value: data.value,
        is_secret: data.is_secret ?? undefined,
        description: data.description ?? undefined,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      },
      { onConflict: "key" }
    );
    if (error) throw new Error(error.message);
    invalidateSettingsCache([data.key]);
    return { ok: true };
  });

export const deleteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ key: z.string().min(1) }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    await sb.from("app_settings").delete().eq("key", data.key);
    invalidateSettingsCache([data.key]);
    return { ok: true };
  });

// ── History / rollback ────────────────────────────────────────────────

export const listSettingHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ key: z.string().min(1), limit: z.number().min(1).max(100).optional() }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: rows, error } = await sb
      .from("app_settings_history")
      .select("id,key,old_value,new_value,action,changed_at,changed_by")
      .eq("key", data.key)
      .order("changed_at", { ascending: false })
      .limit(data.limit ?? 20);
    if (error) throw new Error(error.message);
    // Mask secret values: load setting once to see if it's secret.
    const { data: setting } = await sb.from("app_settings").select("is_secret").eq("key", data.key).maybeSingle();
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
  .inputValidator((i) => z.object({ history_id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    // Find target snapshot — restore its new_value as the new current value.
    const { data: snap, error: e1 } = await sb
      .from("app_settings_history")
      .select("id,key,new_value")
      .eq("id", data.history_id)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!snap) throw new Error("Versão não encontrada");

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

    // Update the most recent history row (just created by the trigger) to mark as rollback.
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
        .update({ action: "rollback", rolled_back_from_id: snap.id })
        .eq("id", latest.id);
    }
    invalidateSettingsCache([snap.key]);
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
      .select("key,last_status,last_message,last_tested_at,last_tested_by")
      .order("key");
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

async function writeStatus(key: string, status: "ok" | "error", message: string, userId: string) {
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
    return { ok: true, message: `Conectado. ${count ?? 0} configuração(ões) na tabela.` };
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

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ key: z.enum(["uazapi", "supabase", "lovable_ai"]) }).parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    let result: { ok: boolean; message: string };
    if (data.key === "uazapi") result = await testUazapi();
    else if (data.key === "supabase") result = await testSupabase();
    else result = await testLovableAi();
    await writeStatus(data.key, result.ok ? "ok" : "error", result.message, context.userId);
    return result;
  });
