import { useState } from "react";
import { ShoppingBag, ArrowRight, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { addToCart, readCart, type CartItem } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { FunnelModalWrapper } from "@/components/funnel/FunnelModalWrapper";
import { useFunnel } from "@/hooks/useFunnel";
import type { ContactIntent } from "@/lib/contact-intent";
import { Button } from "@/components/ui/button";

type Props = {
  product: Omit<CartItem, "qty" | "addedAt">;
  /** Intent para o funil disparado após a decisão de carrinho. */
  intent?: ContactIntent;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
};

/**
 * ProductActionGate
 *
 * CTA de "tirar dúvida / receber orientação" em cards de produto.
 * Distingue INTENÇÃO EXPLÍCITA (não sequestra "Comprar" nem "Ver detalhes"):
 *
 * 1. Se o produto AINDA NÃO ESTÁ NO CARRINHO, mostra sugestão:
 *    "Este produto parece adequado para sua solicitação."
 *    [Adicionar ao carrinho e continuar] [Continuar sem adicionar]
 * 2. Após a decisão (ou se já está no carrinho), abre o funil real
 *    com o contexto do produto e snapshot do carrinho.
 * 3. Nada de wa.me no cliente — o funil, ao concluir, redireciona via
 *    /r/whatsapp/:token (Fatia 1).
 */
export function ProductActionGate({
  product,
  intent,
  label = "Tirar dúvida sobre este produto",
  className,
  variant = "outline",
  size = "default",
}: Props) {
  const [suggesting, setSuggesting] = useState(false);
  const runtimeIntent: ContactIntent = intent ?? {
    purpose: "diagnosis",
    source: `product_${product.slug}`,
    pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
    placement: "section",
    serviceSlug: product.slug,
  };
  const { isOpen, openFunnel, closeFunnel, funnelSlug } = useFunnel(
    "service",
    product.slug,
    undefined,
    runtimeIntent,
  );

  function alreadyInCart(): boolean {
    return readCart().some((c) => c.slug === product.slug);
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    trackEvent("product_action_click", {
      slug: product.slug,
      name: product.name,
      purpose: runtimeIntent.purpose,
    });
    if (alreadyInCart()) {
      openFunnel();
      trackEvent("product_funnel_open", { slug: product.slug, from: "in_cart" });
      return;
    }
    setSuggesting(true);
    trackEvent("cart_suggestion_view", { slug: product.slug });
  }

  function acceptSuggestion() {
    addToCart(product);
    trackEvent("cart_suggestion_accept", { slug: product.slug });
    trackEvent("product_added_to_cart", { slug: product.slug, source: "gate_suggestion" });
    setSuggesting(false);
    openFunnel();
    trackEvent("product_funnel_open", { slug: product.slug, from: "cart_accept" });
  }

  function declineSuggestion() {
    trackEvent("cart_suggestion_decline", { slug: product.slug });
    setSuggesting(false);
    openFunnel();
    trackEvent("product_funnel_open", { slug: product.slug, from: "cart_decline" });
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
        aria-label={label}
      >
        {label}
      </Button>

      <DialogPrimitive.Root open={suggesting} onOpenChange={(o) => !o && setSuggesting(false)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-border
                       bg-background text-foreground shadow-2xl p-6"
          >
            <DialogPrimitive.Title className="text-lg font-semibold">
              Sugestão para sua solicitação
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground mt-2">
              Este produto parece adequado para o que você está buscando. Deseja
              adicioná-lo ao carrinho antes de continuar?
            </DialogPrimitive.Description>

            <div className="mt-4 rounded-xl border border-border p-3 flex items-center gap-3">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="w-14 h-14 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{product.name}</div>
                {typeof product.price === "number" && (
                  <div className="text-sm text-muted-foreground">
                    R$ {product.price.toLocaleString("pt-BR")}
                    {product.pricePeriod ? `/${product.pricePeriod}` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={acceptSuggestion}
                className="w-full sm:flex-1 gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Adicionar e continuar
              </Button>
              <Button
                variant="outline"
                onClick={declineSuggestion}
                className="w-full sm:flex-1 gap-2"
              >
                Continuar sem adicionar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Fechar"
                className="absolute right-3 top-3 grid place-items-center w-8 h-8 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <FunnelModalWrapper
        open={isOpen}
        onClose={closeFunnel}
        funnelSlug={funnelSlug}
        serviceSlug={product.slug}
        intent={runtimeIntent}
      />
    </>
  );
}
