import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CartItemSchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(255),
  category: z.string().max(120).optional(),
  price: z.number().min(0).max(1_000_000).nullable().optional(),
  pricePeriod: z.string().max(40).nullable().optional(),
  imageUrl: z.string().url().max(2048).nullable().optional(),
  qty: z.number().int().min(1).max(99),
});

const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(50),
  notes: z.string().max(2000).optional(),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(40).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

/**
 * Cria um pedido (status=pending) a partir do snapshot do carrinho.
 * Retorna o id do pedido para os CTAs de pagamento/WhatsApp.
 */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const total = data.items.reduce(
      (sum, i) => sum + (typeof i.price === "number" ? i.price : 0) * i.qty,
      0,
    );

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: data.items,
        total,
        currency: "BRL",
        status: "pending",
        notes: data.notes ?? null,
        customer_name: data.customerName ?? claims?.user_metadata?.full_name ?? null,
        customer_email: claims?.email ?? null,
        customer_phone: data.customerPhone ?? null,
      })
      .select("id, total, status, created_at")
      .single();

    if (error) throw new Error(`Falha ao criar pedido: ${error.message}`);
    return { order };
  });

/**
 * Marca o pedido como transferido para WhatsApp e pendente de pagamento.
 * O cliente continua o atendimento pelo WhatsApp; internamente o pedido
 * fica salvo como `pending_payment` para acompanhamento financeiro.
 */
export const markOrderWhatsAppHandoff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("orders")
      .update({
        status: "awaiting_payment",
        payment_method: "whatsapp",
        whatsapp_handoff_at: new Date().toISOString(),
      })
      .eq("id", data.orderId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


/**
 * Lista pedidos do usuário (área do cliente — usado no painel /app).
 */
export const listMyOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("id, items, total, status, payment_method, created_at, whatsapp_handoff_at, paid_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });
