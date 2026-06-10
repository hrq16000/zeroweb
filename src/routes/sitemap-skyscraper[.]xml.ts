import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";

export const Route = createFileRoute("/sitemap-skyscraper.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const host = request.headers.get("host") ?? "0web.com.br";
        const proto = request.headers.get("x-forwarded-proto") ?? "https";
        const base = `${proto}://${host}`;
        const today = new Date().toISOString().slice(0, 10);
        const urls = [
          `${base}/blog-skyscraper`,
          ...SKYSCRAPER_CALENDAR.map((a) => `${base}/blog-skyscraper/${a.slug}`),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map(
            (u) =>
              `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          ),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
