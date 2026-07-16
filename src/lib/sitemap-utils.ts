// Sprint 5 — shared sitemap helpers.
import type {} from "@tanstack/react-start";

const DEFAULT_BASE_URL = "https://0web.com.br";

// Always return the canonical production domain — sitemaps must advertise
// the indexable host, never the preview/staging origin the request came from.
export function resolveBaseUrl(_request?: Request): string {
  return DEFAULT_BASE_URL;
}

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export function renderSitemap(baseUrl: string, entries: SitemapEntry[]): Response {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${baseUrl}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
  });
}
