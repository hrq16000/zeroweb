import { createFileRoute } from "@tanstack/react-router";
import { DyzPromoPage } from "./dyzpromo";

const TITLE = "D.Y.Z Promo · Portfólio de Sites 0WEB";
const DESC =
  "Conheça a página demonstrativa criada pela 0WEB para a D.Y.Z Promo, especialista em divulgação, panfletagem e ações promocionais em Curitiba e região.";
const URL = "https://0web.com.br/portfolio/dyzpromo";

export const Route = createFileRoute("/portfolio/dyzpromo")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "0WEB" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": URL,
          url: URL,
          name: TITLE,
          description: DESC,
          inLanguage: "pt-BR",
          isPartOf: { "@type": "WebSite", "@id": "https://0web.com.br/#website" },
          about: { "@type": "LocalBusiness", name: "D.Y.Z Promo", taxID: "68.500.745/0001-53" },
        }),
      },
    ],
  }),
  component: DyzPromoPage,
});
