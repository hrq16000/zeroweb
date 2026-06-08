import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Star, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { useEffect } from "react";

export type IntentLandingProps = {
  slug: string;
  intent: string; // e.g. "criacao-sites"
  eyebrow: string;
  headline: string;
  subheadline: string;
  offerSlug: string;
  ctaLabel: string;
  whatsappMessage: string;
  benefits: { title: string; description: string }[];
  faq: { q: string; a: string }[];
  socialProof?: { name: string; role: string; quote: string }[];
  schemaService: { name: string; description: string };
  /** Se passado, troca o CTA principal pelo FunnelCTAButton dinâmico. */
  funnelSlug?: string;
  /** Slug do serviço atual, usado pelo funil dinâmico. */
  serviceSlug?: string;
};

export function IntentLanding(p: IntentLandingProps) {
  useEffect(() => {
    trackEvent("lp_view", { intent: p.intent, offer: p.offerSlug });
  }, [p.intent, p.offerSlug]);

  const handleCta = (location: string) => {
    trackEvent("lp_cta_click", { intent: p.intent, offer: p.offerSlug, location });
    trackConversion("cta_click", { intent: p.intent, offer: p.offerSlug });
  };

  const waLink = whatsappUrl(p.whatsappMessage, `lp_${p.intent}`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {p.eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-6xl font-bold font-display tracking-tight"
            >
              {p.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {p.subheadline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {p.funnelSlug ? (
                <FunnelCTAButton
                  pageType="service"
                  serviceSlug={p.serviceSlug}
                  funnelSlug={p.funnelSlug}
                  label={p.ctaLabel}
                  location={`lp_${p.intent}_hero`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                />
              ) : (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCta("hero_wa")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  {p.ctaLabel} <ArrowRight className="w-4 h-4" />
                </a>
              )}
              <Link
                to="/contato"
                onClick={() => handleCta("hero_form")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted transition text-sm font-medium"
              >
                Falar com especialista
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        {p.socialProof && p.socialProof.length > 0 && (
          <section className="py-14 px-6 bg-muted/30 border-y border-border">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
              {p.socialProof.map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex gap-0.5 text-primary mb-3">
                    {Array.from({ length: 5 }).map((_, n) => (
                      <Star key={n} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90">"{s.quote}"</p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">{s.name}</strong> · {s.role}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BENEFITS */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-center">Benefícios</h2>
            <div className="mt-10 grid md:grid-cols-2 gap-5">
              {p.benefits.map((b, i) => (
                <div key={i} className="flex gap-3 p-5 rounded-xl border border-border bg-card">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{b.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-center">Perguntas frequentes</h2>
            <div className="mt-8 space-y-3">
              {p.faq.map((f, i) => (
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

        {/* FINAL CTA */}
        <section className="py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display">Pronto para começar?</h2>
          <p className="mt-3 text-muted-foreground">Resposta em até 1 hora útil.</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCta("footer_wa")}
            className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {p.ctaLabel} <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: p.schemaService.name,
            description: p.schemaService.description,
            provider: { "@type": "Organization", name: "0WEB", url: "https://0web.com.br" },
            areaServed: "BR",
            mainEntity: {
              "@type": "FAQPage",
              mainEntity: p.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          }),
        }}
      />
    </div>
  );
}

export function buildHead(opts: { title: string; description: string; url: string }) {
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: opts.url },
    ],
    links: [{ rel: "canonical", href: opts.url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
            { "@type": "ListItem", position: 2, name: opts.title.split(" · ")[0], item: opts.url },
          ],
        }),
      },
    ],
  };
}
