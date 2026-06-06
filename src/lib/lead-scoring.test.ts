import { describe, it, expect } from "vitest";
import { scoreLead } from "./lead-scoring";

describe("scoreLead", () => {
  it("hot lead with high investment + complete contact + indicação", () => {
    const r = scoreLead({
      investimento: "R$ 3.000 a R$ 5.000",
      servico_principal: "Google Ads",
      clientes_mes: "100 a 200",
      objetivo: "Vender mais",
      origem_clientes: "Indicação",
      tem_site: "Sim",
      ciencia_investimento: "Sim",
      telefone: "11999998888",
      email: "joao@empresa.com",
      nome: "João",
      empresa: "Empresa LTDA",
    });
    expect(r.intent).toBe("hot");
    expect(r.score).toBeGreaterThanOrEqual(70);
    expect(r.tags).toContain("google-ads");
    expect(r.tags).toContain("intent:hot");
  });

  it("cold lead, minimal info", () => {
    const r = scoreLead({ nome: "X" });
    expect(r.intent).toBe("cold");
    expect(r.score).toBeLessThan(40);
  });

  it("warm with medium investment", () => {
    const r = scoreLead({
      investimento: "R$ 1.500",
      servico_principal: "Instagram",
      telefone: "11999",
      email: "a@b.c",
      nome: "N", empresa: "E",
      ciencia_investimento: "Sim",
    });
    expect(r.intent).toBe("warm");
    expect(r.tags).toContain("meta-ads");
  });
});
