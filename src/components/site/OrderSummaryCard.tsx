import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Package, MessageCircle, ExternalLink } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getMyOrder } from "@/lib/orders.functions";
import { formatBRL } from "@/lib/cart";

type OrderItem = {
  slug: string;
  name: string;
  category?: string | null;
  price?: number | null;
  qty: number;
};

type OrderRow = {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  whatsapp_handoff_at: string | null;
  paid_at: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  fulfilled: "Em execução",
  cancelled: "Cancelado",
};

/**
 * Resumo real do pedido exibido na página /obrigado quando há ?order=<id>.
 * Carregamento leve: server fn `getMyOrder` (RLS escopa ao próprio usuário).
 * Se o usuário não estiver autenticado ou o pedido não existir, mostramos
 * uma mensagem amigável com link para a área do cliente.
 */
const DEFAULT_STEPS = [
  { t: "Confirmação", d: "Recebemos seu pedido e nosso time já foi notificado." },
  { t: "Atendimento", d: "Em até 1h útil entramos em contato para alinhar o escopo." },
  { t: "Execução", d: "Após o briefing, o entregável começa conforme o prazo combinado." },
];

const WHATSAPP_STEPS = [
  { t: "Pedido registrado", d: "Seu pedido foi salvo e nosso time comercial já foi notificado." },
  { t: "Proposta no WhatsApp", d: "Em até 1h útil te enviamos a proposta final pelo WhatsApp." },
  { t: "Aprovação e início", d: "Assim que aprovar, iniciamos o projeto conforme o prazo combinado." },
];

const STRIPE_STEPS = [
  { t: "Pagamento confirmado", d: "Seu pagamento foi processado com segurança pelo Stripe." },
  { t: "Briefing de início", d: "Em até 1h útil entramos em contato para alinhar o escopo final." },
  { t: "Execução do projeto", d: "Após o briefing, começamos a entrega conforme o pacote escolhido." },
];

function stepsForSource(source?: string | null) {
  if (source === "checkout-whatsapp") return WHATSAPP_STEPS;
  if (source === "checkout-stripe") return STRIPE_STEPS;
  return DEFAULT_STEPS;
}

export function OrderSummaryCard({ orderId, source }: { orderId: string; source?: string | null }) {
  const fetchOrder = useServerFn(getMyOrder);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; order: OrderRow }
    | { kind: "missing" }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  useEffect(() => {
    let alive = true;
    fetchOrder({ data: { orderId } })
      .then((r) => {
        if (!alive) return;
        if (r.order) setState({ kind: "ok", order: r.order as unknown as OrderRow });
        else setState({ kind: "missing" });
      })
      .catch((e: Error) => alive && setState({ kind: "error", message: e.message }));
    return () => {
      alive = false;
    };
  }, [orderId, fetchOrder]);

  return (
    <section id="pedido" className="mt-12" aria-label="Resumo do pedido">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-elegant">
          <header className="px-6 py-4 border-b border-border bg-muted/40 flex items-center gap-3">
            <Package className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg">Seu pedido</h2>
              <p className="text-xs text-muted-foreground">
                Identificador: <span className="font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            <Link
              to="/app"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Ver no painel <ExternalLink className="w-3 h-3" />
            </Link>
          </header>

          <div className="p-6">
            {state.kind === "loading" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando resumo…
              </div>
            )}

            {state.kind === "missing" && (
              <div className="text-sm text-muted-foreground">
                Não foi possível localizar este pedido na sua conta.{" "}
                <Link to="/app" className="text-primary underline">Acessar painel</Link>
              </div>
            )}

            {state.kind === "error" && (
              <div className="text-sm text-destructive">
                Erro ao carregar o pedido: {state.message}
              </div>
            )}

            {state.kind === "ok" && (
              <>
                <ul className="divide-y divide-border">
                  {state.order.items.map((i) => (
                    <li key={`${i.slug}-${i.name}`} className="py-3 flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{i.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {i.category ?? ""}{i.qty > 1 ? ` · ${i.qty}×` : ""}
                        </p>
                      </div>
                      <span className="tabular-nums text-sm font-semibold">
                        {typeof i.price === "number" && i.price > 0
                          ? formatBRL(i.price * i.qty)
                          : "Sob consulta"}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold tabular-nums">{formatBRL(Number(state.order.total))}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                    {STATUS_LABEL[state.order.status] ?? state.order.status}
                  </span>
                  {state.order.payment_method === "whatsapp" && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <ol className="mt-6 grid sm:grid-cols-3 gap-3 text-sm">
          {stepsForSource(source).map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-border bg-card p-4">
              <span className="text-xs font-mono text-primary">0{i + 1}</span>
              <h3 className="mt-1 font-semibold">{s.t}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
