// Página pilar do cluster "Criação de Sites Robustos".
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gauge, Search, MousePointerClick, Plug, ShieldCheck, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { PILLAR, SATELLITES, CLUSTER_OG_IMAGE } from "@/lib/sites-robustos";

const URL = `${ORIGIN}/sites-robustos`;

const ICONS = [Gauge, Search, MousePointerClick, Plug, ShieldCheck];

const FAQ = [
  {
    q: "O que é um site robusto?",
    a: "É um site que sustenta operação real: carrega rápido no celular, é indexável pelo Google, tem estrutura de página desenhada para conversão, integra-se ao processo comercial e recebe manutenção contínua. Robustez é a soma dessas cinco camadas, não o tamanho do projeto.",
  },
  {
    q: "Quanto custa criar um site robusto?",
    a: "O investimento varia com o número de páginas, a profundidade do conteúdo e as integrações necessárias. Projetos institucionais com SEO técnico e funil de captação partem de valores bem menores que sistemas com catálogo, pagamento e integração com ERP. O orçamento é fechado após o diagnóstico do escopo.",
  },
  {
    q: "Quanto tempo leva a criação de um site robusto?",
    a: "Um site institucional completo, com conteúdo otimizado e SEO técnico, costuma levar de três a seis semanas. Projetos com catálogo, integrações e áreas logadas exigem prazo maior, definido por etapas entregues em sequência.",
  },
  {
    q: "Site robusto precisa de WordPress?",
    a: "Não. WordPress é uma opção válida quando o time publica muito conteúdo e o tema é enxuto. Para performance máxima, integrações personalizadas e escala de páginas geradas por dados, uma aplicação própria entrega resultados melhores com menos manutenção.",
  },
  {
    q: "Como sei se meu site atual precisa ser refeito?",
    a: "Sinais claros: nota baixa de Core Web Vitals no celular, páginas fora do índice do Google, dificuldade para publicar conteúdo sem programador e formulário que não gera contatos qualificados. Se três desses aparecem juntos, reconstruir costuma sair mais barato que remendar.",
  },
  {
    q: "Vocês atendem empresas de fora de Belo Horizonte e Curitiba?",
    a: "Sim. O atendimento presencial se concentra em BH e Curitiba, mas todo o portfólio é entregue remotamente para empresas de qualquer cidade do Brasil.",
  },
];

