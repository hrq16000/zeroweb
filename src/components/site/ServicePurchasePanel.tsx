import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addToCart, openCart, formatBRL } from "@/lib/cart";

export type ServicePurchaseBase = {
  slug: string;
  name: string;
  category?: string;
  price: number; // price > 0 (caller already filtered)
  pricePeriod?: string | null;
  imageUrl?: string | null;
};

/**
 * Painel de compra simplificado para serviços digitais.
 *
 * Serviços da 0WEB têm preço fixo por escopo — sem variantes fictícias
 * ("Essencial/Pro/Avançado") e sem quantidade (não faz sentido multiplicar
 * uma gestão mensal). Se um produto precisar de múltiplas opções reais,
 * elas virão como serviços distintos no catálogo, cada um com seu próprio
 * card e slug.
 */
export function ServicePurchasePanel({ item }: { item: ServicePurchaseBase }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(
      {
        slug: item.slug,
        name: item.name,
        category: item.category,
        price: item.price,
        pricePeriod: item.pricePeriod ?? null,
        imageUrl: item.imageUrl ?? null,
      },
      {
        onLoginNudge: (distinct) => {
          if (distinct === 2) {
            toast("Salve seu carrinho", {
              description: "Entre com Google e a 0WEB guarda seus itens em qualquer dispositivo.",
              action: { label: "Entrar", onClick: () => { window.location.href = "/auth"; } },
              duration: 6000,
            });
          }
        },
      },
    );
    void import("@/lib/analytics").then(({ trackEvent }) =>
      trackEvent("add_to_cart", {
        slug: item.slug,
        unit_price: item.price,
        total: item.price,
        name: item.name,
      }),
    );
    void import("@/lib/persistence").then(({ persistEvent }) =>
      persistEvent("add_to_cart", { slug: item.slug, total: item.price }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast.success(item.name, {
      description: `${formatBRL(item.price)}${item.pricePeriod ? `/${item.pricePeriod}` : ""} adicionado ao carrinho.`,
      action: { label: "Ver carrinho", onClick: () => openCart() },
      duration: 3800,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 text-left max-w-xl mx-auto space-y-5">
      <div>
        <h3 className="font-semibold text-lg">Contratar este serviço</h3>
        <p className="text-sm text-muted-foreground">
          Escopo único definido pela equipe — sem variantes ou multiplicação.
        </p>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-sm text-muted-foreground">Valor</span>
        <span className="text-2xl font-bold tabular-nums">
          {formatBRL(item.price)}
          {item.pricePeriod ? (
            <span className="text-sm font-medium text-muted-foreground">/{item.pricePeriod}</span>
          ) : null}
        </span>
      </div>

      <Button size="lg" className="w-full" onClick={handleAdd} aria-label={`Adicionar ${item.name} ao carrinho`}>
        {added ? <Check className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
        {added ? "Adicionado" : "Adicionar ao carrinho"}
      </Button>
    </div>
  );
}

