import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, ArrowRight, Zap, Rocket, Building2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TrustStrip } from "@/components/site/TrustStrip";
import { absUrl } from "@/lib/seo";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const TITLE = "Comparativo Site START vs PRO vs ENTERPRISE · 0WEB";
const DESC =
  "Compare lado a lado os planos Site Express (START), Site Pro (PRO) e Enterprise. Páginas, SEO, meta de ranking, suporte, prazo de entrega e preço — tudo transparente para você escolher o tier certo.";
const URL = absUrl("/planos-comparativo");

type Tier = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  highlight?: boolean;
  icon: typeof Zap;
  ctaTo: string;
  ctaLabel: string;
};

const TIERS: Tier[] = [
  {
    id: "start",
    name: "Site START",
    tagline: "Express · landing pronta em 24h",
    price: "a partir de R$ 1.500",
    icon: Zap,
    ctaTo: "/servicos/site-express",
    ctaLabel: "Quero o START",
  },
  {
    id: "pro",
    name: "Site PRO",
    tagline: "10+ páginas com meta Google 1–5",
    price: "a partir de R$ 7.900",
    highlight: true,
    icon: Rocket,
    ctaTo: "/servicos/site-pro",
    ctaLabel: "Quero o PRO",
  },
  {
    id: "enterprise",
    name: "Site ENTERPRISE",
    tagline: "Sistema sob medida + integrações",
    price: "sob consulta",
    icon: Building2,
    ctaTo: "/solicitar-diagnostico",
    ctaLabel: "Solicitar diagnóstico",
  },
];

type Row = {
  feature: string;
  start: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
};

const ROWS: Row[] = [
  { feature: "Páginas custom", start: "1 landing", pro: "10+ páginas", enterprise: "ilimitadas" },
  { feature: "Prazo de entrega", start: "24 horas", pro: "21 a 30 dias", enterprise: "60 a 120 dias" },
  { feature: "SEO técnico (Schema, CWV 95+)", start: true, pro: true, enterprise: true },
  { feature: "Estratégia de palavras-chave", start: false, pro: true, enterprise: true },
  { feature: "Meta de ranking Google 1–5", start: false, pro: true, enterprise: true },
  { feature: "Relatório mensal de posições", start: false, pro: true, enterprise: true },
  { feature: "Painel para editar conteúdo", start: "básico", pro: true, enterprise: "custom" },
  { feature: "Integrações (CRM, ERP, API)", start: false, pro: "Meta/GA4", enterprise: "sob medida" },
  { feature: "Hospedagem inclusa", start: "1 ano", pro: "1 ano", enterprise: "incluída" },
  { feature: "SSL + Anti-DDoS + Edge CDN", start: true, pro: true, enterprise: true },
  { feature: "Suporte pós-entrega", start: "30 dias", pro: "6 meses", enterprise: "12 meses + SLA" },
  { feature: "Ideal para", start: "campanhas pagas", pro: "ranquear no Google", enterprise: "operações críticas" },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="w-5 h-5 text-primary mx-auto" aria-label="Incluso" />;
  if (v === false) return <X className="w-5 h-5 text-muted-foreground/50 mx-auto" aria-label="Não incluso" />;
  return <span className="text-sm">{v}</span>;
}

export const Route = createFileRoute("/planos-comparativo")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PlanosComparativo,
});

function PlanosComparativo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="pt-page pb-10">
          <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Planos 0WEB</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">
              START, PRO ou ENTERPRISE — qual é o seu?
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl mx-auto">
              Comparação transparente lado a lado: páginas, SEO, suporte, prazo e investimento. Sem letra miúda.
            </p>
          </div>
        </section>

        <TrustStrip variant="compact" />

        <section className="py-14">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="grid md:grid-cols-3 gap-5">
              {TIERS.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    className={`relative rounded-2xl border p-6 flex flex-col ${
                      t.highlight
                        ? "border-primary bg-card shadow-glow-primary"
                        : "border-border bg-card/60"
                    }`}
                  >
                    {t.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1">
                        Mais escolhido
                      </span>
                    )}
                    <Icon className="w-7 h-7 text-primary" />
                    <h2 className="mt-3 text-xl font-bold">{t.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                    <p className="mt-4 text-lg font-semibold">{t.price}</p>
                    <Link
                      to={t.ctaTo as any}
                      className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                        t.highlight
                          ? "bg-gradient-primary text-primary-foreground shadow-glow-primary"
                          : "border border-border hover:border-primary"
                      }`}
                    >
                      {t.ctaLabel} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Recurso</th>
                    <th className="text-center p-4 font-semibold">START</th>
                    <th className="text-center p-4 font-semibold text-primary">PRO</th>
                    <th className="text-center p-4 font-semibold">ENTERPRISE</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={r.feature} className={i % 2 ? "bg-muted/20" : ""}>
                      <td className="p-4 font-medium">{r.feature}</td>
                      <td className="p-4 text-center"><Cell v={r.start} /></td>
                      <td className="p-4 text-center bg-primary/5"><Cell v={r.pro} /></td>
                      <td className="p-4 text-center"><Cell v={r.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Ainda na dúvida?</h2>
            <p className="mt-3 text-muted-foreground">
              Em 15 minutos de conversa, indicamos o plano certo para o seu momento — sem empurroterapia.
            </p>
            <FunnelCTAButton
              intent={{ purpose: "proposal", source: "planos_comparativo_cta", pagePath: "/planos-comparativo", placement: "footer" }}
              label="Falar com especialista"
              location="planos_comparativo_cta"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-7 py-3.5 shadow-glow-primary uppercase text-sm tracking-wide"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
