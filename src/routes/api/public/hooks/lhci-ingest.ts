// Ingest LHCI results. HMAC verification: X-Signature: sha256=<hex of HMAC(body, secret)>.
// Secret stored in app_settings (lhci.hmac_secret) or process.env.LHCI_HMAC_SECRET.
// Legacy fallback: X-Ingest-Token (deprecated; logs a warning).
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const Body = z.object({
  environment: z.enum(["dev", "staging", "prod"]).default("prod"),
  url: z.string().url(),
  commit_sha: z.string().max(80).nullable().optional(),
  branch: z.string().max(120).nullable().optional(),
  performance: z.number().min(0).max(1).nullable().optional(),
  seo: z.number().min(0).max(1).nullable().optional(),
  accessibility: z.number().min(0).max(1).nullable().optional(),
  best_practices: z.number().min(0).max(1).nullable().optional(),
  lcp_ms: z.number().nullable().optional(),
  cls: z.number().nullable().optional(),
  tbt_ms: z.number().nullable().optional(),
  fcp_ms: z.number().nullable().optional(),
  logs: z.any().optional(),
  raw: z.any().optional(),
});

function safeEqHex(a: string, b: string) {
  try {
    const ab = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/hooks/lhci-ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { getSettingValue } = await import("@/lib/settings.functions");

        const raw = await request.text();

        const secret =
          (await getSettingValue("lhci.hmac_secret")) || process.env.LHCI_HMAC_SECRET;
        const sigHeader = request.headers.get("x-signature") || "";
        const tokenHeader = request.headers.get("x-ingest-token") || "";
        const expectedToken =
          (await getSettingValue("lhci.ingest_token")) || process.env.LHCI_INGEST_TOKEN;

        let authed = false;
        if (secret) {
          const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
          const [, expHex] = expected.split("=");
          const [, gotHex] = sigHeader.split("=");
          if (expHex && gotHex && safeEqHex(expHex, gotHex)) authed = true;
        }
        if (!authed && expectedToken && tokenHeader && tokenHeader === expectedToken) {
          // Legacy token path; still allowed when HMAC secret not configured or fallback.
          authed = true;
        }
        if (!authed) return new Response("Unauthorized", { status: 401 });

        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = Body.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const env = parsed.data.environment;
        const perfMin = Number((await getSettingValue(`lhci.${env}.min_performance`)) ?? 0.9);
        const seoMin = Number((await getSettingValue(`lhci.${env}.min_seo`)) ?? 0.95);
        const lcpMax = Number((await getSettingValue(`lhci.${env}.max_lcp_ms`)) ?? 2500);
        const clsMax = Number((await getSettingValue(`lhci.${env}.max_cls`)) ?? 0.1);

        const failed: string[] = [];
        if (parsed.data.performance != null && parsed.data.performance < perfMin)
          failed.push(`performance<${perfMin}`);
        if (parsed.data.seo != null && parsed.data.seo < seoMin) failed.push(`seo<${seoMin}`);
        if (parsed.data.lcp_ms != null && parsed.data.lcp_ms > lcpMax)
          failed.push(`lcp>${lcpMax}`);
        if (parsed.data.cls != null && parsed.data.cls > clsMax) failed.push(`cls>${clsMax}`);
        const status = failed.length ? "failed" : "passed";

        const { data, error } = await supabaseAdmin
          .from("lhci_runs")
          .insert({
            ...parsed.data,
            status,
            decision_reason: failed.length ? `Limites: ${failed.join(", ")}` : null,
          })
          .select("id")
          .single();
        if (error) return new Response(error.message, { status: 500 });

        return Response.json({ ok: true, id: data?.id, status, failedThresholds: failed });
      },
    },
  },
});
