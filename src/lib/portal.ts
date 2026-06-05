/**
 * Portal resolution (multi-tenant).
 * Resolves the active portal from the request hostname.
 */
export type PortalSummary = {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  aliases: string[];
  status: string;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  brand: Record<string, unknown>;
  contact: Record<string, unknown>;
  seo: Record<string, unknown>;
  social: Record<string, unknown>;
  settings: Record<string, unknown>;
  is_default: boolean;
};

export function matchPortal(portals: PortalSummary[], hostname: string): PortalSummary | null {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  let match = portals.find((p) => (p.domain || "").toLowerCase() === host);
  if (match) return match;
  match = portals.find((p) => (p.aliases || []).some((a) => a.toLowerCase() === host));
  if (match) return match;
  return portals.find((p) => p.is_default) || null;
}

export function getCurrentHostname(): string {
  if (typeof window !== "undefined") return window.location.hostname;
  return "";
}
