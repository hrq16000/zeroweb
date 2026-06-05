import { useEffect } from "react";
import { getGa4Id, getGtmId, isValidGa4, isValidGtm, captureAttribution } from "@/lib/site-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __0web_analytics_loaded?: { ga4?: string; gtm?: string };
  }
}

/** Client-only injector that loads GA4 + GTM scripts based on IDs in localStorage. */
export function AnalyticsBootstrap() {
  useEffect(() => {
    try { captureAttribution(); } catch { /* noop */ }
    const load = () => {
      const ga4 = getGa4Id();
      const gtm = getGtmId();
      window.__0web_analytics_loaded ??= {};
      const loaded = window.__0web_analytics_loaded;

      // dataLayer + gtag shim + consent defaults
      const w = window as unknown as { dataLayer: unknown[]; gtag?: (...a: unknown[]) => void };
      w.dataLayer = w.dataLayer || [];
      if (!w.gtag) {
        w.gtag = function gtag(...args: unknown[]) {
          w.dataLayer.push(args);
        };
        window.gtag = w.gtag;
        window.gtag("consent", "default", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
          functionality_storage: "granted",
          security_storage: "granted",
          wait_for_update: 500,
        });
        try {
          const c = JSON.parse(localStorage.getItem("0web_consent_v1") || "null");
          if (c && c.decided) {
            window.gtag("consent", "update", {
              analytics_storage: c.analytics_storage,
              ad_storage: c.ad_storage,
              ad_user_data: c.ad_user_data,
              ad_personalization: c.ad_personalization,
              functionality_storage: c.functionality_storage,
            });
          }
        } catch {
          /* noop */
        }
        window.gtag("js", new Date());
      }

      // GTM
      if (isValidGtm(gtm) && loaded.gtm !== gtm) {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`;
        s.dataset.zeroweb = "gtm";
        document.head.appendChild(s);
        w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        loaded.gtm = gtm;
      }

      // GA4
      if (isValidGa4(ga4) && loaded.ga4 !== ga4) {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
        s.dataset.zeroweb = "ga4";
        document.head.appendChild(s);
        window.gtag!("config", ga4, { send_page_view: true, anonymize_ip: true });
        loaded.ga4 = ga4;
      }
    };
    load();
    window.addEventListener("0web:analytics-ids", load);
    return () => window.removeEventListener("0web:analytics-ids", load);
  }, []);
  return null;
}
