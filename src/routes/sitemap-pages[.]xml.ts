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
          { path: "/servicos/parceiros", changefreq: "monthly", priority: "0.7" },
          { path: "/servicos/marketplace", changefreq: "weekly", priority: "0.85" },
          { path: "/servicos/google-meu-negocio", changefreq: "weekly", priority: "0.9" },
          { path: "/servicos/presenca-digital", changefreq: "weekly", priority: "0.85" },
          { path: "/servicos/site-pro", changefreq: "weekly", priority: "0.9" },
          { path: "/infraestrutura", changefreq: "monthly", priority: "0.8" },
          { path: "/sites", changefreq: "weekly", priority: "0.85" },
          { path: "/sites/restaurantes", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/advocacia", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/imobiliarias", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/clinicas", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/oficinas", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/lojas", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/comercios", changefreq: "monthly", priority: "0.75" },
          { path: "/sites/prestadores-de-servicos", changefreq: "monthly", priority: "0.75" },
          { path: "/planos-comparativo", changefreq: "monthly", priority: "0.9" },
          { path: "/servicos/trafego-pago-local", changefreq: "weekly", priority: "0.85" },
          { path: "/servicos/consultoria", changefreq: "monthly", priority: "0.75" },
          { path: "/areas-de-atendimento", changefreq: "weekly", priority: "0.9" },
          { path: "/cidades", changefreq: "weekly", priority: "0.85" },
          { path: "/estados", changefreq: "weekly", priority: "0.75" },

          { path: "/cases", changefreq: "weekly", priority: "0.8" },
          { path: "/blog", changefreq: "weekly", priority: "0.8" },
          { path: "/planos", changefreq: "monthly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/solucoes", changefreq: "weekly", priority: "0.85" },
          { path: "/mapa-do-site", changefreq: "monthly", priority: "0.4" },
          { path: "/calculadora-orcamento", changefreq: "monthly", priority: "0.8" },
          { path: "/blog-skyscraper", changefreq: "weekly", priority: "0.85" },
          { path: "/solicitar-diagnostico", changefreq: "monthly", priority: "0.85" },
          { path: "/politica-privacidade", changefreq: "yearly", priority: "0.2" },
          { path: "/privacidade", changefreq: "yearly", priority: "0.2" },
          { path: "/termos", changefreq: "yearly", priority: "0.2" },
          { path: "/rss.xml", changefreq: "daily", priority: "0.5" },
        ]);
      },
    },
  },
});
