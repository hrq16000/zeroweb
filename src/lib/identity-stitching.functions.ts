import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Identity Stitching — costura o visitor_id anônimo (cookie 0web_vid)
 * a todo o histórico em visitantes_rastreio, atribuindo user_id + user_ref.
 *
 * Roda server-side com supabaseAdmin via RPC SECURITY DEFINER.
 * Não bloqueia o redirecionamento: o caller pode despachar e não aguardar.
 */
export const stitchVisitorIdentity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        visitorId: z.string().min(1).max(128).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Fallback: lê do cookie 0web_vid se o cliente não enviar
    let visitorId = data.visitorId;
    if (!visitorId) {
      const cookieHeader = getRequestHeader("cookie") || "";
      const match = cookieHeader.match(/(?:^|;\s*)0web_vid=([^;]+)/);
      if (match) visitorId = decodeURIComponent(match[1]);
    }

    if (!visitorId || !userId) {
      return { stitched: 0, userRef: null as string | null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rpcData, error } = await supabaseAdmin.rpc("stitch_visitor_identity", {
      p_visitor_id: visitorId,
      p_user_id: userId,
    });

    if (error) {
      console.error("[stitchVisitorIdentity] RPC error:", error.message);
      return { stitched: 0, userRef: null as string | null };
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_ref")
      .eq("id", userId)
      .maybeSingle();

    return {
      stitched: (rpcData as number) ?? 0,
      userRef: (profile?.user_ref as string | null) ?? null,
    };
  });
