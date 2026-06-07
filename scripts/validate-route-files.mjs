#!/usr/bin/env node
/**
 * Valida que toda rota importada em src/routeTree.gen.ts aponta
 * para um arquivo existente em src/routes/.
 *
 * Falha cedo (antes do build) com mensagem amigável listando
 * arquivos ausentes — evita blank screen em produção.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TREE = path.join(ROOT, "src/routeTree.gen.ts");
const ROUTES_DIR = path.join(ROOT, "src/routes");

if (!existsSync(TREE)) {
  console.warn("[validate-route-files] routeTree.gen.ts ausente — pulei (será gerado pelo Vite).");
  process.exit(0);
}

const src = readFileSync(TREE, "utf8");
// Captura imports como: from './routes/foo' / from './routes/foo/bar'
const re = /from\s+['"]\.\/routes\/([^'"]+)['"]/g;
const missing = [];
const seen = new Set();

let m;
while ((m = re.exec(src)) !== null) {
  const rel = m[1];
  if (seen.has(rel)) continue;
  seen.add(rel);

  // Tenta resolver: .tsx, .ts, /index.tsx, /index.ts
  const candidates = [
    `${rel}.tsx`,
    `${rel}.ts`,
    path.join(rel, "index.tsx"),
    path.join(rel, "index.ts"),
  ];
  const found = candidates.some((c) => existsSync(path.join(ROUTES_DIR, c)));
  if (!found) missing.push(rel);
}

if (missing.length > 0) {
  console.error("");
  console.error("✖ [validate-route-files] Arquivos de rota ausentes:");
  for (const r of missing) console.error(`   • src/routes/${r}.tsx`);
  console.error("");
  console.error("  routeTree.gen.ts referencia rotas que não existem mais.");
  console.error("  Corrija com um dos passos abaixo:");
  console.error("    1) Recrie o(s) arquivo(s) listado(s); ou");
  console.error("    2) Remova as referências antigas e regenere a árvore:");
  console.error("       rm -rf node_modules/.vite .vite .output && bun run dev");
  console.error("");
  process.exit(1);
}

console.log(`[validate-route-files] ok — ${seen.size} rotas verificadas.`);
