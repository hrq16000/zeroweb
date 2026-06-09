import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { z } from "zod";
import { ArrowRight, CheckCircle, MessageCircle, HelpCircle, Layers, FileText, Star, Sparkles, Package } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { absUrl, ORIGIN, breadcrumbLd } from "@/lib/seo";
import { useEffect, useMemo, type ReactElement } from "react";
import { whatsappUrl } from "@/lib/site-config";
import { getThankYouContent } from "@/lib/thank-you-content";
import { getLeadAttribution, attributionToEventParams } from "@/lib/lead-attribution";
import { loadAttributionSnapshot } from "@/lib/lead-attribution-snapshot";
import { useWhatsappTracking } from "@/lib/use-whatsapp-tracking";
import { THANK_YOU_CTA, buildThankYouCtaParams } from "@/lib/event-taxonomy";
import { OrderSummaryCard } from "@/components/site/OrderSummaryCard";

const TITLE = "Obrigado pelo contato · 0WEB";
const DESC = "Recebemos sua mensagem. Nossa equipe vai responder em até 1 hora útil. Enquanto isso, explore nossos planos e cases.";

const searchSchema = z.object({
  source: z.string().max(80).optional(),
  order: z.string().uuid().optional(),
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


function ObrigadoPage() {
  const { source, order } = Route.useSearch();
  // Snapshot persisted at submit-time wins over the URL ?source= param.
  // Fallbacks: query string, then "direct".
  const attr = useMemo(() => {
    if (typeof window === "undefined") return null;
    return loadAttributionSnapshot() ?? getLeadAttribution(source || "direct");
  }, [source]);
  const resolvedSource = attr?.source ?? source ?? "direct";
  const content = attr?.content ?? getThankYouContent(resolvedSource);
  const evtAttr = useMemo(() => {
    if (typeof window === "undefined") return { source: resolvedSource, channel: content.channel };
    return attributionToEventParams(attr ?? getLeadAttribution(resolvedSource));
  }, [attr, resolvedSource, content.channel]);

  useEffect(() => {
    // Canonical taxonomy event — fires once per /obrigado view.
    trackConversion("thank_you_view", {
      ...evtAttr,
      surface: "page",
      page: "/obrigado",
      event_category: "conversion",
      order_id: order ?? null,
      checkout_method:
        resolvedSource === "checkout-stripe" ? "stripe" :
        resolvedSource === "checkout-whatsapp" ? "whatsapp" :
        "other",
    });
    // Legacy event preserved for one sprint while dashboards transition.
    trackEvent("obrigado_page_view", { ...evtAttr, surface: "page", legacy: true });
  }, [evtAttr, order, resolvedSource]);

  const handleCta = (eventName: string, ctaId: string, label: string, position: number, target: string) => {
    const params = buildThankYouCtaParams({
      base: evtAttr,
      surface: "page",
      ctaId, target, label, position,
    });
    trackConversion(eventName, { ...params, order_id: order ?? null });
    // Legacy event kept for back-compat dashboards.
    trackEvent("obrigado_cta_click", { ...params, legacy: true });
  };

  const waHero = useWhatsappTracking({ ...evtAttr, location: `obrigado_page_${content.channel}`, surface: "page", cta_id: "whatsapp_hero", position: 0 });
  const waFinal = useWhatsappTracking({ ...evtAttr, location: `obrigado_cta_final_${content.channel}`, surface: "page", cta_id: "whatsapp_final", position: 99 });

  const ICONS: Record<string, ReactElement> = {
    layers: <Layers className="w-6 h-6 text-primary" />,
    help: <HelpCircle className="w-6 h-6 text-primary" />,
    file: <FileText className="w-6 h-6 text-primary" />,
    sparkles: <Sparkles className="w-6 h-6 text-primary" />,
    message: <MessageCircle className="w-6 h-6 text-primary" />,
    package: <Package className="w-6 h-6 text-primary" />,
  };

  const ctaCards = content.ctaCards?.length
    ? content.ctaCards.map((c) => ({ ...c, icon: ICONS[c.icon] ?? ICONS.sparkles }))
    : [
        {
          icon: ICONS.layers,
          title: "Conheça nossos planos",
          desc: content.planosLabel,
          to: THANK_YOU_CTA.PLANS.target,
          label: "Ver planos",
          id: THANK_YOU_CTA.PLANS.id,
          event: THANK_YOU_CTA.PLANS.event,
        },
        {
          icon: ICONS.help,
          title: "Dúvidas frequentes",
          desc: "Veja respostas sobre prazos, contratos e entregáveis.",
          to: THANK_YOU_CTA.FAQ.target,
          label: "Ir para FAQ",
          id: THANK_YOU_CTA.FAQ.id,
          event: THANK_YOU_CTA.FAQ.event,
        },
        {
          icon: ICONS.file,
          title: "Solicitar diagnóstico",
          desc: "Receba uma análise gratuita do seu site e estratégia digital.",
          to: "/solicitar-orcamento" as const,
          label: "Pedir diagnóstico",
          id: THANK_YOU_CTA.DIAGNOSTICO.id,
          event: THANK_YOU_CTA.DIAGNOSTICO.event,
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
              onClick={() => handleCta(THANK_YOU_CTA.DIAGNOSTICO.event, THANK_YOU_CTA.DIAGNOSTICO.id, content.finalCtaLabel, 0, content.finalCtaTo)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-6 py-4 font-semibold hover:border-primary transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              {content.finalCtaLabel}
            </Link>
          </motion.div>

          {content.slaBadge ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200"
            >
              ⏱️ {content.slaBadge}
            </motion.p>
          ) : null}

          {order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm"
            >
              <a
                href="#pedido"
                className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
              >
                <Package className="w-4 h-4" />
                Ver resumo do pedido
              </a>
              <Link
                to="/pedido/$id"
                params={{ id: order }}
                onClick={() => handleCta("thank_you_cta_order_page", "order_page_link", "Abrir página do pedido", 0, `/pedido/${order}`)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-semibold hover:border-primary transition-colors"
              >
                Abrir página do pedido
              </Link>
            </motion.div>
          )}

        </section>

        {order ? <OrderSummaryCard orderId={order} source={source} /> : null}



        {/* Status do atendimento (quando o canal define passos) */}
        {content.status && content.status.length > 0 ? (
          <section className="mt-16">
            <div className="mx-auto max-w-4xl px-5 lg:px-8">
              <h2 className="text-center text-2xl font-bold font-display mb-2">Status do seu pedido</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
                Acompanhe o que acontece a seguir:
              </p>
              <ol className="grid md:grid-cols-3 gap-4">
                {content.status.map((s, i) => (
                  <motion.li
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="relative rounded-2xl border border-border bg-card p-5"
                  >
                    <span className="absolute -top-3 -left-3 grid place-items-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">{s.eta}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{s.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

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
                    onClick={() => handleCta(card.event, card.id, card.label, i + 1, card.to)}
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

        {/* Prova social personalizada por origem */}
        <section className="mt-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="text-center text-2xl font-bold font-display mb-8">{content.socialProofHeadline}</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {content.stats.map((s) => (
                <div key={s.l} className="text-center rounded-2xl border border-border bg-card p-6">
                  <p className="text-3xl font-bold font-display text-primary">{s.n}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {content.testimonials.map((t) => (
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
                onClick={waFinal.onClick}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-8 py-3 shadow-glow-primary"
              >
                <MessageCircle className="w-5 h-5" />
                Quero falar agora
              </a>
              <Link
                to="/"
                onClick={() => handleCta("thank_you_cta_home", "home", "Voltar para o início", 100, "/")}
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
