import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ListSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(5).max(100).default(20),
  status: z.string().max(40).optional(),
  paymentMethod: z.string().max(40).optional(),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado: requer admin.");
}

/**
 * Lista paginada de pedidos para o painel admin. Filtros padrão:
 * status=awaiting_payment + payment_method=whatsapp (fluxo do funil atual).
 */
export const adminListOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    let q = supabaseAdmin
      .from("orders")
      .select(
        "id, user_id, items, total, status, payment_method, customer_name, customer_email, customer_phone, notes, created_at, whatsapp_handoff_at, paid_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);
    if (data.status) q = q.eq("status", data.status);
    if (data.paymentMethod) q = q.eq("payment_method", data.paymentMethod);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return {
      orders: rows ?? [],
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });

const IdSchema = z.object({ orderId: z.string().uuid() });

export const adminMarkOrderPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Re-checa o status atual de um pedido (placeholder até o webhook do
 * Stripe estar ativo — por enquanto apenas relê o registro).
 */
export const adminRecheckOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("id, status, payment_method, paid_at, updated_at")
      .eq("id", data.orderId)
      .single();
    if (error) throw new Error(error.message);
    return { order: row };
  });
