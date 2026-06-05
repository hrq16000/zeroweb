import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FilterSchema = z.object({
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  portal_id: z.string().uuid().optional().nullable(),
  utm_source: z.string().max(128).optional().nullable(),
  utm_campaign: z.string().max(128).optional().nullable(),
  country: z.string().max(8).optional().nullable(),
  only_blocked: z.boolean().optional(),
  only_bots: z.boolean().optional(),
  limit: z.number().int().min(1).max(5000).optional(),
});

type Filters = z.infer<typeof FilterSchema>;

function applyFilters(q: any, f: Filters) {
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", f.to);
  if (f.portal_id) q = q.eq("portal_id", f.portal_id);
  if (f.utm_source) q = q.eq("utm_source", f.utm_source);
  if (f.utm_campaign) q = q.eq("utm_campaign", f.utm_campaign);
  if (f.country) q = q.eq("country", f.country);
  if (f.only_blocked) q = q.eq("blocked", true);
  if (f.only_bots) q = q.eq("is_bot", true);
  return q;
}

export const listVisitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => FilterSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const limit = data.limit ?? 500;
    let q = supabase
      .from("visitantes_rastreio")
      .select(
        "id,created_at,day,portal_id,tenant_slug,country,city,ua_device,ua_browser,is_bot,blocked,block_reason,path,referer,utm_source,utm_medium,utm_campaign,utm_content,gclid,fbclid,landing_page,risk_score"
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    q = applyFilters(q, data);
    const { data: rows, error } = await q;
    if (error) return { rows: [], error: error.message };
    return { rows: rows ?? [], error: null };
  });

export const visitorsAggregate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => FilterSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("visitantes_rastreio")
      .select("portal_id,utm_source,utm_campaign,gclid,fbclid,country,is_bot,blocked,landing_page,path,day", { count: "exact" })
      .limit(10000);
    q = applyFilters(q, data);
    const { data: rows, error } = await q;
    if (error) return { funnel: null, sources: [], portals: [], campaigns: [], countries: [], error: error.message };

    const total = rows?.length ?? 0;
    const bots = rows?.filter((r: any) => r.is_bot).length ?? 0;
    const blocked = rows?.filter((r: any) => r.blocked).length ?? 0;
    const withUtm = rows?.filter((r: any) => r.utm_source).length ?? 0;
    const withGclid = rows?.filter((r: any) => r.gclid).length ?? 0;
    const withFbclid = rows?.filter((r: any) => r.fbclid).length ?? 0;

    const group = (key: string) => {
      const map = new Map<string, number>();
      for (const r of rows ?? []) {
        const v = (r as any)[key] || "(none)";
        map.set(v, (map.get(v) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(([k, v]) => ({ key: k, count: v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    };

    return {
      funnel: {
        total,
        humans: total - bots,
        bots,
        blocked,
        with_utm: withUtm,
        with_gclid: withGclid,
        with_fbclid: withFbclid,
      },
      sources: group("utm_source"),
      campaigns: group("utm_campaign"),
      portals: group("portal_id"),
      countries: group("country"),
      landing: group("landing_page"),
      error: null,
    };
  });

function csvEscape(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const exportVisitorsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => FilterSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("visitantes_rastreio")
      .select(
        "created_at,portal_id,tenant_slug,country,city,ua_device,ua_browser,is_bot,blocked,block_reason,path,landing_page,referer,utm_source,utm_medium,utm_campaign,utm_content,gclid,fbclid,risk_score"
      )
      .order("created_at", { ascending: false })
      .limit(10000);
    q = applyFilters(q, data);
    const { data: rows, error } = await q;
    if (error) return { csv: "", error: error.message };
    const headers = [
      "created_at","portal_id","tenant_slug","country","city","device","browser","is_bot","blocked","block_reason","path","landing_page","referer","utm_source","utm_medium","utm_campaign","utm_content","gclid","fbclid","risk_score",
    ];
    const body = (rows ?? []).map((r: any) =>
      [r.created_at,r.portal_id,r.tenant_slug,r.country,r.city,r.ua_device,r.ua_browser,r.is_bot,r.blocked,r.block_reason,r.path,r.landing_page,r.referer,r.utm_source,r.utm_medium,r.utm_campaign,r.utm_content,r.gclid,r.fbclid,r.risk_score].map(csvEscape).join(",")
    );
    return { csv: [headers.join(","), ...body].join("\n"), error: null };
  });
