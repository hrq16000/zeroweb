import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * WhatsApp (uazapi) alert adapter.
 * Env vars expected:
 *   UAZAPI_BASE_URL    e.g. https://free.uazapi.com
 *   UAZAPI_TOKEN       instance token
 *   UAZAPI_ALERT_NUMBER  destination phone (E.164, no +)
 */
export async function sendWhatsAppAlert(message: string): Promise<{ ok: boolean; error?: string }> {
  const base = process.env.UAZAPI_BASE_URL;
  const token = process.env.UAZAPI_TOKEN;
  const number = process.env.UAZAPI_ALERT_NUMBER;
  if (!base || !token || !number) {
    return { ok: false, error: "uazapi env not configured" };
  }
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/send/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({ number, text: message }),
    });
    if (!res.ok) return { ok: false, error: `uazapi ${res.status}` };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "network" };
  }
}

export const listAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ limit: z.number().int().min(1).max(500).optional() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("anomaly_alerts")
      .select("id,kind,severity,value,threshold,zscore,channel,status,message,created_at,sent_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (error) return { rows: [], error: error.message };
    return { rows: rows ?? [], error: null };
  });
