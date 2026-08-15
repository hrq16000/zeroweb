import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Leitura do painel de telemetria de hidratação. Restrito a admins:
 * o endpoint público só aceita escrita (beacon).
 */
export const adminHydrationTelemetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin_or_super", { _uid: userId });
    if (!isAdmin) throw new Error("Acesso negado: requer admin.");

    const { hydrationTelemetrySnapshot } = await import("@/lib/hydration-telemetry.server");
    return hydrationTelemetrySnapshot();
  });
