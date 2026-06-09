#!/usr/bin/env node
/**
 * Snapshot de metadados (canonical + og:image + og:url + title + description)
 * para comparação antes/depois entre deploys.
 *
 * - Para /servicos/{slug}: enumera via /sitemap-services.xml (fallback estático)
 * - Para /pedido/{id}: aceita IDs via flag --orders=uuid1,uuid2 ou
 *   variável de ambiente ORDER_IDS="uuid1,uuid2"
 *
 * Saída:
 *   seo-reports/meta-snapshot-<timestamp>.json
 *   seo-reports/meta-snapshot-latest.json  (sobrescrito a cada execução,
 *     para diff rápido com `diff -u previous current`)
 *
 * Uso:
 *   node scripts/snapshot-meta.mjs                       # produção
 *   node scripts/snapshot-meta.mjs https://preview.url   # outro base
 *   node scripts/snapshot-meta.mjs --orders=uuid1,uuid2
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, "..", "seo-reports");
const BASE = (process.argv.find((a) => a.startsWith("http")) || "https://0web.com.br").replace(/\/$/, "");
const ordersArg = process.argv.find((a) => a.startsWith("--orders="));
const ORDER_IDS = (ordersArg ? ordersArg.slice("--orders=".length) : process.env.ORDER_IDS || "")
  .split(",").map((s) => s.trim()).filter(Boolean);

const FALLBACK_SLUGS = [
  "site-express", "criacao-de-sites", "landing-page", "loja-virtual",
  "seo", "marketing-digital", "automacao-ia", "chatbot-whatsapp", "sistema-web",
];

async function fetchText(url) {
  const r = await fetch(url, { headers: { "user-agent": "0web-meta-snapshot/1.0" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

function pickMeta(html, key, attr = "property") {
  const re1 = new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i");
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function pickLink(html, rel) {
  const re1 = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${rel}["']`, "i");
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function snapshot(html) {
  return {
    title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim() || null,
    description: pickMeta(html, "description", "name"),
    canonical: pickLink(html, "canonical"),
    ogTitle: pickMeta(html, "og:title"),
    ogDescription: pickMeta(html, "og:description"),
    ogUrl: pickMeta(html, "og:url"),
    ogImage: pickMeta(html, "og:image"),
    ogType: pickMeta(html, "og:type"),
    twitterImage: pickMeta(html, "twitter:image", "name"),
    robots: pickMeta(html, "robots", "name"),
  };
}

async function snapshotPath(path) {
  const url = `${BASE}${path}`;
  try {
    const html = await fetchText(url);
    return { path, url, ...snapshot(html) };
  } catch (e) {
    return { path, url, error: e.message };
  }
}

async function loadServiceSlugs() {
  try {
    const xml = await fetchText(`${BASE}/sitemap-services.xml`);
    const slugs = [...xml.matchAll(/<loc>[^<]*\/servicos\/([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (slugs.length) return [...new Set(slugs)];
  } catch { /* fall through */ }
  return FALLBACK_SLUGS;
}

async function main() {
  await mkdir(REPORT_DIR, { recursive: true });
  const slugs = await loadServiceSlugs();
  const paths = [
    "/servicos",
    ...slugs.map((s) => `/servicos/${s}`),
    ...ORDER_IDS.map((id) => `/pedido/${id}`),
  ];
  console.log(`Snapshotando ${paths.length} rotas @ ${BASE}`);
  const snapshots = [];
  for (const p of paths) {
    const s = await snapshotPath(p);
    snapshots.push(s);
    const tag = s.error ? "✗" : "✓";
    const og = s.ogImage ? s.ogImage.slice(0, 60) : "—";
    console.log(`${tag} ${p}  canonical=${s.canonical ?? "—"}  og:image=${og}`);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const data = { baseUrl: BASE, at: stamp, snapshots };
  const latestPath = resolve(REPORT_DIR, "meta-snapshot-latest.json");
  const stampedPath = resolve(REPORT_DIR, `meta-snapshot-${stamp}.json`);

  // Antes de sobrescrever o latest, move para *.previous para permitir diff.
  if (existsSync(latestPath)) {
    try {
      const prev = await readFile(latestPath, "utf8");
      await writeFile(resolve(REPORT_DIR, "meta-snapshot-previous.json"), prev);
    } catch { /* best effort */ }
  }
  await writeFile(stampedPath, JSON.stringify(data, null, 2));
  await writeFile(latestPath, JSON.stringify(data, null, 2));

  console.log(`\n→ Snapshot: ${stampedPath}`);
  console.log(`→ Latest:   ${latestPath}`);
  console.log(`→ Diff:     diff -u seo-reports/meta-snapshot-previous.json seo-reports/meta-snapshot-latest.json`);
}

main().catch((e) => { console.error(e); process.exit(2); });
