import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, MessageCircle, ShieldCheck, LogIn, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readCart, cartTotal, formatBRL, clearCart, type CartItem } from "@/lib/cart";
import { createOrder, markOrderWhatsAppHandoff } from "@/lib/orders.functions";
import { createStripeCheckoutSession } from "@/lib/stripe-checkout.functions";
import { getPaymentSettings, type PaymentSettings } from "@/lib/payment-settings.functions";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BrandLogo } from "@/components/site/BrandLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido · 0WEB" },
      { name: "description", content: "Conclua seu pedido na 0WEB: pague agora com cartão ou finalize pelo WhatsApp em segundos." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Finalizar pedido · 0WEB" },
      { property: "og:description", content: "Conclua seu pedido na 0WEB com pagamento seguro ou atendimento humano." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://0web.com.br/checkout" },
      { property: "og:site_name", content: "0WEB" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://0web.com.br/og-default.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Finalizar pedido · 0WEB" },
      { name: "twitter:description", content: "Conclua seu pedido na 0WEB com pagamento seguro ou atendimento humano." },
      { name: "twitter:image", content: "https://0web.com.br/og-default.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/checkout" }],
  }),
  component: CheckoutPage,
  ssr: false,
});

const DEFAULT_WHATSAPP = "5541997452053";

function buildWhatsAppMessage(items: CartItem[], total: number, orderId: string) {
  const lines = items.map((i) => `• ${i.name}${i.qty > 1 ? ` (x${i.qty})` : ""}${typeof i.price === "number" && i.price > 0 ? ` — ${formatBRL(i.price * i.qty)}` : ""}`);
  return [
    `Olá! Quero fechar meu pedido na 0WEB.`,
    ``,
    `Pedido: ${orderId.slice(0, 8).toUpperCase()}`,
    ``,
    `Itens:`,
    ...lines,
    ``,
    `Total: ${formatBRL(total)}`,
  ].join("\n");
}

