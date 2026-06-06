import { createFileRoute } from "@tanstack/react-router";
import { resolveBaseUrl, renderSitemap } from "@/lib/sitemap-utils";

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const today = new Date().toISOString().slice(0, 10);
        return renderSitemap(resolveBaseUrl(request), [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
          { path: "/servicos", changefreq: "weekly", priority: "0.95" },
          { path: "/sobre", changefreq: "monthly", priority: "0.7" },
          { path: "/contato", changefreq: "monthly", priority: "0.8" },
          { path: "/solicitar-orcamento", changefreq: "monthly", priority: "0.85" },
          { path: "/parceiros", changefreq: "monthly", priority: "0.7" },
          { path: "/marketplace", changefreq: "weekly", priority: "0.85" },
          { path: "/google-meu-negocio", changefreq: "weekly", priority: "0.9" },
          { path: "/presenca-digital", changefreq: "weekly", priority: "0.85" },
          { path: "/trafego-pago-local", changefreq: "weekly", priority: "0.85" },
          { path: "/consultoria", changefreq: "monthly", priority: "0.75" },
          { path: "/cidades", changefreq: "weekly", priority: "0.85" },
          { path: "/estados", changefreq: "weekly", priority: "0.75" },
          { path: "/cases", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/planos", changefreq: "monthly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/politica-privacidade", changefreq: "yearly", priority: "0.2" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.2" },
          { path: "/termos", changefreq: "yearly", priority: "0.2" },
          { path: "/rss.xml", changefreq: "daily", priority: "0.5" },
        ]);
      },
    },
  },
});
