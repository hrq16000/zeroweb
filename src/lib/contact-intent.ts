/**
 * ContactIntent — foundation for the Funnel-first policy.
 *
 * Every public contact CTA on the site must express *why* the user is trying
 * to reach the company, not a raw destination. A central resolver decides
 * which funnel (from a small allowlist) satisfies that intent — the caller
 * never picks a slug directly. Query strings, page data and marker CTAs are
 * parsed through this module so an attacker cannot force an arbitrary
 * funnel slug, external URL or PII to flow into the modal.
 */

export type ContactPurpose =
  | "commercial"
  | "diagnosis"
  | "proposal"
  | "partnership"
  | "lgpd"
  | "order-support";

export type ContactPlacement =
  | "header"
  | "hero"
  | "section"
  | "article"
  | "footer"
  | "sticky-mobile"
  | "case-final"
  | "error-state"
  | "contact-page";

export type ContactIntent = {
  purpose: ContactPurpose;
  source: string;
  pagePath: string;
  placement: ContactPlacement;

  serviceSlug?: string;
  citySlug?: string;
  neighborhoodSlug?: string;
  companySlug?: string;
  professionalSlug?: string;
  caseSlug?: string;
  contentSlug?: string;
  campaign?: string;
};

// ---------------- validation helpers ----------------

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const SOURCE_RE = /^[a-z0-9_\-.:/]{1,120}$/i;
const PAGE_PATH_RE = /^\/[a-z0-9\-_/.$]{0,200}$/i;

const PURPOSES: readonly ContactPurpose[] = [
  "commercial",
  "diagnosis",
  "proposal",
  "partnership",
  "lgpd",
  "order-support",
];
const PLACEMENTS: readonly ContactPlacement[] = [
  "header",
  "hero",
  "section",
  "article",
  "footer",
  "sticky-mobile",
  "case-final",
  "error-state",
  "contact-page",
];

function isSlug(v: unknown): v is string {
  return typeof v === "string" && SLUG_RE.test(v);
}
function optionalSlug(v: unknown): string | undefined {
  return isSlug(v) ? v : undefined;
}

/** Small, safe funnel allowlist. Nothing else may be resolved. */
const ALLOWED_FUNNELS = new Set([
  "funnel-common",
  "funnel-service",
  "funnel-post",
  "funnel-partner",
  "funnel-lgpd",
  "funnel-order-support",
]);

/**
 * Resolve which funnel slug should be opened for a given intent.
 *
 * The resolver is intentionally narrow: purpose alone decides the funnel
 * family. `serviceSlug` and friends are passed through to the funnel runtime
 * as *context* (persisted with the lead) but never used to pick a slug.
 */
export function resolveFunnelFromIntent(intent: ContactIntent): string {
  switch (intent.purpose) {
    case "lgpd":
      return "funnel-lgpd";
    case "order-support":
      return "funnel-order-support";
    case "partnership":
      return "funnel-partner";
    case "diagnosis":
    case "commercial":
    case "proposal":
      if (intent.serviceSlug) return "funnel-service";
      if (intent.contentSlug || intent.caseSlug) return "funnel-post";
      return "funnel-common";
  }
}

/**
 * Validate an externally-supplied funnel slug (e.g. loaded from
 * `services.funnels` in the database) against the allowlist. Returns null
 * when the slug is unknown so callers can fall back to the resolver.
 */
export function assertAllowedFunnelSlug(slug: string | null | undefined): string | null {
  if (typeof slug !== "string") return null;
  if (!ALLOWED_FUNNELS.has(slug)) return null;
  return slug;
}

// ---------------- serialization ----------------

const FIELDS: readonly (keyof ContactIntent)[] = [
  "purpose",
  "source",
  "pagePath",
  "placement",
  "serviceSlug",
  "citySlug",
  "neighborhoodSlug",
  "companySlug",
  "professionalSlug",
  "caseSlug",
  "contentSlug",
  "campaign",
];

const MAX_LEN = 120;

/** Serialize intent into a compact, URL-safe search-param bag. */
export function serializeContactIntent(intent: ContactIntent): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of FIELDS) {
    const v = intent[k];
    if (typeof v !== "string" || !v) continue;
    out[k] = v.slice(0, MAX_LEN);
  }
  return out;
}

/**
 * Best-effort parse of an intent-shaped search-params object.
 * Rejects unknown fields, oversized values and anything that looks like an
 * external URL / PII. Returns null when the required fields are missing.
 */
export function parseContactIntent(
  search: Record<string, unknown> | URLSearchParams | null | undefined,
): ContactIntent | null {
  if (!search) return null;
  const get = (k: string): unknown =>
    search instanceof URLSearchParams ? search.get(k) : (search as Record<string, unknown>)[k];

  const purposeRaw = get("purpose");
  const placementRaw = get("placement");
  const sourceRaw = get("source");
  const pageRaw = get("pagePath");

  const purpose = typeof purposeRaw === "string" && (PURPOSES as string[]).includes(purposeRaw)
    ? (purposeRaw as ContactPurpose)
    : null;
  const placement = typeof placementRaw === "string" && (PLACEMENTS as string[]).includes(placementRaw)
    ? (placementRaw as ContactPlacement)
    : null;
  const source = typeof sourceRaw === "string" && SOURCE_RE.test(sourceRaw) ? sourceRaw : null;
  const pagePath = typeof pageRaw === "string" && PAGE_PATH_RE.test(pageRaw) ? pageRaw : null;

  if (!purpose || !placement || !source || !pagePath) return null;

  return {
    purpose,
    placement,
    source: source.slice(0, MAX_LEN),
    pagePath: pagePath.slice(0, MAX_LEN),
    serviceSlug: optionalSlug(get("serviceSlug")),
    citySlug: optionalSlug(get("citySlug")),
    neighborhoodSlug: optionalSlug(get("neighborhoodSlug")),
    companySlug: optionalSlug(get("companySlug")),
    professionalSlug: optionalSlug(get("professionalSlug")),
    caseSlug: optionalSlug(get("caseSlug")),
    contentSlug: optionalSlug(get("contentSlug")),
    campaign: optionalSlug(get("campaign")),
  };
}

/**
 * Build the accessibility / no-JS fallback href for a CTA.
 * Always resolves to an internal path — never an external URL, never a
 * `wa.me` / `mailto:` / `tel:`. The intent travels as opaque query params so
 * `/contato` (or `/lgpd`) can pre-select the correct funnel.
 */
export function buildContactFallbackHref(intent: ContactIntent): string {
  const base = intent.purpose === "lgpd" ? "/lgpd" : "/contato";
  const params = new URLSearchParams(serializeContactIntent(intent));
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
