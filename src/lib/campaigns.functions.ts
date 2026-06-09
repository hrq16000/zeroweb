import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCampaignAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().min(1).max(365).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = (context as { userId: string }).userId;
    const { data: isAdminRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin"])
      .maybeSingle();
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isAdminRow && !isSuper) throw new Error("Acesso negado");
    const since = new Date(Date.now() - data.days * 86400000).toISOString();

    const [leadsRes, eventsRes, campaignsRes, offersRes] = await Promise.all([
      supabaseAdmin
        .from("lead_submissions")
        .select("utm_source,utm_medium,utm_campaign,utm_content,gclid,fbclid,status,score,temperature,offer_slug,landing_page,created_at")
        .gte("created_at", since),
      supabaseAdmin
        .from("analytics_events")
        .select("event_name,utm_source,utm_medium,utm_campaign,path,created_at")
        .gte("created_at", since),
      supabaseAdmin.from("campaigns").select("*"),
      supabaseAdmin.from("offers").select("*"),
    ]);

    const leads = leadsRes.data ?? [];
    const events = eventsRes.data ?? [];

    type Lead = typeof leads[number];
    const groupBy = <T extends string | null | undefined>(rows: Lead[], key: (l: Lead) => T) => {
      const map = new Map<string, { count: number; won: number; avgScore: number; sumScore: number }>();
      rows.forEach((r) => {
        const k = String(key(r) ?? "(none)");
        const won = r.status === "ganho" || r.status === "fechado" ? 1 : 0;
        const m = map.get(k) ?? { count: 0, won: 0, avgScore: 0, sumScore: 0 };
        m.count += 1;
        m.won += won;
        m.sumScore += r.score ?? 0;
        m.avgScore = Math.round(m.sumScore / m.count);
        map.set(k, m);
      });
      return Array.from(map.entries())
        .map(([key, v]) => ({ key, ...v, conv: v.count ? Math.round((v.won / v.count) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);
    };

    const byTemperature = {
      frio: leads.filter((l) => l.temperature === "frio").length,
      morno: leads.filter((l) => l.temperature === "morno").length,
      quente: leads.filter((l) => l.temperature === "quente").length,
    };

    return {
      days: data.days,
      totals: {
        leads: leads.length,
        events: events.length,
        gclid: leads.filter((l) => l.gclid).length,
        fbclid: leads.filter((l) => l.fbclid).length,
        won: leads.filter((l) => l.status === "ganho" || l.status === "fechado").length,
      },
      byTemperature,
      bySource: groupBy(leads, (l) => l.utm_source),
      byMedium: groupBy(leads, (l) => l.utm_medium),
      byCampaign: groupBy(leads, (l) => l.utm_campaign),
      byOffer: groupBy(leads, (l) => l.offer_slug),
      byLanding: groupBy(leads, (l) => l.landing_page),
      campaigns: campaignsRes.data ?? [],
      offers: offersRes.data ?? [],
    };
  });