export const Route = createFileRoute("/sites-robustos/")({
  head: () => ({
    meta: [
      { title: PILLAR.seoTitle },
      { name: "description", content: PILLAR.description },
      { property: "og:title", content: PILLAR.seoTitle },
      { property: "og:description", content: PILLAR.description },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: CLUSTER_OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "0WEB — criação de sites robustos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PILLAR.seoTitle },
      { name: "twitter:description", content: PILLAR.description },
      { name: "twitter:image", content: CLUSTER_OG_IMAGE },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbLd([
              { name: "Início", path: "/" },
              { name: "Criação de Sites Robustos", path: "/sites-robustos" },
            ]),
            {
              "@type": "CollectionPage",
              "@id": `${URL}#collection`,
              url: URL,
              name: PILLAR.seoTitle,
              description: PILLAR.description,
              inLanguage: "pt-BR",
              hasPart: SATELLITES.map((s) => ({
                "@type": "Article",
                headline: s.h1,
                description: s.description,
                url: `${URL}/${s.slug}`,
              })),
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
  component: PillarPage,
});

function PillarPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Criação de Sites Robustos", path: "/sites-robustos" },
          ]}
        />

        <section className="mx-auto max-w-4xl px-5 lg:px-8 pb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Guia completo</p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1]">{PILLAR.h1}</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Site robusto não é site caro: é site que aguenta operação. Ele carrega rápido no celular do
            cliente, é encontrado no Google, conduz o visitante até o contato, conversa com o seu processo
            comercial e continua funcionando bem seis meses depois da entrega.
          </p>
          <p className="mt-4 text-muted-foreground">
            Este guia reúne as cinco camadas que sustentam um projeto assim, cada uma detalhada em um artigo
            próprio. Use-o como checklist para avaliar o seu site atual ou para especificar o próximo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <FunnelCTAButton
              pageType="service"
              serviceSlug="criacao-de-sites"
              label="Solicitar diagnóstico do meu site"
              location="sites_robustos_pilar_hero"
            />
            <Link
              to="/servicos/$slug"
              params={{ slug: "criacao-de-sites" }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 font-semibold hover:bg-muted transition"
            >
              Ver o serviço de criação de sites <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <noscript>
            <p className="mt-4 text-sm">
              <a className="underline" href="/contato">Fale com a 0WEB pelo formulário de contato</a>
            </p>
          </noscript>
        </section>

        <section className="mx-auto max-w-4xl px-5 lg:px-8 py-10 border-t border-border">
          <h2 className="text-2xl sm:text-3xl font-bold">As cinco camadas de um site robusto</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {SATELLITES.map((s, i) => {
              const Icon = ICONS[i] ?? Gauge;
              return (
                <Link
                  key={s.slug}
                  to="/sites-robustos/$slug"
                  params={{ slug: s.slug }}
                  className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="mt-4 font-semibold text-lg group-hover:text-primary transition">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Ler sobre {s.anchor} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 lg:px-8 py-10 border-t border-border prose-0web">
          <h2 className="text-2xl sm:text-3xl font-bold">Por que a maioria dos sites falha</h2>
          <p className="mt-4 text-muted-foreground">
            Sites institucionais costumam ser tratados como material gráfico: aprovam-se telas bonitas, publica-se
            e ninguém volta ao assunto. Meses depois, a empresa percebe que o site não gera contato, não aparece
            nas buscas e ninguém consegue alterar uma página sem chamar um desenvolvedor.
          </p>
          <p className="mt-4 text-muted-foreground">
            A causa é quase sempre a mesma: o projeto resolveu apenas a camada visual. Faltou desempenho medido em
            campo, faltou{" "}
            <Link className="text-primary underline" to="/sites-robustos/$slug" params={{ slug: "seo-tecnico-para-sites-institucionais" }}>
              SEO técnico para sites institucionais
            </Link>
            , faltou uma{" "}
            <Link className="text-primary underline" to="/sites-robustos/$slug" params={{ slug: "site-que-converte-estrutura-de-paginas" }}>
              estrutura de páginas que converte
            </Link>{" "}
            e faltou plano de manutenção.
          </p>

          <h2 className="mt-10 text-2xl sm:text-3xl font-bold">Como conduzimos um projeto</h2>
          <ol className="mt-4 space-y-3 text-muted-foreground list-decimal pl-5">
            <li><strong className="text-foreground">Diagnóstico</strong> — auditoria de desempenho, indexação, conteúdo e concorrência local.</li>
            <li><strong className="text-foreground">Arquitetura</strong> — mapa de páginas, silos de conteúdo e palavras-chave por intenção de busca.</li>
            <li><strong className="text-foreground">Conteúdo e design</strong> — textos comerciais e telas construídas na sequência de argumentação que converte.</li>
            <li><strong className="text-foreground">Construção</strong> — desenvolvimento com performance e dados estruturados desde o primeiro commit.</li>
            <li><strong className="text-foreground">Integração</strong> — funil de captação, registro de leads e envio contextualizado ao atendimento.</li>
            <li><strong className="text-foreground">Operação</strong> — monitoramento, atualizações, relatórios e evolução contínua.</li>
          </ol>

          <h2 className="mt-10 text-2xl sm:text-3xl font-bold">O que medimos depois da entrega</h2>
          <p className="mt-4 text-muted-foreground">
            Entrega sem métrica é opinião. Acompanhamos Core Web Vitals de campo, páginas indexadas, posições nas
            buscas comerciais, número de contatos por origem e taxa de resposta do time. Esses cinco números
            mostram se o site está trabalhando ou apenas existindo.
          </p>
          <p className="mt-4 text-muted-foreground">
            Se a sua empresa atende por região, cruze este guia com a nossa página de{" "}
            <Link className="text-primary underline" to="/areas-de-atendimento">
              áreas de atendimento
            </Link>{" "}
            e com os conteúdos aprofundados do{" "}
            <Link className="text-primary underline" to="/blog-skyscraper">
              blog técnico
            </Link>
            .
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-5 lg:px-8 py-10 border-t border-border">
          <h2 className="text-2xl sm:text-3xl font-bold">Perguntas frequentes</h2>
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 lg:px-8 py-12 border-t border-border">
          <div className="rounded-3xl bg-gradient-primary/10 border border-border p-8 text-center">
            <MapPin className="w-6 h-6 text-primary mx-auto" />
            <h2 className="mt-3 text-2xl font-bold">Quer saber em que camada seu site está travando?</h2>
            <p className="mt-3 text-muted-foreground">
              Fazemos um diagnóstico gratuito com as cinco camadas deste guia e mostramos onde está a perda.
            </p>
            <div className="mt-6 flex justify-center">
              <FunnelCTAButton
                pageType="service"
                serviceSlug="criacao-de-sites"
                label="Quero meu diagnóstico gratuito"
                location="sites_robustos_pilar_final"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
