import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  readCart,
  removeFromCart,
  setQty,
  clearCart,
  cartTotal,
  formatBRL,
  type CartItem,
} from "@/lib/cart";

/**
 * Drawer do carrinho híbrido. Ouve:
 *  - "0web:cart-open" → abre o Sheet
 *  - "0web:cart-changed" → recarrega itens
 *
 * CTAs do rodapé seguem a Onda 3:
 *  - "Finalizar compra" → fluxo de checkout + login Google + pagamento
 *  - "Fechar pelo WhatsApp" → handoff humano
 * Por ora ambos navegam para /servicos (placeholder seguro) até a Onda 3.
 */
export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    const onOpen = () => {
      sync();
      setOpen(true);
    };
    sync();
    window.addEventListener("0web:cart-open", onOpen);
    window.addEventListener("0web:cart-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("0web:cart-open", onOpen);
      window.removeEventListener("0web:cart-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const total = cartTotal(items);
  const hasUnpriced = items.some((i) => !i.price || i.price === 0);
  const empty = items.length === 0;

  function buildWhatsAppLink() {
    const lines = items.map(
      (i) =>
        `• ${i.name}${i.qty > 1 ? ` (x${i.qty})` : ""}${i.price ? ` — ${formatBRL(i.price)}` : ""}`,
    );
    const text = encodeURIComponent(
      `Olá! Quero fechar este carrinho na 0WEB:\n\n${lines.join("\n")}\n\nTotal estimado: ${formatBRL(total)}`,
    );
    return `https://wa.me/5541997452053?text=${text}`;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Seu carrinho
          </SheetTitle>
          <SheetDescription>
            {empty
              ? "Adicione serviços para montar seu pacote."
              : `${items.length} ite${items.length === 1 ? "m" : "ns"} selecionado${items.length === 1 ? "" : "s"}.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {empty ? (
            <div className="text-center text-muted-foreground py-16">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Carrinho vazio.</p>
              <Link
                to="/servicos"
                onClick={() => setOpen(false)}
                className="mt-4 inline-block text-primary story-link text-sm"
              >
                Explorar serviços
              </Link>
            </div>
          ) : (
            items.map((i) => (
              <div
                key={i.slug}
                className="flex gap-3 p-3 rounded-2xl border border-border bg-card animate-fade-in"
              >
                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0">
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-primary/40">
                      <Sparkles className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {i.category && (
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                      {i.category}
                    </p>
                  )}
                  <Link
                    to="/servicos/$slug"
                    params={{ slug: i.slug }}
                    onClick={() => setOpen(false)}
                    className="text-sm font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors"
                  >
                    {i.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatBRL(i.price)}
                    {i.pricePeriod ? `/${i.pricePeriod}` : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-0 rounded-full border border-border">
                      <button
                        type="button"
                        aria-label="Diminuir"
                        onClick={() => setQty(i.slug, i.qty - 1)}
                        className="w-7 h-7 grid place-items-center hover:text-primary active:scale-90 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Aumentar"
                        onClick={() => setQty(i.slug, i.qty + 1)}
                        className="w-7 h-7 grid place-items-center hover:text-primary active:scale-90 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Remover"
                      onClick={() => removeFromCart(i.slug)}
                      className="text-muted-foreground hover:text-destructive transition active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!empty && (
          <>
            <Separator />
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">
                  Total estimado{hasUnpriced ? " *" : ""}
                </span>
                <span className="text-xl font-bold tabular-nums">{formatBRL(total)}</span>
              </div>
              {hasUnpriced && (
                <p className="text-[11px] text-muted-foreground">
                  * Itens "sob consulta" são orçados durante o atendimento.
                </p>
              )}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    window.location.href = "/checkout";
                  }}
                >
                  Finalizar compra
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full"
                >
                  <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Fechar pelo WhatsApp
                  </a>
                </Button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-destructive transition mt-1"
                >
                  Esvaziar carrinho
                </button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
