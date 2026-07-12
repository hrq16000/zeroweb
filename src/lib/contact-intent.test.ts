import { describe, it, expect } from "vitest";
import {
  resolveFunnelFromIntent,
  assertAllowedFunnelSlug,
  serializeContactIntent,
  parseContactIntent,
  buildContactFallbackHref,
  type ContactIntent,
} from "./contact-intent";

const base: ContactIntent = {
  purpose: "diagnosis",
  source: "home_hero",
  pagePath: "/",
  placement: "hero",
};

describe("contact-intent", () => {
  it("resolves LGPD to funnel-lgpd, never to a commercial funnel", () => {
    expect(resolveFunnelFromIntent({ ...base, purpose: "lgpd" })).toBe("funnel-lgpd");
  });

  it("resolves order-support to its dedicated funnel", () => {
    expect(resolveFunnelFromIntent({ ...base, purpose: "order-support" })).toBe(
      "funnel-order-support",
    );
  });

  it("commercial + serviceSlug picks the service funnel", () => {
    expect(
      resolveFunnelFromIntent({ ...base, purpose: "commercial", serviceSlug: "seo" }),
    ).toBe("funnel-service");
  });

  it("commercial without service falls back to funnel-common", () => {
    expect(resolveFunnelFromIntent({ ...base, purpose: "commercial" })).toBe(
      "funnel-common",
    );
  });

  it("rejects an unknown funnel slug from external input", () => {
    expect(assertAllowedFunnelSlug("evil-funnel")).toBeNull();
    expect(assertAllowedFunnelSlug("funnel-service")).toBe("funnel-service");
    expect(assertAllowedFunnelSlug(null)).toBeNull();
  });

  it("serializes only known fields and drops PII", () => {
    const s = serializeContactIntent({
      ...base,
      serviceSlug: "seo",
      // Extra PII-shaped junk callers might try to smuggle in.
      // @ts-expect-error extra prop should be dropped
      email: "foo@bar.com",
      // @ts-expect-error extra prop should be dropped
      phone: "+55 41 99999-9999",
    });
    expect(s).toEqual({
      purpose: "diagnosis",
      source: "home_hero",
      pagePath: "/",
      placement: "hero",
      serviceSlug: "seo",
    });
  });

  it("parses a valid intent from URLSearchParams", () => {
    const p = parseContactIntent(
      new URLSearchParams({
        purpose: "commercial",
        source: "servicos_cta",
        pagePath: "/servicos/seo",
        placement: "section",
        serviceSlug: "seo",
      }),
    );
    expect(p?.purpose).toBe("commercial");
    expect(p?.serviceSlug).toBe("seo");
  });

  it("rejects unknown fields and invalid values", () => {
    const p = parseContactIntent({
      purpose: "hack",
      source: "x",
      pagePath: "https://evil.com",
      placement: "hero",
      serviceSlug: "seo",
      extra: "ignored",
    });
    expect(p).toBeNull();
  });

  it("builds an internal fallback href, never external", () => {
    const href = buildContactFallbackHref({ ...base, serviceSlug: "seo" });
    expect(href.startsWith("/contato?")).toBe(true);
    expect(href).not.toMatch(/wa\.me|whatsapp|mailto|tel:/);
  });

  it("lgpd fallback goes to /lgpd, not /contato", () => {
    const href = buildContactFallbackHref({ ...base, purpose: "lgpd" });
    expect(href.startsWith("/lgpd")).toBe(true);
  });

  it("rejects an oversized source value", () => {
    const big = "x".repeat(500);
    const p = parseContactIntent({
      purpose: "commercial",
      source: big,
      pagePath: "/",
      placement: "hero",
    });
    // source regex allows the chars but our slice caps size; the parser also
    // rejects when regex fails — 'x' repeated matches SOURCE_RE, so we assert
    // the length was truncated to <=120.
    expect(p?.source.length ?? 0).toBeLessThanOrEqual(120);
  });
});
