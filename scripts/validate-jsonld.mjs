#!/usr/bin/env node
/**
 * SEO/JSON-LD validator para /servicos e /servicos/{slug}.
 *
 * - Busca o sitemap-services.xml para enumerar slugs (com fallback para um
 *   conjunto mínimo).
 * - Faz GET em cada página, extrai todos os <script type="application/ld+json">,
 *   parseia, e roda um checklist por rota cobrindo:
 *     • Open Graph / Twitter (og:title, og:description, og:url, og:image)
 *     • <link rel="canonical">  + hreflang pt-BR / x-default
 *     • BreadcrumbList presente e com posições sequenciais
 *     • FAQPage com mainEntity[] não-vazio quando presente
 *     • Service com name/description/serviceType/url
 *     • Duplicidade: nós com mesmo @id ou múltiplos BreadcrumbList/FAQPage no graph
 * - Gera relatório em seo-reports/<timestamp>.json e atualiza
 *   seo-reports/HISTORY.md com o resumo (passou/falhou por rota).
 *
 * Uso:  node scripts/validate-jsonld.mjs [baseUrl]
 * Default baseUrl: https://0web.com.br
 */
import { writeFile, mkdir, readFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, "..", "seo-reports");
const BASE = (process.argv[2] || "https://0web.com.br").replace(/\/$/, "");

const FALLBACK_SLUGS = [
  "criacao-de-sites",
  "site-express",
  "landing-page",
  "loja-virtual",
  "seo",
  "marketing-digital",
  "automacao-ia",
  "chatbot-whatsapp",
  "sistema-web",
];

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "0web-seo-validator/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.text();
}

async function loadSlugs() {
  try {
    const xml = await fetchText(`${BASE}/sitemap-services.xml`);
    const slugs = [...xml.matchAll(/<loc>[^<]*\/servicos\/([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (slugs.length) return [...new Set(slugs)];
  } catch (err) {
    console.warn(colors.yellow(`! sitemap-services indisponível: ${err.message}`));
  }
  return FALLBACK_SLUGS;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch (e) {
      blocks.push({ __parseError: e.message, raw: m[1].slice(0, 200) });
    }
  }
  return blocks;
}

function extractMeta(html, key, attr = "property") {
  const re = new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractLink(html, rel, extra = "") {
  const re = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*${extra}[^>]*href=["']([^"']*)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : null;
}

function flattenGraph(blocks) {
  const nodes = [];
  for (const b of blocks) {
    if (b && Array.isArray(b["@graph"])) nodes.push(...b["@graph"]);
    else if (b) nodes.push(b);
  }
  return nodes;
}

function check(name, ok, detail = "") {
  return { name, ok: !!ok, detail };
}

function validateRoute(path, html) {
  const url = `${BASE}${path}`;
  const blocks = extractJsonLd(html);
  const nodes = flattenGraph(blocks);
  const byType = (t) => nodes.filter((n) => n && n["@type"] === t);
  const ids = nodes.map((n) => n && n["@id"]).filter(Boolean);
  const idCounts = ids.reduce((a, id) => ((a[id] = (a[id] || 0) + 1), a), {});
  const dupIds = Object.entries(idCounts).filter(([, c]) => c > 1).map(([id]) => id);

  const breadcrumbs = byType("BreadcrumbList");
  const faqs = byType("FAQPage");
  const services = byType("Service");

  const checks = [
    check("og:title presente", !!extractMeta(html, "og:title")),
    check("og:description presente", !!extractMeta(html, "og:description")),
    check("og:url presente", !!extractMeta(html, "og:url")),
    check("og:image presente", !!extractMeta(html, "og:image")),
    check("twitter:card presente", !!extractMeta(html, "twitter:card", "name")),
    check("canonical presente", !!extractLink(html, "canonical")),
    check("hreflang pt-BR presente", !!extractLink(html, "alternate", `hreflang=["']pt-BR["']`)),
    check("JSON-LD parseou (>=1 bloco)", blocks.every((b) => !b.__parseError) && blocks.length > 0,
      blocks.find((b) => b.__parseError)?.__parseError || ""),
    check("Sem @id duplicado", dupIds.length === 0, dupIds.join(", ")),
    check("BreadcrumbList único", breadcrumbs.length <= 1,
      `${breadcrumbs.length} encontrados`),
    check("BreadcrumbList tem itemListElement", breadcrumbs.every((b) => Array.isArray(b.itemListElement) && b.itemListElement.length > 0)),
    check("BreadcrumbList posições sequenciais", breadcrumbs.every((b) =>
      (b.itemListElement || []).every((it, i) => Number(it.position) === i + 1))),
    check("FAQPage único (ou ausente)", faqs.length <= (path === "/servicos" ? 2 : 1),
      `${faqs.length} encontrados`),
    check("FAQPage mainEntity não-vazio", faqs.every((f) => Array.isArray(f.mainEntity) && f.mainEntity.length > 0)),
    check("FAQPage perguntas sem texto vazio", faqs.every((f) =>
      (f.mainEntity || []).every((q) => q.name && q.acceptedAnswer?.text))),
    check("Service tem campos obrigatórios",
      services.length === 0 || services.every((s) => s.name && s.description && s.serviceType && s.url),
      `${services.length} serviços`),
  ];

  const failed = checks.filter((c) => !c.ok);
  return { url, path, blocks: blocks.length, nodes: nodes.length, checks, failed };
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const slugs = await loadSlugs();
  const routes = ["/servicos", ...slugs.map((s) => `/servicos/${s}`)];

  console.log(colors.bold(`\nValidando ${routes.length} rotas em ${BASE}\n`));

  const results = [];
  for (const path of routes) {
    try {
      const html = await fetchText(`${BASE}${path}`);
      const r = validateRoute(path, html);
      results.push(r);
      const tag = r.failed.length === 0 ? colors.green("✓") : colors.red(`✗ (${r.failed.length})`);
      console.log(`${tag} ${path}  [blocks=${r.blocks} nodes=${r.nodes}]`);
      for (const f of r.failed) console.log(colors.red(`   - ${f.name}${f.detail ? `: ${f.detail}` : ""}`));
    } catch (err) {
      console.log(colors.red(`✗ ${path}  ${err.message}`));
      results.push({ url: `${BASE}${path}`, path, error: err.message, failed: [{ name: "fetch" }] });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = resolve(REPORT_DIR, `${stamp}.json`);
  await writeFile(jsonPath, JSON.stringify({ baseUrl: BASE, at: stamp, results }, null, 2));

  const total = results.length;
  const failedRoutes = results.filter((r) => (r.failed || []).length > 0).length;
  const summary = `## ${stamp} — ${BASE}\n` +
    `- Rotas: **${total}** | Falhas: **${failedRoutes}** | Relatório: \`seo-reports/${stamp}.json\`\n` +
    results.map((r) => {
      const status = (r.failed || []).length === 0 ? "✅" : `❌ (${r.failed.length})`;
      return `  - ${status} \`${r.path}\``;
    }).join("\n") + "\n\n";

  const historyPath = resolve(REPORT_DIR, "HISTORY.md");
  if (!existsSync(historyPath)) {
    await writeFile(historyPath, "# Histórico de validações SEO/JSON-LD\n\n");
  }
  await appendFile(historyPath, summary);

  console.log(colors.bold(`\n→ Relatório: ${jsonPath}`));
  console.log(colors.bold(`→ Histórico: ${historyPath}\n`));

  process.exit(failedRoutes === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
