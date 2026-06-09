#!/usr/bin/env node
/**
 * Audit JSON-LD Offers em /servicos/{slug} contra os requisitos do
 * Google Rich Results (Product/Offer) e do Schema.org Validator.
 *
 * Para cada slug listado em /sitemap-services.xml (com fallback):
 *  - Faz GET na página em produção
 *  - Extrai todos os <script application/ld+json>
 *  - Localiza nós Service/Product com `offers`
 *  - Valida cada Offer contra o checklist:
 *      ✓ price (string/number > 0)
 *      ✓ priceCurrency (BRL)
 *      ✓ availability (URL schema.org)
 *      ✓ priceValidUntil (ISO YYYY-MM-DD futuro)
 *      ✓ url
 *      ✓ seller (objeto ou @id)
 *      ✓ name (recomendado p/ múltiplas variações)
 *  - Opcional: dispara validator.schema.org e captura erros/warnings
 *
 * Saída:
 *   seo-reports/offers-audit-<timestamp>.json
 *   resumo legível no stdout (✓ / ❌ por slug + Offer)
 *
 * Uso:
 *   node scripts/audit-offers-jsonld.mjs [baseUrl] [--with-validator]
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, "..", "seo-reports");
const BASE = (process.argv.find((a) => a.startsWith("http")) || "https://0web.com.br").replace(/\/$/, "");
const WITH_VALIDATOR = process.argv.includes("--with-validator");

const FALLBACK_SLUGS = [
  "site-express", "criacao-de-sites", "landing-page", "loja-virtual",
  "seo", "marketing-digital", "automacao-ia", "chatbot-whatsapp", "sistema-web",
];

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "0web-offers-audit/1.0" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

async function loadSlugs() {
  try {
    const xml = await fetchText(`${BASE}/sitemap-services.xml`);
    const slugs = [...xml.matchAll(/<loc>[^<]*\/servicos\/([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (slugs.length) return [...new Set(slugs)];
  } catch (e) { console.warn(c.yellow(`! sitemap indisponível: ${e.message}`)); }
  return FALLBACK_SLUGS;
}

function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1].trim())); }
    catch (e) { out.push({ __parseError: e.message }); }
  }
  return out;
}

function flatten(blocks) {
  const nodes = [];
  for (const b of blocks) {
    if (!b || b.__parseError) continue;
    if (Array.isArray(b["@graph"])) nodes.push(...b["@graph"]);
    else nodes.push(b);
  }
  return nodes;
}

function isFutureDate(s) {
  if (!s || typeof s !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return false;
  return new Date(s).getTime() > Date.now();
}

function validateOffer(offer) {
  const issues = [];
  if (!offer || typeof offer !== "object") return ["offer inválido"];
  const price = Number(offer.price);
  if (!offer.price || Number.isNaN(price) || price <= 0) issues.push("price ausente/inválido");
  if (offer.priceCurrency !== "BRL") issues.push(`priceCurrency=${offer.priceCurrency ?? "—"} (esperado BRL)`);
  if (!/^https?:\/\/schema\.org\//.test(String(offer.availability || ""))) issues.push("availability ausente");
  if (!offer.priceValidUntil) issues.push("priceValidUntil ausente");
  else if (!isFutureDate(offer.priceValidUntil)) issues.push(`priceValidUntil expirado (${offer.priceValidUntil})`);
  if (!offer.url) issues.push("url ausente");
  if (!offer.seller) issues.push("seller ausente");
  if (!offer.name) issues.push("name ausente (recomendado p/ variação)");
  return issues;
}

async function callValidator(url) {
  try {
    const u = `https://validator.schema.org/validate?hl=en&url=${encodeURIComponent(url)}`;
    const r = await fetch(u, { headers: { accept: "application/json" } });
    if (!r.ok) return { errors: null, warnings: null, status: r.status };
    const text = (await r.text()).replace(/^\)\]\}'\n?/, "");
    const j = JSON.parse(text);
    return { errors: j?.totalNumErrors ?? 0, warnings: j?.totalNumWarnings ?? 0 };
  } catch (e) { return { errors: null, warnings: null, error: e.message }; }
}

async function auditSlug(slug) {
  const url = `${BASE}/servicos/${slug}`;
  let html;
  try { html = await fetchText(url); }
  catch (e) { return { slug, url, error: e.message }; }
  const blocks = extractJsonLd(html);
  const nodes = flatten(blocks);
  const carriers = nodes.filter((n) => n && (n["@type"] === "Service" || n["@type"] === "Product") && n.offers);
  const offers = [];
  for (const carrier of carriers) {
    const list = Array.isArray(carrier.offers) ? carrier.offers : [carrier.offers];
    for (const o of list) offers.push({ name: o?.name ?? "(sem nome)", issues: validateOffer(o), offer: o });
  }
  const ok = offers.length > 0 && offers.every((o) => o.issues.length === 0);
  const result = { slug, url, blocks: blocks.length, carriers: carriers.length, offers, ok };
  if (WITH_VALIDATOR) result.validator = await callValidator(url);
  return result;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const slugs = await loadSlugs();
  console.log(c.bold(`\nAuditando Offers JSON-LD em ${slugs.length} serviços @ ${BASE}\n`));
  const results = [];
  let failed = 0;
  for (const slug of slugs) {
    const r = await auditSlug(slug);
    results.push(r);
    if (r.error) {
      console.log(c.red(`✗ /servicos/${slug}  fetch: ${r.error}`));
      failed++; continue;
    }
    if (r.offers.length === 0) {
      console.log(c.yellow(`· /servicos/${slug}  (sem offers — serviço sem preço)`));
      continue;
    }
    const tag = r.ok ? c.green("✓") : c.red(`✗ (${r.offers.filter((o) => o.issues.length).length})`);
    const vTag = r.validator ? c.dim(` validator=err:${r.validator.errors ?? "?"} warn:${r.validator.warnings ?? "?"}`) : "";
    console.log(`${tag} /servicos/${slug}  offers=${r.offers.length}${vTag}`);
    for (const o of r.offers) {
      if (!o.issues.length) console.log(c.dim(`    ✓ ${o.name}`));
      else { failed++; console.log(c.red(`    ✗ ${o.name}: ${o.issues.join(", ")}`)); }
    }
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = resolve(REPORT_DIR, `offers-audit-${stamp}.json`);
  await writeFile(path, JSON.stringify({ baseUrl: BASE, at: stamp, results }, null, 2));
  console.log(c.bold(`\n→ Relatório: ${path}`));
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
