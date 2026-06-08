#!/usr/bin/env node
/**
 * Validação integrada de navegação + SEO técnico.
 *
 * Cobre:
 *  1) Redirects 301/308 de rotas legadas → /servicos/{slug} (sem loops/404).
 *  2) Páginas-chave + catálogo /servicos/{slug} (200, sem 404).
 *  3) Chrome do site: Header, Footer, Breadcrumbs (leafs) e página 404
 *     enriquecida — emulando desktop e mobile via User-Agent.
 *  4) Checklist técnico de SEO: sitemap.xml (urlset|sitemapindex),
 *     robots.txt, Open Graph, JSON-LD e FAQPage schema.
 *
 * Uso:  BASE_URL=https://0web.com.br node scripts/validate-navigation.mjs
 *       (default: https://0web.com.br)
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE_URL || process.argv[2] || "https://0web.com.br").replace(/\/$/, "");
const UA_DESKTOP = "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 Chrome/124 Safari/537.36";
const UA_MOBILE  = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";

const LEGACY_REDIRECTS = {
  "/automacao":         "/servicos/automacao-com-ia",
  "/consultoria":       "/servicos/consultoria",
  "/criacao-sites":     "/servicos/criacao-de-sites",
  "/desenvolvimento":   "/servicos/desenvolvimento-saas",
  "/google-meu-negocio":"/servicos/google-meu-negocio",
  "/ia":                "/servicos/automacao-com-ia",
  "/landing-pages":     "/servicos/landing-pages",
  "/marketplace":       "/servicos/marketplace",
  "/parceiros":         "/servicos/parceiros",
  "/presenca-digital":  "/servicos/presenca-digital",
  "/redes-sociais":     "/servicos/gestao-redes-sociais",
  "/seo":               "/servicos/seo",
  "/trafego-pago":      "/servicos/trafego-pago",
  "/trafego-pago-local":"/servicos/trafego-pago-local",
};

const SERVICE_SLUGS = [
  "automacao-com-ia","chatbot-whatsapp","consultoria","criacao-de-sites",
  "desenvolvimento-saas","gestao-redes-sociais","google-meu-negocio",
  "landing-pages","loja-virtual","marketing-digital","marketplace",
  "parceiros","presenca-digital","seo","sistemas-web","site-24h",
  "site-express","trafego-pago","trafego-pago-local",
];

const KEY_PAGES = ["/", "/servicos", "/sobre", "/blog", "/faq", "/cases", "/contato"];
// Pages we expect to expose breadcrumbs (leafs / inner pages).
const BREADCRUMB_PAGES = ["/servicos/seo", "/servicos/google-meu-negocio", "/sobre", "/faq", "/cases"];

const results = { redirects: [], links: [], chrome: [], seo: [], summary: {} };
let fail = 0;

const log = (ok, msg) => { console.log(`${ok ? "✓" : "✗"} ${msg}`); if (!ok) fail++; };

async function head(url) {
  try {
    const r = await fetch(url, { redirect: "manual", headers: { "user-agent": UA_DESKTOP } });
    return { status: r.status, location: r.headers.get("location") };
  } catch (e) { return { status: 0, error: e.message }; }
}
async function get(url, ua = UA_DESKTOP) {
  try {
    const r = await fetch(url, { redirect: "follow", headers: { "user-agent": ua } });
    const text = await r.text();
    return { status: r.status, html: text, finalUrl: r.url };
  } catch (e) { return { status: 0, error: e.message, html: "" }; }
}
const limit = (arr, n, fn) => new Promise((resolve) => {
  const out = []; let i = 0, running = 0;
  const next = () => {
    if (i >= arr.length && running === 0) return resolve(out);
    while (running < n && i < arr.length) {
      const idx = i++; running++;
      Promise.resolve(fn(arr[idx], idx)).then((v) => { out[idx] = v; running--; next(); });
    }
  };
  next();
});

// 1) REDIRECTS
console.log(`\n[1/4] Redirects 301 legados (${Object.keys(LEGACY_REDIRECTS).length}) — base=${BASE}`);
await limit(Object.entries(LEGACY_REDIRECTS), 6, async ([from, to]) => {
  const r = await head(BASE + from);
  const ok = (r.status === 301 || r.status === 308) && (r.location || "").endsWith(to);
  results.redirects.push({ from, expected: to, ...r, ok });
  log(ok, `${from} → ${r.status} ${r.location || "(–)"} [esperado: ${to}]`);
  if (ok) {
    const final = await head(BASE + to);
    if (final.status !== 200) log(false, `   destino ${to} responde ${final.status}`);
  }
});

// 2) PÁGINAS-CHAVE + CATÁLOGO
console.log(`\n[2/4] Páginas-chave + catálogo /servicos/{slug} (200)`);
await limit(KEY_PAGES, 6, async (p) => {
  const r = await head(BASE + p);
  const ok = r.status === 200;
  results.links.push({ path: p, status: r.status, ok });
  log(ok, `${p} → ${r.status}`);
});
await limit(SERVICE_SLUGS, 6, async (slug) => {
  const p = `/servicos/${slug}`;
  const r = await head(BASE + p);
  const ok = r.status === 200;
  results.links.push({ path: p, status: r.status, ok });
  log(ok, `${p} → ${r.status}`);
});

// 3) CHROME (Header/Footer/Breadcrumbs em desktop+mobile)
console.log(`\n[3/4] Header / Footer / Breadcrumbs (desktop+mobile) e 404`);
for (const p of BREADCRUMB_PAGES) {
  for (const [device, ua] of [["desktop", UA_DESKTOP], ["mobile", UA_MOBILE]]) {
    const r = await get(BASE + p, ua);
    const html = r.html || "";
    const header = /<header[\s>]/i.test(html);
    const footer = /<footer[\s>]/i.test(html);
    const breadcrumbs = /aria-label=["']Breadcrumb["']/i.test(html);
    const ok = r.status === 200 && header && footer && breadcrumbs;
    results.chrome.push({ path: p, device, status: r.status, header, footer, breadcrumbs, ok });
    log(ok, `${device.padEnd(7)} ${p} header=${header} footer=${footer} breadcrumbs=${breadcrumbs}`);
  }
}
const nf = await get(BASE + "/__rota-inexistente-" + Date.now());
const nfOk = nf.status === 404 && /<header[\s>]/i.test(nf.html) && /<footer[\s>]/i.test(nf.html);
results.chrome.push({ path: "404", status: nf.status, ok: nfOk });
log(nfOk, `404 enriquecido (Header+Footer) → status=${nf.status}`);

// 4) SEO
console.log(`\n[4/4] SEO: sitemap, robots, Open Graph, JSON-LD, FAQ schema`);
const sitemap = await get(BASE + "/sitemap.xml");
const sitemapOk = sitemap.status === 200 && (/<urlset[\s>]/i.test(sitemap.html) || /<sitemapindex[\s>]/i.test(sitemap.html));
log(sitemapOk, `/sitemap.xml status=${sitemap.status} (urlset|sitemapindex)`);
const robots = await get(BASE + "/robots.txt");
log(robots.status === 200 && /User-agent/i.test(robots.html), `/robots.txt status=${robots.status}`);

const seoSamples = ["/", "/servicos/seo", "/servicos/google-meu-negocio", "/blog", "/faq", "/sobre"];
for (const p of seoSamples) {
  const r = await get(BASE + p);
  const h = r.html || "";
  const og = /property=["']og:title["']/i.test(h) && /property=["']og:description["']/i.test(h);
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(h);
  const jsonld = /application\/ld\+json/i.test(h);
  const faqOk = p === "/faq" ? /"@type"\s*:\s*"FAQPage"/.test(h) : true;
  const ok = og && canonical && jsonld && faqOk;
  results.seo.push({ path: p, og, canonical, jsonld, faqOk, ok });
  log(ok, `${p} og=${og} canonical=${canonical} jsonld=${jsonld}${p === "/faq" ? ` faq=${faqOk}` : ""}`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await mkdir(path.resolve("seo-reports"), { recursive: true });
results.summary = { base: BASE, at: stamp, fail };
await writeFile(`seo-reports/nav-validate-${stamp}.json`, JSON.stringify(results, null, 2));

console.log(`\nResultado: ${fail === 0 ? "✅ OK" : `❌ ${fail} falha(s)`} — relatório seo-reports/nav-validate-${stamp}.json`);
process.exit(fail ? 1 : 0);
