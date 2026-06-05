import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pathLike: z.string().max(200).optional().nullable(),
  utmSource: z.string().max(100).optional().nullable(),
  limit: z.number().int().min(1).max(500).default(100),
});

async function requireAdmin(supabase: Awaited<ReturnType<typeof getAuthedSupabase>>) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Unauthorized");
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
  if (!roles?.some((r) => r.role === "admin")) throw new Error("Forbidden: admin only");
}
type AuthedSupabase = Awaited<ReturnType<typeof getAuthedSupabase>>;
async function getAuthedSupabase(): Promise<AuthedSupabase> {
  // helper for typing only — actual client comes from middleware context
  throw new Error("unused");
}

/** Aggregated visits by page within a date range. */
export const getVisitsByPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FilterSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("visitantes_rastreio")
      .select("path,day,visitor_id,utm_source,country", { count: "exact" })
      .gte("day", data.startDate)
      .lte("day", data.endDate)
      .limit(50_000);
    if (data.pathLike) q = q.ilike("path", `%${data.pathLike}%`);
    if (data.utmSource) q = q.eq("utm_source", data.utmSource);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const byPage = new Map<string, { path: string; visits: number; uniques: Set<string>; days: Set<string> }>();
    const byDay = new Map<string, number>();
    for (const r of rows ?? []) {
      const p = r.path ?? "(unknown)";
      const entry = byPage.get(p) ?? { path: p, visits: 0, uniques: new Set(), days: new Set() };
      entry.visits += 1;
      if (r.visitor_id) entry.uniques.add(r.visitor_id);
      if (r.day) entry.days.add(r.day);
      byPage.set(p, entry);
      if (r.day) byDay.set(r.day, (byDay.get(r.day) ?? 0) + 1);
    }
    const pages = Array.from(byPage.values())
      .map((e) => ({ path: e.path, visits: e.visits, uniqueVisitors: e.uniques.size, daysSeen: e.days.size }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, data.limit);
    const timeline = Array.from(byDay.entries())
      .map(([day, visits]) => ({ day, visits }))
      .sort((a, b) => a.day.localeCompare(b.day));
    return { pages, timeline, total: rows?.length ?? 0 };
  });

/** CSV export using the same filter. Returns a string body. */
export const exportVisitsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FilterSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await requireAdmin(supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("visitantes_rastreio")
      .select("day,path,visitor_id,country,utm_source,utm_medium,utm_campaign,referer")
      .gte("day", data.startDate)
      .lte("day", data.endDate)
      .order("day", { ascending: false })
      .limit(50_000);
    if (data.pathLike) q = q.ilike("path", `%${data.pathLike}%`);
    if (data.utmSource) q = q.eq("utm_source", data.utmSource);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["day", "path", "visitor_id", "country", "utm_source", "utm_medium", "utm_campaign", "referer"];
    const lines = [header.join(",")];
    for (const r of rows ?? []) {
      lines.push(header.map((h) => esc((r as Record<string, unknown>)[h])).join(","));
    }
    return { csv: lines.join("\n"), rows: rows?.length ?? 0 };
  });

/** Public: log consent decision (banner / settings). */
export const logConsentDecision = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      decision: z.enum(["granted", "denied", "default"]),
      analytics_storage: z.string().max(20).optional(),
      ad_storage: z.string().max(20).optional(),
      source: z.string().max(40).default("banner"),
      path: z.string().max(300).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("consent_audit_log").insert({
      decision: data.decision,
      analytics_storage: data.analytics_storage,
      ad_storage: data.ad_storage,
      source: data.source,
      path: data.path,
    });
    return { ok: true };
  });

/** Admin: read recent consent decisions. */
export const getRecentConsentLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("consent_audit_log")
      .select("created_at,decision,analytics_storage,ad_storage,source,path")
      .order("created_at", { ascending: false })
      .limit(100);
    const total = data?.length ?? 0;
    const granted = (data ?? []).filter((r) => r.decision === "granted").length;
    return { rows: data ?? [], total, granted, denied: total - granted };
  });

/** Admin: run anonymize + purge on demand. */
export const runLgpdMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: anon } = await supabaseAdmin.rpc("anonymize_visitantes_rastreio_old");
    const { data: purged } = await supabaseAdmin.rpc("purge_visitantes_rastreio_old");
    return { anonymized: Number(anon ?? 0), purged: Number(purged ?? 0) };
  });

/** Public LGPD settings (used by /privacidade and banner). */
export const getLgpdSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("key,value")
    .in("key", ["lgpd_anonymize_after_days", "lgpd_purge_after_days", "lgpd_privacy_contact"]);
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  const parseNum = (v: string | null | undefined, d: number) => {
    const n = Number(v ?? d); return Number.isFinite(n) ? n : d;
  };
  const parseStr = (v: string | null | undefined, d: string) => {
    try { return typeof v === "string" && v.startsWith("\"") ? JSON.parse(v) : v ?? d; }
    catch { return v ?? d; }
  };
  return {
    anonymizeAfterDays: parseNum(map.lgpd_anonymize_after_days, 30),
    purgeAfterDays: parseNum(map.lgpd_purge_after_days, 180),
    contactEmail: parseStr(map.lgpd_privacy_contact, "privacidade@example.com"),
  };
});
