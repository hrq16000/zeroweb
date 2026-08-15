import { describe, it, expect } from "vitest";
import {
  buildWhatsAppLeadMessage,
  classifyAnswerSource,
  isFieldAllowedInMessage,
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
  it("reuse window is 30min", () => {
    expect(WHATSAPP_REDIRECT_REUSE_WINDOW_MS).toBe(30 * 60 * 1000);
  });
});


describe("classificação por origem (não por formato textual)", () => {
  it("classifica respostas do visitante como visitor_answer", () => {
    expect(classifyAnswerSource("telefone")).toBe("visitor_answer");
    expect(classifyAnswerSource("email")).toBe("visitor_answer");
    expect(classifyAnswerSource("empresa")).toBe("visitor_answer");
    expect(classifyAnswerSource("orcamento")).toBe("visitor_answer");
  });

  it("classifica telemetria e contato operacional corretamente", () => {
    for (const k of ["ip", "ip_hash", "asn", "isp", "user_agent", "screen_resolution", "consent", "session_id", "token"]) {
      expect(classifyAnswerSource(k)).toBe("internal_telemetry");
    }
    for (const k of ["operational_phone", "operational_email", "admin_contact", "destination_digits"]) {
      expect(classifyAnswerSource(k)).toBe("operational_contact");
    }
  });

  it("permite apenas origens comerciais na mensagem", () => {
    for (const s of ["visitor_answer", "product", "cart", "location", "page", "attribution"] as const) {
      expect(isFieldAllowedInMessage({ source: s })).toBe(true);
    }
    expect(isFieldAllowedInMessage({ source: "internal_telemetry" })).toBe(false);
    expect(isFieldAllowedInMessage({ source: "operational_contact" })).toBe(false);
  });

  it("preserva telefone/e-mail/empresa/cidade do visitante e remove telemetria na mesma mensagem", () => {
    const msg = buildWhatsAppLeadMessage({
      protocol: "0W-TURNO3-001",
      answers: {
        nome: "Teste E2E 0WEB",
        telefone: "41999990000",
        email: "teste-e2e@example.test",
        empresa: "0Web Testes ME",
        cidade: "Curitiba",
        bairro: "Centro",
        orcamento: "R$ 1.000 a R$ 3.000",
        prazo: "30 dias",
        observacoes: "Validar o fluxo Funnel-first",
        ip: "203.0.113.9",
        ip_hash: "deadbeefcafe",
        asn: "AS28573",
        screen_resolution: "390x844",
        consent: "true",
        operational_phone: "5541998864100",
        operational_email: "ops@0web.internal",
      },
      questions: [
        "nome","telefone","email","empresa","cidade","bairro","orcamento","prazo","observacoes",
        "ip","ip_hash","asn","screen_resolution","consent","operational_phone","operational_email",
      ].map((key) => ({ key, label: key, options: [] })),
    });
    // visitante preservado
    expect(msg).toContain("41999990000");
    expect(msg).toContain("teste-e2e@example.test");
    expect(msg).toContain("0Web Testes ME");
    expect(msg).toContain("Curitiba");
    expect(msg).toContain("R$ 1.000 a R$ 3.000");
    // interno removido
    expect(msg).not.toContain("203.0.113.9");
    expect(msg).not.toContain("deadbeefcafe");
    expect(msg).not.toContain("AS28573");
    expect(msg).not.toContain("390x844");
    expect(msg).not.toContain("5541998864100");
    expect(msg).not.toContain("ops@0web.internal");
  });
});
