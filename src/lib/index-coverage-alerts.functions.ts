import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: any) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) throw new Error("forbidden");
}

const DROP_THRESHOLD = -0.3;   // -30% counts as drop in coverage health
const SPIKE_THRESHOLD = 0.5;   // +50% counts as spike in new issues

export type CoverageAlert = {
  issue_type: string;
  kind: "spike" | "drop";
  current: number;
  baseline: number;
  delta_pct: number;
  message: string;
};

/** Compares last 24h vs 7d average per issue_type and returns anomalies. */
export const detectIndexCoverageAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);

    const now = new Date();
    const dayMs = 86400000;
    const last24From = new Date(now.getTime() - dayMs).toISOString();
    const baselineFrom = new Date(now.getTime() - 8 * dayMs).toISOString();
    const baselineTo = new Date(now.getTime() - dayMs).toISOString();

    const { data: recent, error: e1 } = await supabase
      .from("index_coverage_issues")
      .select("issue_type, detected_at")
      .gte("detected_at", last24From);
    if (e1) throw new Error(e1.message);

    const { data: base, error: e2 } = await supabase
      .from("index_coverage_issues")
      .select("issue_type, detected_at")
      .gte("detected_at", baselineFrom)
      .lt("detected_at", baselineTo);
    if (e2) throw new Error(e2.message);

    const byTypeRecent: Record<string, number> = {};
    const byTypeBase: Record<string, number> = {};
    for (const r of recent ?? []) byTypeRecent[r.issue_type] = (byTypeRecent[r.issue_type] ?? 0) + 1;
    for (const r of base ?? []) byTypeBase[r.issue_type] = (byTypeBase[r.issue_type] ?? 0) + 1;

    const types = new Set([...Object.keys(byTypeRecent), ...Object.keys(byTypeBase)]);
    const alerts: CoverageAlert[] = [];
    for (const t of types) {
      const current = byTypeRecent[t] ?? 0;
      const avgPerDay = (byTypeBase[t] ?? 0) / 7;
      if (avgPerDay < 1 && current < 3) continue; // ignore noise

      const baseline = Math.max(avgPerDay, 0.5);
      const delta = (current - baseline) / baseline;

      if (delta >= SPIKE_THRESHOLD && current >= 3) {
        alerts.push({
          issue_type: t,
          kind: "spike",
          current,
          baseline: Math.round(baseline * 10) / 10,
          delta_pct: Math.round(delta * 100),
          message: `Alta de ${Math.round(delta * 100)}% em "${t}" nas últimas 24h (${current} vs média ${baseline.toFixed(1)}/dia).`,
        });
      } else if (delta <= DROP_THRESHOLD && avgPerDay >= 1) {
        alerts.push({
          issue_type: t,
          kind: "drop",
          current,
          baseline: Math.round(baseline * 10) / 10,
          delta_pct: Math.round(delta * 100),
          message: `Queda de ${Math.abs(Math.round(delta * 100))}% em "${t}" nas últimas 24h (${current} vs média ${baseline.toFixed(1)}/dia).`,
        });
      }
    }

    // Persist into anomaly_alerts (best-effort)
    if (alerts.length) {
      const rows = alerts.map((a) => ({
        kind: "index_coverage",
        severity: a.kind === "spike" ? "warning" : "info",
        message: a.message,
        payload: a as any,
      }));
      // Don't throw if anomaly_alerts schema differs — best-effort write
      try { await supabase.from("anomaly_alerts").insert(rows); } catch { /* ignore */ }
    }

    return { alerts, generated_at: new Date().toISOString() };
  });
