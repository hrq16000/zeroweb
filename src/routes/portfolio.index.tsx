import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Globe, 
  Phone,
  ShieldCheck
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { FloatingFunnelCTA } from "@/components/funnel/FloatingFunnelCTA";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const TITLE = "Portfólio & Vitrine de Sites · Projetos Reais Criados pela 0WEB";
const DESC =
  "Explore nossa galeria de sites, landing pages de alta conversão e sistemas desenvolvidos pela 0WEB para negócios locais, clínicas, beleza e serviços em todo o Brasil.";
const URL = "https://0web.com.br/portfolio";

const CATEGORIES = [
  { id: "todos", label: "Todos os Projetos" },
  { id: "beleza", label: "Beleza & Estética" },
  { id: "saude", label: "Saúde & Clínicas" },
  { id: "servicos", label: "Serviços & Negócios Locais" },
  { id: "juridico", label: "Advocacia & Consultoria" },
];

const PORTFOLIO_ITEMS = [
  {
    id: "renata-beauty",
    slug: "/renata-beauty",
    category: "beleza",
    title: "Renata Beauty Studio",
    subtitle: "Lash Designer, Unhas de Fibra & Estética",
    location: "Boneca do Iguaçu — PR",
    badge: "Novo Lançamento",
    image: "/images/renata-beauty-flyer.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=800&q=80",
    tags: ["Volume Egípcio", "Unhas de Fibra", "WhatsApp Direct", "Design Dark Luxury"],
    metrics: "+300% cliques no WhatsApp",
    summary: "Landing page de alta conversão criada para o lançamento do novo espaço físico, integrando promoção de R$ 100, mapa no Google Maps e agendamento instantâneo no WhatsApp.",
  },
  {
    id: "clinica-sorriso",
    slug: "/sites/clinicas",
    category: "saude",
    title: "Clínica Integrada de Saúde",
    subtitle: "Odontologia, Harmonização & Implantes",
    location: "Curitiba — PR",
    badge: "Alta Conversão",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    tags: ["Agendamento Online", "SEO Local", "Google Meu Negócio"],
    metrics: "187 leads/mês no Google",
    summary: "Estrutura completa com páginas de procedimentos, depoimentos em vídeo e captação de pacientes para tratamentos de alto ticket.",
  },
  {
    id: "advocacia-pro",
    slug: "/sites/advocacia",
    category: "juridico",
    title: "Escritório de Advocacia & Consultoria",
    subtitle: "Direito Empresarial, Trabalhista e Previdenciário",
    location: "São Paulo — SP",
    badge: "OAB Conforme",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    tags: ["Provimento 205 OAB", "Artigos Jurídicos", "Formulário LGPD"],
    metrics: "Topo do Google para 14 termos",
    summary: "Site institucional sóbrio e moderno com autoridade técnica, artigos que ranqueiam no Google e conformidade ética total.",
  },
  {
    id: "restaurante-express",
    slug: "/sites/restaurantes",
    category: "servicos",
    title: "Bistrô & Gastronomia Artesanal",
    subtitle: "Cardápio Digital, Reservas & Delivery",
    location: "Belo Horizonte — MG",
    badge: "Cardápio QR Code",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    tags: ["Cardápio Interativo", "Sem Taxas de iFood", "Google Maps"],
    metrics: "+45% reservas diretas",
    summary: "Página leve com carregamento em menos de 1 segundo, cardápio direto no celular e integração com pedidos no WhatsApp.",
  },
];

export const Route = createFileRoute("/portfolio/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${URL}#collection`,
              url: URL,
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Portfólio", item: URL },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("todos");

  const filteredItems = activeCategory === "todos" 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border/40 bg-muted/20">
          <div className="container max-w-6xl mx-auto px-4 py-3">
            <Breadcrumbs items={[{ name: "Início", path: "/" }, { name: "Portfólio", path: "/portfolio" }]} />
          </div>
        </div>

        {/* Hero Showcase */}
        <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden">
          <div className="container max-w-6xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Vitrine Oficial 0WEB
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Do Zero à Web: Projetos que transformam <span className="text-primary underline decoration-primary/30 underline-offset-8">visitas em clientes reais.</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Veja landing pages e portfólios desenvolvidos com design moderno, SEO de alta performance e integração direta para faturar no WhatsApp.
            </p>

            {/* Quick CTA */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <FunnelCTAButton size="lg" className="shadow-lg">
                Quero Meu Site em 24h
              </FunnelCTAButton>
              <a 
                href="/renata-beauty" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30 hover:bg-pink-500/20 text-sm font-semibold transition-all"
              >
                <Sparkles className="w-4 h-4 text-pink-500" /> Ver Destaque: Renata Beauty
              </a>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 px-4 border-y border-border/40 bg-card sticky top-20 z-30 shadow-xs backdrop-blur-md">
          <div className="container max-w-6xl mx-auto flex items-center justify-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm scale-105"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Projects Showcase Grid */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto space-y-12">
            
            <div className="grid md:grid-cols-2 gap-8">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-3xl bg-card border border-border/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Card Media Preview */}
                    <div className="relative h-64 sm:h-72 overflow-hidden bg-muted">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          if (item.fallbackImage) {
                            (e.target as HTMLImageElement).src = item.fallbackImage;
                          }
                        }}
                      />
                      
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-md text-foreground text-xs font-bold shadow-sm">
                          {item.badge}
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                          {item.metrics}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {item.subtitle}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.summary}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                        <Link 
                          to={item.slug}
                          className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                        >
                          Ver Demonstração Ao Vivo <ExternalLink className="w-4 h-4" />
                        </Link>

                        <FunnelCTAButton size="sm" variant="outline">
                          Pedir Igual
                        </FunnelCTAButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Banner Callout for Custom Sites */}
            <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> Entrega em Tempo Recorde
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Quer um site profissional e vendedor para o seu negócio?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Cuidamos do design, dos textos persuasivos, da configuração do Google e do botão de WhatsApp para o seu negócio começar a receber contatos imediatamente.
              </p>
              <div className="pt-2">
                <FunnelCTAButton size="lg" className="shadow-lg">
                  Solicitar Proposta sem Compromisso
                </FunnelCTAButton>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
      <FloatingFunnelCTA />
    </div>
  );
}
