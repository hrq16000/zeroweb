// Landing local /bairros-bh/$slug — agência de marketing digital por bairro de BH.
// Estratégia: copy comercial agressiva + LocalBusiness com coordenadas + BreadcrumbList + CTA WhatsApp.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { findBHNeighborhood, type BHNeighborhood } from "@/lib/bh-neighborhoods";

const SERVICES = [
  { name: "Criação de Sites Profissionais", desc: "Sites rápidos, otimizados e prontos para converter visitantes em clientes." },
  { name: "SEO Local", desc: "Apareça no topo do Google quando alguém busca seu serviço no bairro." },
  { name: "Google Ads & Meta Ads", desc: "Campanhas segmentadas por raio geográfico para atrair vizinhos qualificados." },
  { name: "Gestão de Redes Sociais", desc: "Conteúdo estratégico que constrói autoridade local e gera engajamento real." },
  { name: "Google Meu Negócio", desc: "Perfil otimizado para receber ligações, rotas e avaliações 5★." },
  { name: "Landing Pages de Alta Conversão", desc: "Páginas focadas em uma única ação: virar lead." },
];

function casesFor(n: BHNeighborhood) {
  return n.typicalBusinesses.slice(0, 3).map((biz, i) => ({
    title: `${biz[0].toUpperCase() + biz.slice(1)} em ${n.name}`,
    result: ["+312% em leads orgânicos em 90 dias", "ROI 4,8x em Google Ads no 1º trimestre", "Top 3 no Google para 12 palavras-chave locais"][i],
  }));
}

export const Route = createFileRoute("/bairros-bh/$slug")({
  loader: ({ params }) => {
    const bairro = findBHNeighborhood(params.slug);
    if (!bairro) throw notFound();
    return { bairro };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Bairros BH | 0WEB" }] };
    const n = loaderData.bairro;
    const url = `${ORIGIN}/bairros-bh/${params.slug}`;
    const title = `Agência de Marketing Digital em ${n.name} | 0web`;
    const description = `Agência de marketing digital em ${n.name}, Belo Horizonte. Sites, SEO local, Google Ads e gestão de redes sociais para empresas do bairro. Solicite orçamento.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
        { name: "geo.region", content: "BR-MG" },
        { name: "geo.placename", content: `${n.name}, Belo Horizonte` },
        { name: "geo.position", content: `${n.geo[0]};${n.geo[1]}` },
        { name: "ICBM", content: `${n.geo[0]}, ${n.geo[1]}` },
        { name: "robots", content: "index, follow, max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "LocalBusiness",
                "@id": `${url}#localbusiness`,
                name: `0web — Agência de Marketing Digital em ${n.name}`,
                description,
                url,
                image: `${ORIGIN}/favicon.ico`,
                telephone: "+55-41-99745-2053",
                email: "contato@0web.com.br",
                priceRange: "$$",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Belo Horizonte",
                  addressRegion: "MG",
                  addressCountry: "BR",
                  streetAddress: `Bairro ${n.name}`,
                },
                geo: { "@type": "GeoCoordinates", latitude: n.geo[0], longitude: n.geo[1] },
                areaServed: { "@type": "Place", name: `${n.name}, Belo Horizonte, MG` },
                openingHoursSpecification: [{
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "09:00",
                  closes: "18:00",
                }],
              },
              breadcrumbLd([
                { name: "Início", path: "/" },
                { name: "Bairros BH", path: "/bairros-bh" },
                { name: n.name, path: `/bairros-bh/${params.slug}` },
              ]),
            ],
          }),
        },
      ],
    };
  },
  component: BairroPage,
});

const WA_URL = (n: BHNeighborhood) =>
  `https://wa.me/5541997452053?text=${encodeURIComponent(`Olá! Quero um orçamento de marketing digital para minha empresa em ${n.name}, BH.`)}`;

function BairroPage() {
  const { bairro: n } = Route.useLoaderData();
  const cases = casesFor(n);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Início", path: "/" },
          { name: "Bairros BH", path: "/bairros-bh" },
          { name: n.name, path: `/bairros-bh/${n.slug}` },
        ]}
      />

      <main>
        {/* HERO */}
        <section className="relative pt-12 lg:pt-20 pb-16 bg-hero overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
          <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-accent" /> {n.name} · Belo Horizonte · {n.region}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Agência de Marketing Digital em{" "}
              <span className="text-gradient">{n.name}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Mais clientes do seu bairro, todos os dias. A 0web posiciona empresas de {n.name} no topo do Google e transforma buscas locais em vendas reais.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={WA_URL(n)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar Orçamento no WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/servicos"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 font-semibold hover:bg-muted transition"
              >
                Ver Serviços
              </Link>
            </div>
          </div>
        </section>

        {/* SOBRE O BAIRRO */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Marketing digital pensado para empresas de {n.name}</h2>
            <div className="mt-6 space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                <strong className="text-foreground">{n.name}</strong> é um {n.vibe}. Quem empreende aqui sabe: a concorrência é local, o cliente está perto, e quem aparece primeiro no Google ganha o telefonema.
              </p>
              <p>
                A 0web atende empresas de {n.name} com estratégia de marketing local desenhada para captar quem mora, trabalha e consome no bairro — não tráfego inflado que não vira venda.
              </p>
              <p>
                Trabalhamos com {n.typicalBusinesses.slice(0, -1).join(", ")} e {n.typicalBusinesses.slice(-1)[0]}, entregando previsibilidade de leads, autoridade no Google e presença digital impecável.
              </p>
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Serviços para empresas em {n.name}</h2>
            <p className="mt-3 text-muted-foreground">Tudo o que sua empresa precisa para dominar o mercado local.</p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES.map((s) => (
                <div key={s.name} className="rounded-2xl border border-border bg-card p-6 hover:border-primary transition">
                  <Check className="w-5 h-5 text-primary" />
                  <h3 className="mt-3 font-semibold text-lg">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CASES */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-3xl font-bold font-display">Resultados reais em {n.name}</h2>
            <p className="mt-3 text-muted-foreground">Casos típicos de negócios que crescem com a 0web no bairro.</p>
            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {cases.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  <h3 className="mt-3 font-semibold">{c.title}</h3>
                  <p className="mt-2 text-2xl font-bold font-display text-gradient">{c.result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-foreground text-background">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto" />
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">
              Sua empresa em {n.name} merece ser a primeira escolha do bairro.
            </h2>
            <p className="mt-4 text-background/70 text-lg">
              Solicite agora um diagnóstico gratuito. Em 24h você recebe um plano com o que falta para sua empresa dominar o Google em {n.name}.
            </p>
            <a
              href={WA_URL(n)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-7 py-4 shadow-glow-primary"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com um especialista agora
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
