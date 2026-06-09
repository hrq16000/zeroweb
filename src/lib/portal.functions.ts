import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Public: list active portals (used to resolve current portal client-side). */
export const listPortalsPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("portals")
    .select("id,slug,name,domain,aliases,status,logo_url,primary_color,accent_color,brand,contact,seo,social,settings,is_default")
    .eq("status", "active")
    .order("is_default", { ascending: false });
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
});

/** Admin: list ALL portals (including drafts). */
export const listAllPortals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const { data, error } = await supabaseAdmin
      .from("portals")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    if (error) throw new Error(error.message);
    return { rows: data ?? [], isSuper: true };
  });

const portalInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(120),
  domain: z.string().max(255).nullable().optional(),
  aliases: z.array(z.string().max(255)).optional(),
  status: z.enum(["active", "draft", "paused"]).default("draft"),
  logo_url: z.string().url().nullable().optional(),
  primary_color: z.string().max(32).nullable().optional(),
  accent_color: z.string().max(32).nullable().optional(),
  brand: z.record(z.string(), z.unknown()).optional(),
  contact: z.record(z.string(), z.unknown()).optional(),
  seo: z.record(z.string(), z.unknown()).optional(),
  social: z.record(z.string(), z.unknown()).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const upsertPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => portalInput.parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");
    const payload = { ...data, aliases: data.aliases ?? [] } as never;
    const q = supabaseAdmin.from("portals");
    const { data: row, error } = data.id
      ? await q.update(payload).eq("id", data.id).select().single()
      : await q.insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { row };
  });

/** Master dashboard: KPIs por portal nos últimos N dias. */
export const getMasterMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().min(1).max(365).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");

    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const [{ data: portals }, { data: leads }, { data: events }] = await Promise.all([
      supabaseAdmin.from("portals").select("id,name,slug,status,is_default").order("name"),
      supabaseAdmin.from("lead_submissions").select("portal_id,status,score,created_at").gte("created_at", since),
      supabaseAdmin.from("analytics_events").select("portal_id,event_name,created_at").gte("created_at", since),
    ]);

    const byPortal = (portals ?? []).map((p: { id: string; name: string; slug: string; status: string; is_default: boolean }) => {
      const pLeads = (leads ?? []).filter((l: { portal_id: string | null }) => l.portal_id === p.id);
      const pEvents = (events ?? []).filter((e: { portal_id: string | null }) => e.portal_id === p.id);
      const won = pLeads.filter((l: { status: string }) => l.status === "ganho" || l.status === "fechado").length;
      const avgScore = pLeads.length
        ? Math.round(pLeads.reduce((s: number, l: { score: number | null }) => s + (l.score ?? 0), 0) / pLeads.length)
        : 0;
      return {
        portal: p,
        leads: pLeads.length,
        events: pEvents.length,
        won,
        conversionRate: pLeads.length ? Math.round((won / pLeads.length) * 100) : 0,
        avgScore,
      };
    });

    const totals = byPortal.reduce(
      (acc, r) => ({
        leads: acc.leads + r.leads,
        events: acc.events + r.events,
        won: acc.won + r.won,
      }),
      { leads: 0, events: 0, won: 0 },
    );

    return { byPortal, totals, days: data.days };
  });
