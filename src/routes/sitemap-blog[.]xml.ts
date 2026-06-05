import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { posts } from "@/lib/blog-data";

export const Route = createFileRoute("/sitemap-blog.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return renderSitemap(resolveBaseUrl(request), [
          { path: "/blog", changefreq: "daily" as const, priority: "0.9" },
          ...posts.map((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.date,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
        ]);
      },
    },
  },
});
