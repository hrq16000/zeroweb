import { describe, expect, test } from "bun:test";
import {
  decideTracking,
  hasAnalyticsConsent,
  parseCookies,
  shouldSkip,
} from "./tracking-middleware.helpers";

const consentGranted = encodeURIComponent(
  JSON.stringify({ decided: true, analytics_storage: "granted" }),
);
const consentDenied = encodeURIComponent(
  JSON.stringify({ decided: true, analytics_storage: "denied" }),
);

describe("shouldSkip — asset filter", () => {
  test.each([
    "/assets/app.js",
    "/favicon.ico",
    "/static/logo.png",
    "/styles/main.css",
    "/img.jpeg",
    "/font.woff2",
    "/api/public/hooks/cron",
    "/_build/something",
    "/_server/foo",
    "/robots.txt",
    "/sitemap.xml",
  ])("skips %s", (p) => {
    expect(shouldSkip(p)).toBe(true);
  });

  test.each(["/", "/blog/post-1", "/app/admin", "/servicos/calculadora"])(
    "tracks %s",
    (p) => {
      expect(shouldSkip(p)).toBe(false);
    },
  );
});

describe("parseCookies", () => {
  test("parses multiple cookies and trims whitespace", () => {
    expect(parseCookies("a=1; b=two; c=three%20words")).toEqual({
      a: "1",
      b: "two",
      c: "three words",
    });
  });
  test("returns empty for null/empty", () => {
    expect(parseCookies(null)).toEqual({});
    expect(parseCookies("")).toEqual({});
  });
});

describe("hasAnalyticsConsent", () => {
  test("true only when decided=true AND analytics_storage=granted", () => {
    expect(hasAnalyticsConsent({ "0web_consent_v1": decodeURIComponent(consentGranted) })).toBe(true);
    expect(hasAnalyticsConsent({ "0web_consent_v1": decodeURIComponent(consentDenied) })).toBe(false);
    expect(hasAnalyticsConsent({})).toBe(false);
    expect(hasAnalyticsConsent({ "0web_consent_v1": "not-json" })).toBe(false);
  });
});

describe("decideTracking", () => {
  const baseDoc = { method: "GET", accept: "text/html,*/*" };

  test("skips assets and non-HTML requests", () => {
    expect(decideTracking({ ...baseDoc, pathname: "/assets/x.js", cookieHeader: null }).action).toBe("skip");
    expect(decideTracking({ method: "POST", pathname: "/", accept: "text/html", cookieHeader: null }).action).toBe("skip");
    expect(decideTracking({ method: "GET", pathname: "/", accept: "application/json", cookieHeader: null }).action).toBe("skip");
  });

  test("ephemeral path when consent missing or denied — no Set-Cookie, no insert", () => {
    const a = decideTracking({ ...baseDoc, pathname: "/", cookieHeader: null });
    expect(a.action).toBe("track-ephemeral");
    if (a.action === "track-ephemeral") expect(a.visitorId).toMatch(/^[0-9a-f-]{36}$/i);

    const b = decideTracking({ ...baseDoc, pathname: "/", cookieHeader: `0web_consent_v1=${consentDenied}` });
    expect(b.action).toBe("track-ephemeral");
  });

  test("consent granted + no cookie → sets HttpOnly cookie", () => {
    const r = decideTracking({ ...baseDoc, pathname: "/", cookieHeader: `0web_consent_v1=${consentGranted}` });
    expect(r.action).toBe("track");
    if (r.action !== "track") return;
    expect(r.setCookie).toContain("0web_vid=");
    expect(r.setCookie).toContain("HttpOnly");
    expect(r.setCookie).toContain("Max-Age=63072000");
    expect(r.setCookie).toContain("SameSite=Lax");
    expect(r.ephemeral).toBe(false);
  });

  test("consent granted + existing cookie → reuses id, no Set-Cookie (dedup)", () => {
    const existing = "11111111-2222-3333-4444-555555555555";
    const r = decideTracking({
      ...baseDoc,
      pathname: "/pricing",
      cookieHeader: `0web_vid=${existing}; 0web_consent_v1=${consentGranted}`,
    });
    expect(r.action).toBe("track");
    if (r.action !== "track") return;
    expect(r.visitorId).toBe(existing);
    expect(r.setCookie).toBeNull();
  });
});
