/**
 * Admin user management server fns.
 * - listUsers: paginated profiles join with auth.users + aggregated orders/leads.
 * - getUserDetail: profile + roles + orders + identities + visitor sessions + leads.
 * - updateUserProfile: edit full_name, company, phone, email override.
 * - setUserRole: grant/revoke roles (admin / collaborator / customer).
 * - linkVisitorToUser: stitch visitor_id → user via existing RPC.
 * - linkOrderToUser: re-assigns an order to a user.
 * - listOrphanVisitors: visitors without user_id matching a query.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

async function assertAdmin(supabase: AnyClient, userId: string) {
  const { data: isSuper } = await supabase.rpc("is_super_admin", { _uid: userId });
  if (isSuper) return;
  const { data: isAdm } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdm) throw new Error("Acesso negado: requer admin.");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

// ── List ──────────────────────────────────────────────────────
export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        q: z.string().max(200).optional(),
        page: z.number().int().min(1).max(1000).default(1),
        pageSize: z.number().int().min(5).max(100).default(25),
        role: z.enum(["all", "admin", "collaborator", "customer"]).default("all"),
      })
      .parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = sb
      .from("profiles")
      .select("id, full_name, display_name, email, phone, company, user_ref, created_at, updated_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data.q && data.q.trim()) {
      const s = `%${data.q.trim()}%`;
      q = q.or(`full_name.ilike.${s},display_name.ilike.${s},email.ilike.${s},phone.ilike.${s},company.ilike.${s},user_ref.ilike.${s}`);
    }

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    const ids: string[] = (rows ?? []).map((r: { id: string }) => r.id);
    const [{ data: roles }, { data: ordAgg }] = await Promise.all([
      ids.length
        ? sb.from("user_roles").select("user_id, role").in("user_id", ids)
        : Promise.resolve({ data: [] as { user_id: string; role: string }[] }),
      ids.length
        ? sb.from("orders").select("user_id, total, status").in("user_id", ids)
        : Promise.resolve({ data: [] as { user_id: string; total: number; status: string }[] }),
    ]);

    const rolesByUser: Record<string, string[]> = {};
    for (const r of roles ?? []) {
      (rolesByUser[r.user_id] ??= []).push(r.role);
    }
    const agg: Record<string, { count: number; total: number; paid: number }> = {};
    for (const o of ordAgg ?? []) {
      const a = (agg[o.user_id] ??= { count: 0, total: 0, paid: 0 });
      a.count += 1;
      a.total += Number(o.total ?? 0);
      if (o.status === "paid" || o.status === "fulfilled") a.paid += Number(o.total ?? 0);
    }

    let mut = (rows ?? []).map((r: { id: string }) => ({
      ...r,
      roles: rolesByUser[r.id] ?? [],
      orders_count: agg[r.id]?.count ?? 0,
      orders_total: agg[r.id]?.total ?? 0,
      orders_paid: agg[r.id]?.paid ?? 0,
    }));

    if (data.role !== "all") {
      if (data.role === "customer") {
        mut = mut.filter((u: { roles: string[] }) => u.roles.length === 0);
      } else {
        const want = data.role;
        mut = mut.filter((u: { roles: string[] }) => u.roles.includes(want));
      }
    }

    return { users: mut, total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

// ── Detail ────────────────────────────────────────────────────
export const adminGetUserDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ userId: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const profileR = await sb.from("profiles").select("*").eq("id", data.userId).maybeSingle();
    const profileEmail: string = profileR?.data?.email ?? "";
    const leadsQuery = profileEmail
      ? sb
          .from("lead_submissions")
          .select(
            "id, name, email, phone, source, offer_slug, status, score, score_label, temperature, pipeline_stage, answers_json, created_at, last_interaction",
          )
          .or(`user_id.eq.${data.userId},email.eq.${profileEmail}`)
      : sb
          .from("lead_submissions")
          .select(
            "id, name, email, phone, source, offer_slug, status, score, score_label, temperature, pipeline_stage, answers_json, created_at, last_interaction",
          )
          .eq("user_id", data.userId);

    const [rolesR, ordersR, leadsR, funnelR, visitsR, identitiesR] = await Promise.all([
      sb.from("user_roles").select("role").eq("user_id", data.userId),
      sb
        .from("orders")
        .select(
          "id, items, total, status, payment_method, customer_name, customer_email, customer_phone, notes, metadata, created_at, paid_at, whatsapp_handoff_at",
        )
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(100),
      leadsQuery.order("created_at", { ascending: false }).limit(50),
      sb
        .from("wa_funnel_sessions")
        .select("id, funnel_slug, current_step, answers, status, created_at, updated_at")
        .eq("user_id", data.userId)
        .order("updated_at", { ascending: false })
        .limit(50),
      sb
        .from("visitantes_rastreio")
        .select("id, visitor_id, day, utm_source, utm_campaign, country, city, created_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(50),
      sb
        .from("customer_identity_links")
        .select("identity_id, customer_identities(id, primary_email, primary_phone, full_name, tags, metadata)")
        .eq("user_id", data.userId),
    ]);

    return {
      profile: profileR.data ?? null,
      roles: (rolesR.data ?? []).map((r: { role: string }) => r.role),
      orders: ordersR.data ?? [],
      leads: leadsR.data ?? [],
      funnelSessions: funnelR.data ?? [],
      visits: visitsR.data ?? [],
      identities: identitiesR.data ?? [],
    };
  });

// ── Update profile ────────────────────────────────────────────
export const adminUpdateUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        full_name: z.string().max(200).optional(),
        display_name: z.string().max(200).optional(),
        company: z.string().max(200).optional(),
        phone: z.string().max(40).optional(),
        email: z.string().email().max(255).optional(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { userId, ...patch } = data;
    const { error } = await sb
      .from("profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Role mgmt ─────────────────────────────────────────────────
export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "collaborator", "admin_integrations"]),
        grant: z.boolean(),
      })
      .parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    if (data.grant) {
      const { error } = await sb
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await sb
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ── Link visitor to user (uses existing RPC) ──────────────────
export const adminLinkVisitorToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ visitorId: z.string().min(1).max(120), userId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { data: stitched, error } = await sb.rpc("stitch_visitor_identity", {
      p_visitor_id: data.visitorId,
      p_user_id: data.userId,
    });
    if (error) throw new Error(error.message);
    return { stitched: stitched ?? 0 };
  });

// ── Reassign order to a user ──────────────────────────────────
export const adminAssignOrderToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ orderId: z.string().uuid(), userId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    const { error } = await sb.from("orders").update({ user_id: data.userId }).eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Search orphan visitors (no user_id) ───────────────────────
export const adminListOrphanVisitors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ q: z.string().max(200).optional(), limit: z.number().int().min(1).max(100).default(20) }).parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    let q = sb
      .from("visitantes_rastreio")
      .select("id, visitor_id, day, utm_source, utm_campaign, country, city, referer, created_at")
      .is("user_id", null)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.q && data.q.trim()) {
      const s = `%${data.q.trim()}%`;
      q = q.or(`visitor_id.ilike.${s},utm_campaign.ilike.${s},referer.ilike.${s},city.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { visits: rows ?? [] };
  });

// ── Orphan orders (no user_id linked) for assignment ──────────
export const adminListOrphanOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ q: z.string().max(200).optional(), limit: z.number().int().min(1).max(100).default(20) }).parse(i ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const sb = await admin();
    let q = sb
      .from("orders")
      .select("id, total, status, customer_name, customer_email, customer_phone, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.q && data.q.trim()) {
      const s = `%${data.q.trim()}%`;
      q = q.or(`customer_email.ilike.${s},customer_phone.ilike.${s},customer_name.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { orders: rows ?? [] };
  });
