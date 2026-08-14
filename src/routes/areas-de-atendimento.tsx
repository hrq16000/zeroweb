// Hub-mãe /areas-de-atendimento — topo do silo geográfico.
// Liga BH (30 bairros), Curitiba/RMC, cidades e estados atendidos.
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin, Sparkles, Globe2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { BH_NEIGHBORHOODS } from "@/lib/bh-neighborhoods";
import { CWB_NEIGHBORHOODS } from "@/lib/curitiba-neighborhoods";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const TITLE = "Áreas de Atendimento | Agência de Marketing Digital 0web";
const DESC =
  "Veja onde a 0web atende: 30 bairros de Belo Horizonte, Curitiba e região metropolitana, além de cidades e estados de todo o Brasil. Encontre a sua região.";
const URL = `${ORIGIN}/areas-de-atendimento`;

const FAQ = [
  {
    q: "A 0web atende empresas fora de Belo Horizonte e Curitiba?",
    a: "Sim. Belo Horizonte e Curitiba concentram nosso atendimento presencial e as páginas por bairro, mas todo o portfólio (sites, SEO, Google Ads, redes sociais e automação) é entregue remotamente para empresas de qualquer cidade do Brasil.",
  },
  {
    q: "Qual a vantagem de contratar uma agência que trabalha por bairro?",
    a: "Busca local é decidida no raio de poucos quilômetros. Trabalhar por bairro permite calibrar palavras-chave, raio de anúncio, Google Meu Negócio e conteúdo com a linguagem e a concorrência reais daquela microrregião — o que aumenta a taxa de contato por visita.",
  },
  {
    q: "Preciso ter endereço físico no bairro para ranquear nele?",
    a: "Não é obrigatório para SEO orgânico e para anúncios com segmentação por raio. Para o pacote completo de Google Meu Negócio, um endereço ou área de serviço declarada aumenta muito a força do resultado no mapa.",
  },
  {
    q: "Como sei qual página da minha região devo abrir?",
    a: "Se sua empresa está em BH, escolha o bairro na lista de Belo Horizonte. Em Curitiba ou região metropolitana, use a lista de Curitiba. Fora dessas regiões, comece pela página da sua cidade ou do seu estado.",
  },
  {
    q: "O atendimento é o mesmo em todas as regiões?",
    a: "Sim. O escopo, o processo e os prazos são idênticos. O que muda é a pesquisa de palavras-chave, a análise de concorrência local e a segmentação geográfica das campanhas.",
  },
];

export const Route = createFileRoute("/areas-de-atendimento")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              ...breadcrumbLd([
                { name: "Início", path: "/" },
                { name: "Áreas de Atendimento", path: "/areas-de-atendimento" },
              ]),
            },
            {
              "@type": "FAQPage",
              "@id": `${URL}#faq`,
              mainEntity: FAQ.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: AreasPage,
});

