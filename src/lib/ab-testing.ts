import { useEffect, useState } from "react";
import { trackEvent } from "./analytics";
import { bumpExperiment } from "./persistence";
import { getSessionId } from "./visitor";

const IMPRESSION_KEY = "0web_ab_impr_v1";

function alreadyImpressed(sessionId: string, experiment: string, variant: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(IMPRESSION_KEY) || "{}";
    const map = JSON.parse(raw) as Record<string, string>;
    const k = `${sessionId}:${experiment}`;
    if (map[k] === variant) return true;
    map[k] = variant;
    localStorage.setItem(IMPRESSION_KEY, JSON.stringify(map));
    return false;
  } catch {
    return false;
  }
}

/** Conversion event for an A/B variant (click/submit). Includes session id. */
export function trackExperimentEvent(
  kind: "click" | "conversion",
  experiment: string,
  variant: string,
  extra: Record<string, string | number | boolean | undefined> = {},
) {
  const sessionId = typeof window !== "undefined" ? getSessionId() : "ssr";
  trackEvent(`experiment_${kind}`, { experiment, variant, session_id: sessionId, ...extra });
  bumpExperiment(experiment, variant, kind === "click" ? { clicks: 1 } : { conversions: 1 });
}

const KEY = "0web_ab_v1";
const OVERRIDE_KEY = "0web_ab_winner_v1";

type Assignments = Record<string, string>;

function read(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(a: Assignments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function getOverrides(): Assignments {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setOverrides(o: Assignments) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));
  window.dispatchEvent(new CustomEvent("0web:ab-override"));
}

export function clearOverrides() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OVERRIDE_KEY);
  window.dispatchEvent(new CustomEvent("0web:ab-override"));
}

/** Deterministically assigns user to a variant and persists it. Overrides win. */
export function assignVariant<T extends string>(experiment: string, variants: readonly T[]): T {
  if (typeof window === "undefined") return variants[0];
  const ov = getOverrides();
  if (ov[experiment] && variants.includes(ov[experiment] as T)) return ov[experiment] as T;
  const cur = read();
  if (cur[experiment] && variants.includes(cur[experiment] as T)) return cur[experiment] as T;
  const picked = variants[Math.floor(Math.random() * variants.length)];
  cur[experiment] = picked;
  write(cur);
  return picked;
}

export function useExperiment<T extends string>(experiment: string, variants: readonly T[]): T {
  const [v, setV] = useState<T>(variants[0]);
  useEffect(() => {
    const apply = () => {
      const picked = assignVariant(experiment, variants);
      setV(picked);
      const sessionId = getSessionId();
      const first = !alreadyImpressed(sessionId, experiment, picked);
      trackEvent("experiment_view", { experiment, variant: picked, session_id: sessionId, first_in_session: first });
      if (first) bumpExperiment(experiment, picked, { impressions: 1 });
    };
    apply();
    const onOv = () => setV(assignVariant(experiment, variants));
    window.addEventListener("0web:ab-override", onOv);
    return () => window.removeEventListener("0web:ab-override", onOv);
  }, [experiment]);
  return v;
}

export function getAllAssignments(): Assignments {
  return read();
}

export function resetAssignments() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

/**
 * Compute winning variant per experiment from funnel byVariant counts.
 * Variant key format: "hero_copy:A|hero_cta:B" with weighted score 1·CTA + 3·WhatsApp + 5·Form.
 */
export function computeWinners(
  byVariant: Record<string, Record<string, number>>,
): Assignments {
  const perExp: Record<string, Record<string, number>> = {};
  for (const [combo, events] of Object.entries(byVariant)) {
    const score =
      (events["cta_click"] ?? 0) * 1 +
      (events["whatsapp_click"] ?? 0) * 3 +
      (events["form_submit"] ?? 0) * 5;
    if (score <= 0) continue;
    for (const pair of combo.split("|")) {
      const [exp, variant] = pair.split(":");
      if (!exp || !variant) continue;
      perExp[exp] = perExp[exp] ?? {};
      perExp[exp][variant] = (perExp[exp][variant] ?? 0) + score;
    }
  }
  const winners: Assignments = {};
  for (const [exp, variants] of Object.entries(perExp)) {
    const best = Object.entries(variants).reduce((a, b) => (a[1] > b[1] ? a : b));
    winners[exp] = best[0];
  }
  return winners;
}
