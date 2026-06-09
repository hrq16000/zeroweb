import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_CWB_NEIGHBORHOOD_SLUGS } from "@/lib/curitiba-neighborhoods";

export const Route = createFileRoute("/sitemap-cwb-neighborhoods.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const urls = [
          { path: "/bairros-cwb", changefreq: "weekly" as const, priority: "0.8" },
          ...ALL_CWB_NEIGHBORHOOD_SLUGS.map((slug) => ({
            path: `/bairros-cwb/${slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];
        return renderSitemap(resolveBaseUrl(request), urls);
      },
    },
  },
});
