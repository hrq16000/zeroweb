import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TrustStrip } from "@/components/site/TrustStrip";
import { absUrl } from "@/lib/seo";

type VerticalConfig = {
  slug: string;
  name: string;
  hero: string;
  subheadline: string;
  painPoints: string[];
  services: { title: string; desc: string; to: string }[];
  keywords: string;
};

const VERTICALS: Record<string, VerticalConfig> = {
  restaurantes: {
    slug: "restaurantes",
    name: "Restaurantes e Food Service",
    hero: "Site para Restaurantes que enche a casa",
    subheadline:
      "Cardápio digital, reservas online, fotos profissionais dos pratos, integração com iFood e Google Meu Negócio. Apareça em 1º lugar quando alguém buscar 'restaurante perto de mim'.",
    painPoints: [
      "Cliente não acha seu cardápio atualizado no Google",
      "Reserva por WhatsApp some no meio das mensagens",
      "Concorrente aparece primeiro mesmo sendo pior",
      "Fotos do iFood não vendem o ticket que você quer",
    ],
    services: [
      { title: "Site Express (cardápio + reservas)", desc: "Landing pronta em 24h com cardápio e botão de reserva.", to: "/servicos/site-express" },
      { title: "Google Meu Negócio", desc: "Otimização do GMB para aparecer no mapa local.", to: "/servicos/google-meu-negocio" },
      { title: "Tráfego pago local", desc: "Anúncios geo-segmentados para encher os horários vazios.", to: "/servicos/trafego-pago-local" },
    ],
    keywords: "site para restaurante, cardápio digital, reserva online restaurante",
  },
  advocacia: {
    slug: "advocacia",
    name: "Advocacia e Escritórios Jurídicos",
    hero: "Site para Advogados que gera consultas qualificadas",
    subheadline:
      "Página institucional com áreas de atuação, conteúdo jurídico que ranqueia, captação de leads via formulário e WhatsApp. Conformidade total com o Provimento 205/2021 da OAB.",
    painPoints: [
      "Site genérico que parece de 2010 e afasta cliente",
      "Não aparece no Google quando buscam sua especialidade",
      "Formulário de contato chega sem informação útil",
      "Concorrente com escritório menor capta mais",
    ],
    services: [
      { title: "Site Pro (10+ páginas)", desc: "Site institucional completo com SEO para sua especialidade.", to: "/servicos/site-pro" },
      { title: "Presença digital", desc: "Google, redes sociais e reputação cuidadas em pacote.", to: "/servicos/presenca-digital" },
      { title: "Consultoria estratégica", desc: "Plano de marketing jurídico alinhado à OAB.", to: "/servicos/consultoria" },
    ],
    keywords: "site para advogado, marketing jurídico, site escritório de advocacia",
  },
  imobiliarias: {
    slug: "imobiliarias",
    name: "Imobiliárias e Corretores",
    hero: "Site para Imobiliária com busca de imóveis e captação de leads",
    subheadline:
      "Catálogo de imóveis, filtros por bairro/valor/tipo, integração com CRM e WhatsApp. Captura lead enquanto o cliente ainda está navegando.",
    painPoints: [
      "Catálogo desatualizado afasta o cliente",
      "Lead que veio do anúncio se perde antes de virar visita",
      "Não aparece nas buscas por bairro específico",
      "Concorrente grande domina o Google da sua região",
    ],
    services: [
      { title: "Site Pro (10+ páginas)", desc: "Site com catálogo, busca e CRM integrado.", to: "/servicos/site-pro" },
      { title: "Tráfego pago local", desc: "Anúncios por bairro com captura de WhatsApp.", to: "/servicos/trafego-pago-local" },
      { title: "Google Meu Negócio", desc: "Mapa, fotos da loja e reviews ativos.", to: "/servicos/google-meu-negocio" },
    ],
    keywords: "site para imobiliária, site corretor de imóveis, catálogo de imóveis online",
  },
  clinicas: {
    slug: "clinicas",
    name: "Clínicas e Consultórios",
    hero: "Site para Clínica que enche a agenda",
    subheadline:
      "Agendamento online, especialidades, equipe, convênios e blog de saúde que ranqueia. Conformidade com o CFM/CRM e LGPD para dados sensíveis.",
    painPoints: [
      "Paciente liga, secretária ocupada, ele desiste",
      "Não aparece no Google ao buscar 'especialidade + cidade'",
      "Site não passa confiança nem mostra a equipe",
      "Convênios listados em PDF que ninguém lê",
    ],
    services: [
      { title: "Site Pro (10+ páginas)", desc: "Especialidades, equipe, convênios e blog otimizado.", to: "/servicos/site-pro" },
      { title: "Google Meu Negócio", desc: "Reviews, fotos e horários atualizados no mapa.", to: "/servicos/google-meu-negocio" },
      { title: "Presença digital", desc: "Pacote completo de presença online da clínica.", to: "/servicos/presenca-digital" },
    ],
    keywords: "site para clínica, site para consultório médico, agendamento online clínica",
  },
  oficinas: {
    slug: "oficinas",
    name: "Oficinas Mecânicas e Auto Center",
    hero: "Site para Oficina que aparece quando o carro quebra",
    subheadline:
      "Serviços, especialidades (carro/moto/caminhão), localização, WhatsApp direto. Otimizado para buscas de urgência tipo 'oficina mecânica perto de mim'.",
    painPoints: [
      "Cliente em emergência acha concorrente primeiro",
      "Não mostra os serviços que você cobra mais caro",
      "Sem reviews no Google é desconfiança imediata",
      "WhatsApp escondido, cliente desiste",
    ],
    services: [
      { title: "Site Express", desc: "Landing com serviços, fotos e WhatsApp em destaque.", to: "/servicos/site-express" },
      { title: "Google Meu Negócio", desc: "Mapa, horário, reviews e fotos da oficina.", to: "/servicos/google-meu-negocio" },
      { title: "Tráfego pago local", desc: "Anúncios para 'oficina perto de mim' no seu raio.", to: "/servicos/trafego-pago-local" },
    ],
    keywords: "site para oficina mecânica, site auto center, oficina perto de mim",
  },
  lojas: {
    slug: "lojas",
    name: "Lojas e Comércio Físico",
    hero: "Site para Loja que leva gente até a porta",
    subheadline:
      "Vitrine digital dos produtos, localização, horários, WhatsApp e integração com Instagram. Atrai cliente do bairro e fortalece a marca local.",
    painPoints: [
      "Cliente passa na frente mas não conhece a loja",
      "Não aparece no Google Maps quando deveria",
      "Instagram tem público mas não converte em visita",
      "Sem site, parece pequeno demais para confiar",
    ],
    services: [
      { title: "Site Express", desc: "Vitrine, contato e localização em 24h.", to: "/servicos/site-express" },
      { title: "Google Meu Negócio", desc: "Apareça no mapa quando alguém buscar produto.", to: "/servicos/google-meu-negocio" },
      { title: "Gestão de redes sociais", desc: "Conteúdo que vira visita na loja física.", to: "/servicos/gestao-redes-sociais" },
    ],
    keywords: "site para loja, site comércio local, presença digital lojista",
  },
  comercios: {
    slug: "comercios",
    name: "Comércios e Pequenos Negócios",
    hero: "Site para Comércio Local que disputa o Google",
    subheadline:
      "Presença profissional para qualquer comércio: padaria, mercado, pet shop, papelaria. Apareça no Google, no Maps e no WhatsApp do cliente.",
    painPoints: [
      "Sem site, cliente acha que você fechou",
      "Concorrente com loja igual aparece sempre primeiro",
      "WhatsApp lota e você perde pedido por desorganização",
      "Não consegue mostrar promoções que faz",
    ],
    services: [
      { title: "Site Express", desc: "Site enxuto, rápido e pronto para vender.", to: "/servicos/site-express" },
      { title: "Presença digital", desc: "Google, redes sociais e site em um pacote.", to: "/servicos/presenca-digital" },
      { title: "Tráfego pago local", desc: "Anúncios direcionados ao seu bairro.", to: "/servicos/trafego-pago-local" },
    ],
    keywords: "site para comércio, site pequeno negócio, presença digital comércio local",
  },
  "prestadores-de-servicos": {
    slug: "prestadores-de-servicos",
    name: "Prestadores de Serviços",
    hero: "Site para Prestador de Serviço que gera orçamento todo dia",
    subheadline:
      "Eletricista, encanador, dedetizadora, jardineiro, marceneiro, personal, estética, beleza. Site simples, WhatsApp em destaque e SEO local agressivo.",
    painPoints: [
      "Cliente urgente busca no Google e acha outro",
      "Sem portfólio visual, perde para concorrente com Insta forte",
      "Orçamento por WhatsApp some no fim do dia",
      "Não cobra o que vale porque parece amador",
    ],
    services: [
      { title: "Site Express", desc: "Landing com serviços, portfólio e WhatsApp.", to: "/servicos/site-express" },
      { title: "Tráfego pago local", desc: "Anúncios geo para sua área de atendimento.", to: "/servicos/trafego-pago-local" },
      { title: "Google Meu Negócio", desc: "Apareça no mapa local com fotos e reviews.", to: "/servicos/google-meu-negocio" },
    ],
    keywords: "site para prestador de serviço, site eletricista encanador, site para autônomo",
  },
};

