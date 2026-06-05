// Sitemap INDEX — lists all specialized sitemaps. Sprint 5.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const DEFAULT_BASE_URL = "https://0web.com.br";

function resolveBaseUrl(request: Request): string {
  try {
    const host = request.headers.get("host") ?? "";
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  } catch {}
  return DEFAULT_BASE_URL;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const BASE_URL = resolveBaseUrl(request);
        const today = new Date().toISOString().slice(0, 10);
        const children = [
          "sitemap-pages.xml",
          "sitemap-services.xml",
          "sitemap-cities.xml",
          "sitemap-city-services.xml",
          "sitemap-blog.xml",
          "sitemap-cases.xml",
          "sitemap-marketplace.xml",
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...children.map(
            (c) =>
              `  <sitemap><loc>${BASE_URL}/${c}</loc><lastmod>${today}</lastmod></sitemap>`,
          ),
          `</sitemapindex>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
