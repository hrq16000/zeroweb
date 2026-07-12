import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, ShieldAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/payment-settings.functions";

export const Route = createFileRoute("/_authenticated/app/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos · Admin 0WEB" }, { name: "robots", content: "noindex" }] }),
  component: PagamentosAdminPage,
});

function PagamentosAdminPage() {
  const fetchSettings = useServerFn(getPaymentSettings);
  const saveSettings = useServerFn(updatePaymentSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  useEffect(() => {
    void fetchSettings()
      .then((s) => {
        setStripeEnabled(s.stripeEnabled);
      })
      .catch((e) => toast.error("Falha ao carregar", { description: (e as Error).message }))
      .finally(() => setLoading(false));
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings({ data: { stripeEnabled } });
      toast.success("Configurações de pagamento salvas");
    } catch (e) {
      toast.error("Não foi possível salvar", { description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold tracking-tight">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">
          Controle o fluxo de cobrança do catálogo 0WEB. Enquanto o Stripe estiver desativado,
          todo pedido entra no atendimento assistido e fica salvo como <strong>Pendente de pagamento</strong>.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Carregando…</div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Pagamento online (Stripe)
                </h2>
                <p className="text-xs text-muted-foreground max-w-md">
                  Quando ligado, o checkout exibe "Pagar agora" com Stripe e marca o pedido como pago automaticamente após confirmação.
                  Mantenha desligado até concluir a configuração da conta Stripe.
                </p>
              </div>
              <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
            </div>
            {!stripeEnabled && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs flex gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Stripe desativado. Todos os pedidos serão encaminhados ao atendimento assistido e ficarão como <code>pending_payment</code>.</span>
              </div>
            )}
          </section>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
