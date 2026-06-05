// Sprint 13 — Server functions para rede de parceiros
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

// Atribuição pública (sem auth) — chamada por formulários anônimos pós-conversão
export const attachAttributionPublic = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        partner_code: z.string().trim().min(1).max(30),
        lead_id: z.string().uuid().optional(),
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
    if (!link) return { ok: false, reason: "code_not_found" as const };
    const { error } = await supabaseAdmin.from("partner_attributions").insert({
      partner_id: link.partner_id,
      link_id: link.id,
      lead_id: data.lead_id ?? null,
      conversion_type: "lead",
      value_cents: 0,
      campaign: link.campaign,
      landing_path: data.landing_path,
    });
    if (error) {
      console.error("[attachAttributionPublic]", error.message);
      return { ok: false, reason: "insert_failed" as const };
    }
    return { ok: true as const };
  });

// computeCommission — aplica regras ativas a uma atribuição e registra partner_commissions
export const computeCommission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        attribution_id: z.string().uuid(),
        base_amount_cents: z.number().int().min(0).max(1_000_000_000).optional(),
        period: z.string().max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Apenas administradores podem calcular comissões");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attr, error: attrErr } = await supabaseAdmin
      .from("partner_attributions")
      .select("id, partner_id, value_cents, conversion_type")
      .eq("id", data.attribution_id)
      .maybeSingle();
    if (attrErr || !attr) throw new Error("Atribuição não encontrada");

    const { data: partner } = await supabaseAdmin
      .from("partners")
      .select("id, kind")
      .eq("id", attr.partner_id)
      .maybeSingle();
    if (!partner) throw new Error("Parceiro não encontrado");

    const { data: rules } = await supabaseAdmin
      .from("commission_rules")
      .select("*")
      .eq("active", true)
      .or(`partner_id.eq.${partner.id},partner_id.is.null`);

    const candidate =
      rules?.find((r) => r.partner_id === partner.id) ||
      rules?.find((r) => r.kind_target === partner.kind) ||
      rules?.find((r) => r.partner_id === null && r.kind_target === null);

    if (!candidate) throw new Error("Nenhuma regra de comissão aplicável");

    const base = data.base_amount_cents ?? attr.value_cents ?? 0;
    let commission = 0;
    switch (candidate.type) {
      case "fixo":
      case "recorrente":
      case "vitalicio":
      case "por_produto":
      case "por_categoria":
        commission = Math.round(Number(candidate.value) * 100);
        break;
      case "percentual":
        commission = Math.round((base * Number(candidate.value)) / 100);
        break;
      default:
        commission = 0;
    }

    const period = data.period ?? new Date().toISOString().slice(0, 7);

    const { data: row, error } = await supabaseAdmin
      .from("partner_commissions")
      .upsert(
        {
          partner_id: partner.id,
          attribution_id: attr.id,
          rule_id: candidate.id,
          base_amount_cents: base,
          commission_amount_cents: commission,
          commission_type: candidate.type,
          period,
          status: "pending",
        },
        { onConflict: "attribution_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, commission: row };
  });

// Computa em lote: todas atribuições "sale" sem commission ainda
export const computePendingCommissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Apenas administradores");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pendingAttrs } = await supabaseAdmin
      .from("partner_attributions")
      .select("id")
      .eq("conversion_type", "sale")
      .gt("value_cents", 0)
      .limit(500);

    const ids = (pendingAttrs ?? []).map((a) => a.id);
    if (!ids.length) return { processed: 0, errors: 0 };

    const { data: existing } = await supabaseAdmin
      .from("partner_commissions")
      .select("attribution_id")
      .in("attribution_id", ids);
    const done = new Set((existing ?? []).map((e) => e.attribution_id));

    let processed = 0;
    let errors = 0;
    for (const id of ids) {
      if (done.has(id)) continue;
      try {
        await computeCommission({ data: { attribution_id: id } });
        processed++;
      } catch {
        errors++;
      }
    }
    return { processed, errors };
  });

// Sugere representante ativo com base em partner_territories (cidade > estado > nacional)
// e registra atribuição de origem 'territory' se solicitado.
export const suggestPartnerForLead = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        lead_id: z.string().uuid().optional(),
        city: z.string().trim().max(120).optional(),
        state: z.string().trim().max(40).optional(),
        register_attribution: z.boolean().default(false),
        kinds: z.array(z.enum(KINDS)).default(["representante", "franqueado"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.city && !data.state) {
      return { suggested: null, candidates: [] as Array<{ partner_id: string; scope: string }> };
    }

    // Buscar territórios candidatos (city > state > nacional)
    const orConditions: string[] = [];
    if (data.city) orConditions.push(`and(scope.eq.cidade,value.ilike.${data.city})`);
    if (data.state) orConditions.push(`and(scope.eq.estado,value.ilike.${data.state})`);
    orConditions.push(`scope.eq.nacional`);

    const { data: territories } = await supabaseAdmin
      .from("partner_territories")
      .select("partner_id, scope, value, exclusivity")
      .or(orConditions.join(","));

    if (!territories?.length) {
      return { suggested: null, candidates: [] };
    }

    // Filtrar parceiros aprovados e tipo desejado
    const partnerIds = Array.from(new Set(territories.map((t) => t.partner_id)));
    const { data: partners } = await supabaseAdmin
      .from("partners")
      .select("id, name, kind, status, user_id")
      .in("id", partnerIds)
      .eq("status", "aprovado")
      .in("kind", data.kinds);

    const partnerSet = new Set((partners ?? []).map((p) => p.id));
    const ranked = territories
      .filter((t) => partnerSet.has(t.partner_id))
      .sort((a, b) => {
        const score = (s: string) => (s === "cidade" ? 3 : s === "estado" ? 2 : s === "regiao" ? 1 : 0);
        return score(b.scope) - score(a.scope);
      });

    const best = ranked[0];
    if (!best) return { suggested: null, candidates: [] };

    const suggested = (partners ?? []).find((p) => p.id === best.partner_id) ?? null;

    if (data.register_attribution && data.lead_id && suggested) {
      const { error } = await supabaseAdmin.from("partner_attributions").insert({
        partner_id: suggested.id,
        lead_id: data.lead_id,
        conversion_type: "lead",
        value_cents: 0,
        notes: `territory:${best.scope}:${best.value}`,
      });
      if (error) console.error("[suggestPartnerForLead] insert", error.message);
    }

    return {
      suggested: suggested ? { id: suggested.id, name: suggested.name, kind: suggested.kind, matched_scope: best.scope, matched_value: best.value } : null,
      candidates: ranked.slice(0, 5).map((t) => ({ partner_id: t.partner_id, scope: t.scope, value: t.value })),
    };
  });
