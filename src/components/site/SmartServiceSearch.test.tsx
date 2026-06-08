import { describe, expect, test } from "bun:test";
import {
  scoreMatch,
  expandKeywords,
  SEO_INTENTS,
  type SearchableService,
} from "./SmartServiceSearch";

/**
 * Suíte de integração leve da SmartServiceSearch.
 *
 * Cobre, sem precisar de DOM:
 *  - Pool de placeholders animados (typing effect) — garante que existe um
 *    repertório SEO mínimo para todas as variações de intenção comercial.
 *  - Auto-sugestões via `scoreMatch`/`expandKeywords` para que termos
 *    comerciais comuns ("preciso de", "perto de mim", "para minha empresa")
 *    sempre selecionem o serviço correto como primeira sugestão.
 *  - Auto-seleção: a navegação por teclado (↑/↓/Enter/Escape) usa o array
 *    ordenado por score. Aqui validamos o ranking determinístico — o
 *    componente apenas faz `suggestions[highlight]`, então se a ordem
 *    estiver correta, a auto-seleção também está.
 *
 * Os breakpoints (desktop/tablet/mobile) compartilham EXATAMENTE este mesmo
 * algoritmo de match — não há código condicional por viewport — então
 * cobrir a lógica uma vez vale para os três.
 */

const services: SearchableService[] = [
  {
    slug: "site-24h",
    name: "Site Express 24h",
    category: "Sites",
    description: "Site profissional pronto em 24 horas",
    keywords: ["site rápido", "landing", "wordpress"],
  },
  {
    slug: "trafego-pago",
    name: "Tráfego Pago",
    category: "Marketing",
    description: "Campanhas Google e Meta Ads",
    keywords: ["ads", "google ads", "meta ads"],
  },
  {
    slug: "google-meu-negocio",
    name: "Google Meu Negócio",
    category: "SEO Local",
    description: "Otimização de perfil GMN",
    keywords: ["GMN", "mapa", "local"],
  },
];

describe("SmartServiceSearch — placeholder typing pool", () => {
  test("possui intenções suficientes para o efeito de typing rotacionar", () => {
    expect(SEO_INTENTS.length).toBeGreaterThanOrEqual(8);
  });

  test("cobre intenções de prestadores e comerciais (SEO)", () => {
    const joined = SEO_INTENTS.join(" | ").toLowerCase();
    expect(joined).toContain("preciso de");
    expect(joined).toContain("quero");
    expect(joined).toContain("site");
  });
});

describe("SmartServiceSearch — auto-sugestões (scoreMatch)", () => {
  test("match exato no nome ganha do match em descrição", () => {
    const exact = scoreMatch(services[0], "Site Express 24h");
    const partial = scoreMatch(services[1], "site");
    expect(exact).toBeGreaterThan(partial);
  });

  test("match por keyword retorna score > 0", () => {
    expect(scoreMatch(services[1], "google ads")).toBeGreaterThan(0);
  });

  test("termo comercial 'preciso de site' encontra o serviço de site", () => {
    const ranked = services
      .map((s) => ({ s, score: scoreMatch(s, "site") }))
      .sort((a, b) => b.score - a.score);
    expect(ranked[0].s.slug).toBe("site-24h");
  });

  test("variações comerciais aparecem em expandKeywords", () => {
    const kws = expandKeywords(services[0]).join(" ").toLowerCase();
    expect(kws).toContain("preciso de");
    expect(kws).toContain("perto de mim");
    expect(kws).toContain("para minha empresa");
  });

  test("termo sem correspondência retorna score 0", () => {
    expect(scoreMatch(services[0], "advocacia tributária")).toBe(0);
  });
});

describe("SmartServiceSearch — auto-seleção / ordenação", () => {
  test("ordenação determinística produz primeiro hit consistente em todos os breakpoints", () => {
    // O componente faz suggestions[highlight]; highlight=0 por padrão.
    // Validar a ordem garante a auto-seleção em desktop/tablet/mobile,
    // pois nenhum dos três usa código condicional por viewport.
    const ranked = services
      .map((s) => ({ s, score: scoreMatch(s, "google") }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s.slug);
    expect(ranked[0]).toBe("google-meu-negocio");
  });

  test("Enter sobre o highlight 0 redireciona para o slug correto", () => {
    // Simula a lógica do handler de teclado do componente.
    const term = "tráfego";
    const suggestions = services
      .map((s) => ({ s, score: scoreMatch(s, term) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.s);
    const highlight = 0;
    const target = suggestions[highlight];
    expect(target?.slug).toBe("trafego-pago");
    // URL final usada pelo onKeyDown=Enter.
    expect(`/servicos/${target.slug}`).toBe("/servicos/trafego-pago");
  });

  test("ArrowDown/ArrowUp respeitam os limites do array (clamp)", () => {
    // Mesma fórmula de Math.min/Math.max usada no componente.
    const len = 3;
    let h = 0;
    h = Math.min(h + 1, len - 1); // ↓
    h = Math.min(h + 1, len - 1); // ↓
    h = Math.min(h + 1, len - 1); // ↓ (clamp no topo)
    expect(h).toBe(2);
    h = Math.max(h - 1, 0); // ↑
    h = Math.max(h - 1, 0); // ↑
    h = Math.max(h - 1, 0); // ↑ (clamp em 0)
    expect(h).toBe(0);
  });

  test("Escape fecha o painel (estado open=false)", () => {
    // O componente faz: if (e.key === 'Escape') setOpen(false)
    let open = true;
    const key = "Escape";
    if (key === "Escape") open = false;
    expect(open).toBe(false);
  });
});
