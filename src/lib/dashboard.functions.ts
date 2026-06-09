// Executive dashboard / BI aggregations. Server functions read directly
// from persisted tables via supabaseAdmin (bypassing RLS) and return only
// aggregated, masked, or non-PII data to the client.
//
// Painel is protected client-side (PainelGate). To prevent open lead/PII
// scraping, the lead detail endpoint accepts a token validated server-side.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: roleRow }, { data: isSuper }] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle(),
    supabaseAdmin.rpc("is_super_admin", { _uid: userId }),
  ]);
  if (!roleRow && !isSuper) throw new Error("Acesso negado");
}

const RangeSchema = z.object({
  days: z.number().int().min(1).max(365).default(30),
});

function rangeIso(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

function maskEmail(e?: string | null) {
  if (!e) return null;
  const [u, d] = e.split("@");
  if (!d) return e.slice(0, 2) + "***";
  return u.slice(0, 2) + "***@" + d;
}
function maskPhone(p?: string | null) {
  if (!p) return null;
  const digits = p.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return "***" + digits.slice(-4);
}
function maskName(n?: string | null) {
  if (!n) return null;
  const parts = n.trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p : (p[0] ?? "") + ".")).join(" ");
}

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

// ─────────────────────────────────────────────────────────────
// KPIs — overview
// ─────────────────────────────────────────────────────────────
export const getDashboardKpis = createServerFn({ method: "POST" })
  .inputValidator((i) => RangeSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);

    const [{ data: events }, { data: leads }, { data: waSessions }] = await Promise.all([
      supabaseAdmin
        .from("analytics_events")
        .select("event_name,visitor_id,session_id,path,created_at,metadata_json")
        .gte("created_at", sinceIso)
        .limit(50000),
      supabaseAdmin
        .from("lead_submissions")
        .select("id,created_at,status,source")
        .gte("created_at", sinceIso)
        .limit(20000),
      supabaseAdmin
        .from("wa_funnel_sessions")
        .select("id,completed,current_step,total_steps,started_at,completed_at")
        .gte("created_at", sinceIso)
        .limit(20000),
    ]);

    const ev = events ?? [];
    const visitorSet = new Set<string>();
    const sessionSet = new Set<string>();
    const sessionPages = new Map<string, Set<string>>();
    const sessionTimes = new Map<string, { min: number; max: number }>();
    const totals: Record<string, number> = {};

    for (const e of ev) {
      const evn = e.event_name as string;
      totals[evn] = (totals[evn] ?? 0) + 1;
      if (e.visitor_id) visitorSet.add(e.visitor_id as string);
      const sid = e.session_id as string | null;
      if (sid) {
        sessionSet.add(sid);
        if (e.path) {
          if (!sessionPages.has(sid)) sessionPages.set(sid, new Set());
          sessionPages.get(sid)!.add(e.path as string);
        }
        const t = new Date(e.created_at as string).getTime();
        const st = sessionTimes.get(sid);
        if (!st) sessionTimes.set(sid, { min: t, max: t });
        else {
          st.min = Math.min(st.min, t);
          st.max = Math.max(st.max, t);
        }
      }
    }

    let totalPages = 0;
    let totalDur = 0;
    let durN = 0;
    sessionPages.forEach((s) => (totalPages += s.size));
    sessionTimes.forEach((v) => {
      if (v.max > v.min) {
        totalDur += v.max - v.min;
        durN++;
      }
    });

    const waCompleted = (waSessions ?? []).filter((w) => w.completed).length;
    const waTotal = (waSessions ?? []).length;

    const leadsCount = (leads ?? []).length;
    const visitors = visitorSet.size;
    const conv = totals["form_submit"] ?? 0;
    const convRate = visitors ? +(((conv + waCompleted) / visitors) * 100).toFixed(2) : 0;

    return {
      range: { days: data.days, sinceIso },
      kpis: {
        visitors,
        sessions: sessionSet.size,
        pageviews: totals["page_view"] ?? totals["pageview"] ?? sessionPages.size,
        leads: leadsCount,
        conversions: conv + waCompleted,
        conversion_rate_pct: convRate,
        wa_funnel_completed: waCompleted,
        wa_funnel_started: waTotal,
        whatsapp_clicks: totals["whatsapp_click"] ?? 0,
        cta_clicks: totals["cta_click"] ?? 0,
        form_submits: conv,
        avg_session_seconds:
          durN > 0 ? Math.round(totalDur / durN / 1000) : 0,
        pages_per_session:
          sessionSet.size > 0 ? +(totalPages / sessionSet.size).toFixed(2) : 0,
      },
      totals,
    };
  });

