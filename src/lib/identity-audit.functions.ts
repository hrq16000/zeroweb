import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listIdentityStitchLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        limit: z.number().min(1).max(5000).default(300),
        status: z.enum(["ok", "noop", "error", "all"]).default("all"),
        dateFrom: z.string().datetime().optional(),
        dateTo: z.string().datetime().optional(),
        search: z.string().max(128).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const userId = (context as { userId: string }).userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: isSuper } = await supabaseAdmin.rpc("is_super_admin", { _uid: userId });
    if (!isSuper) throw new Error("forbidden");

    let q = supabaseAdmin
      .from("identity_stitch_log")
      .select("id, visitor_id, user_id, user_ref, stitched_count, status, error_message, source, actor, created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.dateFrom) q = q.gte("created_at", data.dateFrom);
    if (data.dateTo) q = q.lte("created_at", data.dateTo);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`visitor_id.ilike.%${s}%,user_ref.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
