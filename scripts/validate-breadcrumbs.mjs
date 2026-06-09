#!/usr/bin/env node
/**
 * Garante que toda página da loja virtual (/servicos/*) renderiza Breadcrumbs.
 *
 * Estratégia: como o layout `src/routes/servicos.tsx` centraliza Breadcrumbs
 * via <ServicosBreadcrumbs />, basta validar que:
 *   1) O layout contém <ServicosBreadcrumbs /> dentro do Outlet wrapper.
 *   2) Nenhuma rota filha re-introduz <Breadcrumbs> (evita duplicação).
 *   3) Todas as rotas /servicos/*.tsx existem como arquivos.
 *
 * Falha o build (exit 1) se qualquer condição não for satisfeita.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROUTES_DIR = "src/routes";
const LAYOUT = join(ROUTES_DIR, "servicos.tsx");
const errors = [];

const layoutSrc = readFileSync(LAYOUT, "utf8");
if (!/<ServicosBreadcrumbs\s*\/>/.test(layoutSrc)) {
  errors.push(`${LAYOUT}: faltando <ServicosBreadcrumbs /> no layout da loja virtual.`);
}
if (!/<Outlet\s*\/>/.test(layoutSrc)) {
  errors.push(`${LAYOUT}: faltando <Outlet />.`);
}

const children = readdirSync(ROUTES_DIR)
  .filter((f) => f.startsWith("servicos.") && f.endsWith(".tsx") && f !== "servicos.tsx");

if (children.length === 0) {
  errors.push(`${ROUTES_DIR}: nenhuma rota filha /servicos/* encontrada.`);
}

for (const f of children) {
  const p = join(ROUTES_DIR, f);
  const src = readFileSync(p, "utf8");
  if (/<Breadcrumbs\b/.test(src)) {
    errors.push(`${p}: re-introduziu <Breadcrumbs>. Remova — o layout servicos.tsx já renderiza via <ServicosBreadcrumbs />.`);
  }
  if (/from\s*"@\/components\/site\/Breadcrumbs"/.test(src)) {
    errors.push(`${p}: import de Breadcrumbs órfão. Remova.`);
  }
}

if (errors.length) {
  console.error("✖ Breadcrumbs check falhou:\n  - " + errors.join("\n  - "));
  process.exit(1);
}
console.log(`✓ Breadcrumbs OK — layout centralizado + ${children.length} rotas filhas validadas.`);