export const Route = createFileRoute("/sites/$vertical")({
  loader: ({ params }) => {
    const v = VERTICALS[params.vertical];
    if (!v) throw notFound();
    return { vertical: v };
  },
  head: ({ loaderData }) => {
    const v = loaderData?.vertical;
    if (!v) return { meta: [{ title: "Site por segmento · 0WEB" }] };
    const url = absUrl(`/sites/${v.slug}`);
    const title = `${v.hero} · 0WEB`;
    const desc = v.subheadline;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: v.keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: absUrl("/") },
              { "@type": "ListItem", position: 2, name: "Sites por segmento", item: absUrl("/sites") },
              { "@type": "ListItem", position: 3, name: v.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold">Segmento não encontrado</h1>
        <p className="text-muted-foreground mt-2">Veja todos os segmentos disponíveis.</p>
        <Link to="/sites" className="mt-4 inline-block text-primary underline">
          Ver todos os segmentos
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold">Erro ao carregar segmento</h1>
        <button onClick={reset} className="mt-4 text-primary underline">Tentar novamente</button>
      </div>
    </div>
  ),
  component: VerticalHub,
});

function VerticalHub() {
  const { vertical: v } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="pt-page pb-12">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Sites por segmento · {v.name}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold leading-tight">{v.hero}</h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl">{v.subheadline}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary uppercase text-sm tracking-wide"
              >
                Solicitar diagnóstico grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/5541997452053?text=${encodeURIComponent(`Olá! Sou do segmento ${v.name} e quero um site.`)}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background hover:border-primary font-semibold px-6 py-3 text-sm uppercase tracking-wide"
              >
                <MessageCircle className="w-4 h-4" /> Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <TrustStrip variant="compact" />

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold">O que costuma travar nesse segmento</h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4">
              {v.painPoints.map((p: string) => (
                <li key={p} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Serviços recomendados para {v.name}</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-5">
              {v.services.map((s: { title: string; desc: string; to: string }) => (
                <Link
                  key={s.to}
                  to={s.to as any}
                  className="group rounded-2xl border border-border bg-card p-6 hover:border-primary hover:shadow-elegant transition"
                >
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Ver serviço <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Pronto para ser o primeiro do Google no seu segmento?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Em até 24h, você recebe um diagnóstico gratuito da sua presença digital e uma proposta sob medida.
            </p>
            <Link
              to="/contato"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-7 py-3.5 shadow-glow-primary uppercase text-sm tracking-wide"
            >
              Solicitar diagnóstico grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const VERTICAL_SLUGS = Object.keys(VERTICALS);
export const VERTICAL_LIST = Object.values(VERTICALS).map((v) => ({
  slug: v.slug,
  name: v.name,
  hero: v.hero,
  subheadline: v.subheadline,
}));
