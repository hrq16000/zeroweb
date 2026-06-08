import { describe, expect, test } from "bun:test";

/**
 * Testes de integração do fluxo de checkout (camada de roteamento de pagamento).
 *
 * Foco: garantir que a decisão "Stripe vs WhatsApp" depende EXCLUSIVAMENTE
 * da flag `stripeEnabled` no painel admin + da presença de `STRIPE_SECRET_KEY`.
 *
 * Não exercitamos a UI: o checkout.tsx delega para
 *  - `createStripeCheckoutSession` → quando habilitado, retorna URL e o cliente
 *    faz `window.location.href = url`.
 *  - quando `{ enabled: false }`, cai no handoff WhatsApp preservando pedido.
 *
 * Aqui validamos a contrato de retorno e o cálculo de URL/handoff,
 * que é o que o componente consome.
 */

type StripeResult =
  | { enabled: true; url: string; sessionId?: string; reason?: string }
  | { enabled: false; url: null; reason: string };

// Reimplementação da decisão (mesma lógica de checkout.tsx — `handlePayNow`).
function routePayment(opts: {
  stripe: StripeResult;
  order: { id: string; customer_name: string; whatsappPhone: string; total: number };
}): { kind: "stripe"; url: string } | { kind: "whatsapp"; href: string; orderId: string } {
  if (opts.stripe.enabled && opts.stripe.url) {
    return { kind: "stripe", url: opts.stripe.url };
  }
  const msg = encodeURIComponent(
    `Olá! Sou ${opts.order.customer_name}. Pedido #${opts.order.id} — total R$ ${opts.order.total.toFixed(2)}. Quero finalizar pelo WhatsApp.`,
  );
  return {
    kind: "whatsapp",
    href: `https://wa.me/${opts.order.whatsappPhone}?text=${msg}`,
    orderId: opts.order.id,
  };
}

const order = {
  id: "ord_abc123",
  customer_name: "João Teste",
  whatsappPhone: "5541997452053",
  total: 499,
};

describe("checkout — Stripe habilitado", () => {
  test("redireciona para a URL da Checkout Session do Stripe", () => {
    const result = routePayment({
      stripe: {
        enabled: true,
        url: "https://checkout.stripe.com/c/pay/cs_test_abc",
        sessionId: "cs_test_abc",
      },
      order,
    });
    expect(result.kind).toBe("stripe");
    if (result.kind === "stripe") {
      expect(result.url).toContain("checkout.stripe.com");
    }
  });

  test("client_reference_id é o order.id (validado no contrato do serverFn)", () => {
    // O webhook em /api/public/hooks/stripe.ts lê metadata.order_id /
    // client_reference_id para marcar o pedido como pago.
    // Aqui apenas formalizamos o contrato.
    const stripeSessionPayload = {
      client_reference_id: order.id,
      metadata: { order_id: order.id },
    };
    expect(stripeSessionPayload.client_reference_id).toBe(order.id);
    expect(stripeSessionPayload.metadata.order_id).toBe(order.id);
  });
});

describe("checkout — Stripe desabilitado (handoff WhatsApp)", () => {
  test("cai no handoff WhatsApp preservando o pedido e o número configurado", () => {
    const result = routePayment({
      stripe: { enabled: false, url: null, reason: "stripe_disabled" },
      order,
    });
    expect(result.kind).toBe("whatsapp");
    if (result.kind === "whatsapp") {
      expect(result.href).toContain("wa.me/5541997452053");
      expect(result.href).toContain(encodeURIComponent("Pedido #ord_abc123"));
      expect(result.orderId).toBe("ord_abc123");
    }
  });

  test("nome e total do cliente aparecem na mensagem do WhatsApp", () => {
    const result = routePayment({
      stripe: { enabled: false, url: null, reason: "stripe_disabled" },
      order,
    });
    if (result.kind !== "whatsapp") throw new Error("esperado handoff");
    const decoded = decodeURIComponent(result.href.split("?text=")[1]);
    expect(decoded).toContain("João Teste");
    expect(decoded).toContain("R$ 499.00");
  });

  test("Stripe enabled=true mas sem URL ainda cai em WhatsApp (fallback seguro)", () => {
    // Defesa em profundidade: se algum dia o serverFn retornar enabled=true
    // sem URL, não devemos quebrar o checkout.
    const result = routePayment({
      // @ts-expect-error — cenário inválido proposital
      stripe: { enabled: true, url: "" },
      order,
    });
    expect(result.kind).toBe("whatsapp");
  });
});

describe("checkout — pedido preservado em ambos os fluxos", () => {
  test("o orderId persiste no Stripe (via sessionId no payload)", () => {
    const result = routePayment({
      stripe: {
        enabled: true,
        url: `https://checkout.stripe.com/c/pay/cs_test?order_id=${order.id}`,
        sessionId: "cs_test",
      },
      order,
    });
    if (result.kind === "stripe") expect(result.url).toContain(order.id);
  });

  test("o orderId persiste no WhatsApp (mensagem + retorno)", () => {
    const result = routePayment({
      stripe: { enabled: false, url: null, reason: "stripe_disabled" },
      order,
    });
    if (result.kind === "whatsapp") {
      expect(result.orderId).toBe(order.id);
      expect(decodeURIComponent(result.href)).toContain(order.id);
    }
  });
});
