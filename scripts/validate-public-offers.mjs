#!/usr/bin/env node
/**
 * Auditoria pública de preços/labels críticos.
 *
 * Valida HTML renderizado em produção/preview contra gates comerciais:
 * - /servicos não pode expor promessa 24h, GMN R$399/mês ou Tráfego Pago R$1.490/mês.
 * - /servicos/site-express não pode conter microcopy de 24h/24 horas.
 * - /servicos/trafego-pago deve conter a frase aprovada de mídia + gestão sob consulta.
 * - /mapa-do-site deve renderizar serviços no HTML inicial e não exibir estados de loading/zero.
 *
 * Uso:
 *   BASE_URL=https://0web.com.br node scripts/validate-public-offers.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = (process.env.BASE_URL || process.argv[2] || "https://0web.com.br").replace(/\/$/, "");
const OUT = "seo-reports/public-offers-audit.json";
const APPROVED_TRAFEGO_COPY =
  "Mídia paga à parte; recomendamos investimento inicial a partir de R$1.500/mês em mídia. Taxa de gestão sob consulta conforme escopo e verba.";
const APPROVED_TRAFEGO_COPY_REGEX = /Mídia\s+paga\s+à\s+parte;\s+recomendamos\s+investimento\s+inicial\s+a\s+partir\s+de\s+R\$\s*1[\.,]500\/mês\s+em\s+mídia\.\s+Taxa\s+de\s+gestão\s+sob\s+consulta\s+conforme\s+escopo\s+e\s+verba\./i;

const ROUTES = ["/servicos", "/servicos/site-express", "/servicos/trafego-pago", "/mapa-do-site"];

function decodeHtml(input) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalize(input) {
  return decodeHtml(input)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countServices(text) {
  const match = text.match(/Serviços\s*\(\s*(\d+)\s*\)/i);
  return match ? Number(match[1]) : null;
}

function check(name, ok, details = {}) {
  return { name, pass: Boolean(ok), ...details };
}

async function fetchRoute(path) {
  const started = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers: { "User-Agent": "0WEB-offer-audit/1.0" },
  });
  const html = await res.text();
  return { path, url: res.url, status: res.status, ms: Date.now() - started, html, text: normalize(html) };
}

function routeChecks(route) {
  const { path, status, html, text } = route;
  const c = [check("HTTP 200", status === 200, { status })];

  if (path === "/servicos") {
    c.push(
      check("não contém Entrega 24h", !/Entrega\s*24h/i.test(text)),
      check("não contém Site Express em 24h", !/Site\s+Express\s+em\s+24h/i.test(text)),
      check("não contém pronto em 24h", !/pronto\s+em\s+24h/i.test(text)),
      check("não contém pronto em 24 horas", !/pronto\s+em\s+24\s+horas/i.test(text)),
      check("Tráfego Pago não expõe R$1.490/mês", !/Tráfego\s+Pago[\s\S]{0,900}R\$\s*1[\.,]490\s*\/\s*m[eê]s/i.test(text)),
      check("Tráfego Pago aparece Sob consulta", /Tráfego\s+Pago[\s\S]{0,900}Sob consulta/i.test(text)),
      check("GMN não expõe R$399/mês", !/R\$\s*399\s*\/\s*m[eê]s/i.test(text)),
      check("GMN expõe R$397/único ou landing correta", /Google\s+Meu\s+Negócio[\s\S]{0,900}R\$\s*397[\s\S]{0,80}(único|pagamento único)/i.test(text) || /Plano Único\s*R\$\s*397/i.test(text)),
    );
  }

  if (path === "/servicos/site-express") {
    c.push(
      check("title sem Site Express em 24h", !/<title[^>]*>[\s\S]*Site\s+Express\s+em\s+24h[\s\S]*<\/title>/i.test(html)),
      check("conteúdo sem 24h/24 horas", !/\b24h\b|24\s+horas/i.test(text)),
      check("CTA aprovado presente", /Quero meu Site Express/i.test(text)),
    );
  }

  if (path === "/servicos/trafego-pago") {
    c.push(
      check("FAQ contém frase aprovada", APPROVED_TRAFEGO_COPY_REGEX.test(text), { expected: APPROVED_TRAFEGO_COPY }),
      check("FAQ não contém frase antiga", !/R\$\s*1[\.,]500\s*\/\s*m[eê]s\s+em\s+m[íi]dia\s*\+\s*gest[aã]o/i.test(text)),
    );
  }

  if (path === "/mapa-do-site") {
    const serviceCount = countServices(text);
    c.push(
      check("sem Carregando serviços", !/Carregando\s+serviços/i.test(text)),
      check("Serviços > 0 no HTML", serviceCount !== null && serviceCount > 0, { serviceCount }),
      check("contém links de serviços críticos", /\/servicos\/site-express/i.test(html) && /\/servicos\/trafego-pago/i.test(html) && /\/servicos\/google-meu-negocio/i.test(html)),
    );
  }

  return c;
}

async function main() {
  console.log(`[public-offers] base=${BASE}`);
  const results = [];

  for (const path of ROUTES) {
    const route = await fetchRoute(path);
    const checks = routeChecks(route);
    const pass = checks.every((x) => x.pass);
    results.push({ path, url: route.url, status: route.status, ms: route.ms, pass, checks });
    console.log(`\n${pass ? "✓" : "✗"} ${path} — HTTP ${route.status} (${route.ms}ms)`);
    for (const item of checks) {
      console.log(`  ${item.pass ? "✓" : "✗"} ${item.name}${item.serviceCount != null ? ` (${item.serviceCount})` : ""}`);
    }
  }

  const failed = results.flatMap((r) => r.checks.filter((c) => !c.pass).map((c) => ({ path: r.path, check: c.name })));
  const summary = {
    base: BASE,
    generatedAt: new Date().toISOString(),
    totalRoutes: results.length,
    failedChecks: failed.length,
    pass: failed.length === 0,
  };

  mkdirSync("seo-reports", { recursive: true });
  writeFileSync(OUT, JSON.stringify({ summary, failed, results }, null, 2));
  console.log(`\n[public-offers] relatório: ${OUT}`);
  console.log(`[public-offers] resultado: ${summary.pass ? "PASS" : "FAIL"} (${failed.length} falha(s))`);

  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(`[public-offers] erro fatal: ${err?.message || err}`);
  process.exit(2);
});