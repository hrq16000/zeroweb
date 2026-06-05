// Ingest LHCI results. Auth via shared secret header X-Ingest-Token
// (app_settings key "lhci.ingest_token" or env LHCI_INGEST_TOKEN).
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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

export const Route = createFileRoute("/api/public/hooks/lhci-ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { getSettingValue } = await import("@/lib/settings.functions");

        const expected =
          (await getSettingValue("lhci.ingest_token")) || process.env.LHCI_INGEST_TOKEN;
        const provided = request.headers.get("x-ingest-token");
        if (!expected || !provided || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = Body.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const perfMin = Number(
          (await getSettingValue(`lhci.${parsed.data.environment}.min_performance`)) ?? 0.9,
        );
        const seoMin = Number(
          (await getSettingValue(`lhci.${parsed.data.environment}.min_seo`)) ?? 0.95,
        );
        const lcpMax = Number(
          (await getSettingValue(`lhci.${parsed.data.environment}.max_lcp_ms`)) ?? 2500,
        );
        const clsMax = Number(
          (await getSettingValue(`lhci.${parsed.data.environment}.max_cls`)) ?? 0.1,
        );

        const failedThresholds: string[] = [];
        if (parsed.data.performance != null && parsed.data.performance < perfMin)
          failedThresholds.push(`performance<${perfMin}`);
        if (parsed.data.seo != null && parsed.data.seo < seoMin)
          failedThresholds.push(`seo<${seoMin}`);
        if (parsed.data.lcp_ms != null && parsed.data.lcp_ms > lcpMax)
          failedThresholds.push(`lcp>${lcpMax}`);
        if (parsed.data.cls != null && parsed.data.cls > clsMax)
          failedThresholds.push(`cls>${clsMax}`);

        const status = failedThresholds.length ? "failed" : "passed";

        const { data, error } = await supabaseAdmin
          .from("lhci_runs")
          .insert({
            ...parsed.data,
            status,
            decision_reason: failedThresholds.length
              ? `Limites: ${failedThresholds.join(", ")}`
              : null,
          })
          .select("id")
          .single();
        if (error) return new Response(error.message, { status: 500 });

        return Response.json({ ok: true, id: data?.id, status, failedThresholds });
      },
    },
  },
});
