import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_CITY_SLUGS } from "@/lib/geo-data";
import { GEO_SERVICE_SLUGS } from "@/lib/services-data";

export const Route = createFileRoute("/sitemap-city-services.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const entries = ALL_CITY_SLUGS.flatMap((c) =>
          GEO_SERVICE_SLUGS.map((s) => ({
            path: `/${c}/${s}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        );
        return renderSitemap(resolveBaseUrl(request), entries);
      },
    },
  },
});
