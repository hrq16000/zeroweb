import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CheckCircle2, MapPin, MessageCircle, Phone, ShieldCheck, Star,
  TrendingUp, Sparkles, Flame, ArrowRight,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackConversion } from "@/lib/analytics";
import cover from "@/assets/google-meu-negocio-capa.png.asset.json";

const TITLE = "Google Meu Negócio para Empresas · 0WEB Marketing Digital";
const DESC =
  "A 0WEB configura e otimiza o Google Meu Negócio para sua empresa aparecer no Maps, gerar confiança e atrair clientes. Planos a partir de R$247/mês.";
const URL = "https://0web.com.br/servicos/google-meu-negocio";

const benefits = [
  { icon: MapPin, t: "Aparecer no Google", d: "Sua empresa nas primeiras posições do Maps e da busca local." },
  { icon: TrendingUp, t: "Ganhar mais visibilidade", d: "Mais impressões, cliques e ligações no perfil." },
  { icon: MessageCircle, t: "Receber mensagens no WhatsApp", d: "Conexão direta entre o perfil e seu WhatsApp comercial." },
  { icon: ShieldCheck, t: "Transmitir mais confiança", d: "Fotos, avaliações reais e informações sempre atualizadas." },
  { icon: Sparkles, t: "Atrair novos clientes diariamente", d: "Fluxo previsível de leads qualificados sem depender de anúncios." },
];

export const Route = createFileRoute("/servicos/google-meu-negocio")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: cover.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: cover.url },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Configuração e Otimização de Google Meu Negócio",
          provider: {
            "@type": "Organization",
            name: "0WEB Marketing Digital",
            url: "https://0web.com.br",
          },
          areaServed: "BR",
          description: DESC,
          offers: [
            { "@type": "Offer", name: "Plano Único", price: "397", priceCurrency: "BRL" },
            { "@type": "Offer", name: "Plano PRO", price: "247", priceCurrency: "BRL", priceSpecification: { "@type": "UnitPriceSpecification", price: "247", priceCurrency: "BRL", unitText: "MONTH", referenceQuantity: { "@type": "QuantitativeValue", value: 3, unitCode: "MON" } } },
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
            { "@type": "ListItem", position: 2, name: "Serviços", item: "https://0web.com.br/#solucoes" },
            { "@type": "ListItem", position: 3, name: "Google Meu Negócio", item: URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Em quanto tempo minha empresa começa a aparecer no Google?", acceptedAnswer: { "@type": "Answer", text: "Após a configuração e verificação do perfil, os primeiros resultados aparecem em 7 a 30 dias, com crescimento consistente nos meses seguintes." } },
            { "@type": "Question", name: "Preciso já ter um perfil no Google Meu Negócio?", acceptedAnswer: { "@type": "Answer", text: "Não. A 0WEB cria, reivindica ou recupera perfis e faz toda a configuração técnica, fotos, categorias, áreas de atuação e integração com WhatsApp." } },
            { "@type": "Question", name: "Qual a diferença entre o Plano Único e o Plano PRO?", acceptedAnswer: { "@type": "Answer", text: "O Plano Único (R$397) entrega configuração completa em uma única vez. O Plano PRO (R$247/mês por 3 meses) inclui otimização contínua, postagens semanais, respostas a avaliações e relatórios mensais." } },
          ],
        }),
      },
    ],
  }),
  component: GMBPage,
});

