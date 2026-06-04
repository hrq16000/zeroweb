// Centralized site configuration.
// Replace the GA4_ID and GTM_ID with your real IDs.
// They are public (client-side) identifiers — safe to commit.

export const SITE = {
  GA4_ID: "G-XXXXXXXXXX",
  GTM_ID: "GTM-XXXXXXX",
  domain: "0web.com.br",
};

// WhatsApp configuration (Curitiba/PR)
export const WHATSAPP = {
  number: "5541997452053",
  message:
    "Olá! Vim pelo site 0WEB e quero solicitar um diagnóstico gratuito para minha empresa.",
};

// Default UTM source/medium for outbound conversion links
export const DEFAULT_UTM = {
  utm_source: "site",
  utm_medium: "0web",
  utm_campaign: "diagnostico",
};

/** Reads UTMs already on the page URL (campaign attribution) and merges defaults. */
export function getActiveUtms(): Record<string, string> {
  if (typeof window === "undefined") return { ...DEFAULT_UTM };
  const url = new URL(window.location.href);
  const utms: Record<string, string> = { ...DEFAULT_UTM };
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) utms[k] = v;
  });
  return utms;
}

/** Append UTMs to any URL (preserves existing query). */
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
