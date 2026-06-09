import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SeoAuditRow = {
  id: string;
  kind: string;
  ran_at: string;
  summary: unknown;
  details: unknown;
  delta_pct: number | null;
  status: string;
  notes: string | null;
};

type Kind = "legacy_links" | "seo_diff";

export const listSeoAuditHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number; kind?: Kind } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin_or_super", { _uid: context.userId });
    if (!isAdmin) throw new Error("forbidden");
    let q = supabaseAdmin
      .from("seo_audit_history")
      .select("id,kind,ran_at,summary,details,delta_pct,status,notes")
      .order("ran_at", { ascending: false })
      .limit(Math.min(data.limit ?? 50, 200));
    if (data.kind) q = q.eq("kind", data.kind);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: JSON.parse(JSON.stringify(rows ?? [])) as SeoAuditRow[] };
  });
