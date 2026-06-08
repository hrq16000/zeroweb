import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Eventos de CRO persistidos via `persistEvent` em `analytics_events`.
 * Esta whitelist define o que aparece no painel admin de CRO — qualquer
 * outro `event_name` é ignorado para manter o painel focado em conversão.
 */
export const CRO_EVENTS = [
  "add_to_cart",
  "cart_open",
  "cart_remove",
  "cart_checkout_click",
  "whatsapp_click",
  "checkout_whatsapp_handoff",
  "checkout_stripe_start",
  "cta_click",
] as const;

const ListSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(10).max(100).default(25),
  event: z.string().max(64).optional(),
  path: z.string().max(255).optional(),
  device: z.string().max(20).optional(),
  fromDays: z.number().int().min(1).max(180).default(30),
});

async function assertAdmin(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado: requer admin.");
}

/**
 * Lista paginada + agregada de eventos CRO para auditoria e métricas.
 * Retorna também contagem por evento na janela escolhida para os KPIs.
 */
export const adminListCroEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - data.fromDays * 24 * 60 * 60 * 1000).toISOString();
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabaseAdmin
      .from("analytics_events")
      .select(
        "id, created_at, event_name, page, path, location, device_type, visitor_id, session_id, utm_source, utm_campaign, referrer, metadata_json",
        { count: "exact" },
      )
      .gte("created_at", since)
      .in("event_name", CRO_EVENTS as unknown as string[])
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data.event) q = q.eq("event_name", data.event);
    if (data.path) q = q.ilike("path", `%${data.path}%`);
    if (data.device) q = q.eq("device_type", data.device);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    // KPIs por evento (janela inteira, ignora filtros de path/device para totalidade).
    const { data: kpiRows } = await supabaseAdmin
      .from("analytics_events")
      .select("event_name")
      .gte("created_at", since)
      .in("event_name", CRO_EVENTS as unknown as string[]);
    const kpis: Record<string, number> = {};
    for (const ev of CRO_EVENTS) kpis[ev] = 0;
    (kpiRows ?? []).forEach((r) => {
      const k = (r as { event_name: string }).event_name;
      if (k in kpis) kpis[k] += 1;
    });

    return {
      rows: rows ?? [],
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
      kpis,
      windowDays: data.fromDays,
    };
  });
