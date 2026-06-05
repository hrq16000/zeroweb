// Sprint 12 — Server functions para infraestrutura editorial.
// Lê plano em memória (taxonomia) + persiste calendário/monitoramento em DB.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CLUSTERS, THEMES, totalSubclusters, commercialSubclusters } from "./content-taxonomy";
import { planBuckets, generatePlan } from "./editorial-plan";

export const getTopicMap = createServerFn({ method: "GET" }).handler(async () => {
  return {
    themes: THEMES,
    clusters: CLUSTERS.map((c) => ({
      slug: c.slug,
      title: c.title,
      hubPath: c.hubPath,
      subcount: c.subclusters.length,
    })),
    totalSubclusters: totalSubclusters(),
    commercialCount: commercialSubclusters().length,
  };
});

export const getEditorialPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bucket?: "top100" | "top300" | "top1000" | "full" }) => input)
  .handler(async ({ data }) => {
    const buckets = planBuckets();
    const bucket = data.bucket ?? "top100";
    return { items: buckets[bucket], counts: { 100: buckets.top100.length, 300: buckets.top300.length, 1000: buckets.top1000.length, full: buckets.full.length } };
  });

export const getCommercialOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const plan = generatePlan().filter(
      (p) => p.template === "pricing" || p.template === "service-page" || p.intent === "transactional",
    );
    return { items: plan.slice(0, 200), total: plan.length };
  });

// --- DB-backed monitoring (clusters performance snapshot) ---
const MetricsInput = z.object({
  cluster: z.string().min(1).max(60),
  url: z.string().min(1).max(500),
  position: z.number().int().min(1).max(200).optional(),
  ctr: z.number().min(0).max(1).optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
});

export const recordContentMetric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MetricsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("content_metrics").insert({
      cluster_slug: data.cluster,
      url: data.url,
      position: data.position ?? null,
      ctr: data.ctr ?? null,
      impressions: data.impressions ?? null,
      clicks: data.clicks ?? null,
      conversions: data.conversions ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getContentMetricsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("content_metrics")
      .select("cluster_slug, position, ctr, impressions, clicks, conversions, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    const byCluster: Record<string, { samples: number; clicks: number; conversions: number; impressions: number }> = {};
    for (const r of data ?? []) {
      const k = r.cluster_slug as string;
      byCluster[k] ??= { samples: 0, clicks: 0, conversions: 0, impressions: 0 };
      byCluster[k].samples += 1;
      byCluster[k].clicks += (r.clicks as number) ?? 0;
      byCluster[k].conversions += (r.conversions as number) ?? 0;
      byCluster[k].impressions += (r.impressions as number) ?? 0;
    }
    return { byCluster, recent: data ?? [] };
  });
