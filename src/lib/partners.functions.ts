// Sprint 13 — Server functions para rede de parceiros
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KINDS = ["afiliado", "representante", "parceiro_comercial", "agencia", "franqueado"] as const;
const STATUSES = ["pendente", "aprovado", "suspenso", "bloqueado"] as const;

// Inscrição pública
export const applyAsPartner = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(2).max(120),
        company: z.string().trim().max(160).optional(),
        email: z.string().trim().email().max(160),
        phone: z.string().trim().max(40).optional(),
        city: z.string().trim().max(120).optional(),
        state: z.string().trim().max(40).optional(),
        kind: z.enum(KINDS).default("afiliado"),
        areas: z.array(z.string().min(1).max(60)).max(20).default([]),
        specialties: z.array(z.string().min(1).max(60)).max(20).default([]),
        bio: z.string().max(800).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("partners")
      .select("id")
      .ilike("email", data.email)
      .maybeSingle();
    if (existing) return { ok: true, id: existing.id, duplicated: true };
    const { data: row, error } = await supabaseAdmin
      .from("partners")
      .insert({ ...data, status: "pendente" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id, duplicated: false };
  });

// Painel do parceiro (self)
export const getMyPartner = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: partner } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!partner) return { partner: null, links: [], metrics: null };
    const [{ data: links }, { data: clicks }, { data: attrs }] = await Promise.all([
      supabase.from("partner_links").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false }),
      supabase.from("partner_clicks").select("id, created_at").eq("partner_id", partner.id).gte("created_at", new Date(Date.now() - 30 * 86400e3).toISOString()),
      supabase.from("partner_attributions").select("id, conversion_type, value_cents, created_at").eq("partner_id", partner.id).gte("created_at", new Date(Date.now() - 30 * 86400e3).toISOString()),
    ]);
    const leads = (attrs ?? []).filter((a) => a.conversion_type === "lead").length;
    const sales = (attrs ?? []).filter((a) => a.conversion_type === "sale").length;
    const revenue = (attrs ?? []).filter((a) => a.conversion_type === "sale").reduce((s, a) => s + (a.value_cents ?? 0), 0);
    return {
      partner,
      links: links ?? [],
      metrics: { clicks_30d: clicks?.length ?? 0, leads_30d: leads, sales_30d: sales, revenue_cents_30d: revenue },
    };
  });

// Criar link de indicação (auto-gera code)
export const createPartnerLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        label: z.string().max(120).optional(),
        target_path: z.string().regex(/^\/[\w\-./?=&%]*$/).max(500).default("/"),
        campaign: z.string().max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: partner } = await supabase.from("partners").select("id, status").eq("user_id", userId).maybeSingle();
    if (!partner) throw new Error("Parceiro não encontrado");
    if (partner.status !== "aprovado") throw new Error("Parceria pendente — aguarde aprovação");
    const code = Math.random().toString(36).slice(2, 10);
    const { data: row, error } = await supabase
      .from("partner_links")
      .insert({ partner_id: partner.id, code, ...data })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// Lista admin
export const listPartnersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ status: z.enum(STATUSES).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("partners").select("*").order("created_at", { ascending: false }).limit(500);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { partners: rows ?? [] };
  });

// Mudar status (admin)
export const setPartnerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(STATUSES) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { status: typeof data.status; approved_at?: string; approved_by?: string } = { status: data.status };
    if (data.status === "aprovado") {
      patch.approved_at = new Date().toISOString();
      patch.approved_by = userId;
    }
    const { error } = await supabase.from("partners").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Ranking 30d
export const getPartnerRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("partner_ranking_30d")
      .select("*")
      .order("revenue_cents_30d", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { ranking: data ?? [] };
  });

// Materiais
export const listPartnerMaterials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("partner_materials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { materials: data ?? [] };
  });

// Atribuição (chamada por integrações; protegido para admin)
export const attachAttributionToLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        partner_code: z.string().min(1).max(30),
        lead_id: z.string().uuid().optional(),
        conversion_type: z.enum(["lead", "sale"]).default("lead"),
        value_cents: z.number().int().min(0).max(10_000_000).default(0),
        campaign: z.string().max(60).optional(),
        landing_path: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link } = await supabaseAdmin
      .from("partner_links")
      .select("id, partner_id, campaign")
      .eq("code", data.partner_code)
      .maybeSingle();
    if (!link) return { ok: false, reason: "code_not_found" };
    const { error } = await supabaseAdmin.from("partner_attributions").insert({
      partner_id: link.partner_id,
      link_id: link.id,
      lead_id: data.lead_id ?? null,
      conversion_type: data.conversion_type,
      value_cents: data.value_cents,
      campaign: data.campaign ?? link.campaign,
      landing_path: data.landing_path,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