// ─────────────────────────────────────────────────────────────
// Pages analysis
// ─────────────────────────────────────────────────────────────
export const getPagesAnalysis = createServerFn({ method: "POST" })
  .inputValidator((i) => RangeSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);

    const { data: events } = await supabaseAdmin
      .from("analytics_events")
      .select("event_name,path,visitor_id,session_id")
      .gte("created_at", sinceIso)
      .limit(50000);

    const byPath = new Map<
      string,
      { visits: Set<string>; cta: number; wa: number; form: number; scroll75: number; scroll100: number; events: number }
    >();
    for (const e of events ?? []) {
      const p = (e.path as string) || "/";
      if (!byPath.has(p))
        byPath.set(p, {
          visits: new Set(),
          cta: 0,
          wa: 0,
          form: 0,
          scroll75: 0,
          scroll100: 0,
          events: 0,
        });
      const row = byPath.get(p)!;
      row.events++;
      if (e.visitor_id) row.visits.add(e.visitor_id as string);
      const ev = e.event_name as string;
      if (ev === "cta_click") row.cta++;
      else if (ev === "whatsapp_click") row.wa++;
      else if (ev === "form_submit") row.form++;
      else if (ev === "scroll_depth") row.scroll75++;
    }

    const rows = Array.from(byPath.entries()).map(([path, r]) => {
      const visitors = r.visits.size || 1;
      const conversions = r.form + r.wa;
      return {
        path,
        visitors: r.visits.size,
        events: r.events,
        cta: r.cta,
        wa: r.wa,
        form: r.form,
        engagement: r.scroll75,
        conversions,
        conversion_rate_pct: +((conversions / visitors) * 100).toFixed(2),
        bounce_pct: r.events <= 1 ? 100 : +((1 - r.cta / r.events) * 100).toFixed(1),
      };
    });

    rows.sort((a, b) => b.visitors - a.visitors);
    return { rows };
  });

