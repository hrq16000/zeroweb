#!/usr/bin/env node
/**
 * Build gate: garante que o HTML SSR de cada rota crítica contém o
 * dehydrated state do TanStack Router (`$_TSR.router`) antes do deploy.
 *
 * Uso: node scripts/validate-ssr-dehydrated.mjs [baseUrl]
 */
const baseUrl = (process.argv[2] || process.env.E2E_BASE_URL || "http://localhost:8080").replace(
  /\/$/,
  "",
);

export const CRITICAL_ROUTES = [
  "/",
  "/servicos",
  "/servicos/google-ads-299",
  "/solucoes",
  "/blog",
  "/sobre",
  "/planos",
  "/lgpd",
  "/politica-privacidade",
];

const failures = [];

for (const route of CRITICAL_ROUTES) {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { headers: { accept: "text/html" } });
    const html = await response.text();
    const hasPayload = html.includes("$_TSR.router");
    const hasBody = /<body[^>]*>[\s\S]{200,}<\/body>/i.test(html);

    if (!response.ok) failures.push(`${route}: HTTP ${response.status}`);
    else if (!hasPayload) failures.push(`${route}: HTML SSR sem dehydrated state ($_TSR.router)`);
    else if (!hasBody) failures.push(`${route}: HTML SSR praticamente vazio (blank screen)`);
    else console.log(`✓ ${route} dehydrated=ok bytes=${html.length}`);
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length) {
  console.error(`\n✗ SSR dehydrated state ausente em ${failures.length} rota(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`\n✓ ${CRITICAL_ROUTES.length} rotas críticas com dehydrated state válido.`);
