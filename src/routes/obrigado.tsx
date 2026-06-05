import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, MessageCircle, HelpCircle, Layers, FileText } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { trackConversion } from "@/lib/analytics";
import { absUrl, ORIGIN, breadcrumbLd } from "@/lib/seo";
import { useEffect } from "react";
import { whatsappUrl } from "@/lib/site-config";

const TITLE = "Obrigado pelo contato · 0WEB";
const DESC = "Recebemos sua mensagem. Nossa equipe vai responder em até 1 hora útil. Enquanto isso, explore nossos planos e cases.";

export const Route = createFileRoute("/obrigado")({
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
            breadcrumbLd([
              { name: "Obrigado", path: "/obrigado" },
            ]),
          ],
        }),
      },
    ],
  }),
  component: ObrigadoPage,
});

function ObrigadoPage() {
  useEffect(() => {
    trackConversion("obrigado_page_view", { page: "/obrigado", event_category: "conversion" });
  }, []);

  const ctaCards = [
    {
      icon: <Layers className="w-6 h-6 text-primary" />,
      title: "Conheça nossos planos",
      desc: "Escolha o pacote ideal para acelerar seu crescimento digital.",
      to: "/planos",
      label: "Ver planos",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      title: "Dúvidas frequentes",
      desc: "Veja respostas sobre prazos, contratos e entregáveis.",
      to: "/faq",
      label: "Ir para FAQ",
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Cases de sucesso",
      desc: "Leia histórias reais de empresas que cresceram com a 0WEB.",
      to: "/cases",
      label: "Ver cases",
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
            Mensagem enviada com sucesso!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Recebemos seus dados e já abrimos o WhatsApp com sua mensagem.
            <br className="hidden sm:block" />
            Nossa equipe responde em até <strong>1 hora útil</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-8"
          >
            <a
              href={whatsappUrl(undefined, "obrigado_page")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackConversion("whatsapp_click", { location: "obrigado_page" })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-8 py-4 shadow-glow-primary"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp agora
            </a>
          </motion.div>
        </section>

        <section className="mt-20">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="text-center text-2xl font-bold font-display mb-2">O que fazer agora?</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
              Aproveite para conhecer melhor a 0WEB enquanto preparamos sua proposta.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ctaCards.map((card, i) => (
                <motion.div
                  key={card.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                >
                  <Link
                    to={card.to}
                    preload="render"
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

        <section className="mt-20">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center rounded-3xl border border-border bg-card p-8 lg:p-12">
            <h2 className="text-2xl font-bold font-display">Não quer esperar?</h2>
            <p className="mt-2 text-muted-foreground">
              Fale direto pelo WhatsApp e receba um diagnóstico gratuito em poucos minutos.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={whatsappUrl("Quero agilizar minha proposta. Pode me atender agora?", "obrigado_cta_final")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "obrigado_cta_final" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-8 py-3 shadow-glow-primary"
              >
                <MessageCircle className="w-5 h-5" />
                Quero falar agora
              </a>
              <Link
                to="/"
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
