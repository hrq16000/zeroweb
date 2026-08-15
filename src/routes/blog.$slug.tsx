import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { BlogPostFunnelCTA } from "@/components/funnel/BlogPostFunnelCTA";
import { CTA } from "@/components/site/CTA";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { getPost, posts, inlineImages } from "@/lib/blog-data";
import { coverForCategory } from "@/components/site/Blog";
import { Picture } from "@/components/site/Picture";
import { AuthorBio } from "@/components/site/AuthorBio";
import { ContactFormWhatsApp } from "@/components/site/ContactFormWhatsApp";
import { suggestLinksForArticle } from "@/lib/interlinking";
import { BlogContent } from "@/components/site/BlogContent";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Artigo não encontrado · 0WEB" }] };
    const { post } = loaderData;
    const wordCount = post.content.split(/\s+/).filter(Boolean).length;
    const url = `https://0web.com.br/blog/${params.slug}`;
    const image = post.cover ? `https://0web.com.br${post.cover}` : "https://0web.com.br/og-default.jpg";
    return {
      meta: [
        { title: `${post.title} · Blog 0WEB` },
        { name: "description", content: post.excerpt },
        { name: "author", content: "0WEB" },
        { name: "news_keywords", content: post.category },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "article:section", content: post.category },
        { property: "article:published_time", content: post.date },
        { property: "article:modified_time", content: post.date },
        { property: "article:author", content: "0WEB" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        { name: "twitter:image", content: image },
        { name: "robots", content: "max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title.slice(0, 110),
            name: post.title,
            description: post.excerpt,
            datePublished: new Date(`${post.date}T09:00:00-03:00`).toISOString(),
            dateModified: new Date(
              `${post.updatedAt ?? post.date}T09:00:00-03:00`,
            ).toISOString(),
            isAccessibleForFree: true,
            articleSection: post.category,
            wordCount,
            inLanguage: "pt-BR",
            image,
            author: { "@type": "Organization", name: "0WEB", url: "https://0web.com.br" },
            publisher: {
              "@type": "Organization",
              name: "0WEB",
              logo: { "@type": "ImageObject", url: "https://0web.com.br/favicon.ico" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            keywords: post.category,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://0web.com.br/blog" },
              { "@type": "ListItem", position: 3, name: post.category, item: `https://0web.com.br/blog?cat=${encodeURIComponent(post.category)}` },
              { "@type": "ListItem", position: 4, name: post.title, item: url },
            ],
          }),
        },
        ...(post.faq && post.faq.length > 0
          ? [{
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: post.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            }]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-40 pb-24 mx-auto max-w-3xl px-5 text-center">
        <h1 className="text-4xl font-bold">Artigo não encontrado</h1>
        <p className="mt-4 text-muted-foreground">
          O conteúdo que você procura pode ter sido movido ou removido.
        </p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 text-primary font-semibold">
          <ArrowLeft className="w-4 h-4" /> Voltar para o blog
        </Link>
      </main>
      <Footer />
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  const related = posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <main className="pt-6 lg:pt-8 pb-24">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-muted-foreground flex items-center gap-3">
            <time dateTime={post.date}>
              {new Date(post.date + "T12:00:00Z").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
            <span>·</span>
            <span>{post.readTime} de leitura</span>
          </div>

          <div className="mt-10 aspect-[16/9] rounded-3xl overflow-hidden relative bg-muted">
            <Picture
              src={post.cover || coverForCategory(post.category)}
              alt={`Capa do artigo: ${post.title}`}
              width={1280}
              height={720}
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <BlogContent content={post.content} postSlug={post.slug} pagePath={`/blog/${post.slug}`} />

          {inlineImages[post.slug as keyof typeof inlineImages] && (
            <figure className="mt-10">
              <Picture
                src={inlineImages[post.slug as keyof typeof inlineImages]}
                alt={`Ilustração complementar: ${post.title}`}
                width={1280}
                height={720}
                sizes="(min-width: 1024px) 720px, 100vw"
                className="w-full rounded-3xl"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground text-center">
                Prompts bem desenhados destravam respostas muito mais úteis no ChatGPT.
              </figcaption>
            </figure>
          )}

          <AuthorBio className="mt-12" />

          {post.faq && post.faq.length > 0 && (
            <section className="mt-12" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-bold font-display">
                Perguntas frequentes
              </h2>
              <dl className="mt-6 space-y-4">
                {post.faq.map((f: { q: string; a: string }, i: number) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-5">
                    <dt className="font-semibold text-foreground">{f.q}</dt>
                    <dd className="mt-2 text-sm text-foreground/80 leading-relaxed">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}



          {/* CTA Diagnóstico */}
          <aside className="mt-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6 lg:p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Gostou do conteúdo?</p>
            <h2 className="mt-2 text-2xl font-bold font-display">
              Quer um diagnóstico para o seu negócio?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Responda algumas perguntas rápidas e receba um plano personalizado.
            </p>
            <Link
              to="/solicitar-diagnostico"
              onClick={() => trackEvent("cta_click", { label: "Solicitar Diagnóstico", location: `blog_post_${post.slug}` })}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
            >
              Solicitar diagnóstico gratuito
            </Link>
          </aside>

          {/* Formulário de captura */}
          <section className="mt-12">
            <ContactFormWhatsApp
              source={`blog_post_${post.slug}`}
              ctx="blog_post_form"
              title="Quer aplicar isso na sua empresa? Fale com a 0WEB"
              defaultMessage={`Li o artigo "${post.title}" e quero aplicar isso na minha empresa.`}
              requireConsent
            />
          </section>

          {(() => {
            const internal = suggestLinksForArticle({ category: post.category, limit: 6 });
            if (internal.length === 0) return null;
            return (
              <section className="mt-12">
                <h2 className="text-xl font-bold">Links internos relacionados</h2>
                <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                  {internal.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="text-primary hover:underline">
                        → {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}
        </article>

        <BlogPostFunnelCTA postSlug={post.slug} />

        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 lg:px-8 mt-20">
            <h2 className="text-2xl font-bold mb-6">Continue lendo</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  preload="render"
                  className="rounded-2xl bg-card border border-border p-5 hover:shadow-elegant transition"
                >
                  <div className="text-xs uppercase tracking-wider text-primary">{p.category}</div>
                  <h3 className="mt-2 font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {post.relatedServiceSlug && (
          <section className="mx-auto max-w-3xl px-5 lg:px-8 mt-16">
            <h2 className="text-xl font-bold">Serviço relacionado a este post</h2>
            <Link
              to="/servicos/$slug"
              params={{ slug: post.relatedServiceSlug }}
              onClick={() =>
                trackEvent("blog_related_service_click", {
                  post: post.slug,
                  service: post.relatedServiceSlug,
                })
              }
              className="mt-4 flex items-center justify-between rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 hover:shadow-elegant transition group"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Serviço 0WEB
                </p>
                <p className="mt-1 font-semibold text-lg">
                  {post.relatedServiceSlug
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-0.5 transition">
                Ver serviço <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </section>
        )}
      </main>
      <CTA />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
