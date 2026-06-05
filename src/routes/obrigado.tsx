import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { z } from "zod";
import { ArrowRight, CheckCircle, MessageCircle, HelpCircle, Layers, FileText, Star, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { absUrl, ORIGIN, breadcrumbLd } from "@/lib/seo";
import { useEffect, useMemo } from "react";
import { whatsappUrl } from "@/lib/site-config";
import { getThankYouContent } from "@/lib/thank-you-content";
import { getLeadAttribution, attributionToEventParams } from "@/lib/lead-attribution";
import { useWhatsappTracking } from "@/lib/use-whatsapp-tracking";

const TITLE = "Obrigado pelo contato · 0WEB";
const DESC = "Recebemos sua mensagem. Nossa equipe vai responder em até 1 hora útil. Enquanto isso, explore nossos planos e cases.";

const searchSchema = z.object({
  source: z.string().max(80).optional(),
});

export const Route = createFileRoute("/obrigado")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: absUrl("/obrigado") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: absUrl("/obrigado") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": absUrl("/obrigado"),
              url: absUrl("/obrigado"),
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
              isPartOf: { "@type": "WebSite", url: ORIGIN, name: "0WEB" },
            },
            breadcrumbLd([{ name: "Obrigado", path: "/obrigado" }]),
          ],
        }),
      },
    ],
  }),
  component: ObrigadoPage,
});

const TESTIMONIALS = [
  { name: "Carla M.", role: "Clínica de Estética · SP", text: "Em 45 dias dobramos os agendamentos com tráfego pago e site novo." },
  { name: "Rafael T.", role: "Escritório de Advocacia · RJ", text: "A 0WEB nos colocou no topo do Google em buscas locais. Recomendo!" },
  { name: "Juliana P.", role: "Loja de Móveis · MG", text: "Atendimento humano, relatórios claros e vendas reais todo mês." },
];

function ObrigadoPage() {
  const { source } = Route.useSearch();
  const content = getThankYouContent(source);
  const evtAttr = useMemo(() => {
    if (typeof window === "undefined") return { source: source || "direct", channel: content.channel };
    return attributionToEventParams(getLeadAttribution(source || "direct"));
  }, [source, content.channel]);

  useEffect(() => {
    trackConversion("obrigado_page_view", {
      ...evtAttr,
      page: "/obrigado",
      surface: "page",
      event_category: "conversion",
    });
  }, [evtAttr]);

  const handleCta = (ctaId: string, label: string, position: number, target: string) => {
    const params = {
      ...evtAttr,
      cta_id: ctaId,
      label,
      position,
      target,
      surface: "page",
      event_category: "engagement",
    };
    trackConversion("obrigado_cta_click", params);
    trackEvent(`obrigado_cta_${ctaId}`, params);
  };

  const waHero = useWhatsappTracking({ ...evtAttr, location: `obrigado_page_${content.channel}`, surface: "page", cta_id: "whatsapp_hero", position: 0 });
  const waFinal = useWhatsappTracking({ ...evtAttr, location: `obrigado_cta_final_${content.channel}`, surface: "page", cta_id: "whatsapp_final", position: 99 });

  const ctaCards = [
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Conheça nossos planos",
      desc: content.planosLabel,
      to: "/planos" as const,
      label: "Ver planos",
      id: "planos",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      title: "Dúvidas frequentes",
      desc: "Veja respostas sobre prazos, contratos e entregáveis.",
      to: "/faq" as const,
      label: "Ir para FAQ",
      id: "faq",
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Solicitar diagnóstico",
      desc: "Receba uma análise gratuita do seu site e estratégia digital.",
      to: "/solicitar-orcamento" as const,
      label: "Pedir diagnóstico",
      id: "diagnostico",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold font-display tracking-tight"
          >
            {content.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {content.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <a
              href={whatsappUrl(content.whatsappMessage, `obrigado_page_${content.channel}`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={waHero.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-8 py-4 shadow-glow-primary"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp agora
            </a>
            <Link
              to={content.finalCtaTo}
              onClick={() => handleCta("hero_final_cta", content.finalCtaLabel, 0, content.finalCtaTo)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-6 py-4 font-semibold hover:border-primary transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              {content.finalCtaLabel}
            </Link>
          </motion.div>
        </section>

        {/* Próximos passos */}
        <section className="mt-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="text-center text-2xl font-bold font-display mb-2">Próximos passos</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              Aproveite para conhecer melhor a 0WEB enquanto preparamos sua proposta.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ctaCards.map((card, i) => (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <Link
                    to={card.to}
                    preload="render"
                    onClick={() => handleCta(card.id, card.label)}
                    className="group block h-full rounded-2xl border border-border bg-card p-6 hover:border-primary transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {card.label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Prova social */}
        <section className="mt-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {[
                { n: "+200", l: "clientes ativos" },
                { n: "R$ 28M+", l: "em vendas geradas" },
                { n: "98%", l: "de satisfação" },
              ].map((s) => (
                <div key={s.l} className="text-center rounded-2xl border border-border bg-card p-6">
                  <p className="text-3xl font-bold font-display text-primary">{s.n}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex gap-0.5 mb-2 text-yellow-500" aria-label="5 estrelas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-foreground">"{t.text}"</blockquote>
                  <figcaption className="mt-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">{t.name}</strong> · {t.role}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-20">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center rounded-3xl border border-border bg-card p-8 lg:p-12">
            <h2 className="text-2xl font-bold font-display">Não quer esperar?</h2>
            <p className="mt-2 text-muted-foreground">
              Fale direto pelo WhatsApp e receba um diagnóstico gratuito em poucos minutos.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={whatsappUrl("Quero agilizar minha proposta. Pode me atender agora?", `obrigado_cta_final_${content.channel}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCta("final_whatsapp", "Quero falar agora")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-8 py-3 shadow-glow-primary"
              >
                <MessageCircle className="w-5 h-5" />
                Quero falar agora
              </a>
              <Link
                to="/"
                onClick={() => handleCta("home", "Voltar para o início")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-semibold hover:bg-muted transition-colors"
              >
                Voltar para o início
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