// ─────────────────────────────────────────────────────────────
// Attribution
// ─────────────────────────────────────────────────────────────
export const getAttribution = createServerFn({ method: "POST" })
  .inputValidator((i) => RangeSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);

    const { data: events } = await supabaseAdmin
      .from("analytics_events")
      .select(
        "event_name,visitor_id,created_at,utm_source,utm_medium,utm_campaign,utm_term,utm_content,referrer,path"
      )
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(50000);

    const { data: leads } = await supabaseAdmin
      .from("lead_submissions")
      .select("id,created_at,utm_source,utm_medium,utm_campaign,landing_page,source")
      .gte("created_at", sinceIso)
      .limit(20000);

    type Touch = {
      utm_source: string | null;
      utm_medium: string | null;
      utm_campaign: string | null;
      referrer: string | null;
      landing: string | null;
      ts: number;
    };
    const firstTouch = new Map<string, Touch>();
    const lastTouch = new Map<string, Touch>();

    for (const e of events ?? []) {
      const vid = e.visitor_id as string | null;
      if (!vid) continue;
      const t: Touch = {
        utm_source: (e.utm_source as string) ?? null,
        utm_medium: (e.utm_medium as string) ?? null,
        utm_campaign: (e.utm_campaign as string) ?? null,
        referrer: (e.referrer as string) ?? null,
        landing: (e.path as string) ?? null,
        ts: new Date(e.created_at as string).getTime(),
      };
      if (!firstTouch.has(vid)) firstTouch.set(vid, t);
      lastTouch.set(vid, t);
    }

    const bySource: Record<string, { sessions: number; leads: number }> = {};
    const byCampaign: Record<string, { sessions: number; leads: number }> = {};
    const byMedium: Record<string, { sessions: number; leads: number }> = {};
    const byReferrer: Record<string, { sessions: number; leads: number }> = {};

    firstTouch.forEach((t) => {
      const s = t.utm_source || "(direct)";
      const c = t.utm_campaign || "(none)";
      const m = t.utm_medium || "(none)";
      const r = t.referrer ? new URL(t.referrer, "https://x").host || "(direct)" : "(direct)";
      bySource[s] = bySource[s] || { sessions: 0, leads: 0 };
      bySource[s].sessions++;
      byCampaign[c] = byCampaign[c] || { sessions: 0, leads: 0 };
      byCampaign[c].sessions++;
      byMedium[m] = byMedium[m] || { sessions: 0, leads: 0 };
      byMedium[m].sessions++;
      byReferrer[r] = byReferrer[r] || { sessions: 0, leads: 0 };
      byReferrer[r].sessions++;
    });

    for (const l of leads ?? []) {
      const s = (l.utm_source as string) || "(direct)";
      const c = (l.utm_campaign as string) || "(none)";
      const m = (l.utm_medium as string) || "(none)";
      bySource[s] = bySource[s] || { sessions: 0, leads: 0 };
      bySource[s].leads++;
      byCampaign[c] = byCampaign[c] || { sessions: 0, leads: 0 };
      byCampaign[c].leads++;
      byMedium[m] = byMedium[m] || { sessions: 0, leads: 0 };
      byMedium[m].leads++;
    }

    const toRows = (obj: Record<string, { sessions: number; leads: number }>) =>
      Object.entries(obj)
        .map(([key, v]) => ({
          key,
          sessions: v.sessions,
          leads: v.leads,
          conversion_rate_pct: v.sessions ? +((v.leads / v.sessions) * 100).toFixed(2) : 0,
        }))
        .sort((a, b) => b.leads - a.leads || b.sessions - a.sessions);

    return {
      bySource: toRows(bySource),
      byCampaign: toRows(byCampaign),
      byMedium: toRows(byMedium),
      byReferrer: toRows(byReferrer),
      totals: {
        unique_visitors: firstTouch.size,
        total_leads: (leads ?? []).length,
      },
    };
  });

// ─────────────────────────────────────────────────────────────
// A/B
// ─────────────────────────────────────────────────────────────
export const getAbAnalysis = createServerFn({ method: "POST" })
  .inputValidator((i) => RangeSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);

    const [{ data: events }, { data: exps }] = await Promise.all([
      supabaseAdmin
        .from("analytics_events")
        .select("event_name,hero_variant,cta_variant,visitor_id")
        .gte("created_at", sinceIso)
        .limit(50000),
      supabaseAdmin.from("experiments").select("*"),
    ]);

    const combo = new Map<
      string,
      { impressions: Set<string>; cta: number; wa: number; form: number }
    >();
    for (const e of events ?? []) {
      const k = `hero:${e.hero_variant ?? "-"}|cta:${e.cta_variant ?? "-"}`;
      if (!combo.has(k))
        combo.set(k, { impressions: new Set(), cta: 0, wa: 0, form: 0 });
      const r = combo.get(k)!;
      if (e.visitor_id) r.impressions.add(e.visitor_id as string);
      const ev = e.event_name as string;
      if (ev === "cta_click") r.cta++;
      else if (ev === "whatsapp_click") r.wa++;
      else if (ev === "form_submit") r.form++;
    }

    // simple z-test significance vs best
    const variants = Array.from(combo.entries()).map(([key, v]) => {
      const imp = Math.max(1, v.impressions.size);
      const conv = v.form + v.wa;
      const rate = conv / imp;
      return { key, impressions: v.impressions.size, cta: v.cta, wa: v.wa, form: v.form, conversions: conv, rate_pct: +(rate * 100).toFixed(2) };
    });
    variants.sort((a, b) => b.rate_pct - a.rate_pct);

    let significance: number | null = null;
    if (variants.length >= 2 && variants[0].impressions >= 30 && variants[1].impressions >= 30) {
      const a = variants[0], b = variants[1];
      const p1 = a.conversions / a.impressions;
      const p2 = b.conversions / b.impressions;
      const p = (a.conversions + b.conversions) / (a.impressions + b.impressions);
      const se = Math.sqrt(p * (1 - p) * (1 / a.impressions + 1 / b.impressions));
      const z = se > 0 ? (p1 - p2) / se : 0;
      // approximate one-tailed p-value via erf
      const erf = (x: number) => {
        const sign = Math.sign(x);
        x = Math.abs(x);
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p_ = 0.3275911;
        const t = 1 / (1 + p_ * x);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
      };
      const pval = 1 - 0.5 * (1 + erf(Math.abs(z) / Math.SQRT2));
      significance = +(1 - pval).toFixed(4);
    }

    return {
      variants,
      winner: variants[0] ?? null,
      significance_confidence: significance,
      experiments: exps ?? [],
    };
  });

