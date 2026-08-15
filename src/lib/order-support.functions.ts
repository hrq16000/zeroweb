import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({ orderId: z.string().uuid() });

/**
 * Gera um link de suporte para um pedido do próprio usuário.
 * Devolve apenas o caminho tokenizado — nenhum contato comercial.
 */
export const requestOrderSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // RLS garante que só o dono (ou admin) enxerga o pedido.
    const { data: order, error } = await supabase
      .from("orders")
      .select("id")
      .eq("id", data.orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Pedido não encontrado.");

    const {
      generateOrderSupportToken,
      hashOrderSupportToken,
      ORDER_SUPPORT_TTL_MS,
    } = await import("@/lib/order-support.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const token = generateOrderSupportToken();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabaseAdmin as any)
      .from("order_support_requests")
      .insert({
        order_id: data.orderId,
        token_hash: hashOrderSupportToken(token),
        expires_at: new Date(Date.now() + ORDER_SUPPORT_TTL_MS).toISOString(),
      });
    if (insertError) throw new Error(insertError.message);

    void userId;
    return { supportPath: `/suporte-pedido/${token}` };
  });
