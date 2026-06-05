// CRM operational server functions. Painel-only; rows include PII so the
// painel client-side gate (PainelGate) is the only access surface.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const STATUSES = [
  "novo",
  "em_atendimento",
  "qualificado",
  "proposta",
  "negociacao",
  "fechado",
  "perdido",
  "arquivado",
] as const;
export type CrmStatus = (typeof STATUSES)[number];
export const CRM_STATUSES = STATUSES;

// Legacy values present in old rows
const STATUS_ALIAS: Record<string, CrmStatus> = {
  new: "novo",
  contacted: "em_atendimento",
  qualified: "qualificado",
  won: "fechado",
  lost: "perdido",
};
function normStatus(s: string | null | undefined): CrmStatus {
  if (!s) return "novo";
  if ((STATUSES as readonly string[]).includes(s)) return s as CrmStatus;
  return STATUS_ALIAS[s] ?? "novo";
}

const FiltersSchema = z
  .object({
    days: z.number().int().min(1).max(365).default(90),
    status: z.enum(STATUSES).optional(),
    assignee: z.string().max(120).optional(),
    source: z.string().max(60).optional(),
    campaign: z.string().max(120).optional(),
    city: z.string().max(120).optional(),
    service: z.string().max(120).optional(),
    search: z.string().max(120).optional(),
    limit: z.number().int().min(1).max(2000).default(500),
  })
  .partial({ days: true, limit: true });

export const listLeads = createServerFn({ method: "POST" })
  .inputValidator((i) => FiltersSchema.parse(i ?? {}))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = new Date(Date.now() - (data.days ?? 90) * 86400_000).toISOString();
    let q = supabaseAdmin
      .from("lead_submissions")
      .select(
        "id,created_at,name,email,phone,company,source,landing_page,utm_source,utm_medium,utm_campaign,hero_variant,cta_variant,status,assignee,notes,last_interaction,score,score_label,payload_json"
      )
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 500);
    if (data.status) q = q.eq("status", data.status);
    if (data.assignee) q = q.eq("assignee", data.assignee);
    if (data.source) q = q.eq("source", data.source);
    if (data.campaign) q = q.eq("utm_campaign", data.campaign);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    let out = (rows ?? []).map((r) => ({
      ...r,
      status: normStatus(r.status as string | null),
    }));

    if (data.search) {
      const s = data.search.toLowerCase();
      out = out.filter(
        (r) =>
          (r.name && (r.name as string).toLowerCase().includes(s)) ||
          (r.email && (r.email as string).toLowerCase().includes(s)) ||
          (r.phone && (r.phone as string).toLowerCase().includes(s)) ||
          (r.company && (r.company as string).toLowerCase().includes(s))
      );
    }
    if (data.city) {
      const c = data.city.toLowerCase();
      out = out.filter((r) => (r.landing_page as string | null)?.toLowerCase().includes("/" + c));
    }
    if (data.service) {
      const sv = data.service.toLowerCase();
      out = out.filter((r) => (r.landing_page as string | null)?.toLowerCase().includes(sv));
    }

    const byStatus: Record<string, number> = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const r of out) byStatus[r.status as string]++;

    return { rows: out, byStatus, total: out.length };
  });

export const getLeadDetail = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: lead, error: e1 }, { data: history, error: e2 }] = await Promise.all([
      supabaseAdmin.from("lead_submissions").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin
        .from("lead_history")
        .select("*")
        .eq("lead_id", data.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    if (!lead) throw new Error("Lead não encontrado");
    return {
      lead: { ...lead, status: normStatus(lead.status as string | null) },
      history: history ?? [],
    };
  });

const UpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES).optional(),
  assignee: z.string().max(120).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  company: z.string().max(200).nullable().optional(),
});
export const updateLead = createServerFn({ method: "POST" })
  .inputValidator((i) => UpdateSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.assignee !== undefined) patch.assignee = data.assignee;
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.company !== undefined) patch.company = data.company;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabaseAdmin.from("lead_submissions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addLeadHistory = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        lead_id: z.string().uuid(),
        kind: z.enum(["note", "contact", "action"]),
        note: z.string().min(1).max(5000),
        actor: z.string().max(120).optional(),
      })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabaseAdmin
        .from("lead_history")
        .insert({ lead_id: data.lead_id, kind: data.kind, note: data.note, actor: data.actor ?? "admin" }),
      supabaseAdmin
        .from("lead_submissions")
        .update({ last_interaction: new Date().toISOString() })
        .eq("id", data.lead_id),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });

export const getCrmSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("crm_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (
    data ?? {
      distribution_mode: "manual",
      assignees: [],
      fixed_assignee: null,
      round_robin_pointer: 0,
    }
  );
});

export const updateCrmSettings = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        distribution_mode: z.enum(["manual", "round_robin", "fixed"]),
        assignees: z.array(z.string().min(1).max(120)).max(50),
        fixed_assignee: z.string().max(120).nullable().optional(),
      })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("crm_settings")
      .update({
        distribution_mode: data.distribution_mode,
        assignees: data.assignees,
        fixed_assignee: data.fixed_assignee ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("singleton", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCrmSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();
  const stale7 = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: rows, error } = await supabaseAdmin
    .from("lead_submissions")
    .select("id,status,assignee,last_interaction,created_at")
    .gte("created_at", since30)
    .limit(5000);
  if (error) throw new Error(error.message);
  const list = (rows ?? []).map((r) => ({ ...r, status: normStatus(r.status as string | null) }));
  const novos = list.filter((r) => r.status === "novo").length;
  const semResp = list.filter((r) => !r.assignee).length;
  const parados = list.filter(
    (r) => !["fechado", "perdido", "arquivado"].includes(r.status) && (r.last_interaction ?? r.created_at) < stale7
  ).length;
  const fechados = list.filter((r) => r.status === "fechado").length;
  const perdidos = list.filter((r) => r.status === "perdido").length;
  const closeable = fechados + perdidos;
  const taxa = closeable > 0 ? Math.round((fechados / closeable) * 100) : 0;
  const closedRows = list.filter((r) => r.status === "fechado");
  const avgMs =
    closedRows.length > 0
      ? closedRows.reduce((acc, r) => {
          const a = new Date(r.last_interaction ?? r.created_at).getTime();
          const b = new Date(r.created_at as string).getTime();
          return acc + Math.max(0, a - b);
        }, 0) / closedRows.length
      : 0;
  const avgDays = Math.round((avgMs / 86400_000) * 10) / 10;
  return {
    novos,
    sem_responsavel: semResp,
    parados,
    fechados,
    perdidos,
    total: list.length,
    taxa_fechamento: taxa,
    tempo_medio_dias: avgDays,
  };
});
