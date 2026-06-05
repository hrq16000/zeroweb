import { useCallback, useEffect, useRef } from "react";
import { trackConversion, trackEvent } from "@/lib/analytics";

type WhatsappTrackingParams = Record<string, string | number | boolean | undefined>;

/**
 * Tracks WhatsApp interactions with GA4 + dataLayer (forwarded to Meta Pixel
 * via GTM). Fires:
 *   - whatsapp_click  on link click (conversion)
 *   - whatsapp_return when the user comes back to the tab after a click
 *     (used as a soft conversion when the click event itself may have been
 *     missed because the tab was suspended)
 */
export function useWhatsappTracking(baseParams: WhatsappTrackingParams) {
  const clickedAt = useRef<number | null>(null);
  const fired = useRef(false);

  const onClick = useCallback(() => {
    clickedAt.current = Date.now();
    fired.current = false;
    trackConversion("whatsapp_click", { ...baseParams, ts: Date.now() });
  }, [baseParams]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (!clickedAt.current || fired.current) return;
      const elapsed = Date.now() - clickedAt.current;
      // Only fire if the user actually left for >1.5s (real WA open) and <30min
      if (elapsed < 1500 || elapsed > 30 * 60 * 1000) return;
      fired.current = true;
      trackConversion("whatsapp_return", { ...baseParams, elapsed_ms: elapsed });
      // Soft heuristic: also emit a duplicate whatsapp_click as fallback in
      // case the original click event was dropped due to tab suspension.
      trackEvent("whatsapp_click_fallback", { ...baseParams, elapsed_ms: elapsed });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [baseParams]);

  return { onClick };
}
