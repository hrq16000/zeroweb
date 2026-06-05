import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { cases } from "@/lib/cases-data";

export const Route = createFileRoute("/sitemap-cases.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return renderSitemap(
          resolveBaseUrl(request),
          cases.map((c) => ({
            path: `/cases/${c.slug}`,
            changefreq: "monthly" as const,
            priority: "0.75",
          })),
        );
      },
    },
  },
});
