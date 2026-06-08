import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Cria uma Stripe Checkout Session no servidor para um pedido existente.
 *
 * - Lê `STRIPE_SECRET_KEY` do ambiente. Sem ela, retorna `{ enabled: false }`
 *   para o front cair no fluxo WhatsApp (Stripe ainda desativado no painel).
 * - Lê o pedido pelo `orderId`, valida que pertence ao usuário autenticado
 *   e injeta `client_reference_id = order.id` + `metadata.order_id` —
 *   é exatamente isso que o webhook em
 *   `src/routes/api/public/hooks/stripe.ts` lê para marcar `paid`.
 * - Usa a API REST do Stripe (sem dependência native) para ser compatível
 *   com o runtime Worker (Cloudflare/Edge).
 *
 * Retorna `{ enabled, url }` — o cliente faz `window.location.href = url`.
 */
export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        successUrl: z.string().url().max(2048),
        cancelUrl: z.string().url().max(2048),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return { enabled: false as const, url: null, reason: "stripe_disabled" };
    }

    const { supabase, userId } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, items, total, currency, status, customer_email, customer_name")
      .eq("id", data.orderId)
      .eq("user_id", userId)
      .single();
    if (error || !order) throw new Error("Pedido não encontrado");
    if (order.status === "paid") {
      return { enabled: true as const, url: data.successUrl, reason: "already_paid" };
    }

    type CartItem = {
      slug?: string;
      name: string;
      price?: number | null;
      qty: number;
      imageUrl?: string | null;
    };
    const items = (order.items as CartItem[] | null) ?? [];
    const currency = (order.currency ?? "BRL").toLowerCase();

    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${data.successUrl}?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${data.cancelUrl}?order_id=${order.id}`);
    body.set("client_reference_id", order.id);
    body.set("metadata[order_id]", order.id);
    if (order.customer_email) body.set("customer_email", order.customer_email);

    items.forEach((it, idx) => {
      const unitAmount = Math.round(Math.max(0, Number(it.price ?? 0)) * 100);
      body.set(`line_items[${idx}][quantity]`, String(Math.max(1, it.qty)));
      body.set(`line_items[${idx}][price_data][currency]`, currency);
      body.set(`line_items[${idx}][price_data][unit_amount]`, String(unitAmount));
      body.set(`line_items[${idx}][price_data][product_data][name]`, it.name.slice(0, 250));
      if (it.imageUrl) {
        body.set(`line_items[${idx}][price_data][product_data][images][0]`, it.imageUrl);
      }
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[stripe-checkout] failed:", res.status, text);
      throw new Error(`Stripe error (${res.status})`);
    }
    const session = (await res.json()) as { id: string; url: string };

    await supabase
      .from("orders")
      .update({
        payment_method: "stripe",
        metadata: { stripe_session_id: session.id },
      })
      .eq("id", order.id)
      .eq("user_id", userId);

    return { enabled: true as const, url: session.url, sessionId: session.id };
  });
