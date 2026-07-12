import { describe, it, expect } from "vitest";
import {
  buildWhatsAppLeadMessage,
  sanitizeText,
  WHATSAPP_MESSAGE_MAX_LENGTH,
  WHATSAPP_REDIRECT_REUSE_WINDOW_MS,
} from "./whatsapp-redirect.helpers";

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert(1)</script>hello")).toBe("alert(1) hello");
  });
  it("removes control chars and normalizes whitespace", () => {
    expect(sanitizeText("foo\n\r\tbar\u0001baz")).toBe("foo bar baz");
  });
  it("truncates long inputs with ellipsis", () => {
    const long = "x".repeat(500);
    const out = sanitizeText(long, 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("…")).toBe(true);
  });
  it("handles null/undefined", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
  });
});

describe("buildWhatsAppLeadMessage", () => {
  const baseCtx = {
    protocol: "0W-260712-ABC123",
    funnelName: "Tráfego Pago",
    answers: {
      nome: "Teste E2E 0WEB",
      objetivo: "vendas",
      telefone: "41999990000",
      email: "teste-e2e@example.test",
    },
    questions: [
      { key: "nome", label: "Nome", options: [] },
      { key: "objetivo", label: "Objetivo", options: [{ value: "vendas", label: "Aumentar vendas" }] },
      { key: "telefone", label: "Telefone", options: [] },
      { key: "email", label: "Email", options: [] },
    ],
  };

  it("includes protocol and product context", () => {
    const msg = buildWhatsAppLeadMessage({ ...baseCtx, productName: "Google Ads R$299", productPriceLabel: "R$ 299/mês" });
    expect(msg).toContain("0W-260712-ABC123");
    expect(msg).toContain("Google Ads R$299");
    expect(msg).toContain("Aumentar vendas");
  });

  it("preserves visitor-provided phone and email answers", () => {
    const msg = buildWhatsAppLeadMessage(baseCtx);
    expect(msg).toContain("41999990000");
    expect(msg).toContain("teste-e2e@example.test");
    expect(msg).toContain("Teste E2E 0WEB");
  });

  it("never leaks internal telemetry keys as answers", () => {
    const msg = buildWhatsAppLeadMessage({
      ...baseCtx,
      answers: {
        objetivo: "vendas",
        ip: "1.2.3.4",
        ip_hash: "abc123deadbeef",
        user_agent: "Mozilla/5.0",
        session_id: "sess_xyz",
        visitor_id: "vis_xyz",
        funnel_session_id: "fs_xyz",
        lead_id: "lead_xyz",
        token: "tok_xyz",
      },
      questions: [
        { key: "objetivo", label: "Objetivo", options: [] },
        { key: "ip", label: "IP", options: [] },
        { key: "ip_hash", label: "IP hash", options: [] },
        { key: "user_agent", label: "UA", options: [] },
        { key: "session_id", label: "Session", options: [] },
        { key: "visitor_id", label: "Visitor", options: [] },
        { key: "funnel_session_id", label: "Funnel session", options: [] },
        { key: "lead_id", label: "Lead", options: [] },
        { key: "token", label: "Token", options: [] },
      ],
    });
    expect(msg).not.toContain("1.2.3.4");
    expect(msg).not.toContain("abc123deadbeef");
    expect(msg).not.toContain("Mozilla/5.0");
    expect(msg).not.toContain("sess_xyz");
    expect(msg).not.toContain("vis_xyz");
    expect(msg).not.toContain("fs_xyz");
    expect(msg).not.toContain("lead_xyz");
    expect(msg).not.toContain("tok_xyz");
  });

  it("never includes operational contact keys even if injected as answers", () => {
    const msg = buildWhatsAppLeadMessage({
      ...baseCtx,
      answers: {
        objetivo: "vendas",
        operational_phone: "555111222333",
        operational_email: "ops@0web.internal",
      },
      questions: [
        { key: "objetivo", label: "Objetivo", options: [] },
        { key: "operational_phone", label: "Contato interno", options: [] },
        { key: "operational_email", label: "E-mail interno", options: [] },
      ],
    });
    expect(msg).not.toContain("555111222333");
    expect(msg).not.toContain("ops@0web.internal");
  });

  it("respects max length", () => {
    const longAnswers: Record<string, unknown> = {};
    const qs = [];
    for (let i = 0; i < 100; i++) {
      longAnswers[`q${i}`] = "x".repeat(200);
      qs.push({ key: `q${i}`, label: `Pergunta ${i}`, options: [] });
    }
    const msg = buildWhatsAppLeadMessage({ ...baseCtx, answers: longAnswers, questions: qs });
    expect(msg.length).toBeLessThanOrEqual(WHATSAPP_MESSAGE_MAX_LENGTH);
    expect(msg).toContain(baseCtx.protocol);
  });

  it("sanitizes HTML in answers", () => {
    const msg = buildWhatsAppLeadMessage({
      ...baseCtx,
      answers: { objetivo: "<script>evil()</script>vendas" },
      questions: [{ key: "objetivo", label: "Objetivo", options: [] }],
    });
    expect(msg).not.toContain("<script>");
    expect(msg).not.toContain("</script>");
  });
});

describe("constants", () => {
  it("reuse window is 60s", () => {
    expect(WHATSAPP_REDIRECT_REUSE_WINDOW_MS).toBe(60_000);
  });
});

