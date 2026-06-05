import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_SERVICE_SLUGS } from "@/lib/services-data";

export const Route = createFileRoute("/sitemap-services.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return renderSitemap(
          resolveBaseUrl(request),
          ALL_SERVICE_SLUGS.map((s) => ({
            path: `/${s}`,
            changefreq: "monthly" as const,
            priority: "0.85",
          })),
        );
      },
    },
  },
});
