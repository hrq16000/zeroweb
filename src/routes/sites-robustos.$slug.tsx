// Artigos satélites do cluster "Criação de Sites Robustos".
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { ORIGIN, breadcrumbLd } from "@/lib/seo";
import { getSatellite, relatedArticles, CLUSTER_OG_IMAGE } from "@/lib/sites-robustos";

export const Route = createFileRoute("/sites-robustos/$slug")({
  loader: ({ params }) => {
    const article = getSatellite(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ params, loaderData }) => {
    const url = `${ORIGIN}/sites-robustos/${params.slug}`;
    const a = loaderData?.article;
    if (!a) {
      return { meta: [{ title: "Conteúdo não encontrado | 0WEB" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: a.seoTitle },
        { name: "description", content: a.description },
        { property: "og:title", content: a.seoTitle },
        { property: "og:description", content: a.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:image", content: CLUSTER_OG_IMAGE },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: a.title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: a.seoTitle },
        { name: "twitter:description", content: a.description },
        { name: "twitter:image", content: CLUSTER_OG_IMAGE },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              breadcrumbLd([
                { name: "Início", path: "/" },
                { name: "Criação de Sites Robustos", path: "/sites-robustos" },
                { name: a.title, path: `/sites-robustos/${a.slug}` },
              ]),
              {
                "@type": "Article",
                "@id": `${url}#article`,
                headline: a.h1,
                description: a.description,
                inLanguage: "pt-BR",
                mainEntityOfPage: url,
                image: CLUSTER_OG_IMAGE,
                author: { "@type": "Organization", name: "0WEB", url: ORIGIN },
                publisher: { "@type": "Organization", name: "0WEB", url: ORIGIN },
                isPartOf: { "@type": "CollectionPage", "@id": `${ORIGIN}/sites-robustos#collection` },
              },
              {
                "@type": "FAQPage",
                "@id": `${url}#faq`,
                mainEntity: a.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: SatellitePage,
});

function SatellitePage() {
  const { article } = Route.useLoaderData();
  const related = relatedArticles(article.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Criação de Sites Robustos", path: "/sites-robustos" },
            { name: article.title, path: `/sites-robustos/${article.slug}` },
          ]}
        />

        <article className="mx-auto max-w-3xl px-5 lg:px-8 pb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Sites robustos · {article.readTime} de leitura
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-[1.15]">{article.h1}</h1>
          {article.intro.map((p) => (
            <p key={p} className="mt-4 text-lg text-muted-foreground">
              {p}
            </p>
          ))}

          {article.sections.map((s) => (
            <section key={s.h2} className="mt-10">
              <h2 className="text-2xl font-bold">{s.h2}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-4 text-muted-foreground">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-4 space-y-2 text-muted-foreground list-disc pl-5">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Perguntas frequentes</h2>
            <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
              {article.faq.map((f) => (
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

          {/* Lead magnet / CTA do cluster */}
          <section className="mt-12 rounded-3xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold">Checklist de Site Robusto</h2>
            <p className="mt-3 text-muted-foreground">
              Receba o checklist com os 32 pontos que auditamos em {article.anchor} e nas outras camadas do
              projeto. Enviamos direto no seu WhatsApp, com o diagnóstico inicial do seu site.
            </p>
            <div className="mt-6">
              <FunnelCTAButton
                pageType="post"
                label="Quero o checklist e o diagnóstico"
                location={`sites_robustos_leadmagnet_${article.slug}`}
              />
            </div>
            <noscript>
              <p className="mt-4 text-sm">
                <a className="underline" href="/contato">Solicite o checklist pelo formulário de contato</a>
              </p>
            </noscript>
          </section>

          {/* Leia também — interlinking do cluster */}
          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <BookOpen className="w-5 h-5 text-primary" /> Leia também
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/sites-robustos/$slug"
                    params={{ slug: r.slug }}
                    className="group block h-full rounded-2xl border border-border p-5 hover:bg-muted transition"
                  >
                    <span className="font-semibold group-hover:text-primary transition">
                      {r.h1}
                    </span>
                    <span className="mt-2 block text-sm text-muted-foreground">{r.description}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                      Ler sobre {r.anchor} <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8">
            <Link
              to="/sites-robustos"
              className="inline-flex items-center gap-2 font-semibold text-primary"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao guia de criação de sites robustos
            </Link>
            <Link to="/areas-de-atendimento" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              Áreas de atendimento <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
