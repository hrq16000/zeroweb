import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { posts } from "@/lib/blog-data";
import blogSeo from "@/assets/blog-seo.webp";
import blogIa from "@/assets/blog-ia.webp";
import blogMarketing from "@/assets/blog-marketing.webp";
import blogSites from "@/assets/blog-sites.webp";

export function coverForCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("seo")) return blogSeo;
  if (c.includes("inteligência") || c.includes("ia") || c.includes("automa")) return blogIa;
  if (c.includes("site") || c.includes("negóc")) return blogSites;
  return blogMarketing;
}

export function Blog() {
  const featured = posts.slice(0, 6);
  return (
    <section id="blog" className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Conteúdo que <span className="text-gradient">faz crescer.</span>
            </h2>
          </div>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Ver todos os artigos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group rounded-3xl bg-background border border-border overflow-hidden hover:shadow-elegant transition"
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
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition">
                  {p.title}
                </h3>
                <div className="mt-3 text-xs text-muted-foreground">{p.readTime} de leitura</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
