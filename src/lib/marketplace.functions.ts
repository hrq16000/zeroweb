import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

// ---------- PUBLIC READS (admin-elevated, scoped by status) ----------

export const listCatalog = createServerFn({ method: "GET" })
  .inputValidator((i) =>
    z.object({
      kind: z.enum(["all", "provider", "company"]).default("all"),
      q: z.string().max(120).optional(),
      city: z.string().max(80).optional(),
      state: z.string().max(2).optional(),
      category: z.string().max(80).optional(),
      verified: z.boolean().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(48).default(24),
    }).parse(i ?? {})
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    const providers = data.kind !== "company"
      ? supabaseAdmin.from("providers").select("id,slug,display_name,headline,avatar_url,city,state,specialties,verified,rating_avg,rating_count")
          .eq("status", "active")
          .order("verified", { ascending: false })
          .order("rating_avg", { ascending: false })
          .range(from, to)
      : null;
    const companies = data.kind !== "provider"
      ? supabaseAdmin.from("companies").select("id,slug,trade_name,logo_url,description,city,state,categories,verified,rating_avg,rating_count")
          .eq("status", "active")
          .order("verified", { ascending: false })
          .order("rating_avg", { ascending: false })
          .range(from, to)
      : null;

    const applyFilters = (q: any) => {
      if (data.city) q = q.ilike("city", data.city);
      if (data.state) q = q.ilike("state", data.state);
      if (data.verified) q = q.eq("verified", true);
      if (data.q) q = q.or(`display_name.ilike.%${data.q}%,headline.ilike.%${data.q}%`);
      return q;
    };
    const applyFiltersCo = (q: any) => {
      if (data.city) q = q.ilike("city", data.city);
      if (data.state) q = q.ilike("state", data.state);
      if (data.verified) q = q.eq("verified", true);
      if (data.q) q = q.or(`trade_name.ilike.%${data.q}%,description.ilike.%${data.q}%`);
      if (data.category) q = q.contains("categories", [data.category]);
      return q;
    };

    const [pr, co] = await Promise.all([
      providers ? applyFilters(providers) : Promise.resolve({ data: [], error: null }),
      companies ? applyFiltersCo(companies) : Promise.resolve({ data: [], error: null }),
    ]);
    return { providers: pr.data ?? [], companies: co.data ?? [] };
  });

export const getProviderBySlug = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ slug: z.string().min(1).max(80) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: provider } = await supabaseAdmin.from("providers").select("*").eq("slug", data.slug).eq("status", "active").maybeSingle();
    if (!provider) return { provider: null, portfolio: [], reviews: [] };
    const [{ data: portfolio }, { data: reviews }] = await Promise.all([
      supabaseAdmin.from("provider_portfolio").select("*").eq("provider_id", provider.id).order("sort_order"),
      supabaseAdmin.from("reviews").select("id,rating,comment,author_name,created_at").eq("target_type", "provider").eq("target_id", provider.id).eq("status", "approved").order("created_at", { ascending: false }).limit(20),
    ]);
    void supabaseAdmin.from("providers").update({ views_count: (provider.views_count ?? 0) + 1 }).eq("id", provider.id);
    return { provider, portfolio: portfolio ?? [], reviews: reviews ?? [] };
  });

export const getCompanyBySlug = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ slug: z.string().min(1).max(80) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: company } = await supabaseAdmin.from("companies").select("*").eq("slug", data.slug).eq("status", "active").maybeSingle();
    if (!company) return { company: null, reviews: [] };
    const { data: reviews } = await supabaseAdmin.from("reviews").select("id,rating,comment,author_name,created_at").eq("target_type", "company").eq("target_id", company.id).eq("status", "approved").order("created_at", { ascending: false }).limit(20);
    void supabaseAdmin.from("companies").update({ views_count: (company.views_count ?? 0) + 1 }).eq("id", company.id);
    return { company, reviews: reviews ?? [] };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("mk_categories").select("*").eq("active", true).order("sort_order");
  return { categories: data ?? [] };
});

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ slug: z.string().min(1).max(80) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: category } = await supabaseAdmin.from("mk_categories").select("*").eq("slug", data.slug).maybeSingle();
    if (!category) return { category: null, providers: [], companies: [] };
    const [{ data: providers }, { data: companies }] = await Promise.all([
      supabaseAdmin.from("providers").select("id,slug,display_name,headline,avatar_url,city,state,verified,rating_avg,rating_count").eq("status", "active").contains("specialties", [data.slug]).limit(48),
      supabaseAdmin.from("companies").select("id,slug,trade_name,logo_url,description,city,state,verified,rating_avg,rating_count").eq("status", "active").contains("categories", [data.slug]).limit(48),
    ]);
    return { category, providers: providers ?? [], companies: companies ?? [] };
  });

export const getCityCatalog = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ slug: z.string().min(1).max(80) }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cityName = data.slug.replace(/-/g, " ");
    const [{ data: providers }, { data: companies }] = await Promise.all([
      supabaseAdmin.from("providers").select("id,slug,display_name,headline,avatar_url,city,state,verified,rating_avg,rating_count").eq("status", "active").ilike("city", cityName).limit(48),
      supabaseAdmin.from("companies").select("id,slug,trade_name,logo_url,description,city,state,verified,rating_avg,rating_count").eq("status", "active").ilike("city", cityName).limit(48),
    ]);
    return { city: cityName, providers: providers ?? [], companies: companies ?? [] };
  });

// ---------- WRITES ----------

