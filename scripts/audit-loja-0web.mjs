#!/usr/bin/env node
/**
 * Auditoria automatizada: detecta a string "Loja 0WEB" em todas as fontes
 * sob controle do projeto — código (rotas, componentes, libs), assets,
 * conteúdo estático, migrations SQL e seed de banco.
 *
 * Uso: node scripts/audit-loja-0web.mjs
 * Saída: console + seo-reports/loja-0web-audit-<ts>.json
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const NEEDLE = "Loja 0WEB";
const OUT_DIR = resolve(ROOT, "seo-reports");

mkdirSync(OUT_DIR, { recursive: true });

function ripgrep(pattern, args = []) {
  try {
    const out = execSync(
      `rg --no-heading --line-number --color=never ${args.join(" ")} ${JSON.stringify(pattern)} .`,
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
    ).toString();
    return out
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const m = l.match(/^([^:]+):(\d+):(.*)$/);
        return m ? { file: m[1], line: Number(m[2]), preview: m[3].trim() } : { raw: l };
      });
  } catch (e) {
    // rg exits 1 when no match; treat as empty
    if (e.status === 1) return [];
    throw e;
  }
}

const buckets = {
  rotas: ripgrep(NEEDLE, ["-g 'src/routes/**'"]),
  componentes: ripgrep(NEEDLE, ["-g 'src/components/**'"]),
  libs: ripgrep(NEEDLE, ["-g 'src/lib/**'"]),
  assets_publicos: ripgrep(NEEDLE, ["-g 'public/**'"]),
  migrations_sql: ripgrep(NEEDLE, ["-g 'supabase/migrations/**'"]),
  outros: ripgrep(NEEDLE, [
    "-g '!node_modules/**'",
    "-g '!src/routes/**'",
    "-g '!src/components/**'",
    "-g '!src/lib/**'",
    "-g '!public/**'",
    "-g '!supabase/migrations/**'",
    "-g '!seo-reports/**'",
    "-g '!scripts/audit-loja-0web.mjs'",
  ]),
};

const total = Object.values(buckets).reduce((s, arr) => s + arr.length, 0);
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const report = {
  generatedAt: new Date().toISOString(),
  needle: NEEDLE,
  totalOccurrences: total,
  byBucket: Object.fromEntries(
    Object.entries(buckets).map(([k, v]) => [k, { count: v.length, hits: v }]),
  ),
  notes: [
    "Esta auditoria cobre apenas o código sob controle do projeto.",
    "Conteúdo injetado por extensões do navegador, scripts de terceiros, ou widgets externos não aparece aqui — compare preview vs. aba anônima sem extensões para isolar.",
  ],
};

const out = resolve(OUT_DIR, `loja-0web-audit-${ts}.json`);
writeFileSync(out, JSON.stringify(report, null, 2));

console.log(`\n🔍 Auditoria "Loja 0WEB" — ${total} ocorrência(s)\n`);
for (const [bucket, { count, hits }] of Object.entries(report.byBucket)) {
  console.log(`  ${bucket}: ${count}`);
  for (const h of hits) console.log(`    · ${h.file}:${h.line}  ${h.preview ?? h.raw}`);
}
console.log(`\n📄 Relatório salvo em: ${out.replace(ROOT + "/", "")}\n`);

process.exit(total === 0 ? 0 : 1);
