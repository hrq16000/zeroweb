// Centralized SEO helpers, shared dictionaries and JSON-LD builders.
// Sprint 3 — technical SEO foundation.

export const ORIGIN = "https://0web.com.br";

export function absUrl(path: string): string {
  if (!path) return ORIGIN + "/";
  if (/^https?:\/\//i.test(path)) return path;
  return ORIGIN + (path.startsWith("/") ? path : "/" + path);
}

// Default brand share image (fallback when route has no real image).
// Lives at /favicon.png via the favicon asset; safe absolute URL.
export const DEFAULT_OG_IMAGE = `${ORIGIN}/og-default.png`;

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export const ORG_REF = {
  "@type": "Organization",
  "@id": `${ORIGIN}/#org`,
  name: "0WEB",
  url: ORIGIN,
  logo: `${ORIGIN}/favicon.ico`,
  telephone: "+55-41-99745-2053",
  email: "contato@0web.com.br",
  taxID: "41.723.708/0001-58",
  areaServed: "BR",
};

// Single source of truth for service slugs (used by /$service, /$city/$service and the sitemap).
export type ServiceInfo = {
  slug: string;
  name: string;
  title: string;
  description: string;
  serviceType: string;
};

export const SERVICES_DICT: Record<string, ServiceInfo> = {
  "criacao-de-sites": {
    slug: "criacao-de-sites",
    name: "Criação de Sites",
    title: "Criação de Sites Profissionais · 0WEB",
    description: "Sites institucionais rápidos, modernos e otimizados para Google.",
    serviceType: "Web Design",
  },
  "landing-pages": {
    slug: "landing-pages",
    name: "Landing Pages",
    title: "Landing Pages de Alta Conversão · 0WEB",
    description: "Páginas focadas em conversão para Google Ads e Meta Ads.",
    serviceType: "Conversion Rate Optimization",
  },
  "loja-virtual": {
    slug: "loja-virtual",
    name: "Loja Virtual",
    title: "E-commerce e Lojas Virtuais · 0WEB",
    description: "E-commerce de alta performance integrado a pagamentos e marketing.",
    serviceType: "E-commerce Development",
  },
  seo: {
    slug: "seo",
    name: "SEO",
    title: "SEO Técnico e Estratégico · 0WEB",
    description: "Estratégia completa de SEO técnico, on-page e off-page.",
    serviceType: "Search Engine Optimization",
  },
  "marketing-digital": {
    slug: "marketing-digital",
    name: "Marketing Digital",
    title: "Marketing Digital com ROI · 0WEB",
    description: "Estratégia 360° de tráfego pago, orgânico, social media e automação.",
    serviceType: "Digital Marketing",
  },
  "automacao-com-ia": {
    slug: "automacao-com-ia",
    name: "Automação com IA",
    title: "Automação com IA · 0WEB",
    description: "Agentes de IA, integrações e workflows que escalam operações.",
    serviceType: "AI Automation",
  },
  "chatbot-whatsapp": {
    slug: "chatbot-whatsapp",
    name: "Chatbot WhatsApp",
    title: "Chatbot WhatsApp com IA · 0WEB",
    description: "Atendimento e vendas automatizadas no WhatsApp com IA.",
    serviceType: "Conversational AI",
  },
  "desenvolvimento-saas": {
    slug: "desenvolvimento-saas",
    name: "Desenvolvimento de SaaS",
    title: "Desenvolvimento de SaaS · 0WEB",
    description: "Arquitetura moderna, escalável e segura para produtos SaaS.",
    serviceType: "Software Development",
  },
  "sistemas-web": {
    slug: "sistemas-web",
    name: "Sistemas Web",
    title: "Sistemas Web Sob Medida · 0WEB",
    description: "ERP, CRM, agendamento e dashboards customizados.",
    serviceType: "Custom Software Development",
  },
  "gestao-redes-sociais": {
    slug: "gestao-redes-sociais",
    name: "Gestão de Redes Sociais",
    title: "Gestão de Redes Sociais · 0WEB",
    description: "Conteúdo, criativos e estratégia para Instagram, LinkedIn e TikTok.",
    serviceType: "Social Media Management",
  },
};

// Cities served — used by /$city/$service and the sitemap.
export const CITIES_DICT: Record<string, string> = {
  curitiba: "Curitiba",
  "sao-paulo": "São Paulo",
  "rio-de-janeiro": "Rio de Janeiro",
  "belo-horizonte": "Belo Horizonte",
  "porto-alegre": "Porto Alegre",
  fortaleza: "Fortaleza",
  salvador: "Salvador",
  brasilia: "Brasília",
  florianopolis: "Florianópolis",
  recife: "Recife",
};
