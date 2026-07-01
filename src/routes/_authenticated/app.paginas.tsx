import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe, Briefcase, ImageOff, LayoutTemplate, BookOpen, Target,
  ShoppingCart, CreditCard, Search, Inbox, Layers, Eye, Activity,
  FileText, Users, Shield, Fingerprint, Network, KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/paginas")({
  component: PagesHub,
});

type Card = { to: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string; group: string };

const CARDS: Card[] = [
  // Conteúdo / Páginas
  { group: "Páginas & Conteúdo", to: "/app/servicos",           icon: Briefcase,      title: "Serviços",          desc: "Catálogo público, preços, imagens e SEO por landing." },
  { group: "Páginas & Conteúdo", to: "/app/servicos-imagens",   icon: ImageOff,       title: "Imagens dos serviços", desc: "Uploads, imagens órfãs e capas em bulk." },
  { group: "Páginas & Conteúdo", to: "/app/editorial",          icon: BookOpen,       title: "Editorial (Blog)",  desc: "Artigos, clusters e status de publicação." },
  { group: "Páginas & Conteúdo", to: "/app/editorial/skyscraper", icon: BookOpen,     title: "Blog Skyscraper",    desc: "24 artigos programáticos e blueprints." },
  { group: "Páginas & Conteúdo", to: "/app/editorial/skyscraper-review", icon: BookOpen, title: "Revisão editorial", desc: "SEO score, aprovação, A/B e exportação." },
  { group: "Páginas & Conteúdo", to: "/app/templates",          icon: LayoutTemplate, title: "Templates & Funis", desc: "Landings dinâmicas e funis internos." },
  { group: "Páginas & Conteúdo", to: "/app/funis",              icon: Target,         title: "Funis dinâmicos",   desc: "Pipelines, regras e leads por funil." },
  { group: "Páginas & Conteúdo", to: "/app/portals",            icon: Layers,         title: "Portais / Verticais", desc: "Hubs /sites/[vertical] e clusters." },

  // Comercial
  { group: "Comercial",          to: "/app/leads",              icon: Inbox,          title: "Leads unificados",  desc: "Widget, formulários, chatbot, WhatsApp." },
  { group: "Comercial",          to: "/app/pedidos",            icon: ShoppingCart,   title: "Pedidos",           desc: "Carrinho, propostas e status." },
  { group: "Comercial",          to: "/app/pagamentos",         icon: CreditCard,     title: "Pagamentos",        desc: "Cobranças, Stripe/Mercado Pago." },
  { group: "Comercial",          to: "/app/campaigns",          icon: Target,         title: "Campanhas",         desc: "Utm, mídia paga e experimentos." },

  // SEO & Analytics
  { group: "SEO & Analytics",    to: "/app/seo-auditoria",      icon: Shield,         title: "Auditoria SEO",     desc: "JSON-LD, OG, canonicals por rota." },
  { group: "SEO & Analytics",    to: "/app/indexacao",          icon: Search,         title: "Indexação",         desc: "Sitemap, submissão e cobertura." },
  { group: "SEO & Analytics",    to: "/app/seo-404s",           icon: Search,         title: "404s & Redirects",  desc: "Erros de rastreamento e 301s." },
  { group: "SEO & Analytics",    to: "/app/visitantes",         icon: Eye,            title: "Visitantes",        desc: "Sessões e origem do tráfego." },
  { group: "SEO & Analytics",    to: "/app/cro",                icon: Activity,       title: "CRO · Eventos",     desc: "Cliques, scroll, A/B e conversão." },

  // Infra & Governança
  { group: "Infra & Governança", to: "/app/admin",              icon: Shield,         title: "Painel Admin",      desc: "Configurações globais e feature flags." },
  { group: "Infra & Governança", to: "/app/usuarios",           icon: Users,          title: "Usuários & Papéis", desc: "Admins, colaboradores e clientes." },
  { group: "Infra & Governança", to: "/app/master",             icon: Globe,          title: "Dashboard Master",  desc: "Visão executiva 360º." },
  { group: "Infra & Governança", to: "/app/licenses",           icon: KeyRound,       title: "Licenças",          desc: "Chaves, quotas e permissões." },
  { group: "Infra & Governança", to: "/app/ecosystem",          icon: Network,        title: "Ecossistema",       desc: "Integrações e webhooks." },
  { group: "Infra & Governança", to: "/app/auditoria/identidade", icon: Fingerprint,  title: "Auditoria Identidade", desc: "Logs de acesso e segurança." },
  { group: "Infra & Governança", to: "/app/documents",          icon: FileText,       title: "Documentos",        desc: "Contratos, briefings e anexos." },
];

function PagesHub() {
  const groups = Array.from(new Set(CARDS.map((c) => c.group)));
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Central administrativa</p>
        <h1 className="text-3xl lg:text-4xl font-bold font-display">Páginas & Produtos</h1>
        <p className="text-muted-foreground max-w-2xl">
          Todo o site é gerenciado a partir daqui: landings, produtos, blog, leads, SEO e infraestrutura.
          Cada card leva ao editor específico com fluxo de rascunho → publicação.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g} className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARDS.filter((c) => c.group === g).map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group rounded-2xl border border-border bg-card p-5 hover:border-primary hover:shadow-elegant transition"
                >
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
