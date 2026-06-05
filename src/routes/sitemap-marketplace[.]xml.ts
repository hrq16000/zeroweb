import { createFileRoute } from "@tanstack/react-router";
import { listSitemapEntries } from "@/lib/marketplace.functions";
import { ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/sitemap-marketplace.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { providers, companies, categories } = await listSitemapEntries();
        const urls: string[] = [
          `${ORIGIN}/marketplace`,
          `${ORIGIN}/solicitar-orcamento`,
        ];
        for (const c of categories) urls.push(`${ORIGIN}/categoria/${c.slug}`);
        for (const p of providers) urls.push(`${ORIGIN}/profissional/${p.slug}`);
        for (const co of companies) urls.push(`${ORIGIN}/empresa/${co.slug}`);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
