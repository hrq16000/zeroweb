import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { listServicesNav, type NavService } from "@/lib/services-nav.functions";

type Props = {
  title?: string;
  subtitle?: string;
  /** Quantos serviços exibir (default 4). */
  limit?: number;
};

/**
 * Vitrine compacta de serviços em destaque para a home.
 * 100% gerenciada pelo painel administrativo via flag show_in_home_featured
 * e ordem display_order. Sem itens marcados, a seção não renderiza nada
 * (a Home não exibe duplicatas do catálogo).
 */
export function FeaturedServices({
  title = "Serviços em destaque",
  subtitle = "Selecionados pelo nosso time. Catálogo completo na página de Serviços.",
  limit = 4,
}: Props) {
  const { data } = useQuery({
    queryKey: ["services-nav"],
    queryFn: () => listServicesNav(),
    staleTime: 5 * 60 * 1000,
  });
  const items = (data?.homeFeatured ?? []).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="py-20" id="servicos-destaque">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Destaques
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">{title}</h2>
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          </div>
          <Link
            to="/servicos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos os serviços <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((s: NavService) => (
            <Link
              key={s.slug}
              to="/servicos/$slug"
              params={{ slug: s.slug }}
              className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary hover:-translate-y-1 hover:shadow-elegant transition-all duration-300"
            >
              {s.imageUrl ? (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={s.imageUrl}
                    alt={s.imageAlt || s.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-1">
                  <Sparkles className="w-8 h-8 text-primary/40" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Capa pendente
                  </span>
                </div>
              )}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
                  {s.category}
                </p>
                <h3 className="mt-1 font-semibold text-base">{s.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                  {s.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Ver detalhes <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
