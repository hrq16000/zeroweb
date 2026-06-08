#!/usr/bin/env node
/**
 * Validador de imagens do catálogo de serviços.
 *
 * Para cada serviço ativo no banco (table `services` via REST Supabase),
 * garante:
 *   - image_path não nulo OU og_image_path não nulo
 *   - a imagem responde HEAD 200 com Content-Type image/*
 *
 * Falha o processo se houver qualquer órfão (exit 1), permitindo gating em CI.
 *
 * Uso:
 *   node scripts/validate-catalog-images.mjs
 *
 * Variáveis:
 *   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY (ou VITE_*)
 *   SKIP_CATALOG_IMAGE_CHECK=1 → pula
 */
const SKIP = process.env.SKIP_CATALOG_IMAGE_CHECK === "1";
if (SKIP) {
  console.log("[catalog-images] skipped via SKIP_CATALOG_IMAGE_CHECK=1");
  process.exit(0);
}

const URL_BASE =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://lxajhxocyqzwwbcfahya.supabase.co";
const ANON =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!ANON) {
  console.error("[catalog-images] missing SUPABASE_PUBLISHABLE_KEY env");
  process.exit(2);
}

async function fetchServices() {
  const url = `${URL_BASE.replace(/\/$/, "")}/rest/v1/services?select=slug,name,image_path,og_image_path,is_active&is_active=eq.true&order=slug.asc`;
  const r = await fetch(url, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.json();
}

function publicImageUrl(path) {
  if (!path) return null;
  return `${URL_BASE.replace(/\/$/, "")}/storage/v1/object/public/service-images/${path}`;
}

async function headOk(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    if (!r.ok) return { ok: false, reason: `HTTP ${r.status}` };
    const ct = r.headers.get("content-type") ?? "";
    if (!/^image\//.test(ct)) return { ok: false, reason: `content-type=${ct}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

(async () => {
  let services;
  try {
    services = await fetchServices();
  } catch (e) {
    console.error(`[catalog-images] failed to fetch services: ${e.message}`);
    process.exit(2);
  }
  console.log(`[catalog-images] checking ${services.length} active service(s)`);

  const orphans = [];
  const broken = [];

  for (const s of services) {
    const path = s.image_path || s.og_image_path;
    if (!path) {
      orphans.push(s.slug);
      continue;
    }
    const url = publicImageUrl(path);
    const r = await headOk(url);
    if (!r.ok) broken.push({ slug: s.slug, url, reason: r.reason });
  }

  if (orphans.length === 0 && broken.length === 0) {
    console.log(`[catalog-images] ✅ all ${services.length} services have valid cover images`);
    process.exit(0);
  }

  if (orphans.length) {
    console.error(`\n[catalog-images] ❌ ${orphans.length} service(s) with NO image_path:`);
    for (const slug of orphans) console.error(`  - ${slug}`);
  }
  if (broken.length) {
    console.error(`\n[catalog-images] ❌ ${broken.length} broken image URL(s):`);
    for (const b of broken) console.error(`  - ${b.slug} → ${b.url} (${b.reason})`);
  }
  process.exit(1);
})();
