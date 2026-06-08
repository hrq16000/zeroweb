import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type UnifiedLead = {
  id_lead: string;
  nome: string;
  origem: "carrinho" | "funil";
  etapa_atual: string;
  dados_extras: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export const listUnifiedLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { origem?: "carrinho" | "funil" | "all"; etapa?: string | "all"; limit?: number } = {}) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // gate: must be admin or super_admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const allowed = (roles ?? []).some((r) => r.role === "admin" || r.role === "super_admin");
    if (!allowed) throw new Error("forbidden");

    let q = (supabaseAdmin as any)
      .from("vw_unified_leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(Math.min(data.limit ?? 200, 500));
    if (data.origem && data.origem !== "all") q = q.eq("origem", data.origem);
    if (data.etapa && data.etapa !== "all") q = q.eq("etapa_atual", data.etapa);
    const { data: rows, error } = await q;

    if (error) throw error;

    const list = (rows ?? []) as UnifiedLead[];
    const etapas = Array.from(new Set(list.map((r) => r.etapa_atual).filter(Boolean))).sort();
    return { leads: list, etapas };
  });
