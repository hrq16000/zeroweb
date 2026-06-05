// Plans CRUD — server functions.
// Public read uses admin client (RLS allows anon SELECT of active rows too,
// but going through admin keeps SSR fetches simple and consistent).
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

export interface PlanRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  price_label: string | null;
  period: "month" | "year" | "project" | "custom";
  features: string[];
  highlight: boolean;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  active: boolean;
  updated_at?: string;
}

function normalize(row: Record<string, unknown>): PlanRow {
  const features = Array.isArray(row.features)
    ? (row.features as string[])
    : typeof row.features === "string"
      ? (() => { try { const v = JSON.parse(row.features as string); return Array.isArray(v) ? v : []; } catch { return []; } })()
      : [];
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    price_cents: (row.price_cents as number) ?? null,
    price_label: (row.price_label as string) ?? null,
    period: ((row.period as string) ?? "month") as PlanRow["period"],
    features,
    highlight: Boolean(row.highlight),
    cta_label: (row.cta_label as string) ?? "Quero esse plano",
    cta_href: (row.cta_href as string) ?? "#contato",
    sort_order: Number(row.sort_order ?? 0),
    active: Boolean(row.active),
    updated_at: row.updated_at as string | undefined,
  };
}

// Public — only active plans, ordered.
export const listPlansPublic = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await getAdmin();
  const { data, error } = await sb
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { plans: [] as PlanRow[], error: error.message };
  return { plans: (data ?? []).map(normalize), error: null as string | null };
});

// Admin — all plans.
export const listPlansAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const { data, error } = await sb
      .from("plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { plans: (data ?? []).map(normalize) };
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, "slug deve ser kebab-case"),
  name: z.string().min(1).max(120),
  description: z.string().max(400).nullable().optional(),
  price_cents: z.number().int().min(0).nullable().optional(),
  price_label: z.string().max(60).nullable().optional(),
  period: z.enum(["month", "year", "project", "custom"]),
  features: z.array(z.string().min(1).max(200)).max(30),
  highlight: z.boolean(),
  cta_label: z.string().min(1).max(60),
  cta_href: z.string().min(1).max(400),
  sort_order: z.number().int().min(0).max(10000),
  active: z.boolean(),
});

export const upsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const payload = { ...data, features: data.features };
    if (data.id) {
      const { data: out, error } = await sb.from("plans").update(payload).eq("id", data.id).select().single();
      if (error) throw new Error(error.message);
      return { plan: normalize(out as Record<string, unknown>) };
    }
    const { data: out, error } = await sb.from("plans").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { plan: normalize(out as Record<string, unknown>) };
  });

export const deletePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    const { error } = await sb.from("plans").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reorderPlans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ order: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })).max(100) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin((context as { userId: string }).userId);
    const sb = await getAdmin();
    for (const o of data.order) {
      const { error } = await sb.from("plans").update({ sort_order: o.sort_order }).eq("id", o.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export function formatPrice(p: PlanRow): { price: string; period: string } {
  if (p.price_label) return { price: p.price_label, period: "" };
  if (p.price_cents == null) return { price: "Sob consulta", period: "" };
  const v = p.price_cents / 100;
  const price = v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: v % 1 === 0 ? 0 : 2 });
  const period =
    p.period === "month" ? "/mês" :
    p.period === "year" ? "/ano" :
    p.period === "project" ? "/projeto" : "";
  return { price, period };
}