function CheckoutPage() {
  const navigate = useNavigate();
  const fetchSettings = useServerFn(getPaymentSettings);
  const [items, setItems] = useState<CartItem[]>([]);
  const [session, setSession] = useState<{ email?: string; name?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [submitting, setSubmitting] = useState<"none" | "stripe" | "whatsapp">("none");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<PaymentSettings>({
    stripeEnabled: false,
    whatsappNumber: DEFAULT_WHATSAPP,
  });
  const total = useMemo(() => cartTotal(items), [items]);
  const hasUnpriced = items.some((i) => !i.price);

  useEffect(() => {
    setItems(readCart());
    const onChange = () => setItems(readCart());
    window.addEventListener("0web:cart-changed", onChange);
    return () => window.removeEventListener("0web:cart-changed", onChange);
  }, []);

  useEffect(() => {
    void fetchSettings().then(setSettings).catch(() => {});
  }, [fetchSettings]);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSession({
          email: data.user.email ?? undefined,
          name: (data.user.user_metadata?.full_name as string | undefined) ?? undefined,
        });
        if (data.user.user_metadata?.full_name) setName(data.user.user_metadata.full_name as string);
      }
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) {
        setSession({
          email: s.user.email ?? undefined,
          name: (s.user.user_metadata?.full_name as string | undefined) ?? undefined,
        });
      } else {
        setSession(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleGoogle() {
    setAuthBusy(true);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/checkout",
    });
    if (r.error) {
      toast.error("Não foi possível entrar com Google", { description: r.error.message });
      setAuthBusy(false);
    }
  }

  async function handleWhatsApp() {
    if (!session) return handleGoogle();
    if (items.length === 0) return;
    setSubmitting("whatsapp");
    try {
      const { order } = await createOrder({
        data: {
          items: items.map(({ slug, name, category, price, pricePeriod, imageUrl, qty }) => ({
            slug, name, category, price: price ?? null, pricePeriod: pricePeriod ?? null,
            imageUrl: imageUrl ?? null, qty,
          })),
          notes: notes || undefined,
          customerName: name || undefined,
          customerPhone: phone || undefined,
        },
      });
      await markOrderWhatsAppHandoff({ data: { orderId: order.id } });
      const msg = buildWhatsAppMessage(items, total, order.id);
      // CRO tracking — handoff WhatsApp
      void import("@/lib/analytics").then(({ trackConversion }) =>
        trackConversion("checkout_whatsapp_handoff", { order_id: order.id, total, items: items.length, location: "checkout" }),
      );
      void import("@/lib/persistence").then(({ persistEvent }) =>
        persistEvent("checkout_whatsapp_handoff", { order_id: order.id, total, items: items.length }),
      );
      clearCart();
      const wa = settings.whatsappNumber || DEFAULT_WHATSAPP;
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      toast.success("Pedido registrado", { description: "Continue a conversa pelo WhatsApp." });
      navigate({ to: "/app" });
    } catch (e) {
      toast.error("Não foi possível registrar o pedido", { description: (e as Error).message });
    } finally {
      setSubmitting("none");
    }
  }

  async function handlePayNow() {
    if (!session) return handleGoogle();
    if (items.length === 0) return;
    // Stripe desativado no admin → cai para WhatsApp, salvando como pendente.
    if (!settings.stripeEnabled) {
      toast("Pagamento online ainda não está ativo", {
        description: "Vamos finalizar pelo WhatsApp. Seu pedido fica salvo como pendente de pagamento.",
        duration: 4000,
      });
      return handleWhatsApp();
    }
    setSubmitting("stripe");
    try {
      const { order } = await createOrder({
        data: {
          items: items.map(({ slug, name, category, price, pricePeriod, imageUrl, qty }) => ({
            slug, name, category, price: price ?? null, pricePeriod: pricePeriod ?? null,
            imageUrl: imageUrl ?? null, qty,
          })),
          notes: notes || undefined,
          customerName: name || undefined,
          customerPhone: phone || undefined,
        },
      });
      void import("@/lib/analytics").then(({ trackConversion }) =>
        trackConversion("checkout_stripe_start", { order_id: order.id, total, items: items.length, location: "checkout" }),
      );
      void import("@/lib/persistence").then(({ persistEvent }) =>
        persistEvent("checkout_stripe_start", { order_id: order.id, total, items: items.length }),
      );
      const res = await createStripeCheckoutSession({
        data: {
          orderId: order.id,
          successUrl: `${window.location.origin}/app`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });
      if (!res.enabled || !res.url) {
        toast("Stripe ainda não está conectado", {
          description: "Vamos finalizar pelo WhatsApp.",
          action: { label: "WhatsApp", onClick: () => void handleWhatsApp() },
          duration: 6000,
        });
        return;
      }
      clearCart();
      window.location.href = res.url;
    } catch (e) {
      toast.error("Não foi possível iniciar o pagamento", { description: (e as Error).message });
    } finally {
      setSubmitting("none");
    }
  }


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-5 py-10 sm:py-16">
        <button
          onClick={() => navigate({ to: "/servicos" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar à loja
        </button>

        <div className="flex items-center gap-3 mb-8">
          <BrandLogo size={40} alt="" priority />
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Finalizar pedido</h1>
            <p className="text-sm text-muted-foreground">Confirme os itens, escolha pagar agora ou pelo WhatsApp.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button className="mt-4" onClick={() => navigate({ to: "/servicos" })}>Ver serviços</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <section className="space-y-6">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <header className="px-5 py-3 border-b border-border bg-muted/40 text-sm font-semibold">
                  Resumo do pedido ({items.length} {items.length === 1 ? "item" : "itens"})
                </header>
                <ul className="divide-y divide-border">
                  {items.map((i) => (
                    <li key={i.slug} className="px-5 py-4 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {i.category ?? ""}{i.qty > 1 ? ` · ${i.qty}×` : ""}
                        </p>
                      </div>
                      <span className="tabular-nums text-sm font-semibold">
                        {typeof i.price === "number" && i.price > 0 ? formatBRL(i.price * i.qty) : "Sob consulta"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h2 className="font-display font-bold text-lg">Suas informações</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ck-name">Nome</Label>
                    <Input id="ck-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ck-phone">WhatsApp</Label>
                    <Input id="ck-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ck-notes">Observações (opcional)</Label>
                  <Textarea id="ck-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Conte qualquer detalhe importante do seu projeto." rows={3} />
                </div>
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 self-start space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-elegant">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold tabular-nums">{formatBRL(total)}</span>
                </div>
                {hasUnpriced && (
                  <p className="text-[11px] text-muted-foreground">* Itens "sob consulta" são orçados durante o atendimento.</p>
                )}

                {authReady && !session && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
                    Para finalizar, entre com sua conta Google. É rápido e seguro.
                  </div>
                )}

                <div className="grid gap-2">
                  {!session ? (
                    <Button size="lg" onClick={handleGoogle} disabled={authBusy} className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      {authBusy ? "Conectando…" : "Entrar com Google"}
                    </Button>
                  ) : (
                    <>
                      {settings.stripeEnabled && (
                        <Button
                          size="lg" className="w-full"
                          onClick={handlePayNow}
                          disabled={submitting !== "none"}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pagar agora
                        </Button>
                      )}
                      <Button
                        size="lg"
                        variant={settings.stripeEnabled ? "outline" : "default"}
                        className="w-full"
                        onClick={handleWhatsApp}
                        disabled={submitting !== "none"}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {submitting === "whatsapp" ? "Enviando…" : "Fechar pelo WhatsApp"}
                      </Button>
                    </>
                  )}

                </div>

                <div className="pt-3 border-t border-border flex items-start gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Seus dados ficam protegidos. Não compartilhamos com terceiros.</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
