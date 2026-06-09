import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { FloatingFunnelCTA } from "@/components/funnel/FloatingFunnelCTA";
import { HelpCircle } from "lucide-react";

const URL = "https://0web.com.br/faq";
const TITLE = "Perguntas Frequentes · Sites, SEO, Tráfego e IA · 0WEB";
const DESC =
  "Dúvidas frequentes sobre criação de sites, SEO, tráfego pago, automações com IA, prazos, preços, contratos e resultados. Respostas claras da 0WEB.";

const faqs = [
  {
    q: "Quanto custa criar um site profissional com a 0WEB?",
    a: "Sites institucionais começam em R$ 2.500 (projeto) ou R$ 290/mês (assinatura com hospedagem, SSL e manutenção inclusos). Sites com áreas logadas, e-commerce ou sistemas sob medida têm escopo personalizado.",
  },
  {
    q: "Quanto tempo leva para criar meu site?",
    a: "Sites institucionais ficam prontos entre 10 e 25 dias, dependendo do escopo. Landing pages podem sair em até 7 dias. E-commerces e sistemas web entre 30 e 90 dias dependendo da complexidade.",
  },
  {
    q: "O site é responsivo para celular?",
    a: "Sim. Todos os nossos projetos seguem abordagem Mobile First e são testados em múltiplos dispositivos.",
  },
  {
    q: "Vocês fazem SEO técnico e de conteúdo?",
    a: "Sim. Cuidamos de auditoria técnica (Core Web Vitals, crawl, schema), produção de conteúdo otimizado, link building seguro e relatórios mensais com posições e tráfego orgânico.",
  },
  {
    q: "Em quanto tempo o SEO traz resultado?",
    a: "Resultados iniciais costumam aparecer entre 60 e 120 dias. SEO local (Google Meu Negócio) pode trazer leads em 30 dias. Palavras competitivas levam de 6 a 12 meses para top 3.",
  },
  {
    q: "Como funciona o tráfego pago da 0WEB?",
    a: "Estruturamos campanhas em Google Ads, Meta Ads, TikTok Ads e LinkedIn Ads. Gestão completa: criativos, copy, segmentação, lances, acompanhamento diário e relatórios semanais com CPL e ROAS.",
  },
  {
    q: "Como funciona a IA para WhatsApp?",
    a: "Implantamos um agente treinado no seu negócio, integrado ao WhatsApp Business API, com qualificação automática de leads e agendamento. Também integramos com OpenAI, Gemini e Claude conforme o fluxo comercial.",
  },
  {
    q: "Vocês criam e-commerce?",
    a: "Sim. Desenvolvemos lojas com Shopify, WooCommerce ou stack headless sob medida.",
  },
  {
    q: "Vocês desenvolvem sistemas e SaaS?",
    a: "Sim. Construímos sistemas web e SaaS sob medida com Next.js, React e TypeScript.",
  },
  {
    q: "Vocês integram com meu CRM ou ERP?",
    a: "Sim. Integramos com RD Station, HubSpot, Pipedrive, ActiveCampaign, Bling, Tiny, Omie, Conta Azul, e qualquer sistema com API ou webhook.",
  },
  {
    q: "Posso editar o site depois?",
    a: "Sim. Entregamos painéis amigáveis e treinamento — ou mantemos a gestão para você.",
  },
  {
    q: "A hospedagem está inclusa?",
    a: "Nos planos Start e Pro a hospedagem premium está inclusa. No Enterprise, dimensionamos sob demanda.",
  },
  {
    q: "Vocês fazem manutenção depois que o site fica pronto?",
    a: "Sim. Oferecemos planos de manutenção mensal com backups, atualizações, monitoramento de uptime, segurança e pequenas alterações inclusas.",
  },
  {
    q: "É possível migrar meu site atual?",
    a: "Sim. Fazemos migração com plano de redirects 301 para preservar seu SEO.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Suporte humanizado por WhatsApp, e-mail e chamados, com SLAs por plano.",
  },
  {
    q: "Atendem empresas fora de Curitiba?",
    a: "Sim, atendemos todo o Brasil de forma 100% remota com reuniões via Google Meet e WhatsApp. Temos clientes em SP, RJ, MG, RS, SC, BA, PE e exterior.",
  },
  {
    q: "Existe fidelidade obrigatória?",
    a: "Para projetos pontuais, não. Para planos mensais, trabalhamos com contrato de 6 meses para garantir maturação de SEO e campanhas, com possibilidade de pausa em casos especiais.",
  },
  {
    q: "Vocês emitem nota fiscal?",
    a: "Sim. Emitimos NF-e para todos os contratos.",
  },
  {
    q: "Como começo um projeto?",
    a: "Solicite um diagnóstico gratuito. Em até 24h apresentamos um plano sob medida.",
  },
];

export const Route = createFileRoute("/faq")({
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
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
            { "@type": "ListItem", position: 2, name: "FAQ", item: URL },
          ],
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />
      <main>
        <section className="pt-6 pb-12 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <HelpCircle className="w-3.5 h-3.5" /> Perguntas Frequentes
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold max-w-3xl mx-auto">
            Tudo o que você precisa saber sobre <span className="text-gradient">sites, SEO, tráfego e IA</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            Respostas claras e diretas para as dúvidas mais comuns de quem contrata a 0WEB.
          </p>
        </section>

        <section className="pb-24 px-6">
          <div className="max-w-3xl mx-auto space-y-4 scroll-smooth">
            {faqs.map((f) => {
              const id =
                "q-" +
                f.q
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
                  .slice(0, 60);
              return (
                <details
                  key={f.q}
                  id={id}
                  className="group rounded-2xl border border-border bg-card p-6 open:shadow-md scroll-mt-24"
                >
                  <summary className="cursor-pointer font-semibold text-lg flex justify-between items-start gap-4">
                    <span>{f.q}</span>
                    <span className="text-primary group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              );
            })}
          </div>
          <p className="text-center mt-12 text-muted-foreground">
            Não encontrou sua dúvida? <Link to="/contato" className="text-primary font-medium underline">Fale com a gente</Link>.
          </p>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
      <FloatingFunnelCTA location="faq_page" />
    </div>
  );
}
