import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_STATE_SLUGS } from "@/lib/geo-data";

export const Route = createFileRoute("/sitemap-cities.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return renderSitemap(
          resolveBaseUrl(request),
          ALL_STATE_SLUGS.map((s) => ({
            path: `/estados/${s}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        );
      },
    },
  },
});
