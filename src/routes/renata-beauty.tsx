import { createFileRoute } from "@tanstack/react-router";
import { RenataBeautyView } from "@/components/site/RenataBeautyView";

const TITLE = "Renata Beauty Studio · Cílios, Unhas & Estética em Boneca do Iguaçu";
const DESC =
  "Promoção de Inauguração! Cílios Volume Egípcio ou Brasileiro por apenas R$ 100,00. Especialista em Extensão de Cílios, Unhas de Fibra, Sobrancelhas e Spa dos Pés no Boneca do Iguaçu.";
const URL = "https://0web.com.br/renata-beauty";

export const Route = createFileRoute("/renata-beauty")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: "✨ Promoção de Inauguração — Renata Beauty Studio" },
      { property: "og:description", content: "Cílios Volume Egípcio ou Brasileiro por apenas R$ 100,00 no Boneca do Iguaçu!" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://0web.com.br/images/renata-beauty-flyer.jpg" },
      { property: "og:image:alt", content: "Renata Beauty Studio - Promoção Inauguração" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/images/renata-beauty-flyer.jpg" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BeautySalon",
              "@id": `${URL}#salon`,
              name: "Espaço Renata Beauty Studio",
              url: URL,
              telephone: "+55 41 9604-8639",
              priceRange: "R$ 50 - R$ 180",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Rua Rondônia, 300",
                addressLocality: "Boneca do Iguaçu",
                addressRegion: "PR",
                addressCountry: "BR",
              },
              sameAs: ["https://www.instagram.com/renatabeautystudiio/"],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Portfólio", item: "https://0web.com.br/portfolio" },
                { "@type": "ListItem", position: 3, name: "Renata Beauty", item: URL },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: RenataBeautyView,
});
