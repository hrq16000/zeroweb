// Admin-managed runtime settings (key/value). Allows the admin panel to
// configure integrations (e.g. uazapi WhatsApp alerts) without touching env.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function isAdmin(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) => r.role === "admin");
}

// ── In-process cache for hot reads (alerts loop). 60s TTL. ────────────
const _cache = new Map<string, { v: string | null; exp: number }>();
const TTL = 60_000;

/** Server-only helper: read a single setting (cached). Returns null if unset. */
export async function getSettingValue(key: string): Promise<string | null> {
  const hit = _cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.v;
  const sb = await getAdmin();
  const { data } = await sb.from("app_settings").select("value").eq("key", key).maybeSingle();
  const v = (data?.value as string | null) ?? null;
  _cache.set(key, { v, exp: Date.now() + TTL });
  return v;
}

/** Invalidate cache (called after a write). */
export function invalidateSettingsCache(keys?: string[]) {
  if (!keys) _cache.clear();
  else keys.forEach((k) => _cache.delete(k));
}

// ── Admin RPCs ────────────────────────────────────────────────────────

export const listSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("app_settings")
      .select("key,value,is_secret,description,updated_at,updated_by")
      .order("key");
    if (error) throw new Error(error.message);
    // Mask secret values in the response: only return whether a value exists.
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
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
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
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    await sb.from("app_settings").delete().eq("key", data.key);
    invalidateSettingsCache([data.key]);
    return { ok: true };
  });
