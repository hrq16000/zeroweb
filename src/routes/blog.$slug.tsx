import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { CTA } from "@/components/site/CTA";
import { getPost, posts } from "@/lib/blog-data";
import { coverForCategory } from "@/components/site/Blog";

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
    const image = "https://0web.com.br/og-default.png";
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
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.date,
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
      <main className="pt-32 lg:pt-40 pb-24">
        <article className="mx-auto max-w-3xl px-5 lg:px-8">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{post.category}</span>
          </nav>

          <span className="mt-6 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {post.category}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-muted-foreground flex items-center gap-3">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
            <span>·</span>
            <span>{post.readTime} de leitura</span>
          </div>

          <div className="mt-10 aspect-[16/9] rounded-3xl overflow-hidden relative bg-muted">
            <img
              src={coverForCategory(post.category)}
              alt={`Capa do artigo: ${post.title}`}
              width={1280}
              height={720}
              fetchPriority="high"
              decoding="async"
              sizes="(min-width: 1024px) 960px, 100vw"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="mt-10 text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
            {post.content}
          </div>
        </article>

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
      </main>
      <CTA />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
