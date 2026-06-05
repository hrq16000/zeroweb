import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuper(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
  if (!data) throw new Error("forbidden");
  return supabaseAdmin;
}

export const listEcosystems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data: ecosystems } = await admin
      .from("ecosystems")
      .select("*")
      .order("created_at");
    const { data: links } = await admin
      .from("ecosystem_portals")
      .select("ecosystem_id, portal_id, role, portals(id,name,slug,domain,status)");
    return { ecosystems: ecosystems ?? [], links: links ?? [] };
  });

export const upsertEcosystem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
      name: z.string().min(2).max(120),
      description: z.string().max(2000).optional().nullable(),
      status: z.enum(["active", "paused", "draft"]).default("active"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const q = admin.from("ecosystems");
    const { data: row, error } = data.id
      ? await q.update(data).eq("id", data.id).select().single()
      : await q.insert(data).select().single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const linkPortalToEcosystem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      ecosystem_id: z.string().uuid(),
      portal_id: z.string().uuid(),
      role: z.string().max(32).default("member"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { error } = await admin.from("ecosystem_portals").upsert(data, {
      onConflict: "ecosystem_id,portal_id",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unlinkPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ ecosystem_id: z.string().uuid(), portal_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    await admin
      .from("ecosystem_portals")
      .delete()
      .eq("ecosystem_id", data.ecosystem_id)
      .eq("portal_id", data.portal_id);
    return { ok: true };
  });

// ============ CUSTOMER 360 ============
export const searchIdentities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ q: z.string().max(120).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    let query = admin
      .from("customer_identities")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(50);
    if (data.q && data.q.length >= 2) {
      query = query.or(
        `primary_email.ilike.%${data.q}%,primary_phone.ilike.%${data.q}%,full_name.ilike.%${data.q}%`,
      );
    }
    const { data: rows } = await query;
    return { rows: rows ?? [] };
  });

export const getIdentity360 = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const [{ data: identity }, { data: links }, { data: touchpoints }, { data: opps }] =
      await Promise.all([
        admin.from("customer_identities").select("*").eq("id", data.id).single(),
        admin.from("customer_identity_links").select("*").eq("identity_id", data.id),
        admin
          .from("customer_touchpoints")
          .select("*")
          .eq("identity_id", data.id)
          .order("occurred_at", { ascending: false })
          .limit(200),
        admin.from("cross_sell_opportunities").select("*").eq("identity_id", data.id),
      ]);
    return { identity, links: links ?? [], touchpoints: touchpoints ?? [], opportunities: opps ?? [] };
  });

// ============ BACKFILL: leads -> identities ============
export const backfillIdentitiesFromLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data: leads } = await admin
      .from("lead_submissions")
      .select("id,email,phone,name,portal_id,created_at,source")
      .order("created_at", { ascending: true })
      .limit(2000);
    let created = 0;
    let linked = 0;
    for (const l of leads ?? []) {
      const { data: idRes } = await admin.rpc("resolve_or_create_identity", {
        p_email: l.email,
        p_phone: l.phone,
        p_name: l.name,
        p_ecosystem_id: null,
      });
      if (!idRes) continue;
      created++;
      const { error: linkErr } = await admin
        .from("customer_identity_links")
        .upsert(
          {
            identity_id: idRes as string,
            portal_id: l.portal_id,
            entity_type: "lead",
            entity_id: l.id,
            link_source: l.source ?? "backfill",
          } as never,
          { onConflict: "entity_type,entity_id" },
        );
      if (!linkErr) linked++;
      await admin.from("customer_touchpoints").insert({
        identity_id: idRes as string,
        portal_id: l.portal_id,
        kind: "lead_submitted",
        title: `Lead via ${l.source ?? "site"}`,
        occurred_at: l.created_at,
      } as never);
    }
    return { processed: leads?.length ?? 0, identities_touched: created, links: linked };
  });

// ============ BI SNAPSHOT ============
export const computeBiSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ecosystem_id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const today = new Date().toISOString().slice(0, 10);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();

    const { data: ecosystems } = await admin
      .from("ecosystems")
      .select("id")
      .eq("status", "active");
    const target = data.ecosystem_id
      ? [{ id: data.ecosystem_id }]
      : ecosystems ?? [];

    const snapshots = [];
    for (const eco of target) {
      const { data: links } = await admin
        .from("ecosystem_portals")
        .select("portal_id")
        .eq("ecosystem_id", eco.id);
      const portalIds = (links ?? []).map((l: { portal_id: string }) => l.portal_id);

      let leads = 0;
      let won = 0;
      let events = 0;
      if (portalIds.length) {
        const { count: lc } = await admin
          .from("lead_submissions")
          .select("id", { count: "exact", head: true })
          .in("portal_id", portalIds)
          .gte("created_at", since);
        leads = lc ?? 0;
        const { count: wc } = await admin
          .from("lead_submissions")
          .select("id", { count: "exact", head: true })
          .in("portal_id", portalIds)
          .in("status", ["ganho", "fechado"])
          .gte("created_at", since);
        won = wc ?? 0;
        const { count: ec } = await admin
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .in("portal_id", portalIds)
          .gte("created_at", since);
        events = ec ?? 0;
      }

      const kpis = {
        period_days: 30,
        leads,
        won,
        events,
        portals: portalIds.length,
        conversion_rate: leads ? Math.round((won / leads) * 100) : 0,
      };

      const { error } = await admin.from("bi_snapshots").upsert(
        {
          ecosystem_id: eco.id,
          portal_id: null,
          snapshot_date: today,
          scope: "ecosystem",
          kpis,
        },
        { onConflict: "ecosystem_id,portal_id,snapshot_date,scope" },
      );
      if (!error) snapshots.push({ ecosystem_id: eco.id, kpis });
    }
    return { snapshots };
  });