const reviewSchema = z.object({
  target_type: z.enum(["provider", "company"]),
  target_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  author_name: z.string().trim().min(2).max(100),
  author_email: z.string().email().max(255).optional(),
});

export const createReview = createServerFn({ method: "POST" })
  .inputValidator((i) => reviewSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reviews").insert({ ...data, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const requestSchema = z.object({
  requester_name: z.string().trim().min(2).max(100),
  requester_email: z.string().email().max(255).optional(),
  requester_phone: z.string().trim().min(8).max(30).optional(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  category_slug: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(2).optional(),
  budget_range: z.string().max(60).optional(),
});

export const createServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((i) => requestSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("service_requests").insert(data).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// ---------- OWNER (authenticated) ----------

const providerUpsertSchema = z.object({
  display_name: z.string().trim().min(2).max(120),
  headline: z.string().trim().max(200).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
  avatar_url: z.string().url().max(500).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  whatsapp: z.string().trim().max(30).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  service_regions: z.array(z.string().max(80)).max(50).optional(),
  specialties: z.array(z.string().max(80)).max(50).optional(),
  social: z.record(z.string(), z.string()).optional(),
});

export const getMyProvider = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("providers").select("*").eq("user_id", userId).maybeSingle();
    return { provider: data };
  });

export const upsertMyProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => providerUpsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("providers").select("id,slug").eq("user_id", userId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("providers").update(data).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id };
    }
    const slug = `${slugify(data.display_name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error } = await supabase.from("providers").insert({ ...data, user_id: userId, slug, status: "pending" }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

const companyUpsertSchema = z.object({
  trade_name: z.string().trim().min(2).max(160),
  legal_name: z.string().trim().max(200).optional().nullable(),
  cnpj: z.string().trim().max(20).optional().nullable(),
  logo_url: z.string().url().max(500).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  whatsapp: z.string().trim().max(30).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  website: z.string().url().max(255).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  service_regions: z.array(z.string().max(80)).max(50).optional(),
  categories: z.array(z.string().max(80)).max(50).optional(),
  social: z.record(z.string(), z.string()).optional(),
});

export const getMyCompany = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("companies").select("*").eq("user_id", userId).maybeSingle();
    return { company: data };
  });

export const upsertMyCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => companyUpsertSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("companies").select("id,slug").eq("user_id", userId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("companies").update(data).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id };
    }
    const slug = `${slugify(data.trade_name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error } = await supabase.from("companies").insert({ ...data, user_id: userId, slug, status: "pending" }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// ---------- ADMIN MODERATION ----------

const moderationSchema = z.object({
  target_type: z.enum(["provider", "company", "review", "request"]),
  target_id: z.string().uuid(),
  action: z.enum(["approve", "suspend", "block", "verify", "unverify", "reject", "reopen"]),
  reason: z.string().trim().max(500).optional(),
});

export const adminModerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => moderationSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const map: Record<string, { status?: string; verified?: boolean }> = {
      approve: { status: "active" },
      suspend: { status: "suspended" },
      block: { status: "blocked" },
      reject: { status: "rejected" },
      reopen: { status: "active" },
      verify: { verified: true },
      unverify: { verified: false },
    };
    const patch = map[data.action];

    if (data.target_type === "provider" && patch) {
      await supabaseAdmin.from("providers").update(patch).eq("id", data.target_id);
    } else if (data.target_type === "company" && patch) {
      await supabaseAdmin.from("companies").update(patch).eq("id", data.target_id);
    } else if (data.target_type === "review") {
      const status = data.action === "approve" ? "approved" : data.action === "reject" ? "rejected" : "pending";
      await supabaseAdmin.from("reviews").update({ status }).eq("id", data.target_id);
    } else if (data.target_type === "request") {
      await supabaseAdmin.from("service_requests").update({ status: data.action === "reopen" ? "open" : "closed" }).eq("id", data.target_id);
    }
    await supabaseAdmin.from("moderation_actions").insert({ ...data, actor_user_id: userId });
    return { ok: true };
  });

export const adminListPending = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: providers }, { data: companies }, { data: reviews }, { data: requests }] = await Promise.all([
      supabaseAdmin.from("providers").select("id,slug,display_name,city,state,status,verified,created_at").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("companies").select("id,slug,trade_name,city,state,status,verified,created_at").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("reviews").select("id,target_type,target_id,rating,comment,author_name,status,created_at").order("created_at", { ascending: false }).limit(50),
      supabaseAdmin.from("service_requests").select("id,title,city,state,status,created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    return { providers: providers ?? [], companies: companies ?? [], reviews: reviews ?? [], requests: requests ?? [] };
  });

const distSchema = z.object({
  request_id: z.string().uuid(),
  target_type: z.enum(["provider", "company"]),
  target_id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const adminDistributeRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => distSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("request_distributions").insert(data);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("service_requests").update({ status: "distributed" }).eq("id", data.request_id);
    return { ok: true };
  });

// ---------- SITEMAP helpers (public) ----------

export const listSitemapEntries = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: providers }, { data: companies }, { data: categories }] = await Promise.all([
    supabaseAdmin.from("providers").select("slug,updated_at").eq("status", "active").limit(50000),
    supabaseAdmin.from("companies").select("slug,updated_at").eq("status", "active").limit(50000),
    supabaseAdmin.from("mk_categories").select("slug").eq("active", true),
  ]);
  return { providers: providers ?? [], companies: companies ?? [], categories: categories ?? [] };
});
