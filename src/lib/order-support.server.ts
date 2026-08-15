/**
 * Suporte a pedidos ("pedido com ajuda") — helpers server-only.
 *
 * Contrato: o cliente autenticado dono do pedido solicita ajuda → geramos um
 * token opaco (guardado apenas como hash) → a rota `/suporte-pedido/$token`
 * valida, marca o pedido como "com ajuda" e encaminha para o funil
 * `funnel-order-support`. Nenhum contato comercial trafega no HTML público.
 */
if (typeof window !== "undefined") {
  throw new Error("order-support.server.ts imported from client code");
}

import { randomBytes, createHash } from "node:crypto";

export const ORDER_SUPPORT_TTL_MS = 24 * 60 * 60 * 1000;
export const ORDER_SUPPORT_FUNNEL_SLUG = "funnel-order-support";

export function generateOrderSupportToken(): string {
  return randomBytes(24).toString("hex");
}

export function hashOrderSupportToken(token: string): string {
  const salt = process.env.IP_HASH_SALT ?? "0web-default-salt";
  return createHash("sha256").update(`order-support:${salt}:${token}`).digest("hex");
}

export function isValidOrderSupportTokenFormat(token: string): boolean {
  return /^[a-f0-9]{32,96}$/.test(token);
}

export type OrderSupportResolution =
  | { ok: true; orderId: string; redirectTo: string }
  | { ok: false; reason: "invalid_format" | "not_found" | "expired" };

/** Valida e consome (marca uso) um token de suporte. */
export async function resolveOrderSupportToken(token: string): Promise<OrderSupportResolution> {
  if (!isValidOrderSupportTokenFormat(token)) return { ok: false, reason: "invalid_format" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const tokenHash = hashOrderSupportToken(token);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabaseAdmin as any)
    .from("order_support_requests")
    .select("id, order_id, expires_at, use_count, status")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!row) return { ok: false, reason: "not_found" };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin as any)
      .from("order_support_requests")
      .update({ status: "expired" })
      .eq("id", row.id);
    return { ok: false, reason: "expired" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabaseAdmin as any)
    .from("order_support_requests")
    .update({
      status: "opened",
      used_at: new Date().toISOString(),
      use_count: (row.use_count ?? 0) + 1,
    })
    .eq("id", row.id);

  // Marca o pedido como "ajuda solicitada" sem tocar no status financeiro.
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("metadata")
    .eq("id", row.order_id)
    .maybeSingle();

  const metadata = {
    ...((order?.metadata as Record<string, unknown> | null) ?? {}),
    support_requested: true,
    support_requested_at: new Date().toISOString(),
  };

  await supabaseAdmin
    .from("orders")
    .update({ metadata: metadata as never, updated_at: new Date().toISOString() })
    .eq("id", row.order_id);

  const params = new URLSearchParams({
    intent: "order-support",
    ref: String(row.order_id).slice(0, 8),
  });

  return {
    ok: true,
    orderId: row.order_id,
    redirectTo: `/f/${ORDER_SUPPORT_FUNNEL_SLUG}?${params.toString()}`,
  };
}
