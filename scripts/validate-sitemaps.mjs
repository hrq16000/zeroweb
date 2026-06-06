#!/usr/bin/env node
/**
 * Verifica que /servicos e /servicos/{slug} aparecem corretamente nos
 * sitemaps publicados e que robots.txt não bloqueia essas rotas nem
 * cria duplicidade de Sitemap:.
 *
 * Checagens:
 *  - robots.txt expõe Sitemap: <base>/sitemap.xml (exatamente 1)
 *  - robots.txt NÃO contém Disallow: que case com /servicos
 *  - sitemap-pages.xml inclui /servicos
 *  - sitemap-services.xml inclui pelo menos os slugs de fallback
 *  - sitemap-services.xml não duplica URLs
 *  - /servicos aparece em UM único sitemap (sem duplicidade entre pages e services)
 *
 * Uso: node scripts/validate-sitemaps.mjs [baseUrl]
 */
import { writeFile, mkdir, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, "..", "seo-reports");
const BASE = (process.argv[2] || "https://0web.com.br").replace(/\/$/, "");

const REQUIRED_SLUGS = [
  "criacao-de-sites",
  "landing-pages",
  "loja-virtual",
  "seo",
];

const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const GREEN = (s) => `\x1b[32m${s}\x1b[0m`;
const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "0web-sitemap-validator/1.0" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function check(name, ok, detail) {
  return { name, ok, detail: detail ?? null };
}

async function main() {
  const checks = [];
  const data = {};

  // robots.txt
  let robots = "";
  try {
    robots = await fetchText(`${BASE}/robots.txt`);
    data.robots = robots;
    const sitemapLines = robots.split("\n").filter((l) => /^\s*Sitemap:/i.test(l));
    checks.push(check(
      "robots.txt: 1 diretiva Sitemap:",
      sitemapLines.length === 1,
      `encontradas: ${sitemapLines.length} (${sitemapLines.join(" | ")})`,
    ));
    const disallows = robots.split("\n")
      .filter((l) => /^\s*Disallow:/i.test(l))
      .map((l) => l.replace(/^\s*Disallow:\s*/i, "").trim())
      .filter(Boolean);
    const blocksServicos = disallows.some(
      (d) => d === "/" || d === "/servicos" || d === "/servicos/" || d.startsWith("/servicos"),
    );
    checks.push(check(
      "robots.txt: não bloqueia /servicos",
      !blocksServicos,
      blocksServicos ? `Disallow: ${disallows.join(", ")}` : null,
    ));
  } catch (err) {
    checks.push(check("robots.txt acessível", false, err.message));
  }

  // sitemap-pages
  let pagesUrls = [];
  try {
    const xml = await fetchText(`${BASE}/sitemap-pages.xml`);
    pagesUrls = extractUrls(xml);
    data.pagesUrls = pagesUrls;
    checks.push(check(
      "sitemap-pages.xml inclui /servicos",
      pagesUrls.some((u) => u.replace(/\/$/, "").endsWith("/servicos")),
      `total urls: ${pagesUrls.length}`,
    ));
  } catch (err) {
    checks.push(check("sitemap-pages.xml acessível", false, err.message));
  }

  // sitemap-services
  let servicesUrls = [];
  try {
    const xml = await fetchText(`${BASE}/sitemap-services.xml`);
    servicesUrls = extractUrls(xml);
    data.servicesUrls = servicesUrls;
    checks.push(check(
      "sitemap-services.xml acessível",
      servicesUrls.length > 0,
      `total urls: ${servicesUrls.length}`,
    ));
    const slugSet = new Set(servicesUrls.map((u) => u.replace(/\/$/, "").split("/").pop()));
    const missing = REQUIRED_SLUGS.filter((s) => !slugSet.has(s));
    checks.push(check(
      `sitemap-services.xml contém slugs obrigatórios (${REQUIRED_SLUGS.length})`,
      missing.length === 0,
      missing.length ? `faltando: ${missing.join(", ")}` : null,
    ));
    const dupes = servicesUrls.filter((u, i) => servicesUrls.indexOf(u) !== i);
    checks.push(check(
      "sitemap-services.xml sem URLs duplicadas",
      dupes.length === 0,
      dupes.length ? `dupes: ${[...new Set(dupes)].join(", ")}` : null,
    ));
  } catch (err) {
    checks.push(check("sitemap-services.xml acessível", false, err.message));
  }

  // duplicidade cruzada: /servicos/{slug} não pode estar em pages.xml
  const crossDupes = pagesUrls.filter((u) => /\/servicos\/[^/]+\/?$/.test(u));
  checks.push(check(
    "Sem duplicidade /servicos/{slug} entre pages.xml e services.xml",
    crossDupes.length === 0,
    crossDupes.length ? `em pages.xml: ${crossDupes.join(", ")}` : null,
  ));

  // Render
  console.log(BOLD(`\n→ Sitemap/robots validation @ ${BASE}\n`));
  let failed = 0;
  for (const c of checks) {
    if (c.ok) {
      console.log(`${GREEN("✓")} ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
    } else {
      failed++;
      console.log(`${RED("✗")} ${c.name}${c.detail ? `\n   ${RED(c.detail)}` : ""}`);
    }
  }

  // Persist report
  if (!existsSync(REPORT_DIR)) await mkdir(REPORT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = resolve(REPORT_DIR, `sitemaps-${ts}.json`);
  await writeFile(
    reportPath,
    JSON.stringify({ base: BASE, generated_at: new Date().toISOString(), checks, data }, null, 2),
  );

  const historyPath = resolve(REPORT_DIR, "HISTORY.md");
  const summary = [
    `## ${ts} — sitemap/robots — ${BASE}`,
    `- Checks: **${checks.length}** | Falhas: **${failed}** | Relatório: \`seo-reports/sitemaps-${ts}.json\``,
    ...checks.filter((c) => !c.ok).map((c) => `  - ❌ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`),
    "",
  ].join("\n");
  await appendFile(historyPath, summary + "\n");

  console.log(BOLD(`\n→ Relatório: ${reportPath}`));
  console.log(BOLD(`→ Histórico: ${historyPath}\n`));

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(RED(`Erro fatal: ${err?.message || err}`));
  process.exit(2);
});
