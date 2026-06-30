import { useRouterState } from "@tanstack/react-router";
import { Breadcrumbs, type Crumb } from "@/components/site/Breadcrumbs";

/**
 * Breadcrumbs centralizado da loja virtual (/servicos/*). Deriva os itens do
 * pathname atual e usa um dicionário de rótulos amigáveis. Para slugs
 * desconhecidos (ex.: produtos cadastrados dinamicamente via /servicos/$slug),
 * capitaliza o slug. Sempre `compact` para evitar espaçamento duplicado com a
 * barra de busca renderizada no layout.
 */
const LABELS: Record<string, string> = {
  servicos: "Serviços",
  marketplace: "Marketplace",
  parceiros: "Parceiros",
  consultoria: "Consultoria",
  "site-express": "Site Express",
  "presenca-digital": "Presença Digital",
  "google-meu-negocio": "Google Meu Negócio",
  "gestao-redes-sociais": "Gestão de Redes Sociais",
  "trafego-pago": "Tráfego Pago",
  "trafego-pago-local": "Tráfego Pago Local",
};

function labelFor(slug: string): string {
  if (LABELS[slug]) return LABELS[slug];
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function ServicosBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!pathname.startsWith("/servicos")) return null;

  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  // segments[0] === "servicos"
  const items: Crumb[] = [];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    items.push({ name: labelFor(seg), path: acc });
  }
  return <Breadcrumbs compact="auto" items={items} />;
}