// ─────────────────────────────────────────────────────────────
// WA funnel analysis
// ─────────────────────────────────────────────────────────────
export const getWaFunnel = createServerFn({ method: "POST" })
  .inputValidator((i) => RangeSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);
    const { data: sessions } = await supabaseAdmin
      .from("wa_funnel_sessions")
      .select("id,current_step,total_steps,completed,started_at,completed_at")
      .gte("created_at", sinceIso)
      .limit(20000);

    const all = sessions ?? [];
    const total = all.length;
    const completed = all.filter((s) => s.completed).length;
    const totalSteps = all.reduce((m, s) => Math.max(m, s.total_steps ?? 0), 4);
    const reachedStep: number[] = Array(totalSteps + 1).fill(0);
    for (const s of all) {
      const reached = s.completed ? s.total_steps : (s.current_step ?? 0);
      for (let i = 0; i <= reached && i < reachedStep.length; i++) reachedStep[i]++;
    }
    const drop: { step: number; reached: number; drop_pct: number }[] = [];
    for (let i = 0; i < reachedStep.length; i++) {
      const prev = i === 0 ? reachedStep[0] || 1 : reachedStep[i - 1] || 1;
      drop.push({
        step: i,
        reached: reachedStep[i],
        drop_pct: i === 0 ? 0 : +(((prev - reachedStep[i]) / prev) * 100).toFixed(1),
      });
    }
    const durations = all
      .filter((s) => s.completed && s.started_at && s.completed_at)
      .map((s) => new Date(s.completed_at as string).getTime() - new Date(s.started_at as string).getTime());
    const avgMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const critical = drop
      .slice(1)
      .reduce((w, s) => (s.drop_pct > (w?.drop_pct ?? -1) ? s : w), null as null | { step: number; drop_pct: number });

    return {
      total,
      completed,
      completion_rate_pct: total ? +((completed / total) * 100).toFixed(2) : 0,
      avg_completion_seconds: Math.round(avgMs / 1000),
      steps: drop,
      critical_step: critical,
    };
  });

// ─────────────────────────────────────────────────────────────
// Leads pipeline
// ─────────────────────────────────────────────────────────────
export const getLeads = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        days: z.number().int().min(1).max(365).default(60),
        status: z.enum(LEAD_STATUSES).optional(),
        limit: z.number().int().min(1).max(500).default(200),
      })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);
    let q = supabaseAdmin
      .from("lead_submissions")
      .select("id,created_at,name,email,phone,source,landing_page,utm_source,utm_campaign,status")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows } = await q;

    const byStatus: Record<string, number> = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]));
    for (const r of rows ?? []) byStatus[(r.status as string) ?? "new"]++;

    return {
      rows: (rows ?? []).map((r) => ({
        id: r.id as string,
        created_at: r.created_at as string,
        name: maskName(r.name as string | null),
        email: maskEmail(r.email as string | null),
        phone: maskPhone(r.phone as string | null),
        source: r.source as string | null,
        landing_page: r.landing_page as string | null,
        utm_source: r.utm_source as string | null,
        utm_campaign: r.utm_campaign as string | null,
        status: (r.status as string) ?? "new",
      })),
      byStatus,
      total: (rows ?? []).length,
    };
  });

