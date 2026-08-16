import { createFileRoute } from "@tanstack/react-router";
import { RenataBeautyView } from "@/components/site/RenataBeautyView";

const TITLE = "Renata Beauty Studio · Portfólio de Sites 0WEB";
const DESC = "Conheça o site desenvolvido pela 0WEB para o Espaço Renata Beauty Studio no Boneca do Iguaçu. Alta conversão para WhatsApp e design de luxo.";
const URL = "https://0web.com.br/portfolio/renata-beauty";

export const Route = createFileRoute("/portfolio/renata-beauty")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://0web.com.br/images/volume-egipcio-fios-w.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/renata-beauty" }],
  }),
  component: RenataBeautyView,
});
