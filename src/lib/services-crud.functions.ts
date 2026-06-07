// Services CRUD — server functions for the admin catalogue.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function getAdmin(): Promise<AnyClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function assertAdmin(userId: string) {
  const sb = await getAdmin();
  const [{ data: roles }, { data: portal }] = await Promise.all([
    sb.from("user_roles").select("role").eq("user_id", userId),
    sb.from("portal_members").select("role").eq("user_id", userId).eq("role", "super_admin"),
  ]);
  const isAdmin =
    (roles ?? []).some((r: { role: string }) => r.role === "admin") ||
    (portal ?? []).length > 0;
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

export type ServiceFunnels = {
  default?: string | null;
  header?: string | null;
  hero?: string | null;
  card?: string | null;
  detail?: string | null;
  footer?: string | null;
};

export interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  title: string;
  h1: string;
  description: string;
  service_type: string;
  tagline: string | null;
  price_from: number | null;
  // Comercial (novo)
  price: number | null;
  price_period: string | null;
  delivery_days: string | null;
  conditions: string | null;
  cta_label: string;
  cta_target: string | null;
  image_path: string | null;
  image_url: string | null;
  image_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  problems: string[];
  benefits: string[];
  process: { step: string; desc: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  is_active: boolean;
  is_featured: boolean;
  // Visibilidade (novo)
  show_in_menu: boolean;
  show_in_footer: boolean;
  show_in_home_featured: boolean;
  show_in_sitemap: boolean;
  // Funis por local (novo)
  funnels: ServiceFunnels;
  display_order: number;
  updated_at?: string;
}


function asArr<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") {
    try { const j = JSON.parse(v); return Array.isArray(j) ? j : []; } catch { return []; }
  }
  return [];
}

function publicImageUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/service-images/${path}`;
}

function normalize(row: Record<string, unknown>): ServiceRow {
  const image_path = (row.image_path as string) ?? null;
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    category: row.category as string,
    title: row.title as string,
    h1: row.h1 as string,
    description: row.description as string,
    service_type: row.service_type as string,
    tagline: (row.tagline as string) ?? null,
    price_from: (row.price_from as number) ?? null,
    price: (row.price as number) ?? null,
    price_period: (row.price_period as string) ?? null,
    delivery_days: (row.delivery_days as string) ?? null,
    conditions: (row.conditions as string) ?? null,
    cta_label: (row.cta_label as string) ?? "Solicitar proposta",
    cta_target: (row.cta_target as string) ?? null,
    image_path,
    image_url: publicImageUrl(image_path),
    image_alt: (row.image_alt as string) ?? null,
    seo_title: (row.seo_title as string) ?? null,
    seo_description: (row.seo_description as string) ?? null,
    problems: asArr<string>(row.problems),
    benefits: asArr<string>(row.benefits),
    process: asArr<{ step: string; desc: string }>(row.process),
    faq: asArr<{ q: string; a: string }>(row.faq),
    keywords: asArr<string>(row.keywords),
    is_active: Boolean(row.is_active),
    is_featured: Boolean(row.is_featured),
    show_in_menu: row.show_in_menu === undefined ? true : Boolean(row.show_in_menu),
    show_in_footer: row.show_in_footer === undefined ? true : Boolean(row.show_in_footer),
    show_in_home_featured: row.show_in_home_featured === undefined ? false : Boolean(row.show_in_home_featured),
    show_in_sitemap: row.show_in_sitemap === undefined ? true : Boolean(row.show_in_sitemap),
    funnels: (row.funnels && typeof row.funnels === "object" ? row.funnels : {}) as ServiceFunnels,
    display_order: Number(row.display_order ?? 100),
    updated_at: row.updated_at as string | undefined,
  };
}


// Public — only active.
export const listServicesPublic = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await getAdmin();
  const { data, error } = await sb
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) return { services: [] as ServiceRow[], error: error.message };
  return { services: (data ?? []).map(normalize), error: null as string | null };
});

// Admin — all rows.
export const listServicesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { services: (data ?? []).map(normalize) };
  });

const slugRegex = /^[a-z0-9-]+$/;

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  // Slug only required for create; ignored for update (stable).
  slug: z.string().min(1).max(80).regex(slugRegex, "slug deve ser kebab-case").optional(),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(40),
  title: z.string().min(1).max(160),
  h1: z.string().min(1).max(160),
  description: z.string().min(1).max(400),
  service_type: z.string().min(1).max(80),
  tagline: z.string().max(200).nullable().optional(),
  price_from: z.number().min(0).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  price_period: z.string().max(40).nullable().optional(),
  delivery_days: z.string().max(60).nullable().optional(),
  conditions: z.string().max(2000).nullable().optional(),
  cta_label: z.string().min(1).max(60),
  cta_target: z.string().max(400).nullable().optional(),
  image_path: z.string().max(400).nullable().optional(),
  image_alt: z.string().max(200).nullable().optional(),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(320).nullable().optional(),
  problems: z.array(z.string().min(1).max(300)).max(20).default([]),
  benefits: z.array(z.string().min(1).max(300)).max(20).default([]),
  process: z.array(z.object({ step: z.string().min(1).max(80), desc: z.string().min(1).max(300) })).max(20).default([]),
  faq: z.array(z.object({ q: z.string().min(1).max(300), a: z.string().min(1).max(1200) })).max(30).default([]),
  keywords: z.array(z.string().min(1).max(80)).max(30).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  show_in_menu: z.boolean().default(true),
  show_in_footer: z.boolean().default(true),
  show_in_home_featured: z.boolean().default(false),
  show_in_sitemap: z.boolean().default(true),
  funnels: z
    .object({
      default: z.string().max(120).nullable().optional(),
      header: z.string().max(120).nullable().optional(),
      hero: z.string().max(120).nullable().optional(),
      card: z.string().max(120).nullable().optional(),
      detail: z.string().max(120).nullable().optional(),
      footer: z.string().max(120).nullable().optional(),
    })
    .default({}),
  display_order: z.number().int().min(0).max(10000).default(100),
});


export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    if (data.id) {
      // Slug is immutable on edit.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, slug: _ignore, ...rest } = data;
      const { data: out, error } = await sb
        .from("services").update(rest).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return { service: normalize(out as Record<string, unknown>) };
    }
    if (!data.slug) throw new Error("slug obrigatório ao criar");
    const { id: _omit, ...payload } = data;
    const { data: out, error } = await sb
      .from("services").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { service: normalize(out as Record<string, unknown>) };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    // Cleanup image if any
    const { data: row } = await sb.from("services").select("image_path").eq("id", data.id).maybeSingle();
    const imgPath = (row as { image_path?: string } | null)?.image_path;
    if (imgPath) {
      await sb.storage.from("service-images").remove([imgPath]).catch(() => null);
    }
    const { error } = await sb.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderServices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      order: z.array(z.object({ id: z.string().uuid(), display_order: z.number().int().min(0) })).max(200),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    for (const o of data.order) {
      const { error } = await sb.from("services").update({ display_order: o.display_order }).eq("id", o.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// Signed upload URL for direct browser upload.
export const getServiceImageUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      slug: z.string().min(1).max(80).regex(slugRegex),
      filename: z.string().min(1).max(120),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const ext = (data.filename.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${data.slug}/${Date.now()}.${ext}`;
    const { data: out, error } = await sb.storage
      .from("service-images")
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return {
      path,
      token: (out as { token: string }).token,
      signedUrl: (out as { signedUrl: string }).signedUrl,
      publicUrl: publicImageUrl(path),
    };
  });
