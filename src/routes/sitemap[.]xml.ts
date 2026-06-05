import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { posts } from "@/lib/blog-data";
import { cases } from "@/lib/cases-data";
import { SERVICES_DICT, CITIES_DICT } from "@/lib/seo";

const DEFAULT_BASE_URL = "https://0web.com.br";

function resolveBaseUrl(request: Request): string {
  try {
    const host = request.headers.get("host") ?? "";
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    // Use the request host for lovable preview/published domains so the
    // sitemap validates on whichever domain is crawling it. Fall back to the
    // canonical production domain otherwise.
    if (host.endsWith("lovable.app") || host.startsWith("localhost")) {
      return `${proto}://${host}`;
    }
    if (host) return `${proto}://${host}`;
  } catch {}
  return DEFAULT_BASE_URL;
}

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const serviceSlugs = Object.keys(SERVICES_DICT);
        const citySlugs = Object.keys(CITIES_DICT);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/sobre", changefreq: "monthly", priority: "0.7" },
          { path: "/contato", changefreq: "monthly", priority: "0.8" },
          { path: "/google-meu-negocio", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "daily", priority: "0.9" },
          { path: "/rss.xml", changefreq: "daily", priority: "0.5" },
          { path: "/politica-privacidade", changefreq: "yearly", priority: "0.2" },
          { path: "/termos", changefreq: "yearly", priority: "0.2" },
          // Service hubs
          ...serviceSlugs.map((s) => ({
            path: `/${s}`,
            changefreq: "monthly" as const,
            priority: "0.85",
          })),
          // City × Service (only the 6 services exposed by the geo route)
          ...citySlugs.flatMap((c) =>
            ["criacao-de-sites", "landing-pages", "loja-virtual", "seo", "marketing-digital", "automacao-com-ia"]
              .map((s) => ({
                path: `/${c}/${s}`,
                changefreq: "monthly" as const,
                priority: "0.7",
              })),
          ),
          // Cases
          ...cases.map((c) => ({
            path: `/cases/${c.slug}`,
            changefreq: "monthly" as const,
            priority: "0.75",
          })),
          // Blog posts
          ...posts.map((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.date,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
