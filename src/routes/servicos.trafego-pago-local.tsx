import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { whatsappUrl } from "@/lib/site-config";
import { CheckCircle2, XCircle, MessageCircle, Phone, ShoppingCart, Rocket, AlertTriangle, ArrowRight, Sparkles, Target } from "lucide-react";
import capa from "@/assets/trafego-pago-499-capa.png.asset.json";
import { ContactFormWhatsApp } from "@/components/site/ContactFormWhatsApp";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";

const URL = "https://0web.com.br/servicos/trafego-pago-local";
const TITLE = "Tráfego Pago para Negócios Locais a partir de R$499/mês · 0WEB";
const DESC = "Tráfego pago estratégico para negócios locais: anúncios no Instagram, Facebook e Google que geram mensagens, ligações e vendas reais. Sem contrato, sem fidelidade, planos a partir de R$499/mês.";

export const Route = createFileRoute("/servicos/trafego-pago-local")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "keywords", content: "tráfego pago, anúncios Instagram, anúncios Facebook, Google Ads, negócios locais, gestão de tráfego, mais clientes, mais vendas, marketing local, 0WEB" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `https://0web.com.br${capa.url}` },
      { property: "og:image:width", content: "1240" },
      { property: "og:image:height", content: "1240" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: `https://0web.com.br${capa.url}` },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Tráfego Pago para Negócios Locais",
          description: DESC,
          provider: { "@type": "Organization", name: "0WEB", url: "https://0web.com.br", logo: "https://0web.com.br/logo.png" },
          areaServed: { "@type": "Country", name: "Brasil" },
          serviceType: "Gestão de Tráfego Pago",
          offers: {
            "@type": "Offer",
            price: "499",
            priceCurrency: "BRL",
            priceSpecification: { "@type": "UnitPriceSpecification", price: "499", priceCurrency: "BRL", unitText: "MONTH" },
            availability: "https://schema.org/InStock",
            url: URL,
          },
          image: `https://0web.com.br${capa.url}`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Quanto custa o tráfego pago da 0WEB?", acceptedAnswer: { "@type": "Answer", text: "Planos a partir de R$499/mês, sem contrato e sem fidelidade. Você paga a gestão e a verba de mídia é definida conforme seu objetivo." } },
            { "@type": "Question", name: "Tem contrato ou fidelidade?", acceptedAnswer: { "@type": "Answer", text: "Não. Você entra porque quer vender mais e sai quando quiser, sem multa." } },
            { "@type": "Question", name: "Em quanto tempo começo a receber clientes?", acceptedAnswer: { "@type": "Answer", text: "As campanhas entram no ar em até 72h após o briefing. A maioria dos clientes começa a receber mensagens, ligações e pedidos na primeira semana." } },
            { "@type": "Question", name: "Quais plataformas vocês usam?", acceptedAnswer: { "@type": "Answer", text: "Instagram, Facebook e Google (Pesquisa, Maps, Display e YouTube), com foco em onde seu público realmente está." } },
            { "@type": "Question", name: "Vocês entregam relatórios?", acceptedAnswer: { "@type": "Answer", text: "Sim. Relatórios claros com resultados, custo por contato e para onde cada real foi investido." } },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
            { "@type": "ListItem", position: 2, name: "Serviços", item: "https://0web.com.br/servicos" },
            { "@type": "ListItem", position: 3, name: "Tráfego Pago Local", item: URL },
          ],
        }),
      },
    ],
  }),
  component: TrafegoPagoLocalPage,
});

const wa = (msg: string, ctx: string) => whatsappUrl(msg, ctx);

