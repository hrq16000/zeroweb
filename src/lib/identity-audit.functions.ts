import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listIdentityStitchLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        limit: z.number().min(1).max(500).default(200),
        status: z.enum(["ok", "noop", "error", "all"]).default("all"),
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
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
