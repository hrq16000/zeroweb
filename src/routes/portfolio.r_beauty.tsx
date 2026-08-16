import { createFileRoute } from "@tanstack/react-router";
import { RBeautyEditorialView } from "@/components/site/RBeautyEditorialView";

const TITLE = "R_Beauty Studio · Edição Especial Portfólio 0WEB";
const DESC = "Conheça a versão editorial do Espaço R_Beauty Studio desenvolvida pela 0WEB. Tipografia cinética, alta conversão e sofisticação no Boneca do Iguaçu.";
const URL = "https://0web.com.br/portfolio/r_beauty";

export const Route = createFileRoute("/portfolio/r_beauty")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: "https://0web.com.br/images/r-beauty-cilios.jpg" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: RBeautyEditorialView,
});
