import { useEffect, useRef, useState } from "react";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

const FUNNEL_KEY = "0web_funnel_v1";
const CONSENT_KEY = "0web_consent_v1";

export type ConsentState = {
  analytics_storage: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  functionality_storage: "granted" | "denied";
  decided: boolean;
};

export const DEFAULT_CONSENT: ConsentState = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  functionality_storage: "granted",
  decided: false,
};

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return DEFAULT_CONSENT;
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function setConsent(next: Partial<ConsentState>) {
  if (typeof window === "undefined") return;
  const merged: ConsentState = { ...getConsent(), ...next, decided: true };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(merged));
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: merged.analytics_storage,
      ad_storage: merged.ad_storage,
      ad_user_data: merged.ad_user_data,
      ad_personalization: merged.ad_personalization,
      functionality_storage: merged.functionality_storage,
    });
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: "consent_update", ...merged });
  window.dispatchEvent(new CustomEvent("0web:consent", { detail: merged }));
}

/** Funnel counter (per-event, page, category, variant) stored in localStorage. */
type FunnelRecord = {
  totals: Record<string, number>;
  byPage: Record<string, Record<string, number>>;
  byCategory: Record<string, Record<string, number>>;
  byVariant: Record<string, Record<string, number>>; // variantKey "hero_copy:A|hero_cta:B" -> event counts
  lastUpdated: string;
};

function emptyFunnel(): FunnelRecord {
  return {
    totals: {},
    byPage: {},
    byCategory: {},
    byVariant: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function getFunnel(): FunnelRecord {
  if (typeof window === "undefined") return emptyFunnel();
  try {
    const raw = localStorage.getItem(FUNNEL_KEY);
    const parsed = raw ? (JSON.parse(raw) as FunnelRecord) : emptyFunnel();
    parsed.byVariant = parsed.byVariant ?? {};
    return parsed;
  } catch {
    return emptyFunnel();
  }
}

export function resetFunnel() {
  if (typeof window === "undefined") return;
  localStorage.setItem(FUNNEL_KEY, JSON.stringify(emptyFunnel()));
  window.dispatchEvent(new CustomEvent("0web:funnel"));
}

function getVariantKey(): string {
  try {
    const ab = JSON.parse(localStorage.getItem("0web_ab_v1") || "{}");
    const keys = Object.keys(ab).sort();
    if (!keys.length) return "(none)";
    return keys.map((k) => `${k}:${ab[k]}`).join("|");
  } catch {
    return "(none)";
  }
}

function incFunnel(event: string, params: EventParams) {
  if (typeof window === "undefined") return;
  const cur = getFunnel();
  cur.totals[event] = (cur.totals[event] ?? 0) + 1;
  const page = typeof window !== "undefined" ? window.location.pathname : "/";
  cur.byPage[page] = cur.byPage[page] ?? {};
  cur.byPage[page][event] = (cur.byPage[page][event] ?? 0) + 1;
  const cat = (params.category ?? params.event_category) as string | undefined;
  if (cat) {
    cur.byCategory[cat] = cur.byCategory[cat] ?? {};
    cur.byCategory[cat][event] = (cur.byCategory[cat][event] ?? 0) + 1;
  }
  const vKey = getVariantKey();
  cur.byVariant[vKey] = cur.byVariant[vKey] ?? {};
  cur.byVariant[vKey][event] = (cur.byVariant[vKey][event] ?? 0) + 1;
  cur.lastUpdated = new Date().toISOString();
  localStorage.setItem(FUNNEL_KEY, JSON.stringify(cur));
  window.dispatchEvent(new CustomEvent("0web:funnel"));
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
  incFunnel(name, params);
}

export function trackConversion(name: string, params: EventParams = {}) {
  trackEvent(name, { ...params, conversion: true, event_category: params.event_category ?? "conversion" });
}

/** Canonical list of events that should be marked as GA4 Conversion events. */
export const CONVERSION_EVENTS = [
  "cta_click",
  "whatsapp_click",
  "form_submit",
  "scroll_depth",
  "wa_funnel_open",
  "wa_funnel_step",
  "wa_funnel_complete",
] as const;

/** Expected dataLayer schema per event (used by /qa-events expected vs captured). */
export const EXPECTED_EVENT_SCHEMA: Record<string, string[]> = {
  cta_click: ["label", "location"],
  whatsapp_click: ["location"],
  form_submit: ["form_name"],
  scroll_depth: ["percent"],
  experiment_view: ["experiment", "variant"],
  consent_update: ["analytics_storage", "ad_storage"],
  wa_funnel_open: ["location"],
  wa_funnel_step: ["step_id", "step_index"],
  wa_funnel_complete: ["steps"],
};


export function useScrollDepthTracking() {
  const fired = useRef<Set<number>>(new Set());
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((h.scrollTop / max) * 100);
      thresholds.forEach((t) => {
        if (pct >= t && !fired.current.has(t)) {
          fired.current.add(t);
          const isConversion = t === 75 || t === 100;
          const fn = isConversion ? trackConversion : trackEvent;
          fn("scroll_depth", { percent: t });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/** React hook to subscribe to consent changes. */
export function useConsent(): [ConsentState, (n: Partial<ConsentState>) => void] {
  const [state, setState] = useState<ConsentState>(() => getConsent());
  useEffect(() => {
    const onChange = () => setState(getConsent());
    window.addEventListener("0web:consent", onChange);
    return () => window.removeEventListener("0web:consent", onChange);
  }, []);
  return [state, setConsent];
}
