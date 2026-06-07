#!/usr/bin/env node
/**
 * Smoke test dinâmico para /servicos/{slug}.
 *
 * - Busca todos os slugs publicados via Supabase (table: services).
 * - Adiciona slugs fixos das landing pages migradas.
 * - Faz GET em cada URL e valida HTTP 200, presença de <h1>, CTA WhatsApp
 *   e tag canonical apontando para a própria URL.
 *
 * Uso:
 *   BASE_URL=https://0web.com.br node scripts/smoke-servicos.mjs
 *
 * Sai com código 1 se qualquer URL falhar.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "https://0web.com.br";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

const STATIC_SLUGS = [
  "site-express",
  "trafego-pago-local",
  "trafego-pago",
  "presenca-digital",
  "google-meu-negocio",
  "consultoria",
  "parceiros",
  "marketplace",
];

async function fetchDbSlugs() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/services?select=slug&status=eq.published`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

async function probe(slug) {
  const url = `${BASE}/servicos/${slug}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: "manual" });
    const html = await res.text();
    const ms = Date.now() - start;
    const ok = res.status === 200;
    const hasH1 = /<h1\b/i.test(html);
    const hasCta = /whatsapp|wa\.me|orçamento|orcamento/i.test(html);
    const hasCanonical = new RegExp(`<link[^>]+rel=["']canonical["'][^>]+/servicos/${slug}`, "i").test(html);
    return {
      slug,
      url,
      status: res.status,
      ms,
      ok,
      hasH1,
      hasCta,
      hasCanonical,
      pass: ok && hasH1 && hasCta && hasCanonical,
    };
  } catch (err) {
    return { slug, url, status: 0, ms: Date.now() - start, ok: false, error: String(err), pass: false };
  }
}

async function main() {
  const dbSlugs = await fetchDbSlugs();
  const slugs = [...new Set([...STATIC_SLUGS, ...dbSlugs])].sort();
  console.log(`Smoke /servicos: ${slugs.length} slugs em ${BASE}\n`);

  const results = [];
  for (const slug of slugs) {
    const r = await probe(slug);
    results.push(r);
    const icon = r.pass ? "✓" : "✗";
    const flags = `[h1:${r.hasH1 ? "y" : "n"} cta:${r.hasCta ? "y" : "n"} canon:${r.hasCanonical ? "y" : "n"}]`;
    console.log(`${icon} ${r.status} ${slug.padEnd(28)} ${r.ms}ms ${flags}`);
  }

  const failed = results.filter((r) => !r.pass);
  const summary = {
    base: BASE,
    total: results.length,
    pass: results.length - failed.length,
    fail: failed.length,
    timestamp: new Date().toISOString(),
    failed: failed.map((r) => ({ slug: r.slug, status: r.status, reason: r.error || "missing markers" })),
  };

  mkdirSync("seo-reports", { recursive: true });
  writeFileSync(`seo-reports/smoke-servicos.json`, JSON.stringify({ summary, results }, null, 2));
  console.log(`\nRelatório: seo-reports/smoke-servicos.json`);
  console.log(`Pass ${summary.pass}/${summary.total}`);

  process.exit(failed.length ? 1 : 0);
}

main();
