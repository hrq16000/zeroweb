import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_SERVICE_SLUGS } from "@/lib/services-data";
import { listServicesPublic } from "@/lib/services-public.functions";

export const Route = createFileRoute("/sitemap-services.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // União DB (is_active) + arquivo estático — dedupe por slug.
        const slugs = new Set<string>(ALL_SERVICE_SLUGS);
        try {
          const { services } = await listServicesPublic();
          for (const s of services) slugs.add(s.slug);
        } catch (err) {
          console.error("[sitemap-services] db read failed, using static slugs", err);
        }
        return renderSitemap(
          resolveBaseUrl(request),
          [...slugs].sort().map((s) => ({
            path: `/servicos/${s}`,
            changefreq: "monthly" as const,
            priority: "0.85",
          })),
        );
      },
    },
  },
});
