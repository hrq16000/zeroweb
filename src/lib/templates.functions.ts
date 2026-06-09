import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const templateInput = z.object({
  id: z.string().uuid().optional(),
  portal_id: z.string().uuid().nullable().optional(),
  kind: z.enum(["landing_page", "funnel", "page", "email", "material", "config"]),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(200),
  description: z.string().max(1000).nullable().optional(),
  is_global: z.boolean().default(false),
  payload: z.record(z.string(), z.unknown()).optional(),
  preview_url: z.string().url().nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export const listTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ portal_id: z.string().uuid().nullable().optional(), kind: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    let q = supabaseAdmin.from("content_templates").select("*").order("updated_at", { ascending: false });
    if (data.kind) q = q.eq("kind", data.kind as "landing_page" | "funnel" | "page" | "email" | "material" | "config");
    if (data.portal_id) q = q.or(`portal_id.eq.${data.portal_id},is_global.eq.true`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const upsertTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => templateInput.parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const payload = { ...data, created_by: userId } as never;
    const q = supabaseAdmin.from("content_templates");
    const { data: row, error } = data.id
      ? await q.update(payload).eq("id", data.id).select().single()
      : await q.insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const deleteTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const { error } = await supabaseAdmin.from("content_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Service catalog */
export const listServiceCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("service_catalog").select("*").order("name");
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
});

export const upsertServiceCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      code: z.string().min(2).max(64).regex(/^[a-z0-9_-]+$/),
      name: z.string().min(2).max(200),
      description: z.string().max(1000).nullable().optional(),
      category: z.string().max(80).nullable().optional(),
      default_price: z.number().nullable().optional(),
      active: z.boolean().default(true),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const q = supabaseAdmin.from("service_catalog");
    const { data: row, error } = data.id
      ? await q.update(data).eq("id", data.id).select().single()
      : await q.insert(data).select().single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const togglePortalService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      portal_id: z.string().uuid(),
      service_id: z.string().uuid(),
      enabled: z.boolean(),
      custom_price: z.number().nullable().optional(),
      custom_name: z.string().max(200).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const { error } = await supabaseAdmin
      .from("portal_services")
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: "portal_id,service_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
