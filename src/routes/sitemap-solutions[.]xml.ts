import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";
import { listServicesNav } from "@/lib/services-nav.functions";

export const Route = createFileRoute("/sitemap-solutions.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let slugs: string[] = [];
        try {
          const nav = await listServicesNav();
          slugs = nav.solutionsSitemap;
        } catch (err) {
          console.error("[sitemap-solutions] db read failed", err);
        }
        const entries = [
          { path: "/solucoes", changefreq: "weekly" as const, priority: "0.8" },
          ...[...new Set(slugs)].sort().map((s) => ({
            path: `/servicos/${s}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];
        return renderSitemap(resolveBaseUrl(request), entries);
      },
    },
  },
});
