// Sitemap dos bairros de BH (hub + 30 leaves).
import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_BH_NEIGHBORHOOD_SLUGS } from "@/lib/bh-neighborhoods";

export const Route = createFileRoute("/sitemap-bh-neighborhoods.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urls = [
          { path: "/bairros-bh", changefreq: "weekly" as const, priority: "0.8" },
          ...ALL_BH_NEIGHBORHOOD_SLUGS.map((slug) => ({
            path: `/bairros-bh/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];
        return renderSitemap(resolveBaseUrl(request), urls);
      },
    },
  },
});
