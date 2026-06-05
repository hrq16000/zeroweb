// Sprint 12 — Sitemap específico para hubs editoriais
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { CLUSTERS } from "@/lib/content-taxonomy";

export const Route = createFileRoute("/sitemap-editorial.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const host = request.headers.get("host") ?? "0web.com.br";
        const proto = request.headers.get("x-forwarded-proto") ?? "https";
        const base = `${proto}://${host}`;
        const today = new Date().toISOString().slice(0, 10);
        const urls = [
          `${base}/blog/mapa`,
          ...CLUSTERS.map((c) => `${base}${c.hubPath}`),
          ...CLUSTERS.map((c) => `${base}/blog/cluster/${c.slug}`),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls.map(
            (u) =>
              `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
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
