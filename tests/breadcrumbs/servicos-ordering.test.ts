import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Garante a ordem de renderização no layout /servicos:
 *   data-top-bar (busca/carrinho)  →  <ServicosBreadcrumbs />  →  <Outlet />
 *
 * Isso evita regressão onde alguém:
 *   - move o Breadcrumbs para depois do <Outlet /> (some da página).
 *   - remove o marcador data-top-bar (quebra o modo compact="auto").
 *   - duplica o Breadcrumbs.
 *
 * Como o componente usa apenas classes Tailwind responsivas sem branches por
 * largura, validar a ordem no JSX cobre tanto desktop quanto mobile.
 */
const ROUTES = resolve(__dirname, "../../src/routes");
const layout = readFileSync(resolve(ROUTES, "servicos.tsx"), "utf8");

const idxTopBar = layout.indexOf('data-top-bar="1"');
const idxCrumbs = layout.indexOf("<ServicosBreadcrumbs");
// Skip the import statement; find the JSX usage of <Outlet />
const outletJsxMatch = layout.match(/<Outlet\s*\/>/);
const idxOutlet = outletJsxMatch ? layout.indexOf(outletJsxMatch[0]) : -1;
const crumbsOccurrences = (layout.match(/<ServicosBreadcrumbs/g) ?? []).length;


describe("Loja virtual — ordem Header → Breadcrumbs → Outlet", () => {
  test("layout marca a barra fixa do topo com data-top-bar=\"1\"", () => {
    expect(idxTopBar).toBeGreaterThan(-1);
  });

  test("renderiza <ServicosBreadcrumbs /> entre a barra fixa e o <Outlet />", () => {
    expect(idxCrumbs).toBeGreaterThan(idxTopBar);
    expect(idxOutlet).toBeGreaterThan(idxCrumbs);
  });

  test("<ServicosBreadcrumbs /> aparece exatamente uma vez", () => {
    expect(crumbsOccurrences).toBe(1);
  });
});

/**
 * Garante que o componente Breadcrumbs expõe o marcador data-breadcrumbs="1"
 * — usado por testes E2E e pelo overlay de debug de espaçamento — e que o
 * heurístico compact="auto" só responde aos prefixos declarados.
 */
const BC = readFileSync(resolve(__dirname, "../../src/components/site/Breadcrumbs.tsx"), "utf8");
const SB = readFileSync(resolve(__dirname, "../../src/components/site/ServicosBreadcrumbs.tsx"), "utf8");

describe("Breadcrumbs — contrato de marcação e modo auto", () => {
  test("renderiza atributo data-breadcrumbs=\"1\" no <nav>", () => {
    expect(BC).toMatch(/data-breadcrumbs="1"/);
  });

  test("declara TOP_BAR_PREFIXES incluindo /servicos", () => {
    expect(BC).toMatch(/TOP_BAR_PREFIXES\s*=\s*\[[^\]]*"\/servicos"/);
  });

  test("ServicosBreadcrumbs usa compact=\"auto\" (não hardcoded)", () => {
    expect(SB).toMatch(/compact="auto"/);
  });
});
