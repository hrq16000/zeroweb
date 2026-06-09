import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Clock,
  MessageCircle,
  Smartphone,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Globe,
  Palette,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { FunnelModalWrapper } from "@/components/funnel/FunnelModalWrapper";
import { trackEvent } from "@/lib/analytics";
import { absUrl, ORG_REF, breadcrumbLd } from "@/lib/seo";

const SLUG = "site-24h";
const PATH = `/servicos/${SLUG}`;
const URL = absUrl(PATH);
const TITLE = "Site Profissional em 24h por R$499 · 0WEB";
const DESC =
  "R$499 separam você de um site que transforma curiosos em clientes. Site sob medida, mobile-first, no ar em até 24 horas. Pagamento único, sem mensalidade.";
const PRICE = "499.00";

export const Route = createFileRoute("/servicos/site-24h")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "site em 24h, site profissional barato, site R$499, site sob medida, criação de site rápida, site mobile first, landing page conversão",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "product" },
      { property: "og:url", content: URL },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "product:price:amount", content: PRICE },
      { property: "product:price:currency", content: "BRL" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": `${URL}#service`,
              name: "Site profissional em 24h",
              description: DESC,
              serviceType: "Web Design Express",
              category: "Web Development",
              url: URL,
              areaServed: { "@type": "Country", name: "BR" },
              provider: ORG_REF,
              offers: {
                "@type": "Offer",
                price: PRICE,
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
                url: URL,
              },
            },
            breadcrumbLd([
              { name: "Início", path: "/" },
              { name: "Serviços", path: "/servicos" },
              { name: "Site em 24h", path: PATH },
            ]),
          ],
        }),
      },
    ],
  }),
  component: Site24hPage,
});

const BENEFITS = [
  "Site profissional criado em até 24 horas",
  "Design que passa credibilidade e converte visita em contato",
  "Otimizado para celular — onde o seu cliente está",
];

const STATS = [
  { value: "24h", label: "prazo de entrega garantido" },
  { value: "R$499", label: "investimento único no site" },
  { value: "100%", label: "feito sob medida pro seu negócio" },
];

const PROBLEMS = [
  { n: "01", t: "Agências cobram R$3.000, R$5.000 e demoram semanas" },
  { n: "02", t: "Plataformas de arrastar e soltar ficam genéricas e feias" },
  { n: "03", t: "Freelancers somem no meio do projeto" },
  { n: "04", t: "E enquanto isso, seus concorrentes aparecem e você não" },
];

const SOLUTIONS = [
  { icon: Palette, t: "Design profissional feito sob medida pro seu segmento" },
  { icon: Globe, t: "Hospedagem configurada e domínio no ar em até 24h" },
  { icon: MessageCircle, t: "Copy pensada para transformar visita em mensagem no WhatsApp" },
  { icon: Smartphone, t: "Mobile first — perfeito no celular, onde seu cliente está" },
];

const STEPS = [
  {
    n: "01",
    title: "Você me conta sobre o negócio",
    badge: "5 minutos",
    desc:
      "Me manda uma mensagem no WhatsApp com o nome do seu negócio, o que você faz e quem é o seu cliente. ↳ Já consigo começar com o básico que você me passar.",
  },
  {
    n: "02",
    title: "Eu construo o site",
    badge: "até 24h",
    desc:
      "Com as informações em mãos, desenvolvo um site completo, mobile-first e com copy focada em conversão. ↳ Você recebe um link para revisar antes de ir ao ar.",
  },
  {
    n: "03",
    title: "Site no ar, negócio vendendo",
    badge: "resultado",
    desc:
      "Após sua aprovação, publico o site com domínio e hospedagem configurados. ↳ Suporte pós-entrega incluso para ajustes finais.",
  },
];