function TrafegoPagoLocalPage() {
  const ctaLink = wa("Quero começar com o tráfego pago da 0WEB a partir de R$499/mês.", "lp_trafego_local");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-16 px-6">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Tráfego pago para negócios locais
              </motion.div>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95]">
                MAIS CLIENTES.<br />
                <span className="text-primary">MAIS VENDAS.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Tráfego pago estratégico para colocar sua empresa na frente de quem <strong className="text-foreground">já quer comprar</strong>.
                Anúncios no Instagram, Facebook e Google com foco total em gerar clientes — não curtidas.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow-primary">
                  Quero receber clientes essa semana <ArrowRight className="w-4 h-4" />
                </a>
                <Link to="/planos" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border hover:bg-muted text-sm font-medium">
                  Ver planos
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><XCircle className="w-4 h-4 text-primary" /> Sem contrato</span>
                <span className="inline-flex items-center gap-1.5"><XCircle className="w-4 h-4 text-primary" /> Sem fidelidade</span>
                <span className="inline-flex items-center gap-1.5"><XCircle className="w-4 h-4 text-primary" /> Sem conversa fiada</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative">
              <img
                src={capa.url}
                alt="0WEB Tráfego Pago — Mais clientes, mais vendas. Planos a partir de R$499/mês"
                width={1240}
                height={1240}
                loading="eager"
                fetchPriority="high"
                className="w-full h-auto rounded-2xl shadow-2xl border border-border"
              />
            </motion.div>
          </div>
        </section>

        {/* ALERTA */}
        <section className="py-12 px-6 bg-destructive/5 border-y border-destructive/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-destructive font-semibold mb-3">
              <AlertTriangle className="w-5 h-5" /> Alerta
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Seu negócio está perdendo clientes <span className="text-destructive">todos os dias</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Enquanto você espera indicações ou faz posts que ninguém vê, seus concorrentes estão aparecendo na frente
              de quem <strong className="text-foreground">já quer comprar</strong>. Isso não é sorte — é tráfego pago bem feito.
            </p>
          </div>
        </section>

        {/* 3 CARDS */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center">O que você passa a receber</h2>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                { icon: MessageCircle, title: "Mais mensagens", desc: "Conversas no WhatsApp e Direct com pessoas prontas para fechar." },
                { icon: Phone, title: "Mais ligações", desc: "Telefone tocando de cliente local procurando seu serviço." },
                { icon: ShoppingCart, title: "Mais vendas", desc: "Pedidos reais entrando — não vaidade de likes e seguidores." },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6 text-center">
                  <div className="w-12 h-12 grid place-items-center rounded-xl bg-primary/10 text-primary mx-auto">
                    <c.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="py-20 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
            {[
              { t: "Anúncios no Instagram, Facebook e Google", d: "Cobertura completa nos canais onde seu cliente já está pesquisando agora." },
              { t: "Foco total em gerar clientes, não curtidas", d: "Cada campanha é otimizada por conversão real: mensagem, ligação ou venda." },
              { t: "Suporte humano (ninguém te abandona)", d: "Você fala direto com gente de verdade — sem robô, sem ticket frio." },
              { t: "Relatórios claros — você vê pra onde cada real vai", d: "Painel transparente com gasto, custo por conversa e retorno por canal." },
              { t: "Públicos locais e segmentação cirúrgica", d: "Raio geográfico, idade, interesse e intenção de compra." },
              { t: "Criativos prontos para performance", d: "Imagens, vídeos curtos e copy validados para CTR alto e CPC baixo." },
            ].map((b) => (
              <div key={b.t} className="flex gap-3 p-5 rounded-xl border border-border bg-card">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{b.t}</div>
                  <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OFERTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-10 text-center shadow-glow-primary">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
              <Target className="w-3.5 h-3.5" /> Oferta
            </div>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold">
              Planos a partir de <span className="text-primary">R$ 499/mês</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Você entra porque quer vender mais. Sai quando quiser.</p>
            <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
              {["Sem contrato", "Sem fidelidade", "Sem conversa fiada"].map((x) => (
                <li key={x} className="rounded-xl border border-border bg-background/60 py-2 font-medium">{x}</li>
              ))}
            </ul>
            <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-semibold">
              Começar agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center">Perguntas frequentes</h2>
            <div className="mt-8 space-y-3">
              {[
                { q: "Quanto custa o tráfego pago da 0WEB?", a: "Planos a partir de R$499/mês, sem contrato e sem fidelidade. Você paga a gestão e a verba de mídia é definida conforme seu objetivo." },
                { q: "Tem contrato ou fidelidade?", a: "Não. Você entra porque quer vender mais e sai quando quiser, sem multa." },
                { q: "Em quanto tempo começo a receber clientes?", a: "Campanhas no ar em até 72h após o briefing. A maioria dos clientes começa a receber mensagens, ligações e pedidos na primeira semana." },
                { q: "Quais plataformas vocês usam?", a: "Instagram, Facebook e Google (Pesquisa, Maps, Display e YouTube), com foco em onde seu público realmente está." },
                { q: "Vocês entregam relatórios?", a: "Sim. Relatórios claros, com resultados, custo por contato e para onde cada real foi investido." },
              ].map((f, i) => (
                <details key={i} className="group border border-border rounded-xl bg-card p-4">
                  <summary className="cursor-pointer font-medium text-sm flex justify-between">
                    {f.q} <span className="text-muted-foreground group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA → FUNIL */}
        <section className="py-16 px-6">
          <div className="mx-auto max-w-2xl text-center rounded-3xl border border-border bg-card/60 backdrop-blur p-8 lg:p-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Quero começar com tráfego pago</h2>
            <p className="mt-3 text-muted-foreground">Responda 3 perguntas rápidas e enviamos uma proposta no seu WhatsApp em até 1 hora útil.</p>
            <div className="mt-6 flex justify-center">
              <ServiceCTA
                serviceSlug="trafego-pago-local"
                location="footer"
                label="Falar com um especialista"
              />
            </div>
          </div>
        </section>

        {/* LINKS RELACIONADOS */}
        <RelatedLinksGrid
          title="Combine com outros serviços da 0WEB"
          subtitle="Tráfego pago performa muito mais quando seu site, SEO e atendimento estão alinhados."
          only={["/servicos/criacao-de-sites", "/servicos/seo", "/servicos/automacao-com-ia", "/planos", "/cases", "/faq"]}
        />

        {/* FINAL */}
        <section className="py-20 px-6 text-center">
          <Rocket className="w-10 h-10 text-primary mx-auto" />
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold">Comece a receber clientes ainda esta semana</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Se você não anuncia, seu concorrente anuncia — e ele fica com seus clientes.
            Ou você aparece. Ou você desaparece.
          </p>
          <a href={ctaLink} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold">
            Quero meus primeiros clientes <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
