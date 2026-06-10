import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SKYSCRAPER_CALENDAR } from "@/lib/skyscraper-calendar";
import { renderSkyscraperArticle } from "@/lib/skyscraper-render";

export const Route = createFileRoute("/blog-skyscraper/$slug")({
  loader: ({ params }) => {
    const article = SKYSCRAPER_CALENDAR.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article, rendered: renderSkyscraperArticle(article) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Artigo não encontrado · 0WEB" }] };
    const { rendered, article } = loaderData;
    const url = `https://0web.com.br/blog-skyscraper/${params.slug}`;
    const image = "https://0web.com.br/og-default.jpg";
    return {
      meta: [
        { title: `${rendered.title} · 0WEB` },
        { name: "description", content: rendered.meta },
        { property: "og:title", content: rendered.title },
        { property: "og:description", content: rendered.meta },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "article:published_time", content: new Date().toISOString() },
        { property: "article:section", content: article.pillar },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: rendered.title },
        { name: "twitter:description", content: rendered.meta },
        { name: "twitter:image", content: image },
        { name: "robots", content: "max-image-preview:large" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: rendered.title,
            description: rendered.meta,
            inLanguage: "pt-BR",
            articleSection: article.pillar,
            wordCount: rendered.wordCount,
            keywords: article.targetKeyword,
            image,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: "0WEB", url: "https://0web.com.br" },
            publisher: {
              "@type": "Organization",
              name: "0WEB",
              logo: { "@type": "ImageObject", url: "https://0web.com.br/favicon.ico" },
            },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
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
              {
                "@type": "ListItem",
                position: 3,
                name: "Skyscraper",
                item: "https://0web.com.br/blog-skyscraper",
              },
              { "@type": "ListItem", position: 4, name: rendered.title, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: rendered.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-40 pb-24 mx-auto max-w-3xl px-5 text-center">
        <h1 className="text-4xl font-bold">Artigo Skyscraper não encontrado</h1>
        <Link to="/blog-skyscraper" className="mt-6 inline-block text-primary underline">
          Ver calendário completo
        </Link>
      </main>
      <Footer />
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { article, rendered } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Breadcrumbs
        items={[
          { name: "Blog", path: "/blog" },
          { name: "Skyscraper", path: "/blog-skyscraper" },
          { name: rendered.title, path: `/blog-skyscraper/${article.slug}` },
        ]}
      />
      <main className="pt-6 pb-24 mx-auto max-w-3xl px-5 lg:px-8">
        <article>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            {article.pillar} · Semana {article.week}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {rendered.title}
          </h1>
          <p className="mt-3 text-muted-foreground">{rendered.meta}</p>
          <div
            className="prose prose-invert max-w-none mt-10"
            dangerouslySetInnerHTML={{ __html: rendered.bodyHtml }}
          />
        </article>
      </main>
      <Footer />
    </div>
  );
}