// ============ CROSS SELL DETECTOR ============
export const detectCrossSell = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data: identities } = await admin
      .from("customer_identities")
      .select("id, ecosystem_id")
      .order("last_seen_at", { ascending: false })
      .limit(500);

    let created = 0;
    for (const idn of identities ?? []) {
      const { data: links } = await admin
        .from("customer_identity_links")
        .select("portal_id, entity_type")
        .eq("identity_id", idn.id);
      const portals = new Set((links ?? []).map((l: { portal_id: string }) => l.portal_id).filter(Boolean));
      if (portals.size === 0) continue;

      // simple heuristic: any identity present in <2 portals gets opp for the others
      const { data: ecoPortals } = await admin
        .from("ecosystem_portals")
        .select("portal_id, portals(name,slug)")
        .eq("ecosystem_id", idn.ecosystem_id ?? "");
      for (const ep of ecoPortals ?? []) {
        if (portals.has(ep.portal_id)) continue;
        const { error } = await admin.from("cross_sell_opportunities").insert({
          ecosystem_id: idn.ecosystem_id,
          identity_id: idn.id,
          to_portal_id: ep.portal_id,
          offer_slug: "cross-portal",
          offer_title: `Conhecer ${(ep.portals as { name?: string } | null)?.name ?? "portal"}`,
          score: 50,
          status: "pending",
          reason: "Identidade presente em outros portais do ecossistema",
        });
        if (!error) created++;
      }
    }
    return { opportunities_created: created };
  });

export const listCrossSellOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data } = await admin
      .from("cross_sell_opportunities")
      .select("*, customer_identities(primary_email,full_name), portals!cross_sell_opportunities_to_portal_id_fkey(name,slug)")
      .order("score", { ascending: false })
      .limit(100);
    return { rows: data ?? [] };
  });

// ============ LEAD ROUTING ============
export const listRoutingRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data } = await admin
      .from("lead_routing_rules")
      .select("*")
      .order("priority");
    return { rows: data ?? [] };
  });

export const upsertRoutingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      id: z.string().uuid().optional(),
      ecosystem_id: z.string().uuid().nullable().optional(),
      portal_id: z.string().uuid().nullable().optional(),
      name: z.string().min(2).max(120),
      priority: z.number().int().min(0).max(10000).default(100),
      enabled: z.boolean().default(true),
      match_city: z.string().max(120).nullable().optional(),
      match_state: z.string().max(8).nullable().optional(),
      match_category: z.string().max(120).nullable().optional(),
      match_specialty: z.string().max(120).nullable().optional(),
      match_source: z.string().max(120).nullable().optional(),
      target_kind: z.enum(["partner", "provider", "company", "queue", "user"]),
      target_id: z.string().uuid().nullable().optional(),
      strategy: z.enum(["round_robin", "first_match", "highest_score"]).default("round_robin"),
      notes: z.string().max(1000).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const q = admin.from("lead_routing_rules");
    const { data: row, error } = data.id
      ? await q.update(data).eq("id", data.id).select().single()
      : await q.insert(data).select().single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const deleteRoutingRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    await admin.from("lead_routing_rules").delete().eq("id", data.id);
    return { ok: true };
  });

// ============ BI DASHBOARD ============
export const getBiDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper((context as { userId: string }).userId);
    const { data: snapshots } = await admin
      .from("bi_snapshots")
      .select("*, ecosystems(name,slug)")
      .order("snapshot_date", { ascending: false })
      .limit(50);
    const { data: ecosystems } = await admin.from("ecosystems").select("id,name,slug,status");
    const { data: identityCount } = await admin
      .from("customer_identities")
      .select("id", { count: "exact", head: true });
    const { data: oppCount } = await admin
      .from("cross_sell_opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return {
      snapshots: snapshots ?? [],
      ecosystems: ecosystems ?? [],
      totals: {
        identities: (identityCount as unknown as { count?: number })?.count ?? 0,
        pending_opportunities: (oppCount as unknown as { count?: number })?.count ?? 0,
      },
    };
  });
