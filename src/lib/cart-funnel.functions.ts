// Server fns para persistir progresso do funil do carrinho.
// Usado pelo CartDrawer (abrir, adicionar, remover) e pelo checkout
// (iniciar pagamento, pagar, handoff WhatsApp). Aceita usuários
// autenticados (RLS scope user_id=auth.uid()) e anônimos (sem user_id,
// fallback admin via service role).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const StepSchema = z.enum([
  "cart_open",
  "cart_update",
  "checkout_started",
  "checkout_completed",
  "handoff_whatsapp",
  "payment_pending",
  "payment_paid",
  "payment_failed",
  "payment_cancelled",
  "abandoned",
]);

const CartItemSchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  qty: z.number().int().min(0).max(99),
  price: z.number().nullable().optional(),
  pricePeriod: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

const Input = z.object({
  sessionKey: z.string().min(8).max(120),
  visitorId: z.string().max(120).optional(),
  step: StepSchema,
  cart: z.array(CartItemSchema).max(50),
  totalAmount: z.number().nullable().optional(),
  paymentChannel: z.enum(["site", "whatsapp", "unknown"]).optional(),
  paymentStatus: z
    .enum(["open", "pending", "paid", "failed", "cancelled", "handoff"])
    .optional(),
  paymentRef: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const saveCartFunnelStep = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Best-effort: tenta resolver user_id pelo bearer token quando presente.
    let userId: string | null = null;
    try {
      const { getRequestHeader } = await import("@tanstack/react-start/server");
      const auth = getRequestHeader("authorization") || getRequestHeader("Authorization");
      if (auth?.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length);
        const { data: u } = await supabaseAdmin.auth.getUser(token);
        userId = u?.user?.id ?? null;
      }
    } catch {
      /* anônimo */
    }

    const payload = {
      user_id: userId,
      visitor_id: data.visitorId ?? null,
      session_key: data.sessionKey,
      step: data.step,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cart_snapshot: data.cart as any,
      payment_status: data.paymentStatus ?? "open",
      payment_channel: data.paymentChannel ?? "unknown",
      payment_ref: data.paymentRef ?? null,
      total_amount: data.totalAmount ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: (data.metadata ?? {}) as any,
      updated_at: new Date().toISOString(),
    };

    // Upsert por session_key (unique)
    const { error } = await supabaseAdmin
      .from("cart_funnel_progress")
      .upsert(payload, { onConflict: "session_key" });
    if (error) {
      console.error("[saveCartFunnelStep] upsert failed", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  });