const TESTIMONIALS = [
  {
    text:
      "Não acreditei quando vi pronto. Mandei as informações de manhã e no outro dia o site já estava no ar. Em uma semana comecei a receber contato no WhatsApp de gente que me achou no Google.",
    name: "Marcos Oliveira",
    role: "Eletricista — Londrina, PR",
    initials: "MO",
  },
  {
    text:
      "Fui em agência antes e me pediram R$4.500 e 45 dias. Aqui paguei muito menos e ficou pronto em um dia. O design ficou lindo e meu salão começou a passar muito mais credibilidade.",
    name: "Juliana Ferreira",
    role: "Salão de beleza — Maringá, PR",
    initials: "JF",
  },
];

function Site24hPage() {
  const [open, setOpen] = useState(false);
  const cta = () => {
    trackEvent("cta_click", { label: "funnel_cta", location: "site24h_legacy_cta", funnel: "funnel-service" });
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs compact
        items={[
          { name: "Serviços", path: "/servicos" },
          { name: "Site em 24h", path: "/servicos/site-24h" },
        ]}
      />
      <FunnelModalWrapper
        open={open}
        onClose={() => setOpen(false)}
        funnelSlug="funnel-service"
        serviceSlug="site-24h"
      />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Site profissional · Entrega em 24h
            </motion.div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              <span className="text-primary">R$499</span> separam você de um site
              <br className="hidden md:block" /> que transforma curiosos em clientes.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Pare de perder clientes por não parecer profissional na internet.
              Site feito sob medida, entregue em até 24 horas.
            </p>

            <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={cta}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02] hover:shadow-primary/50"
            >
              Quero meu site agora
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border/60 bg-card/40">
        <div className="container mx-auto grid grid-cols-1 gap-px overflow-hidden md:grid-cols-3 md:divide-x md:divide-border/60">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-10 text-center">
              <div className="font-display text-4xl font-bold text-primary md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFÓLIO */}
      <Section tag="Portfólio" title={<>Sites reais. <br className="hidden md:block" />Entregues de verdade.</>}>
        <p className="mx-auto max-w-2xl text-center text-muted-foreground">
          Não é template, não é mockup. São sites que eu fiz e estão no ar agora —
          cada um pensado do zero pro negócio do cliente.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <BrowserCard
            url="jjsolucaorh.com.br"
            footer="J&J Assessoria RH / Consultoria de RH · Entregue em 24h"
          />
          <BrowserCard
            url="luxury-scone-9fd.netlify.app"
            footer="Luxury — Moda & Estilo / Agência de viagens · Entregue em 24h"
          />
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">O seu pode ser o próximo.</p>
        <div className="mt-6 flex justify-center">
          <CtaButton onClick={cta}>Quero um site assim</CtaButton>
        </div>
      </Section>

      {/* PROBLEMA */}
      <Section
        tag="O Problema"
        title="Seu concorrente já está na internet. E você, onde está?"
        bg="muted"
      >
        <p className="mx-auto max-w-2xl text-center text-muted-foreground">
          Enquanto você adia, outra empresa do seu segmento aparece no Google, no
          Instagram, no WhatsApp — e fica com o cliente que seria seu.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {PROBLEMS.map((p) => (
            <div
              key={p.n}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 transition hover:border-primary/40"
            >
              <span className="font-display text-2xl font-bold text-primary">{p.n}</span>
              <span className="text-foreground/90">{p.t}</span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-muted-foreground">
          É por isso que tantos negócios bons continuam dependendo só do boca a boca —
          sem presença digital nenhuma.
        </p>
      </Section>

      {/* SOLUÇÃO */}
      <Section tag="A Solução" title="Site pronto, sem complicação">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <ul className="space-y-4">
            {SOLUTIONS.map(({ icon: Icon, t }) => (
              <li
                key={t}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5"
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-foreground/90">{t}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              O que você recebe
            </div>
            <div className="mt-3 flex items-end gap-2">
              <div className="font-display text-6xl font-bold text-primary leading-none">24</div>
              <div className="pb-2 text-sm text-muted-foreground">horas até no ar</div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                "Design moderno",
                "Adaptado ao celular",
                "Focado em conversão",
              ].map((l) => (
                <div key={l}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/80">{l}</span>
                    <span className="font-semibold text-primary">100%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-primary/70" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-lg">
          Tudo isso por <span className="font-bold text-primary">R$499</span> — você
          paga uma vez e fica com o site. Simples assim.
        </p>
      </Section>

      {/* COMO FUNCIONA */}
      <Section
        tag="Como Funciona"
        title="Do zero ao site no ar em 3 passos simples"
        bg="muted"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-bold text-primary">{s.n}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {s.badge}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center">
          Do pagamento ao site no ar:{" "}
          <span className="font-bold text-primary">menos de 24 horas.</span>
        </p>
      </Section>

      {/* DEPOIMENTOS */}
      <Section tag="Resultados" title="O que dizem quem já tem o site no ar">
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="mt-4 text-foreground/90">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-muted-foreground">
          Você não precisa gastar caro pra aparecer bem na internet. Já tem um jeito
          mais rápido e mais barato.
        </p>
      </Section>

      {/* INVESTIMENTO */}
      <Section
        tag="Investimento"
        title="Sem pagar caro por algo que demora semanas."
        bg="muted"
      >
        <p className="mx-auto max-w-2xl text-center text-muted-foreground">
          Compare o investimento de uma agência tradicional com o que você paga
          aqui — e veja por que faz sentido começar agora.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-8 opacity-80">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agências tradicionais
            </div>
            <div className="mt-4 font-display text-3xl font-bold line-through decoration-muted-foreground/60">
              R$3.000–R$8.000
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> 30 dias
            </div>
          </div>
          <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/15 via-card to-card p-8 shadow-xl">
            <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Aqui
            </span>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              0WEB · Site em 24h
            </div>
            <div className="mt-4 font-display text-5xl font-bold text-primary">R$499</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium">
              <Zap className="h-4 w-4 text-primary" /> 24 horas
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Site completo",
                "Hospedagem configurada",
                "Suporte pós-entrega",
              ].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden border-t border-border/60 bg-gradient-to-br from-primary/15 via-background to-background">
        <div className="container mx-auto px-4 py-20 text-center md:py-28">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Agora a decisão é sua.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Continuar sem aparecer na internet… ou ter um site profissional no ar
            ainda hoje.
          </p>
          <div className="mt-10 flex justify-center">
            <CtaButton onClick={cta} large>
              Quero meu site em 24h
            </CtaButton>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Pagamento único
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" /> Entrega em 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" /> Foco em conversão
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Pronto para começar?</h2>
          <p className="mt-2 text-muted-foreground">
            Responda 7 perguntas rápidas e receba um orçamento personalizado.
          </p>
          <div className="mt-6 flex justify-center">
            <FunnelCTAButton
              pageType="service"
              serviceSlug="site-24h"
              label="Solicitar orçamento gratuito"
              location="site24h_cta_final"
            />
          </div>
        </div>
      </section>

      <RelatedLinksGrid
        title="Serviços relacionados"
        subtitle="Continue evoluindo a presença digital do seu negócio."
        only={["/servicos/criacao-de-sites", "/servicos/landing-pages", "/servicos/presenca-digital"]}
      />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({
  tag,
  title,
  children,
  bg = "default",
}: {
  tag: string;
  title: React.ReactNode;
  children: React.ReactNode;
  bg?: "default" | "muted";
}) {
  return (
    <section className={bg === "muted" ? "bg-card/30 border-y border-border/60" : ""}>
      <div className="container mx-auto px-4 py-20 md:py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            {tag}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function CtaButton({
  children,
  onClick,
  large = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  large?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-3 rounded-full bg-primary font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02] hover:shadow-primary/50 ${
        large ? "px-10 py-5 text-base md:text-lg" : "px-7 py-3.5 text-sm"
      }`}
    >
      {children}
      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
    </button>
  );
}

function BrowserCard({ url, footer }: { url: string; footer: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
        <div className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-muted/40 to-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Carregando prévia...
        </div>
      </div>
      <div className="border-t border-border/60 bg-card px-4 py-3 text-xs text-muted-foreground">
        {footer}
      </div>
    </div>
  );
}
