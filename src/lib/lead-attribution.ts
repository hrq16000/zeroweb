import { getAttributionPayload, getActiveUtms } from "@/lib/site-config";
import { getThankYouContent, type ThankYouContent } from "@/lib/thank-you-content";

export type LeadAttribution = {
  source: string;
  channel: ThankYouContent["channel"];
  content: ThankYouContent;
  ctx: string;
  utms: Record<string, string>;
  landing_page: string | null;
  page_path: string | null;
  referrer: string | null;
  gclid: string | null;
  fbclid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
};

/**
 * Single source of truth for lead attribution. Modal, WhatsApp message and
 * obrigado page all derive their channel/source/utm from this helper so the
 * persisted lead, GA4/Pixel events and CTAs stay consistent.
 */
export function getLeadAttribution(source: string, ctx?: string): LeadAttribution {
  const content = getThankYouContent(source);
  const attr = getAttributionPayload();
  return {
    source,
    channel: content.channel,
    content,
    ctx: ctx || `${content.channel}_form`,
    utms: getActiveUtms(),
    landing_page: attr.landing_page ?? null,
    page_path: typeof window !== "undefined" ? window.location.pathname : null,
    referrer: attr.referrer ?? null,
    gclid: attr.gclid ?? null,
    fbclid: attr.fbclid ?? null,
    utm_source: attr.utm_source ?? null,
    utm_medium: attr.utm_medium ?? null,
    utm_campaign: attr.utm_campaign ?? null,
    utm_term: attr.utm_term ?? null,
    utm_content: attr.utm_content ?? null,
  };
}

/** Compact attribution object suitable for embedding in event params / lead payload. */
export function attributionToEventParams(a: LeadAttribution) {
  return {
    source: a.source,
    channel: a.channel,
    utm_source: a.utm_source || "(direct)",
    utm_medium: a.utm_medium || "(none)",
    utm_campaign: a.utm_campaign || "(none)",
    utm_content: a.utm_content || "(none)",
    landing_page: a.landing_page || a.page_path || "/",
    has_gclid: a.gclid ? true : false,
    has_fbclid: a.fbclid ? true : false,
  };
}
