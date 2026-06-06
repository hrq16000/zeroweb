import { describe, expect, test } from "bun:test";
import {
  computeCanonicalRedirect,
  detectRedirectConflicts,
  shouldSkipCanonical,
} from "./canonical-redirect.helpers";

const empty = new Map<string, { to: string; status: number }>();

describe("shouldSkipCanonical", () => {
  test.each([
    "/assets/app.js",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/api/public/webhook",
    "/_build/foo",
    "/img.png",
    "/styles.css",
  ])("skips %s", (p) => {
    expect(shouldSkipCanonical(p)).toBe(true);
  });

  test.each(["/", "/blog", "/blog/post-x", "/categoria/seo"])(
    "does not skip %s",
    (p) => expect(shouldSkipCanonical(p)).toBe(false),
  );
});

describe("computeCanonicalRedirect — host/proto normalization (308)", () => {
  test("redirects www → apex with 308", () => {
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://www.0web.com.br/blog",
      forwardedProto: "https",
      redirects: empty,
    });
    expect(d).not.toBeNull();
    expect(d!.status).toBe(308);
    expect(d!.location).toBe("https://0web.com.br/blog");
    expect(d!.source).toBe("host");
  });

  test("redirects http → https on prod host", () => {
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "http://0web.com.br/sobre",
      forwardedProto: "http",
      redirects: empty,
    });
    expect(d).not.toBeNull();
    expect(d!.status).toBe(308);
    expect(d!.location).toBe("https://0web.com.br/sobre");
  });

  test("does not force https on preview hosts", () => {
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://preview--abc.lovable.app/sobre",
      forwardedProto: "https",
      redirects: empty,
    });
    expect(d).toBeNull();
  });
});

describe("computeCanonicalRedirect — trailing slash (308)", () => {
  test("strips trailing slash", () => {
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/blog/",
      forwardedProto: "https",
      redirects: empty,
    });
    expect(d!.status).toBe(308);
    expect(d!.location).toBe("https://0web.com.br/blog");
  });

  test("does not strip root", () => {
    expect(
      computeCanonicalRedirect({
        method: "GET",
        url: "https://0web.com.br/",
        forwardedProto: "https",
        redirects: empty,
      }),
    ).toBeNull();
  });

  test("preserves query string when stripping slash", () => {
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/blog/?utm_source=x",
      forwardedProto: "https",
      redirects: empty,
    });
    expect(d!.location).toBe("https://0web.com.br/blog?utm_source=x");
  });
});

describe("computeCanonicalRedirect — custom redirects table", () => {
  test("applies 301 from table", () => {
    const map = new Map([["/antigo", { to: "/novo", status: 301 }]]);
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/antigo",
      forwardedProto: "https",
      redirects: map,
    });
    expect(d!.status).toBe(301);
    expect(d!.location).toBe("https://0web.com.br/novo");
    expect(d!.source).toBe("custom");
  });

  test("applies 308 from table when configured", () => {
    const map = new Map([["/x", { to: "/y", status: 308 }]]);
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/x",
      forwardedProto: "https",
      redirects: map,
    });
    expect(d!.status).toBe(308);
  });

  test("supports absolute target URLs", () => {
    const map = new Map([["/ext", { to: "https://other.com/x", status: 301 }]]);
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/ext",
      forwardedProto: "https",
      redirects: map,
    });
    expect(d!.location).toBe("https://other.com/x");
  });

  test("custom redirect collapses trailing slash + table lookup in one hop", () => {
    // /antigo/ strips to /antigo, then matches the table → single 301 to /novo.
    // Locks the current behavior (one redirect, not two).
    const map = new Map([["/antigo", { to: "/novo", status: 301 }]]);
    const d = computeCanonicalRedirect({
      method: "GET",
      url: "https://0web.com.br/antigo/",
      forwardedProto: "https",
      redirects: map,
    });
    expect(d!.status).toBe(301);
    expect(d!.location).toBe("https://0web.com.br/novo");
  });
});

describe("computeCanonicalRedirect — pass-through cases", () => {
  test("ignores POST/PUT methods", () => {
    expect(
      computeCanonicalRedirect({
        method: "POST",
        url: "https://www.0web.com.br/blog/",
        forwardedProto: "https",
        redirects: empty,
      }),
    ).toBeNull();
  });

  test("returns null when already canonical", () => {
    expect(
      computeCanonicalRedirect({
        method: "GET",
        url: "https://0web.com.br/blog",
        forwardedProto: "https",
        redirects: empty,
      }),
    ).toBeNull();
  });
});

describe("detectRedirectConflicts", () => {
  test("flags self-loops", () => {
    const conflicts = detectRedirectConflicts([
      { from_path: "/x", to_path: "/x", status_code: 301 },
    ]);
    expect(conflicts).toEqual([
      expect.objectContaining({ kind: "self_loop", from_path: "/x" }),
    ]);
  });

  test("flags two-step cycles", () => {
    const conflicts = detectRedirectConflicts([
      { from_path: "/a", to_path: "/b", status_code: 301 },
      { from_path: "/b", to_path: "/a", status_code: 301 },
    ]);
    expect(conflicts.filter((c) => c.kind === "cycle")).toHaveLength(2);
  });

  test("flags chains (a→b→c)", () => {
    const conflicts = detectRedirectConflicts([
      { from_path: "/a", to_path: "/b", status_code: 301 },
      { from_path: "/b", to_path: "/c", status_code: 301 },
    ]);
    expect(conflicts.some((c) => c.kind === "chain_to_redirected")).toBe(true);
  });

  test("flags duplicate from_path", () => {
    const conflicts = detectRedirectConflicts([
      { from_path: "/a", to_path: "/b", status_code: 301 },
      { from_path: "/a", to_path: "/c", status_code: 301 },
    ]);
    expect(conflicts.some((c) => c.kind === "duplicate_from")).toBe(true);
  });

  test("no conflicts for clean dataset", () => {
    expect(
      detectRedirectConflicts([
        { from_path: "/a", to_path: "/b", status_code: 301 },
        { from_path: "/c", to_path: "/d", status_code: 308 },
      ]),
    ).toEqual([]);
  });
});
