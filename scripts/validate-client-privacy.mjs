#!/usr/bin/env node
/**
 * Validator: garante que o bundle público do cliente (dist/client/assets)
 * não contém wa.me, e-mails corporativos ou telefones em números literais.
 *
 * Chunks admin (_authenticated/app.*) são inspecionados mas apenas emitem
 * warning — o painel só carrega após login e as strings encontradas são
 * de suporte a pedidos (número do próprio cliente do pedido), não da 0Web.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/client/assets";
const WA = /wa\.me/g;
// e-mails: exclui domínios de vendors/schemas/typedefs conhecidos
const EMAIL = /[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const EMAIL_ALLOW = /^(?:.*@)(?:sentry|example|schema\.org|w3\.org|whatwg|graphql|googleapis|gstatic|facebook|npmjs|types|radix|tanstack|babel|react|supabase|ai-sdk|floating|lovable|vite|fontsource|hookform|lookout|stripe|internal\.|noreply\.)/i;
// telefones BR: (41) 99745-2053 / 41997452053 / +5541997452053
const PHONE = /(?<!\d)(?:\+?55)?\s?\(?[1-9]\d\)?[\s-]?9?\d{4}[\s-]?\d{4}(?!\d)/g;

const ADMIN_PREFIXES = ["app.pedidos", "app.servicos", "app.leads", "app.painel", "app.dashboard", "app.crm", "app.usuarios", "app.integracoes", "app.configuracoes", "app.marketplace", "app.b2b"];

function isAdminChunk(name) {
  return ADMIN_PREFIXES.some((p) => name.startsWith(p));
}

let errors = 0;
let warns = 0;

function scan(file) {
  const name = file.split("/").pop();
  const admin = isAdminChunk(name);
  const src = readFileSync(file, "utf8");

  const waHits = [...src.matchAll(WA)].length;
  const emailHits = [...src.matchAll(EMAIL)].filter((m) => !EMAIL_ALLOW.test(m[0])).map((m) => m[0]);
  const phoneHits = [...src.matchAll(PHONE)].map((m) => m[0]);

  if (waHits === 0 && emailHits.length === 0 && phoneHits.length === 0) return;

  const lvl = admin ? "WARN" : "ERROR";
  if (admin) warns++; else errors++;

  console.log(`\n[${lvl}] ${name}`);
  if (waHits) console.log(`  wa.me x${waHits}`);
  if (emailHits.length) console.log(`  emails: ${[...new Set(emailHits)].slice(0, 5).join(", ")}`);
  if (phoneHits.length) console.log(`  phones: ${[...new Set(phoneHits)].slice(0, 5).join(", ")}`);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (entry.endsWith(".js")) scan(p);
  }
}

console.log(`[client-privacy] scanning ${DIST}`);
walk(DIST);

if (errors) {
  console.error(`\n[client-privacy] FAIL — ${errors} public chunk(s) with leaks`);
  process.exit(1);
}
console.log(`\n[client-privacy] OK — public bundle clean (${warns} warning(s) in admin chunks)`);
