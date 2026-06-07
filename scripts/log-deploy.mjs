#!/usr/bin/env node
/**
 * Pós-deploy: valida rotas legadas (301) em produção e anexa relatório
 * ao seo-reports/HISTORY.md. Uso:
 *   node scripts/log-deploy.mjs https://0web.com.br
 */
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HISTORY = path.join(ROOT, "seo-reports/HISTORY.md");

const base = (process.argv[2] || "https://0web.com.br").replace(/\/$/, "");

const LEGACY = [
  { from: "/criacao-sites", to: "/servicos/criacao-de-sites" },
  { from: "/landing-pages", to: "/servicos/landing-pages" },
  { from: "/seo", to: "/servicos/seo" },
  { from: "/automacao", to: "/servicos/automacao-com-ia" },
  { from: "/ia", to: "/servicos/automacao-com-ia" },
  { from: "/desenvolvimento", to: "/servicos/desenvolvimento-saas" },
  { from: "/redes-sociais", to: "/servicos/gestao-redes-sociais" },
];

async function probe(p) {
  try {
    const r = await fetch(base + p, { redirect: "manual" });
    const loc = r.headers.get("location");
    return { status: r.status, location: loc };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

const stamp = new Date().toISOString();
const lines = [
  ``,
  `## Deploy ${stamp} — relatório de 301s`,
  ``,
  `Base: ${base}`,
  ``,
  `| Rota legada | Esperado | Status | Location |`,
  `| --- | --- | --- | --- |`,
];

let pass = 0;
let fail = 0;
for (const { from, to } of LEGACY) {
  const r = await probe(from);
  const ok = r.status === 301 && (r.location || "").includes(to);
  if (ok) pass++;
  else fail++;
  lines.push(
    `| ${from} | ${to} (301) | ${r.status}${r.error ? ` (${r.error})` : ""} | ${r.location ?? "—"} | ${
      ok ? "✓" : "✗"
    }`,
  );
}

lines.push("");
lines.push(`**Resultado:** ${pass}/${LEGACY.length} OK${fail ? `, ${fail} falharam` : ""}.`);
lines.push("");

mkdirSync(path.dirname(HISTORY), { recursive: true });
appendFileSync(HISTORY, lines.join("\n"));
console.log(`[log-deploy] anexado a ${path.relative(ROOT, HISTORY)} — ${pass}/${LEGACY.length} OK`);
process.exit(fail > 0 ? 1 : 0);
