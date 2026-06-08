#!/usr/bin/env node
/**
 * CI seo-diff: compara o SEO renderizado da preview URL contra o snapshot
 * de cada serviço do banco. Falha se diferenças relevantes acima do limite.
 *
 * Uso:
 *   BASE_URL=https://preview.lovable.app node scripts/run-seo-diff.mjs
 *
 * Limites configuráveis em seo-reports/seo-diff.config.json:
 *   { "maxDelta": 0.30, "ignoreSlugs": [...] }
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE_URL || process.env.PREVIEW_URL || "https://0web.com.br").replace(/\/$/, "");
const URL_BASE =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://lxajhxocyqzwwbcfahya.supabase.co";
const ANON =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!ANON) {
  console.error("[seo-diff] missing SUPABASE_PUBLISHABLE_KEY env");
  process.exit(2);
}

let CONFIG = { maxDelta: 0.3, ignoreSlugs: [] };
try {
  CONFIG = { ...CONFIG, ...JSON.parse(await readFile(path.resolve("seo-reports/seo-diff.config.json"), "utf8")) };
} catch { /* defaults */ }

function pick(html, attr, key) {
  const re1 = new RegExp(`<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, "i");
  return html.match(re1)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function parse(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
  return {
    title,
    description: pick(html, "name", "description"),
    ogTitle: pick(html, "property", "og:title"),
    ogDescription: pick(html, "property", "og:description"),
    ogImage: pick(html, "property", "og:image"),
    jsonLd: [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).filter(Boolean),
  };
}

function delta(a, b) {
  a = (a ?? "").trim();
  b = (b ?? "").trim();
  if (!a && !b) return 0;
  if (!a || !b) return 1;
  if (a === b) return 0;
  // simples: 1 - razão de chars iguais
  const max = Math.max(a.length, b.length);
  let same = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) same++;
  return 1 - same / max;
}

const url = `${URL_BASE.replace(/\/$/, "")}/rest/v1/services?select=slug,name,seo_title,seo_description,og_image_path,image_path,schema_jsonld&is_active=eq.true`;
const services = await (await fetch(url, { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } })).json();

let failures = 0;
const report = [];
for (const s of services) {
  if (CONFIG.ignoreSlugs.includes(s.slug)) continue;
  const target = `${BASE}/servicos/${s.slug}`;
  let html;
  try {
    const r = await fetch(target);
    if (!r.ok) { console.warn(`[seo-diff] ${target} → HTTP ${r.status}`); continue; }
    html = await r.text();
  } catch (e) {
    console.warn(`[seo-diff] ${target} fetch failed: ${e.message}`);
    continue;
  }
  const live = parse(html);
  const expectedTitle = s.seo_title ?? s.name;
  const expectedDesc = s.seo_description ?? "";

  const dT = delta(live.title, expectedTitle);
  const dD = delta(live.description, expectedDesc);
  const dOg = delta(live.ogTitle, expectedTitle);
  const hasJsonLd = live.jsonLd.length > 0;
  const expectsJsonLd = Array.isArray(s.schema_jsonld) && s.schema_jsonld.length > 0;
  const jsonMismatch = expectsJsonLd && !hasJsonLd;

  const breach = dT > CONFIG.maxDelta || dD > CONFIG.maxDelta || dOg > CONFIG.maxDelta || jsonMismatch;
  report.push({ slug: s.slug, dT: dT.toFixed(2), dD: dD.toFixed(2), dOg: dOg.toFixed(2), jsonMismatch, breach });
  if (breach) failures++;
}

console.log("slug\tdT\tdD\tdOg\tjson\tBREACH");
for (const r of report) console.log(`${r.slug}\t${r.dT}\t${r.dD}\t${r.dOg}\t${r.jsonMismatch ? "MISSING" : "ok"}\t${r.breach ? "❌" : "✓"}`);

// Persiste no histórico admin (seo_audit_history). Best-effort: requer SUPABASE_SERVICE_ROLE_KEY.
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (SVC) {
  try {
    const totalReports = report.length || 1;
    const avgDelta =
      report.reduce((s, r) => s + Number(r.dT) + Number(r.dD) + Number(r.dOg), 0) / (3 * totalReports);
    await fetch(`${URL_BASE.replace(/\/$/, "")}/rest/v1/seo_audit_history`, {
      method: "POST",
      headers: {
        apikey: SVC,
        Authorization: `Bearer ${SVC}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        kind: "seo_diff",
        summary: { scanned: report.length, failures, maxDelta: CONFIG.maxDelta, avgDelta },
        details: { base: BASE, report },
        delta_pct: Number((avgDelta * 100).toFixed(2)),
      }),
    });
  } catch (e) {
    console.warn(`[seo-diff] history insert failed: ${e.message}`);
  }
}

if (failures > 0) {
  console.error(`\n[seo-diff] ❌ ${failures} service(s) excederam delta=${CONFIG.maxDelta}`);
  process.exit(1);
}
console.log(`\n[seo-diff] ✅ ${report.length} service(s) dentro do limite`);