function GMBPage() {
  const wa = (msg: string, content: string) =>
    whatsappUrl(msg, content);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0a1330] to-[#0b1a3d] text-white">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Flame className="w-3.5 h-3.5" /> Oferta de lançamento · 10 primeiros clientes
            </p>
            <h1 className="mt-4 font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Sua empresa <span className="text-amber-400">NÃO aparece</span> no Google?
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-xl">
              Enquanto seus concorrentes recebem clientes <strong className="text-amber-300">todos os dias</strong> pelo Google Maps,
              quem não está otimizado simplesmente fica invisível. A 0WEB resolve isso.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={wa("Olá! Quero o Plano PRO de Google Meu Negócio (R$247/mês).", "gmb_hero_pro")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "gmb_hero_pro", label: "Plano PRO" })}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-6 py-3.5 shadow-glow-primary hover:scale-[1.02] transition"
              >
                Quero meu Plano PRO <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={wa("Olá! Quero o Plano Único de Google Meu Negócio (R$397).", "gmb_hero_unico")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "gmb_hero_unico", label: "Plano Único" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white font-semibold px-6 py-3.5 hover:bg-white/10 transition"
              >
                Plano Único · R$397
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <span className="ml-1">+520 empresas atendidas · 20 anos de mercado</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-amber-400/30 to-primary/30 rounded-[3rem] blur-3xl" />
            <img
              src={cover.url}
              alt="Sua empresa não aparece no Google? A 0WEB configura e otimiza seu Google Meu Negócio."
              width={1248}
              height={1248}
              fetchPriority="high"
              decoding="async"
              className="relative w-full rounded-3xl shadow-2xl ring-1 ring-white/10"
            />
          </motion.div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 lg:p-10 shadow-elegant">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Por que isso é urgente</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
              Hoje, quem busca por empresas do seu segmento <span className="text-gradient">vê primeiro quem está no Maps</span>.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Se a sua empresa não está otimizada no Google Meu Negócio, ela simplesmente não existe para
              quem procura agora. E cada clique que vai para o concorrente é uma venda que poderia ser sua.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 bg-surface">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">O que entregamos</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              A 0WEB <span className="text-gradient">configura e otimiza</span> seu Google Meu Negócio
            </h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.t}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-elegant transition"
              >
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
                  <b.icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {b.t}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Flame className="w-3.5 h-3.5" /> Oferta para os 10 primeiros clientes
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Escolha seu plano e <span className="text-gradient">apareça no Google esta semana</span>
            </h2>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-5">
            {/* Único */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
              <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Plano Único</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-display font-black">R$397</span>
                <span className="text-muted-foreground">/ pagamento único</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {["Criação/reivindicação do perfil","Otimização completa (categorias, áreas, horários)","Inserção de fotos profissionais","Integração com WhatsApp","Primeiras postagens estratégicas"].map((i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> {i}</li>
                ))}
              </ul>
              <a
                href={wa("Quero o Plano Único de Google Meu Negócio (R$397).", "gmb_pricing_unico")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "gmb_pricing_unico" })}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground text-foreground font-semibold px-6 py-3.5 hover:bg-foreground hover:text-background transition"
              >
                Contratar Plano Único
              </a>
            </div>

            {/* PRO */}
            <div className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-slate-950 to-slate-900 text-white p-8 shadow-2xl overflow-hidden">
              <span className="absolute top-4 right-4 rounded-full bg-amber-400 text-slate-900 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                Recomendado
              </span>
              <div className="text-xs uppercase tracking-wider font-semibold text-amber-300">Plano PRO</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-display font-black">R$247</span>
                <span className="text-white/70">/mês</span>
              </div>
              <p className="text-xs text-white/60 mt-1">por 3 meses (tempo mínimo)</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Tudo do Plano Único","Otimização contínua mensal","Postagens semanais no perfil","Resposta a avaliações","Relatório mensal de performance","Suporte prioritário"].map((i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> {i}</li>
                ))}
              </ul>
              <a
                href={wa("Quero o Plano PRO de Google Meu Negócio (R$247/mês por 3 meses).", "gmb_pricing_pro")}
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "gmb_pricing_pro" })}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-6 py-3.5 hover:scale-[1.02] transition"
              >
                Quero o Plano PRO <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Perguntas frequentes</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "Em quanto tempo minha empresa começa a aparecer no Google?", a: "Após a configuração e verificação do perfil, os primeiros resultados aparecem em 7 a 30 dias, com crescimento consistente nos meses seguintes." },
              { q: "Preciso já ter um perfil no Google Meu Negócio?", a: "Não. A 0WEB cria, reivindica ou recupera perfis e faz toda a configuração técnica, fotos, categorias, áreas de atuação e integração com WhatsApp." },
              { q: "Qual a diferença entre o Plano Único e o Plano PRO?", a: "O Plano Único (R$397) entrega configuração completa em uma única vez. O Plano PRO (R$247/mês por 3 meses) inclui otimização contínua, postagens, respostas a avaliações e relatórios mensais." },
              { q: "Funciona para qualquer tipo de empresa?", a: "Sim, atende prestadores de serviço, comércios, escritórios, autoescolas, restaurantes, clínicas e qualquer empresa com atendimento local ou regional." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                <summary className="cursor-pointer font-semibold flex items-center justify-between">
                  {f.q}
                  <ArrowRight className="w-4 h-4 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0b1a3d] to-slate-900 text-white p-10 lg:p-14 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-amber-400 font-semibold uppercase tracking-wider text-xs flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Clique em “Saiba Mais” e fale conosco no WhatsApp
                </p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
                  Mais visibilidade. Mais confiança. <span className="text-amber-400">Mais clientes!</span>
                </h2>
                <p className="mt-3 text-white/80">
                  Conectamos sua empresa a mais clientes todos os dias.
                </p>
              </div>
              <FunnelCTAButton
                pageType="service"
                serviceSlug="google-meu-negocio"
                label="Solicitar orçamento gratuito"
                location="gmb_cta_final"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 font-bold px-7 py-4 hover:scale-[1.02] transition"
              />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Leia também:{" "}
            <Link
              to="/blog/$slug"
              params={{ slug: "google-meu-negocio-como-aparecer-no-google" }}
              onClick={() => trackEvent("internal_link_click", { from: "gmb_page", to: "blog_post" })}
              className="text-primary font-semibold hover:underline"
            >
              Como aparecer no Google Maps em 2026 →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
