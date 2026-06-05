// Site sections — toggle/reorder visibility per page via admin panel.
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
  return (data ?? []).some(
    (r: { role: string }) => r.role === "admin" || r.role === "admin_integrations",
  );
}

export type SiteSectionRow = {
  id: string;
  page: string;
  key: string;
  label: string;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
};

/** Public read — used by route loaders to know what to render. */
export const getPageSections = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ page: z.string().min(1).max(60) }).parse(i))
  .handler(async ({ data }) => {
    const sb = await getAdmin();
    const { data: rows, error } = await sb
      .from("site_sections")
      .select("key,enabled,sort_order")
      .eq("page", data.page)
      .order("sort_order");
    if (error) throw new Error(error.message);
    const map: Record<string, boolean> = {};
    for (const r of rows ?? []) map[r.key as string] = !!r.enabled;
    return { map, rows: rows ?? [] };
  });

/** Admin list (all sections for a page, including disabled). */
export const adminListSections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ page: z.string().min(1).max(60) }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: rows, error } = await sb
      .from("site_sections")
      .select("id,page,key,label,enabled,sort_order,updated_at")
      .eq("page", data.page)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as SiteSectionRow[] };
  });

export const adminListPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data, error } = await sb.from("site_sections").select("page");
    if (error) throw new Error(error.message);
    const pages = Array.from(new Set((data ?? []).map((r: any) => r.page as string))).sort();
    return { pages };
  });

export const adminToggleSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid(), enabled: z.boolean() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb
      .from("site_sections")
      .update({ enabled: data.enabled, updated_by: context.userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminReorderSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        items: z
          .array(z.object({ id: z.string().uuid(), sort_order: z.number().int() }))
          .min(1)
          .max(200),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    for (const it of data.items) {
      await sb
        .from("site_sections")
        .update({ sort_order: it.sort_order, updated_by: context.userId })
        .eq("id", it.id);
    }
    return { ok: true };
  });

export const adminUpsertSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid().optional(),
        page: z.string().min(1).max(60),
        key: z.string().min(1).max(60).regex(/^[a-z0-9_]+$/),
        label: z.string().min(1).max(120),
        enabled: z.boolean().optional(),
        sort_order: z.number().int().optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb.from("site_sections").upsert(
      {
        ...data,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page,key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    if (!(await canManage(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb.from("site_sections").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
