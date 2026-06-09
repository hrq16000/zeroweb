import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { addToCart, openCart, formatBRL } from "@/lib/cart";

export type ServicePurchaseBase = {
  slug: string;
  name: string;
  category?: string;
  price: number; // price > 0 (caller already filtered)
  pricePeriod?: string | null;
  imageUrl?: string | null;
};

type Variant = {
  id: "essencial" | "pro" | "avancado";
  label: string;
  factor: number;
  blurb: string;
};

const VARIANTS: Variant[] = [
  { id: "essencial", label: "Essencial", factor: 0.7, blurb: "Entrega-base focada no essencial." },
  { id: "pro", label: "Pro (mais escolhido)", factor: 1, blurb: "Escopo completo recomendado pela equipe." },
  { id: "avancado", label: "Avançado", factor: 1.6, blurb: "Customizações e suporte estendido." },
];

/**
 * Painel de compra com seleção de pacote, preço dinâmico e quantidade
 * antes de adicionar ao carrinho. Cada variante vira um item distinto
 * (`slug__variant`) preservando o histórico de pedidos.
 */
export function ServicePurchasePanel({ item }: { item: ServicePurchaseBase }) {
  const [variantId, setVariantId] = useState<Variant["id"]>("pro");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => VARIANTS.find((v) => v.id === variantId)!, [variantId]);
  const unitPrice = useMemo(() => Math.round(item.price * variant.factor), [item.price, variant.factor]);
  const total = unitPrice * qty;

  function handleAdd() {
    addToCart(
      {
        slug: variant.id === "pro" ? item.slug : `${item.slug}--${variant.id}`,
        name: `${item.name} · ${variant.label.replace(" (mais escolhido)", "")}`,
        category: item.category,
        price: unitPrice,
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
    // Como o painel adiciona N unidades, repetimos add(N-1) extras:
    for (let i = 1; i < qty; i++) {
      addToCart({
        slug: variant.id === "pro" ? item.slug : `${item.slug}--${variant.id}`,
        name: `${item.name} · ${variant.label.replace(" (mais escolhido)", "")}`,
        category: item.category,
        price: unitPrice,
        pricePeriod: item.pricePeriod ?? null,
        imageUrl: item.imageUrl ?? null,
      });
    }
    void import("@/lib/analytics").then(({ trackEvent }) =>
      trackEvent("add_to_cart", {
        slug: item.slug,
        variant: variant.id,
        qty,
        unit_price: unitPrice,
        total,
        name: item.name,
      }),
    );
    void import("@/lib/persistence").then(({ persistEvent }) =>
      persistEvent("add_to_cart", { slug: item.slug, variant: variant.id, qty, total }),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast.success(`${qty}× ${item.name} (${variant.label.split(" ")[0]})`, {
      description: `Total ${formatBRL(total)} adicionado.`,
      action: { label: "Ver carrinho", onClick: () => openCart() },
      duration: 3800,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 text-left max-w-xl mx-auto space-y-5">
      <div>
        <h3 className="font-semibold text-lg">Monte seu pacote</h3>
        <p className="text-sm text-muted-foreground">Escolha o nível de entrega e a quantidade.</p>
      </div>

      <RadioGroup value={variantId} onValueChange={(v) => setVariantId(v as Variant["id"])} className="space-y-2">
        {VARIANTS.map((v) => {
          const p = Math.round(item.price * v.factor);
          const id = `pkg-${v.id}`;
          const selected = v.id === variantId;
          return (
            <Label
              key={v.id}
              htmlFor={id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={v.id} id={id} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{v.label}</span>
                  <span className="tabular-nums font-semibold">
                    {formatBRL(p)}
                    {item.pricePeriod ? <span className="text-xs text-muted-foreground">/{item.pricePeriod}</span> : null}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{v.blurb}</p>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Quantidade</span>
        <div className="inline-flex items-center rounded-full border border-border">
          <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-10 text-center tabular-nums font-semibold" aria-live="polite">{qty}</span>
          <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-xl font-bold tabular-nums">{formatBRL(total)}</span>
      </div>

      <Button size="lg" className="w-full" onClick={handleAdd} aria-label={`Adicionar ${qty} ${item.name} ao carrinho`}>
        {added ? <Check className="w-4 h-4 mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
        {added ? "Adicionado" : "Adicionar ao carrinho"}
      </Button>
    </div>
  );
}
