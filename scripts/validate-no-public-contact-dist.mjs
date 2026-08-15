#!/usr/bin/env node
/**
 * Validador do BUILD (dist/): garante que nenhum contato operacional da 0WEB,
 * segredo ou dado server-only vaze para o bundle público, HTML pré-renderizado,
 * JSON-LD ou sourcemaps.
 *
 * NÃO falha por: a palavra "WhatsApp", CTAs como "Continuar no WhatsApp",
 * a rota interna /r/whatsapp/:token, ou nomes de eventos de analytics.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist", "client"); // apenas o bundle entregue ao navegador

const PATTERNS = [
  { re: /wa\.me\/\d+/g, name: "wa.me/<numero>" },
  { re: /api\.whatsapp\.com\/send/gi, name: "api.whatsapp.com/send" },
  { re: /whatsapp:\/\//gi, name: "whatsapp:// scheme" },
  { re: /mailto:[A-Za-z0-9._%+-]+@0web[A-Za-z0-9.-]*/gi, name: "mailto: comercial" },
  { re: /tel:\+?\d[\d\s().-]{7,}/gi, name: "tel: comercial" },
  { re: /destination_digits/g, name: "destination_digits" },
  { re: /SUPABASE_SERVICE_ROLE_KEY|service_role/g, name: "service role key" },
  { re: /sb_secret_[A-Za-z0-9_-]+/g, name: "secret key" },
  // números operacionais conhecidos da 0WEB (com ou sem formatação)
  { re: /55\s?41\s?9?\s?9886\s?-?\s?4100/g, name: "numero operacional 0WEB" },
  { re: /\+?55\s?\(?41\)?[\s-]?9\s?9886[\s-]?4100/g, name: "numero operacional 0WEB" },
  { re: /[A-Za-z0-9._%+-]+@0web\.com\.br/gi, name: "e-mail operacional 0WEB" },
];

// Caminhos internos legítimos que contêm "whatsapp" e não são contato.
const SAFE_LINE = /\/r\/whatsapp\/|r\.whatsapp|whatsapp_redirect|whatsapp-redirect/;

const EXT = /\.(js|mjs|cjs|html|json|map|txt|xml)$/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (EXT.test(entry)) out.push(full);
  }
  return out;
}

if (!existsSync(DIST)) {
  console.error("[dist-contact] dist/client não encontrado — rode `bun run build` antes.");
  process.exit(1);
}

let violations = 0;
const files = walk(DIST);
for (const f of files) {
  const rel = relative(ROOT, f);
  let content;
  try {
    content = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  for (const { re, name } of PATTERNS) {
    re.lastIndex = 0;
    const hits = [...content.matchAll(re)].filter((m) => {
      const start = Math.max(0, m.index - 120);
      const ctx = content.slice(start, m.index + 120);
      return !SAFE_LINE.test(ctx);
    });
    if (hits.length) {
      console.error(`[dist-contact] ${rel} → ${name} x${hits.length} (ex.: ${hits[0][0].slice(0, 60)})`);
      violations += hits.length;
    }
  }
}

if (violations > 0) {
  console.error(`\n✗ ${violations} ocorrência(s) de contato operacional/segredo no build.`);
  process.exit(1);
}
console.log(`✓ dist limpo — ${files.length} arquivos inspecionados, nenhum contato operacional ou segredo.`);
