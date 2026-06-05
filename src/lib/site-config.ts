// Centralized site configuration.
// GA4/GTM IDs default to placeholders here and can be overridden at runtime
// from the admin painel — values persist in localStorage and the analytics
// scripts are injected client-side by <AnalyticsBootstrap/>.

export const SITE = {
  GA4_ID: "G-XXXXXXXXXX",
  GTM_ID: "GTM-XXXXXXX",
  domain: "0web.com.br",
  origin: "https://0web.com.br",
};

const LS_GA4 = "0web_ga4_id";
const LS_GTM = "0web_gtm_id";

export function isValidGa4(id: string | null | undefined) {
  return !!id && /^G-[A-Z0-9]{6,}$/.test(id);
}
export function isValidGtm(id: string | null | undefined) {
  return !!id && /^GTM-[A-Z0-9]{5,}$/.test(id);
}

export function getGa4Id(): string {
  if (typeof window === "undefined") return SITE.GA4_ID;
  const v = localStorage.getItem(LS_GA4);
  return isValidGa4(v) ? (v as string) : SITE.GA4_ID;
}
export function getGtmId(): string {
  if (typeof window === "undefined") return SITE.GTM_ID;
  const v = localStorage.getItem(LS_GTM);
  return isValidGtm(v) ? (v as string) : SITE.GTM_ID;
}
export function setAnalyticsIds(ga4: string, gtm: string) {
  if (typeof window === "undefined") return;
  if (ga4) localStorage.setItem(LS_GA4, ga4.trim());
  else localStorage.removeItem(LS_GA4);
  if (gtm) localStorage.setItem(LS_GTM, gtm.trim());
  else localStorage.removeItem(LS_GTM);
  window.dispatchEvent(new Event("0web:analytics-ids"));
}

// WhatsApp configuration (Curitiba/PR)
export const WHATSAPP = {
  number: "5541997452053",
  message:
    "Olá! Vim pelo site 0WEB e quero solicitar um diagnóstico gratuito para minha empresa.",
};

export const DEFAULT_UTM = {
  utm_source: "site",
  utm_medium: "0web",
  utm_campaign: "diagnostico",
};

const ATTR_STORAGE = "0web_attr_v1";

type StoredAttribution = Record<string, string>;

function readStoredAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ATTR_STORAGE) || "{}");
  } catch {
    return {};
  }
}

function writeStoredAttribution(attr: StoredAttribution) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTR_STORAGE, JSON.stringify(attr));
  } catch {
    /* ignore */
  }
}

/** Captures + persists 1st-touch attribution (utms + gclid/fbclid + referrer). */
export function captureAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};
  const stored = readStoredAttribution();
  const url = new URL(window.location.href);
  const current: StoredAttribution = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) current[k] = v;
  });
  if (document.referrer && !stored.referrer) current.referrer = document.referrer;
  if (!stored.landing_page) current.landing_page = window.location.pathname;
  const merged = { ...current, ...stored }; // 1st-touch wins
  if (Object.keys(current).length) writeStoredAttribution(merged);
  return merged;
}

export function getActiveUtms(): Record<string, string> {
  if (typeof window === "undefined") return { ...DEFAULT_UTM };
  const stored = readStoredAttribution();
  const url = new URL(window.location.href);
  const utms: Record<string, string> = { ...DEFAULT_UTM };
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = url.searchParams.get(k) || stored[k];
    if (v) utms[k] = v;
  });
  return utms;
}

export function getAttributionPayload(): Record<string, string | null> {
  const stored = readStoredAttribution();
  const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
  const pick = (k: string) => (url?.searchParams.get(k) || stored[k] || null);
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_term: pick("utm_term"),
    utm_content: pick("utm_content"),
    gclid: pick("gclid"),
    fbclid: pick("fbclid"),
    referrer: stored.referrer || (typeof document !== "undefined" ? document.referrer || null : null),
    landing_page: stored.landing_page || (typeof window !== "undefined" ? window.location.pathname : null),
  };
}

export function withUtms(href: string, extra: Record<string, string> = {}) {
  const utms = { ...getActiveUtms(), ...extra };
  try {
    const u = new URL(href, typeof window !== "undefined" ? window.location.href : "https://0web.com.br");
    Object.entries(utms).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  } catch {
    return href;
  }
}

export function whatsappUrl(extraMessage?: string, utmContent?: string) {
  const baseMsg = extraMessage ?? WHATSAPP.message;
  const utms = getActiveUtms();
  if (utmContent) utms.utm_content = utmContent;
  const tail =
    "\n\n—\nOrigem: " +
    Object.entries(utms)
      .map(([k, v]) => `${k}=${v}`)
      .join(" · ");
  const text = encodeURIComponent(baseMsg + tail);
  return `https://wa.me/${WHATSAPP.number}?text=${text}`;
}
