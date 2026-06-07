import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { ALL_SERVICE_SLUGS } from "@/lib/services-data";
import { listServicesNav } from "@/lib/services-nav.functions";

export const Route = createFileRoute("/sitemap-services.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Banco é fonte de verdade — respeita flag show_in_sitemap.
        // Fallback para slugs estáticos quando o DB não responde.
        let slugs: string[] = [];
        try {
          const nav = await listServicesNav();
          slugs = nav.sitemap;
        } catch (err) {
          console.error("[sitemap-services] db read failed, using static slugs", err);
        }
        if (slugs.length === 0) slugs = [...ALL_SERVICE_SLUGS];
        return renderSitemap(
          resolveBaseUrl(request),
          [...new Set(slugs)].sort().map((s) => ({
            path: `/servicos/${s}`,
            changefreq: "monthly" as const,
            priority: "0.85",
          })),
        );
      },
    },
  },
});
