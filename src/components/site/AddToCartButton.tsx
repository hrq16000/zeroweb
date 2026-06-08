import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addToCart, openCart, type CartItem } from "@/lib/cart";

type Props = {
  item: Omit<CartItem, "qty" | "addedAt">;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
};

/**
 * Botão "Adicionar ao carrinho" do carrinho híbrido.
 * - 1º item: silencioso (toast simples).
 * - 2º item distinto: dispara toast com CTA de login Google (não-bloqueante),
 *   incentivando salvar o carrinho — alinhado à decisão da Onda 2.
 */
export function AddToCartButton({ item, variant = "outline", size = "lg", className }: Props) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(item, {
      onLoginNudge: (distinct) => {
        if (distinct === 2) {
          toast("Salve seu carrinho", {
            description: "Entre com Google e a 0WEB guarda seus itens em qualquer dispositivo.",
            action: {
              label: "Entrar",
              onClick: () => {
                window.location.href = "/auth";
              },
            },
            duration: 6000,
          });
        }
      },
    });
    // CRO tracking — captura intenção de compra por serviço
    void import("@/lib/analytics").then(({ trackEvent }) =>
      trackEvent("add_to_cart", { slug: item.slug, name: item.name, price: item.price ?? null, category: item.category ?? null }),
    );
    void import("@/lib/persistence").then(({ persistEvent }) =>
      persistEvent("add_to_cart", { slug: item.slug, name: item.name, price: item.price ?? null }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast.success(`${item.name} adicionado`, {
      description: "Clique no carrinho para finalizar.",
      action: { label: "Ver carrinho", onClick: () => openCart() },
      duration: 3500,
    });
  }


  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      aria-label={`Adicionar ${item.name} ao carrinho`}
    >
      {added ? <Check className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
      {added ? "Adicionado" : "Adicionar ao carrinho"}
    </Button>
  );
}