function AreasPage() {
  const bhByRegion = BH_NEIGHBORHOODS.reduce<Record<string, typeof BH_NEIGHBORHOODS>>((acc, n) => {
    (acc[n.region] ||= []).push(n);
    return acc;
  }, {});

  const cwbByCity = CWB_NEIGHBORHOODS.reduce<Record<string, typeof CWB_NEIGHBORHOODS>>((acc, n) => {
    (acc[n.city] ||= []).push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Início", path: "/" },
          { name: "Áreas de Atendimento", path: "/areas-de-atendimento" },
        ]}
      />

      <main>
        {/* HERO */}
        <section className="relative pt-12 lg:pt-20 pb-14 bg-hero overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5 text-accent" /> Cobertura nacional · Presença local
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Áreas de <span className="text-gradient">Atendimento</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              A 0web trabalha perto de quem compra de você. Escolha o seu bairro, a sua cidade ou o seu estado e veja a estratégia de marketing digital desenhada para aquela realidade.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <FunnelCTAButton
                intent={{ purpose: "proposal", source: "areas_atendimento", pagePath: "/areas-de-atendimento", placement: "hero" }}
                label="Solicitar Orçamento"
                location="areas_atendimento_hero"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
              />
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 font-semibold hover:bg-muted transition"
              >
                Ver Serviços
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="py-14">
          <div className="mx-auto max-w-4xl px-5 lg:px-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <h2 className="text-3xl font-bold font-display text-foreground">
              Marketing local funciona por proximidade, não por volume
            </h2>
            <p>
              Uma clínica na Savassi não disputa o mesmo cliente que uma clínica no Barreiro. O bairro muda o poder aquisitivo, o vocabulário da busca, o horário de pico e a lista de concorrentes que aparecem no mapa. Tratar tudo como “Belo Horizonte” desperdiça verba em cliques de gente que nunca vai até a sua porta.
            </p>
            <p>
              Por isso o atendimento da 0web é organizado por região. Cada página de bairro carrega a pesquisa de palavras-chave daquela microrregião, os tipos de negócio predominantes e o raio de segmentação que faz sentido para campanhas pagas. O mesmo vale para as páginas de cidade e de estado, usadas por empresas que atendem áreas maiores.
            </p>
            <p>
              Se a sua região ainda não tem página própria, o atendimento continua o mesmo — é só solicitar um orçamento e montamos a pesquisa local do zero.
            </p>
          </div>
        </section>

        {/* BELO HORIZONTE */}
        <section className="py-14 bg-muted/30">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold font-display">Belo Horizonte · 30 bairros</h2>
                <p className="mt-2 text-muted-foreground">
                  Silo completo de landing pages locais por bairro da capital mineira.
                </p>
              </div>
              <Link
                to="/bairros-bh"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                Ver hub de bairros de BH <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 space-y-7">
              {Object.entries(bhByRegion).map(([region, items]) => (
                <div key={region}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {region}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {items.map((n) => (
                      <li key={n.slug}>
                        <Link
                          to="/bairros-bh/$slug"
                          params={{ slug: n.slug }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary hover:text-primary transition"
                        >
                          <MapPin className="w-3.5 h-3.5" /> {n.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CURITIBA */}
        <section className="py-14">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold font-display">Curitiba e Região Metropolitana</h2>
                <p className="mt-2 text-muted-foreground">
                  Bairros de Curitiba e cidades da RMC com estratégia local dedicada.
                </p>
              </div>
              <Link
                to="/bairros-cwb"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                Ver hub de Curitiba <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 space-y-7">
              {Object.entries(cwbByCity).map(([city, items]) => (
                <div key={city}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {city}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {items.map((n) => (
                      <li key={n.slug}>
                        <Link
                          to="/bairros-cwb/$slug"
                          params={{ slug: n.slug }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary hover:text-primary transition"
                        >
                          <MapPin className="w-3.5 h-3.5" /> {n.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CIDADES E ESTADOS */}
        <section className="py-14 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Resto do Brasil</h2>
            <p className="mt-2 text-muted-foreground">
              Atendimento remoto com a mesma estrutura de pesquisa local.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              <Link
                to="/cidades"
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-elegant transition"
              >
                <Building2 className="w-6 h-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">Cidades atendidas</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Páginas por capital e cidades-chave, com serviços cruzados por cidade.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Ver cidades <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
              <Link
                to="/estados"
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-elegant transition"
              >
                <Globe2 className="w-6 h-6 text-primary" />
                <h3 className="mt-3 text-lg font-semibold">Estados atendidos</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Visão por unidade federativa para empresas com operação regional.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Ver estados <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* LEIA TAMBÉM — cluster Sites Robustos */}
        <section className="py-14 border-t border-border">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Leia também</h2>
            <p className="mt-3 text-muted-foreground">
              Antes de escolher a região, entenda o que sustenta um projeto que realmente performa.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <li>
                <Link
                  to="/sites-robustos"
                  className="block h-full rounded-2xl border border-border bg-card p-5 hover:bg-muted transition"
                >
                  <span className="font-semibold">Guia de criação de sites robustos</span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    As cinco camadas de um site que carrega rápido, ranqueia e converte.
                  </span>
                </Link>
              </li>
              {SITES_ROBUSTOS.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/sites-robustos/$slug"
                    params={{ slug: s.slug }}
                    className="block h-full rounded-2xl border border-border bg-card p-5 hover:bg-muted transition"
                  >
                    <span className="font-semibold">{s.h1}</span>
                    <span className="mt-2 block text-sm text-muted-foreground">Ler sobre {s.anchor}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Perguntas frequentes</h2>
            <div className="mt-8 space-y-4">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold flex items-start justify-between gap-4">
                    {f.q}
                    <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-primary group-open:rotate-90 transition" />
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-foreground text-background">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto" />
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">
              Não achou a sua região na lista?
            </h2>
            <p className="mt-4 text-background/70 text-lg">
              Fazemos a pesquisa local da sua cidade do zero. Em 24h você recebe um diagnóstico com o que falta para dominar as buscas na sua área.
            </p>
            <FunnelCTAButton
              intent={{ purpose: "proposal", source: "areas_atendimento_final", pagePath: "/areas-de-atendimento", placement: "section" }}
              label="Falar com um especialista"
              location="areas_atendimento_final"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-7 py-4 shadow-glow-primary"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
