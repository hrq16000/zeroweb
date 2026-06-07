#!/usr/bin/env node
/**
 * Valida que cada rota legada responde 301 e cai no destino /servicos/{slug}.
 *
 * Uso:  node scripts/validate-legacy-301.mjs [baseUrl]
 * Default baseUrl: https://0web.com.br
 *
 * Apêndice automático em seo-reports/HISTORY.md.
 */
import { writeFile, mkdir, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, "..", "seo-reports");
const BASE = (process.argv[2] || "https://0web.com.br").replace(/\/$/, "");

// from → expected suffix after redirect
const LEGACY_MAP = {
  "/trafego-pago": "/servicos/trafego-pago",
  "/trafego-pago-local": "/servicos/trafego-pago-local",
  "/consultoria": "/servicos/consultoria",
  "/google-meu-negocio": "/servicos/google-meu-negocio",
  "/marketplace": "/servicos/marketplace",
  "/parceiros": "/servicos/parceiros",
  "/presenca-digital": "/servicos/presenca-digital",
  // dynamic catch-all /$service
  "/site-express": "/servicos/site-express",
};

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function probe(from, expected) {
  const url = `${BASE}${from}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const status = res.status;
    const location = res.headers.get("location") || "";
    const is301 = status === 301 || status === 308;
    const lands = location.endsWith(expected) || location.includes(`${expected}?`) || location === `${BASE}${expected}`;
    return { from, expected, status, location, is301, lands, pass: is301 && lands };
  } catch (err) {
    return { from, expected, status: 0, location: "", is301: false, lands: false, pass: false, error: String(err) };
  }
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  console.log(c.bold(`\nValidando ${Object.keys(LEGACY_MAP).length} rotas legadas em ${BASE}\n`));

  const results = [];
  for (const [from, expected] of Object.entries(LEGACY_MAP)) {
    const r = await probe(from, expected);
    results.push(r);
    const icon = r.pass ? c.green("✓") : c.red("✗");
    console.log(`${icon} ${String(r.status).padEnd(3)} ${from.padEnd(28)} → ${r.location || "(sem Location)"}`);
    if (!r.pass && r.error) console.log(c.red(`     erro: ${r.error}`));
  }

  const failed = results.filter((r) => !r.pass);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = resolve(REPORT_DIR, `legacy-301-${stamp}.json`);
  await writeFile(jsonPath, JSON.stringify({ baseUrl: BASE, at: stamp, results }, null, 2));

  const block =
    `## ${stamp} — Legacy 301 — ${BASE}\n` +
    `- Rotas: **${results.length}** | Falhas: **${failed.length}** | Relatório: \`seo-reports/legacy-301-${stamp}.json\`\n` +
    results.map((r) => `  - ${r.pass ? "✅" : "❌"} \`${r.from}\` → ${r.status} ${r.location || "(–)"}`).join("\n") +
    "\n\n";

  const historyPath = resolve(REPORT_DIR, "HISTORY.md");
  if (!existsSync(historyPath)) {
    await writeFile(historyPath, "# Histórico de validações SEO/JSON-LD\n\n");
  }
  await appendFile(historyPath, block);

  console.log(c.bold(`\n→ Relatório: ${jsonPath}`));
  console.log(c.bold(`→ Pass ${results.length - failed.length}/${results.length}\n`));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
