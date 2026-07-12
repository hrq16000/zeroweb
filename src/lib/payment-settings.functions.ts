import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PaymentSettings = {
  stripeEnabled: boolean;
};

const DEFAULTS: PaymentSettings = {
  stripeEnabled: false,
};

/**
 * Lê as configurações públicas de pagamento (somente flag do Stripe).
 * Usa supabaseAdmin pois a tabela app_settings é admin-only.
 */
export const getPaymentSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PaymentSettings> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("key, value")
      .in("key", ["payments.stripe_enabled"]);
    if (error) return DEFAULTS;
    const map = new Map((data ?? []).map((r) => [r.key, r.value]));
    return {
      stripeEnabled: (map.get("payments.stripe_enabled") ?? "false").toLowerCase() === "true",
    };
  },
);

const UpdateSchema = z.object({
  stripeEnabled: z.boolean().optional(),
  whatsappNumber: z.string().regex(/^\d{10,15}$/).optional(),
});

/**
 * Atualiza as configurações de pagamento. Apenas admins.
 */
export const updatePaymentSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { userId, supabase } = context;

    // Confirma role admin (RLS já protege, mas a checagem explícita evita escalada).
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado: requer admin.");

    const rows: { key: string; value: string; updated_by: string }[] = [];
    if (typeof data.stripeEnabled === "boolean") {
      rows.push({
        key: "payments.stripe_enabled",
        value: data.stripeEnabled ? "true" : "false",
        updated_by: userId,
      });
    }
    if (typeof data.whatsappNumber === "string") {
      rows.push({
        key: "payments.whatsapp_number",
        value: data.whatsappNumber,
        updated_by: userId,
      });
    }
    if (rows.length === 0) return { ok: true };

    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
