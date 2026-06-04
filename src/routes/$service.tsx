import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent } from "@/lib/analytics";

type ServiceData = {
  title: string;
  h1: string;
  description: string;
  benefits: string[];
};

const SERVICES: Record<string, ServiceData> = {
  "criacao-de-sites": {
    title: "Criação de Sites Profissionais · 0WEB",
    h1: "Criação de sites que vendem",
    description: "Sites institucionais rápidos, modernos e otimizados para Google. Conversão acima da média do mercado.",
    benefits: ["Design premium", "Performance 95+", "SEO técnico embutido", "Painel para editar", "Hospedagem incluída"],
  },
  "landing-pages": {
    title: "Landing Pages de Alta Conversão · 0WEB",
    h1: "Landing pages que convertem visitantes em clientes",
    description: "Páginas focadas em conversão para campanhas de Google Ads e Meta Ads. Taxa de conversão até 4x maior.",
    benefits: ["Estrutura validada por CRO", "Integração com Ads", "A/B testing", "Tracking completo", "Entrega em 7 dias"],
  },
  "loja-virtual": {
    title: "E-commerce e Lojas Virtuais · 0WEB",
    h1: "Lojas virtuais prontas para escalar",
    description: "E-commerce de alta performance integrado a meios de pagamento, frete e marketing.",
    benefits: ["Checkout otimizado", "Integração de pagamentos", "Painel administrativo", "Recuperação de carrinho", "SEO de produto"],
  },
  "seo": {
    title: "SEO Técnico e Estratégico · 0WEB",
    h1: "SEO que posiciona sua empresa no topo do Google",
    description: "Estratégia completa de SEO técnico, on-page e off-page para tráfego orgânico sustentável.",
    benefits: ["Auditoria técnica", "Core Web Vitals", "Conteúdo otimizado", "Link building", "Relatórios mensais"],
  },
  "marketing-digital": {
    title: "Marketing Digital com ROI · 0WEB",
    h1: "Marketing digital que gera resultado",
    description: "Estratégia 360° de tráfego pago, orgânico, social media e automação focada em ROI.",
    benefits: ["Google Ads", "Meta Ads", "Funil completo", "Atribuição multicanal", "Otimização semanal"],
  },
  "automacao-com-ia": {
    title: "Automação com IA · 0WEB",
    h1: "Automações inteligentes que escalam sua operação",
    description: "Agentes de IA, integrações e workflows que economizam horas e aumentam vendas.",
    benefits: ["Agentes GPT customizados", "Integrações n8n / Make", "Qualificação automática", "Follow-up inteligente", "ROI mensurável"],
  },
  "chatbot-whatsapp": {
    title: "Chatbot WhatsApp com IA · 0WEB",
    h1: "Chatbot WhatsApp que vende 24/7",
    description: "Atendimento e vendas automatizadas no WhatsApp com Inteligência Artificial.",
    benefits: ["Resposta em segundos", "Treinado no seu negócio", "Integra com CRM", "Multi-atendente", "Métricas em tempo real"],
  },
  "desenvolvimento-saas": {
    title: "Desenvolvimento de SaaS · 0WEB",
    h1: "Desenvolvemos seu SaaS do MVP ao scale",
    description: "Arquitetura moderna, escalável e segura para produtos SaaS B2B e B2C.",
    benefits: ["Next.js + TypeScript", "Multi-tenant", "Billing integrado", "Painel admin", "Suporte contínuo"],
  },
  "sistemas-web": {
    title: "Sistemas Web Sob Medida · 0WEB",
    h1: "Sistemas web sob medida para sua operação",
    description: "ERP, CRM, ordens de serviço, agendamento e dashboards customizados.",
    benefits: ["Análise de processos", "Stack moderna", "Treinamento incluso", "Hospedagem dedicada", "Evolução contínua"],
  },
  "gestao-redes-sociais": {
    title: "Gestão de Redes Sociais · 0WEB",
    h1: "Gestão estratégica de redes sociais",
    description: "Conteúdo, criativos, estratégia e métricas para Instagram, LinkedIn, TikTok e mais.",
    benefits: ["Calendário editorial", "Criativos premium", "Copywriting persuasivo", "Engajamento real", "Relatórios mensais"],
  },
};

export const Route = createFileRoute("/$service")({
  beforeLoad: ({ params }) => {
    if (!SERVICES[params.service]) throw notFound();
  },
  loader: ({ params }) => SERVICES[params.service],
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Serviço · 0WEB" }] };
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: `https://0web.com.br/${params.service}` },
      ],
      links: [{ rel: "canonical", href: `https://0web.com.br/${params.service}` }],
    };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center">
      <Link to="/" className="text-primary underline">Voltar ao início</Link>
    </div>
  ),
});

function ServicePage() {
  const data = Route.useLoaderData();
  const { service } = Route.useParams();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32">
        <section className="py-16 bg-hero">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Serviço</p>
            <h1 className="mt-3 text-4xl lg:text-6xl font-bold tracking-tight">
              {data.h1.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-gradient">{data.h1.split(" ").slice(-2).join(" ")}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">{data.description}</p>
            <a
              href={whatsappUrl(`Quero saber mais sobre ${data.h1}.`, `service_${service}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_click", { label: "service_whatsapp", location: service })}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
            >
              Falar com especialista <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Benefícios incluídos</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.benefits.map((b) => (
                <div key={b} className="flex items-start gap-3 p-5 rounded-2xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
