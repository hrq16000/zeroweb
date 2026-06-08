import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, RefreshCcw, XCircle, MessageCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  adminListOrders,
  adminMarkOrderPaid,
  adminCancelOrder,
  adminRecheckOrder,
} from "@/lib/orders-admin.functions";

export const Route = createFileRoute("/_authenticated/app/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos · Admin 0WEB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PedidosAdminPage,
});

type OrderRow = {
  id: string;
  user_id: string | null;
  items: unknown;
  total: number | null;
  status: string;
  payment_method: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  whatsapp_handoff_at: string | null;
  paid_at: string | null;
};

const STATUS_FILTERS = [
  { value: "awaiting_payment", label: "Pendentes WhatsApp" },
  { value: "paid", label: "Pagos" },
  { value: "cancelled", label: "Cancelados" },
  { value: "", label: "Todos" },
];

function formatBRL(v: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function PedidosAdminPage() {
  const listFn = useServerFn(adminListOrders);
  const payFn = useServerFn(adminMarkOrderPaid);
  const cancelFn = useServerFn(adminCancelOrder);
  const recheckFn = useServerFn(adminRecheckOrder);

  const [status, setStatus] = useState<string>("awaiting_payment");
  const [paymentMethod, setPaymentMethod] = useState<string>("whatsapp");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [data, setData] = useState<{ orders: OrderRow[]; total: number }>({ orders: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / pageSize)), [data.total]);

  async function load() {
    setLoading(true);
    try {
      const r = await listFn({
        data: {
          page,
          pageSize,
          status: status || undefined,
          paymentMethod: paymentMethod || undefined,
        },
      });
      setData({ orders: r.orders as OrderRow[], total: r.total });
    } catch (e) {
      toast.error("Falha ao carregar pedidos", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, paymentMethod]);

  async function handlePaid(id: string) {
    setBusyId(id);
    try {
      await payFn({ data: { orderId: id } });
      toast.success("Pedido marcado como pago");
      void load();
    } catch (e) {
      toast.error("Falha ao marcar como pago", { description: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  }
  async function handleCancel(id: string) {
    if (!confirm("Cancelar este pedido?")) return;
    setBusyId(id);
    try {
      await cancelFn({ data: { orderId: id } });
      toast.success("Pedido cancelado");
      void load();
    } catch (e) {
      toast.error("Falha ao cancelar", { description: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  }
  async function handleRecheck(id: string) {
    setBusyId(id);
    try {
      const r = await recheckFn({ data: { orderId: id } });
      toast.success("Status atualizado", { description: `Atual: ${r.order?.status ?? "?"}` });
      void load();
    } catch (e) {
      toast.error("Falha ao re-checar", { description: (e as Error).message });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e finalize manualmente pedidos do funil WhatsApp enquanto o Stripe não está ativo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              status === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="mx-2 text-muted-foreground text-xs self-center">·</span>
        {[
          { value: "whatsapp", label: "Via WhatsApp" },
          { value: "stripe", label: "Via Stripe" },
          { value: "", label: "Qualquer canal" },
        ].map((f) => (
          <button
            key={f.value || "any"}
            onClick={() => {
              setPaymentMethod(f.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs border transition ${
              paymentMethod === f.value
                ? "bg-primary/10 text-primary border-primary"
                : "bg-card border-border hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : data.orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Inbox className="w-8 h-8 opacity-50" />
            Nenhum pedido encontrado para esses filtros.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.orders.map((o) => {
              const items = Array.isArray(o.items) ? (o.items as any[]) : [];
              const wa = (o.customer_phone || "").replace(/\D/g, "");
              return (
                <li key={o.id} className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-start gap-3 justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                          {o.id.slice(0, 8).toUpperCase()}
                        </code>
                        <Badge variant={o.status === "paid" ? "default" : o.status === "cancelled" ? "destructive" : "secondary"}>
                          {o.status}
                        </Badge>
                        {o.payment_method && (
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {o.payment_method}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span>
                      </div>
                      <p className="mt-1 font-semibold truncate">
                        {o.customer_name || "Sem nome"}
                        {o.customer_email ? ` · ${o.customer_email}` : ""}
                        {o.customer_phone ? ` · ${o.customer_phone}` : ""}
                      </p>
                      <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                        {items.slice(0, 4).map((i: any, idx: number) => (
                          <li key={idx} className="truncate">
                            • {i?.name ?? "item"}{i?.qty > 1 ? ` (x${i.qty})` : ""}
                          </li>
                        ))}
                        {items.length > 4 && <li>+ {items.length - 4} item(ns)…</li>}
                      </ul>
                      {o.notes && (
                        <p className="mt-2 text-xs italic text-muted-foreground line-clamp-2">"{o.notes}"</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold tabular-nums">{formatBRL(o.total)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Abrir WhatsApp
                      </a>
                    )}
                    <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => void handleRecheck(o.id)}>
                      <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Re-checar
                    </Button>
                    {o.status !== "paid" && (
                      <Button size="sm" disabled={busyId === o.id} onClick={() => void handlePaid(o.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Marcar como pago
                      </Button>
                    )}
                    {o.status !== "cancelled" && o.status !== "paid" && (
                      <Button size="sm" variant="ghost" disabled={busyId === o.id} onClick={() => void handleCancel(o.id)}>
                        <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancelar
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {data.total} resultado(s) · página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
            Próxima <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
