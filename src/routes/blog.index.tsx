import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { posts, categories } from "@/lib/blog-data";
import { coverForCategory } from "@/components/site/Blog";
import { ArrowUpRight } from "lucide-react";

const TITLE = "Blog 0WEB · Marketing, SEO, IA e Tecnologia para empresas";
const DESC =
  "Conteúdo prático sobre marketing digital, SEO, criação de sites, IA, automação e crescimento de negócios.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://0web.com.br/blog" },
      { property: "og:image", content: "https://0web.com.br/og-default.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
      { name: "robots", content: "max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://0web.com.br/blog" },
      { rel: "alternate", type: "application/rss+xml", title: "Blog 0WEB", href: "https://0web.com.br/rss.xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              name: "Blog 0WEB",
              url: "https://0web.com.br/blog",
              inLanguage: "pt-BR",
              publisher: { "@type": "Organization", name: "0WEB", url: "https://0web.com.br" },
              blogPost: posts.map((p) => ({
                "@type": "BlogPosting",
                headline: p.title,
                description: p.excerpt,
                datePublished: p.date,
                articleSection: p.category,
                url: `https://0web.com.br/blog/${p.slug}`,
              })),
            },
            {
              "@type": "CollectionPage",
              "@id": "https://0web.com.br/blog#collection",
              url: "https://0web.com.br/blog",
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://0web.com.br/blog" },
              ],
            },
            {
              "@type": "ItemList",
              itemListElement: posts.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://0web.com.br/blog/${p.slug}`,
                name: p.title,
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [cat, setCat] = useState<string | null>(null);
  const filtered = cat ? posts.filter((p) => p.category === cat) : posts;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 lg:pt-40 pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Conteúdo que <span className="text-gradient">faz crescer.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
            Estratégia, tecnologia e marketing digital — direto ao ponto.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setCat(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                cat === null
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground/70 hover:bg-muted/70"
              }`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  cat === c
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground/70 hover:bg-muted/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group rounded-3xl bg-card border border-border overflow-hidden hover:shadow-elegant transition"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-muted">
                  <img
                    src={p.cover || coverForCategory(p.category)}
                    alt={`Imagem ilustrativa: ${p.title}`}
                    width={1280}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 rounded-full glass text-xs font-medium px-3 py-1">
                    {p.category}
                  </div>
                  <div className="absolute top-4 right-4 grid place-items-center w-9 h-9 rounded-full glass opacity-0 group-hover:opacity-100 transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg leading-snug group-hover:text-primary transition">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <time dateTime={p.date}>
                      {new Date(p.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <span>{p.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
