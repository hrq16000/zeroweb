import { useEffect, useRef } from "react";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Push an event to GTM dataLayer AND fire a GA4 event via gtag if available.
 * Marks key events as "conversion" so GA4 attribution credits them.
 */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  // GTM dataLayer
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });

  // GA4 direct (works even without GTM container)
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

/** Mark an event as a conversion (GA4 key event). */
export function trackConversion(name: string, params: EventParams = {}) {
  trackEvent(name, { ...params, conversion: true, event_category: "conversion" });
}

/** Tracks scroll depth (25/50/75/100%) once per session. */
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
