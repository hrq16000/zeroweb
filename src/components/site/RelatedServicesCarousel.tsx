import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/site/AddToCartButton";
import type { ServiceData } from "@/lib/services-data";

type CrossSellItem = ServiceData & {
  price?: number | null;
  pricePeriod?: string | null;
  imageUrl?: string | null;
};

/**
 * Carrossel horizontal de recomendações de cross-sell.
 * - Scroll-snap nativo no mobile; setas em telas maiores.
 * - Botão inline AddToCart para itens com preço (>0); fallback "Ver detalhes" para Soluções.
 */
export function RelatedServicesCarousel({ items }: { items: CrossSellItem[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="hidden sm:flex absolute -top-14 right-0 gap-2">
        <Button variant="outline" size="icon" onClick={() => nudge(-1)} aria-label="Anterior">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => nudge(1)} aria-label="Próximo">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 lg:mx-0 lg:px-0 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Serviços recomendados"
      >
        {items.map((s) => {
          const hasPrice = typeof s.price === "number" && s.price > 0;
          return (
            <article
              key={s.slug}
              data-card
              className="snap-start shrink-0 w-[78%] sm:w-[300px] flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary transition-colors"
            >
              <Link
                to="/servicos/$slug"
                params={{ slug: s.slug }}
                className="block"
              >
                {s.imageUrl ? (
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    <img src={s.imageUrl} alt={s.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-muted" aria-hidden />
                )}
                <div className="p-4">
                  <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">{s.category}</p>
                  <h3 className="mt-1 font-semibold leading-snug">{s.name}</h3>
                  {hasPrice ? (
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">A partir de </span>
                      <span className="font-semibold tabular-nums">
                        R$ {Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </span>
                      {s.pricePeriod ? <span className="text-muted-foreground">/{s.pricePeriod}</span> : null}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Sob consulta</p>
                  )}
                </div>
              </Link>
              <div className="px-4 pb-4 mt-auto">
                {hasPrice ? (
                  <AddToCartButton
                    item={{
                      slug: s.slug,
                      name: s.name,
                      category: s.category,
                      price: s.price ?? null,
                      pricePeriod: s.pricePeriod ?? null,
                      imageUrl: s.imageUrl ?? null,
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  />
                ) : (
                  <Link
                    to="/servicos/$slug"
                    params={{ slug: s.slug }}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background h-8 px-3 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    Ver detalhes <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
