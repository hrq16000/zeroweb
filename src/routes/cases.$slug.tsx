import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Quote,
  Sparkles,
  Target,
  Trophy,
  Wrench,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { ScrollTracker } from "@/components/site/ScrollTracker";
import { cases, getCase } from "@/lib/cases-data";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

export const Route = createFileRoute("/cases/$slug")({
  loader: ({ params }) => {
    const c = getCase(params.slug);
    if (!c) throw notFound();
    return { case: c };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const c = loaderData.case;
    return {
      meta: [
        { title: c.seo.title },
        { name: "description", content: c.seo.description },
        { name: "keywords", content: c.seo.keywords },
        { property: "og:title", content: c.seo.title },
        { property: "og:description", content: c.seo.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/cases/${c.slug}` },
        { property: "og:image", content: c.cover },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: c.seo.title },
        { name: "twitter:description", content: c.seo.description },
        { name: "twitter:image", content: c.cover },
      ],
      links: [{ rel: "canonical", href: `/cases/${c.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: c.seo.title,
                description: c.seo.description,
                image: c.cover,
                author: { "@type": "Organization", name: "0WEB" },
                publisher: { "@type": "Organization", name: "0WEB" },
                mainEntityOfPage: `/cases/${c.slug}`,
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Início", item: "/" },
                  { "@type": "ListItem", position: 2, name: "Cases", item: "/#cases" },
                  { "@type": "ListItem", position: 3, name: c.brand, item: `/cases/${c.slug}` },
                ],
              },
              {
                "@type": "Organization",
                name: c.brand,
                url: c.url,
                areaServed: c.city,
              },
            ],
          }),
        },
      ],
    };
  },
  component: CasePage,
});

function CasePage() {
  const { case: c } = Route.useLoaderData() as { case: import("@/lib/cases-data").CaseStudy };
  const { open: openFunnel } = useWaFunnel();

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <ScrollTracker />
      <Header />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className={`relative overflow-hidden bg-gradient-to-br ${c.color} text-white`}>
          <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-20 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm"
                onClick={() => trackEvent("case_back", { slug: c.slug })}
              >
                <ArrowLeft className="w-4 h-4" /> Voltar para 0WEB
              </Link>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> {c.category} · {c.city}
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                {c.brand}
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-white/90 max-w-2xl">{c.tagline}</p>
              <p className="mt-5 text-white/80 max-w-2xl">{c.intro}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("case_visit_site", { slug: c.slug, domain: c.domain })}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-foreground font-semibold px-6 py-3.5 hover:bg-white/95 transition"
                >
                  Visitar {c.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    trackConversion("whatsapp_click", { location: "case_hero", slug: c.slug });
                    openFunnel(`case_${c.slug}`);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background font-semibold px-6 py-3.5 hover:bg-foreground/90 transition"
                >
                  <MessageCircle className="w-4 h-4 text-accent" />
                  Quero algo parecido
                </button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 blur-3xl rounded-full" />
                <img
                  src={c.cover}
                  alt={`Mockup do projeto ${c.brand}`}
                  width={1280}
                  height={800}
                  loading="eager"
                  className="relative rounded-3xl shadow-2xl ring-1 ring-white/30 w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Métricas */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 -mt-12 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {c.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-card border border-border p-5 shadow-elegant"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </div>
                <div className="mt-1 text-3xl font-bold font-display text-gradient">{m.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Desafio / Solução / Resultado */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-20 grid lg:grid-cols-3 gap-6">
          <Block
            icon={<Target className="w-5 h-5" />}
            title="Desafio"
            tone="primary"
            items={c.challenges}
          />
          <Block
            icon={<Wrench className="w-5 h-5" />}
            title="Solução"
            tone="accent"
            items={c.solutions}
          />
          <Block
            icon={<Trophy className="w-5 h-5" />}
            title="Resultado"
            tone="emerald"
            items={c.results}
          />
        </section>

        {/* Stack */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-16">
          <h2 className="text-2xl font-bold font-display">Stack & integrações</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {c.stack.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {s}
              </span>
            ))}
          </div>
        </section>

        {/* Depoimento */}
        <section className="mx-auto max-w-5xl px-5 lg:px-8 mt-20">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-background to-muted p-8 sm:p-12 shadow-elegant">
            <Quote className="w-8 h-8 text-primary" />
            <p className="mt-4 text-xl sm:text-2xl font-display leading-snug">
              “{c.testimonial.quote}”
            </p>
            <div className="mt-6 text-sm text-muted-foreground">
              <strong className="text-foreground">{c.testimonial.author}</strong> ·{" "}
              {c.testimonial.role}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-20">
          <div className="rounded-3xl bg-foreground text-background p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-display">
                Quer um resultado <span className="text-accent">como este</span>?
              </h2>
              <p className="mt-3 text-background/80">
                Solicite um diagnóstico gratuito e descubra o plano de crescimento ideal para o seu
                negócio.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/"
                hash="diagnostico"
                onClick={() =>
                  trackEvent("cta_click", { label: "diagnostico", location: `case_${c.slug}` })
                }
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
              >
                Solicitar Diagnóstico <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={whatsappUrl(undefined, `case_${c.slug}_cta`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackConversion("whatsapp_click", { location: `case_${c.slug}_cta` })
                }
                className="inline-flex items-center gap-2 rounded-full bg-background text-foreground font-semibold px-6 py-3.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Outros cases */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-20">
          <h2 className="text-2xl font-bold font-display">Outros cases</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases
              .filter((o) => o.slug !== c.slug)
              .slice(0, 3)
              .map((o) => (
                <Link
                  key={o.slug}
                  to="/cases/$slug"
                  params={{ slug: o.slug }}
                  className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-elegant transition"
                >
                  <img
                    src={o.cover}
                    alt={o.brand}
                    width={1280}
                    height={800}
                    loading="lazy"
                    className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition"
                  />
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground">{o.category}</div>
                    <div className="font-semibold mt-0.5">{o.brand}</div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function Block({
  icon,
  title,
  tone,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "primary" | "accent" | "emerald";
  items: string[];
}) {
  const toneBg = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/20 text-accent-foreground",
    emerald: "bg-emerald-500/10 text-emerald-600",
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${toneBg}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-lg">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
