// Read-side aggregates for the /painel admin view.
// Uses the standard browser supabase client with anon key — `analytics_events`
// and `experiments` are publicly readable; PII tables are not exposed here.

import { supabase } from "@/integrations/supabase/client";

export type RemoteFunnel = {
  totals: Record<string, number>;
  byPage: Record<string, Record<string, number>>;
  byVariant: Record<string, Record<string, number>>;
  experiments: Array<{
    experiment_name: string;
    variant: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  lastUpdated: string;
};

export async function fetchRemoteFunnel(): Promise<RemoteFunnel | null> {
  try {
    const { data: events, error } = await supabase
      .from("analytics_events")
      .select("event_name, path, hero_variant, cta_variant")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) return null;

    const totals: Record<string, number> = {};
    const byPage: Record<string, Record<string, number>> = {};
    const byVariant: Record<string, Record<string, number>> = {};

    for (const e of events ?? []) {
      const ev = e.event_name as string;
      totals[ev] = (totals[ev] ?? 0) + 1;
      const p = (e.path as string) || "/";
      byPage[p] = byPage[p] ?? {};
      byPage[p][ev] = (byPage[p][ev] ?? 0) + 1;
      const vk = `hero_copy:${e.hero_variant ?? "-"}|hero_cta:${e.cta_variant ?? "-"}`;
      byVariant[vk] = byVariant[vk] ?? {};
      byVariant[vk][ev] = (byVariant[vk][ev] ?? 0) + 1;
    }

    const { data: exps } = await supabase
      .from("experiments")
      .select("experiment_name, variant, impressions, clicks, conversions");

    return {
      totals,
      byPage,
      byVariant,
      experiments: (exps ?? []) as RemoteFunnel["experiments"],
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
