import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "fs";
import { resolve } from "path";

/**
 * Garante que toda página da loja virtual (/servicos/*) renderiza Breadcrumbs.
 * Como o layout /servicos centraliza via <ServicosBreadcrumbs />, falhamos o
 * build se:
 *   - O layout deixa de renderizar <ServicosBreadcrumbs />.
 *   - Alguma rota filha re-introduz <Breadcrumbs> (causa duplicação/espaçamento).
 *   - Falta o <Outlet /> no layout.
 *
 * Validação viewport-agnóstica: o componente usa apenas classes responsivas
 * Tailwind, sem branches por largura — se renderiza, renderiza em mobile e
 * desktop.
 */
const ROUTES = resolve(__dirname, "../../src/routes");
const layoutSrc = readFileSync(resolve(ROUTES, "servicos.tsx"), "utf8");

describe("Loja virtual — Breadcrumbs centralizados em /servicos/*", () => {
  test("layout servicos.tsx renderiza <ServicosBreadcrumbs /> e <Outlet />", () => {
    expect(layoutSrc).toMatch(/<ServicosBreadcrumbs\s*\/>/);
    expect(layoutSrc).toMatch(/<Outlet\s*\/>/);
  });

  const children = readdirSync(ROUTES).filter(
    (f) => f.startsWith("servicos.") && f.endsWith(".tsx") && f !== "servicos.tsx",
  );

  test("existe pelo menos uma rota filha em /servicos/*", () => {
    expect(children.length).toBeGreaterThan(0);
  });

  for (const f of children) {
    test(`rota filha não duplica Breadcrumbs: ${f}`, () => {
      const src = readFileSync(resolve(ROUTES, f), "utf8");
      expect(src).not.toMatch(/<Breadcrumbs\b/);
      expect(src).not.toMatch(/from\s*"@\/components\/site\/Breadcrumbs"/);
    });
  }
});
