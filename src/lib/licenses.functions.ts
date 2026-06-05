import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const licenseInput = z.object({
  id: z.string().uuid().optional(),
  portal_id: z.string().uuid(),
  parent_license_id: z.string().uuid().nullable().optional(),
  code: z.string().min(3).max(64).regex(/^[A-Z0-9_-]+$/),
  type: z.enum(["master", "franqueadora", "licenciado", "white_label", "trial"]),
  status: z.enum(["active", "suspended", "expired", "cancelled", "trial", "pending"]).default("pending"),
  plan: z.string().min(2).max(64).default("starter"),
  limits: z.record(z.string(), z.unknown()).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
  starts_at: z.string().optional(),
  renews_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

async function requireSuper(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
  if (!data) throw new Error("forbidden");
}

export const listLicenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = (context as { userId: string }).userId;
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    const q = supabaseAdmin.from("license_overview").select("*").order("starts_at", { ascending: false });
    if (!isSuper) {
      const { data: pm } = await supabaseAdmin.from("portal_members").select("portal_id").eq("user_id", userId);
      const ids = (pm ?? []).map((r: { portal_id: string }) => r.portal_id);
      if (ids.length === 0) return { rows: [], isSuper: false };
      q.in("portal_id", ids);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: data ?? [], isSuper: !!isSuper };
  });

export const upsertLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => licenseInput.parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    await requireSuper(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: Record<string, unknown> = { ...data, created_by: userId };
    const q = supabaseAdmin.from("licenses");
    const { data: row, error } = data.id
      ? await q.update(payload).eq("id", data.id).select().single()
      : await q.insert(payload).select().single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("license_audit_log").insert({
      license_id: row.id,
      portal_id: row.portal_id,
      actor: userId,
      action: data.id ? "license_update" : "license_create",
      payload: { code: row.code, status: row.status },
    });
    return { row };
  });

export const setLicenseStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["active", "suspended", "expired", "cancelled", "trial", "pending"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    await requireSuper(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("licenses")
      .update({ status: data.status })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("license_audit_log").insert({
      license_id: row.id,
      portal_id: row.portal_id,
      actor: userId,
      action: "status_change",
      payload: { to: data.status },
    });
    return { ok: true };
  });

export const getLicenseAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ license_id: z.string().uuid(), limit: z.number().min(1).max(500).default(100) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("license_audit_log")
      .select("*")
      .eq("license_id", data.license_id)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const getLicenseUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ license_id: z.string().uuid(), days: z.number().min(1).max(365).default(30) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - data.days * 86400000).toISOString().slice(0, 10);
    const { data: rows, error } = await supabaseAdmin
      .from("license_usage_metrics")
      .select("*")
      .eq("license_id", data.license_id)
      .gte("day", since)
      .order("day", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

/** Snapshot current license usage. */
export const snapshotLicenseUsage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ license_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    await requireSuper(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lic } = await supabaseAdmin.from("licenses").select("portal_id").eq("id", data.license_id).single();
    if (!lic) throw new Error("license not found");
    const portal_id = lic.portal_id as string;
    const [{ count: users_count }, { count: leads_count }, { count: visits_count }] = await Promise.all([
      supabaseAdmin.from("portal_members").select("user_id", { count: "exact", head: true }).eq("portal_id", portal_id),
      supabaseAdmin.from("lead_submissions").select("id", { count: "exact", head: true }).eq("portal_id", portal_id),
      supabaseAdmin.from("visitantes_rastreio").select("id", { count: "exact", head: true }).eq("portal_id", portal_id),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabaseAdmin
      .from("license_usage_metrics")
      .upsert(
        {
          license_id: data.license_id,
          portal_id,
          day: today,
          users_count: users_count ?? 0,
          leads_count: leads_count ?? 0,
          visits_count: visits_count ?? 0,
          projects_count: 0,
        },
        { onConflict: "license_id,day" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
