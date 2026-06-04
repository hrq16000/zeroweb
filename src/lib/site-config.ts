// Centralized site configuration.
// Replace the GA4_ID and GTM_ID with your real IDs.
// They are public (client-side) identifiers — safe to commit.

export const SITE = {
  // Google Analytics 4 — formato G-XXXXXXX
  GA4_ID: "G-XXXXXXXXXX",
  // Google Tag Manager — formato GTM-XXXXXXX
  GTM_ID: "GTM-XXXXXXX",
};

// WhatsApp configuration (Curitiba/PR)
export const WHATSAPP = {
  number: "5541997452053", // 55 (BR) + 41 + 9 9745 2053
  message:
    "Olá! Vim pelo site 0WEB e quero solicitar um diagnóstico gratuito para minha empresa.",
};

export function whatsappUrl(extraMessage?: string) {
  const msg = encodeURIComponent(extraMessage ?? WHATSAPP.message);
  return `https://wa.me/${WHATSAPP.number}?text=${msg}`;
}