export const updateLeadStatus = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(LEAD_STATUSES),
      })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("lead_submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ─────────────────────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────────────────────
export const getAlerts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = Date.now();
  const d7 = new Date(now - 7 * 86400 * 1000).toISOString();
  const d14 = new Date(now - 14 * 86400 * 1000).toISOString();
  const d2 = new Date(now - 2 * 86400 * 1000).toISOString();

  const [{ data: ev7 }, { data: ev14 }, { data: leads7 }, { data: waBroken }, { data: ev2 }] = await Promise.all([
    supabaseAdmin
      .from("analytics_events")
      .select("event_name,visitor_id")
      .gte("created_at", d7)
      .limit(50000),
    supabaseAdmin
      .from("analytics_events")
      .select("event_name,visitor_id")
      .gte("created_at", d14)
      .lt("created_at", d7)
      .limit(50000),
    supabaseAdmin
      .from("lead_submissions")
      .select("id,created_at")
      .gte("created_at", d7)
      .limit(2000),
    supabaseAdmin
      .from("wa_funnel_sessions")
      .select("id,current_step,completed")
      .gte("created_at", d7)
      .limit(5000),
    supabaseAdmin
      .from("analytics_events")
      .select("event_name")
      .gte("created_at", d2)
      .limit(50000),
  ]);

  const visitors7 = new Set((ev7 ?? []).map((e) => e.visitor_id as string)).size;
  const visitors14 = new Set((ev14 ?? []).map((e) => e.visitor_id as string)).size;
  const conv7 = (ev7 ?? []).filter((e) => e.event_name === "form_submit").length;
  const conv14 = (ev14 ?? []).filter((e) => e.event_name === "form_submit").length;

  const alerts: { level: "info" | "warn" | "error"; code: string; message: string }[] = [];

  if (visitors14 > 20 && visitors7 < visitors14 * 0.5)
    alerts.push({ level: "warn", code: "traffic_drop", message: `Tráfego caiu ${Math.round((1 - visitors7 / visitors14) * 100)}% vs semana anterior` });
  if (conv14 > 5 && conv7 < conv14 * 0.5)
    alerts.push({ level: "warn", code: "conversion_drop", message: `Conversões caíram ${Math.round((1 - conv7 / conv14) * 100)}% vs semana anterior` });

  const waStarts = (waBroken ?? []).length;
  const waCompletes = (waBroken ?? []).filter((w) => w.completed).length;
  if (waStarts > 10 && waCompletes === 0)
    alerts.push({ level: "error", code: "wa_funnel_broken", message: `${waStarts} sessões iniciadas e nenhuma concluída em 7 dias` });

  if ((leads7 ?? []).length === 0 && visitors7 > 50)
    alerts.push({ level: "warn", code: "no_leads", message: "Nenhum lead capturado em 7 dias com tráfego ativo" });

  const seen2 = new Set((ev2 ?? []).map((e) => e.event_name as string));
  const expected = ["cta_click", "whatsapp_click", "page_view"];
  for (const e of expected) {
    if (!seen2.has(e))
      alerts.push({ level: "info", code: `missing:${e}`, message: `Evento "${e}" não registrado nas últimas 48h` });
  }

  if (alerts.length === 0) alerts.push({ level: "info", code: "all_ok", message: "Sem anomalias detectadas." });
  return { alerts };
});

// ─────────────────────────────────────────────────────────────
// Exports (raw rows server-side; client formats CSV/XLSX)
// ─────────────────────────────────────────────────────────────
export const exportData = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        dataset: z.enum(["leads", "events", "wa_sessions", "experiments"]),
        days: z.number().int().min(1).max(365).default(60),
        mask: z.boolean().default(true),
      })
      .parse(i)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sinceIso = rangeIso(data.days);
    if (data.dataset === "leads") {
      const { data: rows } = await supabaseAdmin
        .from("lead_submissions")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(10000);
      const out = (rows ?? []).map((r) => ({
        ...r,
        name: data.mask ? maskName(r.name as string | null) : r.name,
        email: data.mask ? maskEmail(r.email as string | null) : r.email,
        phone: data.mask ? maskPhone(r.phone as string | null) : r.phone,
      }));
      return { rows: out };
    }
    if (data.dataset === "events") {
      const { data: rows } = await supabaseAdmin
        .from("analytics_events")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(20000);
      return { rows: rows ?? [] };
    }
    if (data.dataset === "wa_sessions") {
      const { data: rows } = await supabaseAdmin
        .from("wa_funnel_sessions")
        .select("*")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(10000);
      return { rows: rows ?? [] };
    }
    const { data: rows } = await supabaseAdmin.from("experiments").select("*");
    return { rows: rows ?? [] };
  });
