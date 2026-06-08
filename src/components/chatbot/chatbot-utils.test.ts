import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  initialState,
  loadState,
  saveState,
  maskPhone,
  validateWhatsApp,
  getAttribution,
  type State,
} from "./chatbot-utils";

describe("chatbot-utils — maskPhone", () => {
  it("masks progressively as digits are typed", () => {
    expect(maskPhone("1")).toBe("1");
    expect(maskPhone("11")).toBe("11");
    expect(maskPhone("1199")).toBe("(11) 99");
    expect(maskPhone("11999")).toBe("(11) 999");
    expect(maskPhone("11999887766")).toBe("(11) 99988-7766");
  });
  it("strips non-digits", () => {
    expect(maskPhone("(11) abc 99988-7766")).toBe("(11) 99988-7766");
  });
  it("caps at 11 digits", () => {
    expect(maskPhone("11999887766999")).toBe("(11) 99988-7766");
  });
});

describe("chatbot-utils — validateWhatsApp", () => {
  it("rejects short numbers", () => {
    expect(validateWhatsApp("(11) 9999").valid).toBe(false);
  });
  it("rejects invalid DDD", () => {
    const r = validateWhatsApp("(00) 99988-7766");
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/DDD/);
  });
  it("rejects 11-digit mobile not starting with 9", () => {
    const r = validateWhatsApp("(11) 89988-7766");
    expect(r.valid).toBe(false);
  });
  it("accepts valid mobile with mask", () => {
    expect(validateWhatsApp("(11) 99988-7766").valid).toBe(true);
  });
  it("accepts valid 10-digit landline", () => {
    expect(validateWhatsApp("(11) 3344-5566").valid).toBe(true);
  });
});

describe("chatbot-utils — sessionStorage round-trip (refresh restore)", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns initialState when empty", () => {
    expect(loadState()).toEqual(initialState);
  });

  it("restores nome, whatsapp, consent, step and draft inputs after refresh", () => {
    const masked = maskPhone("11999887766");
    const persisted: State = {
      step: 3,
      messages: [
        { id: "a", role: "bot", text: "Olá" },
        { id: "b", role: "user", text: "Serviço X" },
      ],
      servico: { slug: "site-express", name: "Site Express" },
      perfil: "Empresa pequena",
      prazo: "Urgente",
      nome: "Maria Silva",
      whatsapp: masked,
      draftName: "Maria Silva",
      draftPhone: masked,
      consent: true,
      reviewing: true,
    };
    saveState(persisted);

    const restored = loadState();
    expect(restored.step).toBe(3);
    expect(restored.draftName).toBe("Maria Silva");
    expect(restored.draftPhone).toBe(masked);
    expect(restored.consent).toBe(true);
    expect(restored.reviewing).toBe(true);
    // Re-applying the mask on a restored value must keep it valid
    expect(maskPhone(restored.draftPhone!)).toBe(masked);
    expect(validateWhatsApp(restored.draftPhone!).valid).toBe(true);
  });

  it("survives malformed payloads by returning initialState", () => {
    sessionStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual(initialState);
  });
});

describe("chatbot-utils — getAttribution shape (tracking parity)", () => {
  it("always emits utm_source / utm_medium / utm_campaign / page_path", () => {
    // jsdom default URL is http://localhost/
    const a = getAttribution();
    expect(a).toHaveProperty("page_path");
    expect(a).toHaveProperty("page_url");
    expect(a.utm_source).toBe("(direct)");
    expect(a.utm_medium).toBe("(none)");
    expect(a.utm_campaign).toBe("(none)");
  });

  it("reads UTM values from the current URL when present", () => {
    const originalHref = window.location.href;
    // jsdom allows replacing location via history.replaceState
    window.history.replaceState(
      {},
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=brand&utm_term=foo&utm_content=bar",
    );
    const a = getAttribution();
    expect(a.utm_source).toBe("google");
    expect(a.utm_medium).toBe("cpc");
    expect(a.utm_campaign).toBe("brand");
    expect(a.utm_term).toBe("foo");
    expect(a.utm_content).toBe("bar");
    expect(a.page_path).toContain("utm_source=google");
    window.history.replaceState({}, "", originalHref);
  });
});
