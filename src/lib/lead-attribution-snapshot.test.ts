// @vitest-environment happy-dom
import { describe, expect, it, beforeEach } from "vitest";
import { saveAttributionSnapshot, loadAttributionSnapshot, clearAttributionSnapshot } from "./lead-attribution-snapshot";
import type { LeadAttribution } from "./lead-attribution";

// jsdom provides sessionStorage in vitest by default.
const sample: LeadAttribution = {
  source: "contact_form_whatsapp",
  channel: "contato",
  // content shape used by ThankYou — only required fields filled here
  content: { channel: "contato" } as any,
  ctx: "contact_form",
  utms: { utm_source: "google", utm_medium: "cpc" },
  landing_page: "/",
  page_path: "/contato",
  referrer: null,
  gclid: "abc",
  fbclid: null,
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "brand",
  utm_term: null,
  utm_content: null,
};

describe("lead-attribution snapshot", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null when empty", () => {
    expect(loadAttributionSnapshot()).toBeNull();
  });

  it("round-trips a saved snapshot", () => {
    saveAttributionSnapshot(sample);
    const got = loadAttributionSnapshot();
    expect(got?.source).toBe("contact_form_whatsapp");
    expect(got?.utm_source).toBe("google");
    expect(got?.gclid).toBe("abc");
  });

  it("clears when TTL is expired", () => {
    saveAttributionSnapshot(sample);
    // Force-expire by rewriting envelope with past expires_at
    const raw = sessionStorage.getItem("0web_last_lead_attr_v1")!;
    const env = JSON.parse(raw);
    env.expires_at = Date.now() - 1;
    sessionStorage.setItem("0web_last_lead_attr_v1", JSON.stringify(env));
    expect(loadAttributionSnapshot()).toBeNull();
    expect(sessionStorage.getItem("0web_last_lead_attr_v1")).toBeNull();
  });

  it("clearAttributionSnapshot removes the key", () => {
    saveAttributionSnapshot(sample);
    clearAttributionSnapshot();
    expect(loadAttributionSnapshot()).toBeNull();
  });
});
