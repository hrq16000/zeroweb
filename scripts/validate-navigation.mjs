#!/usr/bin/env node
/**
 * Validação integrada de navegação + SEO técnico.
 *
 * Cobre:
 *  1) Redirects 301 de rotas legadas → /servicos/{slug} (sem loops/404).
 *  2) Links de Serviços Relacionados, Breadcrumbs e Serviço relacionado a posts (200).
 *  3) Presença de Header, Footer, Breadcrumbs e seção de 404 (desktop+mobile,
 *     via marcadores no HTML SSR).
 *  4) Checklist técnico de SEO: sitemap.xml, robots.txt, Open Graph, JSON-LD,
 *     FAQPage schema onde aplicável.
 *
 * Uso:  BASE_URL=https://0web.com.br node scripts/validate-navigation.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE_URL || process.argv[2] || "https://0web.com.br").replace(/\/$/, "");

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

const results = { redirects: [], links: [], chrome: [], seo: [], summary: {} };
let fail = 0;

const log = (ok, msg) => { console.log(`${ok ? "✓" : "✗"} ${msg}`); if (!ok) fail++; };

async function head(url) {
  try {
    const r = await fetch(url, { redirect: "manual" });
    return { status: r.status, location: r.headers.get("location") };
  } catch (e) { return { status: 0, error: e.message }; }
}
async function get(url) {
  try {
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();
    return { status: r.status, html: text, finalUrl: r.url };
  } catch (e) { return { status: 0, error: e.message, html: "" }; }
}

// 1) REDIRECTS
console.log(`\n[1/4] Redirects 301 legados (${Object.keys(LEGACY_REDIRECTS).length}) — base=${BASE}`);
for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
  const r = await head(BASE + from);
  const ok = (r.status === 301 || r.status === 308) && (r.location || "").endsWith(to);
  results.redirects.push({ from, expected: to, ...r, ok });
  log(ok, `${from} → ${r.status} ${r.location || "(–)"} [esperado: ${to}]`);
  if (ok) {
    const final = await head(BASE + to);
    if (final.status !== 200) { log(false, `   destino ${to} responde ${final.status}`); }
  }
}

// 2) LINKS principais (Header/Footer/Breadcrumbs alvos comuns) + serviços
console.log(`\n[2/4] Páginas-chave e catálogo de serviços (200)`);
for (const p of KEY_PAGES) {
  const r = await get(BASE + p);
  const ok = r.status === 200;
  results.links.push({ path: p, status: r.status, ok });
  log(ok, `${p} → ${r.status}`);
}
for (const slug of SERVICE_SLUGS) {
  const p = `/servicos/${slug}`;
  const r = await head(BASE + p);
  const ok = r.status === 200;
  results.links.push({ path: p, status: r.status, ok });
  log(ok, `${p} → ${r.status}`);
}

// 3) CHROME (Header/Footer/Breadcrumbs presentes em HTML SSR)
console.log(`\n[3/4] Header, Footer, Breadcrumbs e 404`);
const chromeSamples = ["/", "/servicos/seo", "/blog", "/sobre", "/cases"];
for (const p of chromeSamples) {
  const r = await get(BASE + p);
  const html = r.html || "";
  const header = /<header[\s>]/i.test(html);
  const footer = /<footer[\s>]/i.test(html);
  const breadcrumbs = p === "/" ? true : /aria-label="Breadcrumb"|class="[^"]*breadcrumb/i.test(html);
  results.chrome.push({ path: p, header, footer, breadcrumbs });
  log(header && footer && breadcrumbs, `${p} header=${header} footer=${footer} breadcrumbs=${breadcrumbs}`);
}
// 404 enriquecido
const nf = await get(BASE + "/__rota-inexistente-" + Date.now());
const nfOk = nf.status === 404 && /<header[\s>]/i.test(nf.html) && /<footer[\s>]/i.test(nf.html);
results.chrome.push({ path: "404", status: nf.status, ok: nfOk });
log(nfOk, `404 com Header+Footer → status=${nf.status}`);

// 4) SEO técnico
console.log(`\n[4/4] SEO: sitemap, robots, Open Graph, JSON-LD, FAQ schema`);
const sitemap = await get(BASE + "/sitemap.xml");
log(sitemap.status === 200 && sitemap.html.includes("<urlset"), `/sitemap.xml status=${sitemap.status}`);
const robots = await get(BASE + "/robots.txt");
log(robots.status === 200 && /User-agent/i.test(robots.html), `/robots.txt status=${robots.status}`);

const seoSamples = ["/", "/servicos/seo", "/blog", "/faq"];
for (const p of seoSamples) {
  const r = await get(BASE + p);
  const h = r.html || "";
  const og = /property=["']og:title["']/i.test(h) && /property=["']og:description["']/i.test(h);
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(h);
  const jsonld = /application\/ld\+json/i.test(h);
  const faqOk = p === "/faq" ? /"@type"\s*:\s*"FAQPage"/.test(h) : true;
  const ok = og && canonical && jsonld && faqOk;
  results.seo.push({ path: p, og, canonical, jsonld, faqOk });
  log(ok, `${p} og=${og} canonical=${canonical} jsonld=${jsonld}${p === "/faq" ? ` faq=${faqOk}` : ""}`);
}

// Persist report
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await mkdir(path.resolve("seo-reports"), { recursive: true });
results.summary = { base: BASE, at: stamp, fail };
await writeFile(`seo-reports/nav-validate-${stamp}.json`, JSON.stringify(results, null, 2));

console.log(`\nResultado: ${fail === 0 ? "✅ OK" : `❌ ${fail} falha(s)`} — relatório seo-reports/nav-validate-${stamp}.json`);
process.exit(fail ? 1 : 0);
