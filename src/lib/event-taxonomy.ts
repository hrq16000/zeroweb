/**
 * Event Taxonomy — /obrigado (Thank-You) surface
 * =============================================================
 *
 * Canonical event names and parameter contracts so GA4, Meta Pixel
 * and GTM can be wired without guesswork.
 *
 * Conventions
 * - snake_case event names
 * - every event carries the base attribution payload
 *   (source, channel, utm_source, utm_medium, utm_campaign,
 *    utm_content, landing_page, has_gclid, has_fbclid)
 * - `surface` is either "modal" (ThankYouModal) or "page" (/obrigado)
 *
 * GTM mapping
 * | GA4 event name           | Meta Pixel call                       | Trigger                     |
 * | ------------------------ | ------------------------------------- | --------------------------- |
 * | thank_you_view           | fbq('track','Lead')                   | After form submit succeeds  |
 * | thank_you_cta_plans      | fbq('trackCustom','TYCtaPlans')       | Click "Ver planos"          |
 * | thank_you_cta_faq        | fbq('trackCustom','TYCtaFaq')         | Click "FAQ"                 |
 * | thank_you_cta_diagnostico| fbq('trackCustom','TYCtaDiagnostico') | Click final CTA             |
 * | thank_you_cta_whatsapp   | fbq('track','Contact')                | Click WhatsApp on TY surface|
 * | thank_you_dismiss        | —                                     | User closes modal           |
 */

export type ThankYouSurface = "modal" | "page";

export type BaseAttrParams = {
  source: string;
  channel: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_page?: string;
  has_gclid?: boolean;
  has_fbclid?: boolean;
};

export type ThankYouEventName =
  | "thank_you_view"
  | "thank_you_cta_plans"
  | "thank_you_cta_faq"
  | "thank_you_cta_diagnostico"
  | "thank_you_cta_whatsapp"
  | "thank_you_dismiss";

export const THANK_YOU_EVENTS: Record<
  ThankYouEventName,
  { pixelName?: string; pixelStandard?: "Lead" | "Contact"; required: string[]; optional: string[] }
> = {
  thank_you_view: {
    pixelStandard: "Lead",
    required: ["source", "channel", "surface"],
    optional: ["utm_source", "utm_medium", "utm_campaign", "utm_content", "landing_page"],
  },
  thank_you_cta_plans: {
    pixelName: "TYCtaPlans",
    required: ["source", "channel", "surface", "cta_id", "target"],
    optional: ["position", "label"],
  },
  thank_you_cta_faq: {
    pixelName: "TYCtaFaq",
    required: ["source", "channel", "surface", "cta_id", "target"],
    optional: ["position", "label"],
  },
  thank_you_cta_diagnostico: {
    pixelName: "TYCtaDiagnostico",
    required: ["source", "channel", "surface", "cta_id", "target"],
    optional: ["position", "label"],
  },
  thank_you_cta_whatsapp: {
    pixelStandard: "Contact",
    required: ["source", "channel", "surface", "location"],
    optional: ["cta_id", "position"],
  },
  thank_you_dismiss: {
    required: ["source", "channel", "surface"],
    optional: [],
  },
};

/** Stable CTA IDs used across modal + page so dashboards match. */
export const THANK_YOU_CTA = {
  PLANS: { id: "plans", event: "thank_you_cta_plans" as const, target: "/planos" },
  FAQ: { id: "faq", event: "thank_you_cta_faq" as const, target: "/faq" },
  DIAGNOSTICO: { id: "diagnostico", event: "thank_you_cta_diagnostico" as const },
  WHATSAPP: { id: "whatsapp", event: "thank_you_cta_whatsapp" as const },
  DISMISS: { event: "thank_you_dismiss" as const },
} as const;

/** Build a fully-typed payload for a Thank-You CTA event. */
export function buildThankYouCtaParams(args: {
  base: BaseAttrParams;
  surface: ThankYouSurface;
  ctaId: string;
  target: string;
  label?: string;
  position?: number;
}) {
  return {
    ...args.base,
    surface: args.surface,
    cta_id: args.ctaId,
    target: args.target,
    label: args.label,
    position: args.position,
    event_category: "engagement",
    conversion: true,
  };
}
