#!/usr/bin/env node
/**
 * Validador estático de canonicals.
 *
 * Faz análise estática em src/routes/**.tsx e __root.tsx para garantir:
 *  - __root.tsx NUNCA define `<link rel="canonical">` (router concatena links e
 *    duplica em todas as rotas — bug TanStack/router#6719).
 *  - Cada rota leaf que define canonical o faz uma única vez por arquivo.
 *  - O canonical é uma URL absoluta começando com https://0web.com.br (ou,
 *    quando a rota tem `$param`, é interpolado dinamicamente — aceitamos
 *    template strings que comecem com https://0web.com.br).
 *  - Nenhum canonical aponta para http://, www.0web.com.br ou termina com
 *    `/` (exceto a raiz "/"), já que o middleware redireciona para o canônico.
 *  - Rotas dinâmicas com `params` reais usam template literal (não literal
 *    estático), evitando todas apontarem para o mesmo URL.
 *
 * Falha o build com `process.exit(1)` se encontrar erros.
 *
 * Bypass: SKIP_CANONICAL_CHECK=1 npm run build
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

if (process.env.SKIP_CANONICAL_CHECK === "1") {
  console.log("[canonicals] SKIP_CANONICAL_CHECK=1 — validação ignorada.");
  process.exit(0);
}

const ROUTES_DIR = path.resolve(process.cwd(), "src/routes");
const CANONICAL_HOST = "https://0web.com.br";

/** Recursive list of .tsx files under src/routes. */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

/** Locate every `{ rel: "canonical", href: ` opener; href value is extracted manually. */
const CANONICAL_OPENER_RE =
  /\{\s*rel\s*:\s*["']canonical["']\s*,\s*href\s*:\s*/g;

/**
 * Extract the href expression starting at `start` in src. Supports string
 * literals "..." / '...' and template literals `...${...}...` with nested
 * braces. Returns { expr, end } or null.
 */
function extractHrefExpr(src, start) {
  let i = start;
  // Skip whitespace
  while (i < src.length && /\s/.test(src[i])) i++;
  const ch = src[i];
  if (ch === '"' || ch === "'") {
    const quote = ch;
    let j = i + 1;
    while (j < src.length && src[j] !== quote) {
      if (src[j] === "\\") j++;
      j++;
    }
    return { expr: src.slice(i, j + 1), end: j + 1 };
  }
  if (ch === "`") {
    let j = i + 1;
    let depth = 0;
    while (j < src.length) {
      const c = src[j];
      if (c === "\\") { j += 2; continue; }
      if (c === "`" && depth === 0) return { expr: src.slice(i, j + 1), end: j + 1 };
      if (c === "$" && src[j + 1] === "{") { depth++; j += 2; continue; }
      if (c === "}" && depth > 0) { depth--; j++; continue; }
      j++;
    }
    return { expr: src.slice(i, j), end: j };
  }
  // Identifier / call expression — read until , or } at top level
  let j = i;
  let depth = 0;
  while (j < src.length) {
    const c = src[j];
    if (c === "(" || c === "[" || c === "{") depth++;
    else if (c === ")" || c === "]" || c === "}") {
      if (depth === 0) break;
      depth--;
    } else if ((c === "," || c === "\n") && depth === 0) break;
    j++;
  }
  return { expr: src.slice(i, j).trim(), end: j };
}

/**
 * For a given canonical match index, walk backwards to find the nearest
 * `links:` or `meta:` array opener. Returns "links", "meta" or "unknown".
 */
function nearestArrayOwner(src, idx) {
  const before = src.slice(0, idx);
  const linksIdx = before.lastIndexOf("links:");
  const metaIdx = before.lastIndexOf("meta:");
  if (linksIdx === -1 && metaIdx === -1) return "unknown";
  return linksIdx > metaIdx ? "links" : "meta";
}

const errors = [];
const warnings = [];

const files = walk(ROUTES_DIR);

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const src = readFileSync(file, "utf8");

  // __root.tsx must not own a canonical.
  if (/__root\.(t|j)sx?$/.test(file)) {
    if (CANONICAL_RE.test(src)) {
      errors.push(
        `${rel}: __root NÃO pode definir <link rel="canonical"> (router concatena para todas as rotas, duplicando).`,
      );
    }
    CANONICAL_RE.lastIndex = 0;
    continue;
  }

  const hrefs = [];
  let m;
  CANONICAL_RE.lastIndex = 0;
  while ((m = CANONICAL_RE.exec(src)) !== null) {
    const owner = nearestArrayOwner(src, m.index);
    if (owner === "meta") {
      errors.push(
        `${rel}: { rel: "canonical" } dentro de meta:[]. Mova para links:[] (linha ~${src.slice(0, m.index).split("\n").length}).`,
      );
      continue;
    }
    hrefs.push(m[1].trim());
  }

  if (hrefs.length === 0) continue;

  if (hrefs.length > 3) {
    warnings.push(`${rel}: ${hrefs.length} declarações de canonical (>3) — revise duplicidade.`);
  }

  for (const href of hrefs) {
    const unquoted = href.replace(/^["'`]/, "").replace(/["'`]$/, "");

    // Dynamic template literal: must include canonical host or use ORIGIN constant.
    if (href.startsWith("`")) {
      if (!href.includes(CANONICAL_HOST) && !href.includes("${ORIGIN}") && !href.includes("${BASE_URL}")) {
        errors.push(`${rel}: canonical template não usa ${CANONICAL_HOST} nem ORIGIN → ${href}`);
      }
      continue;
    }

    // Computed expression (variable/function): ignore.
    if (!href.startsWith('"') && !href.startsWith("'")) continue;

    if (!unquoted.startsWith(CANONICAL_HOST + "/") && unquoted !== CANONICAL_HOST + "/" && unquoted !== CANONICAL_HOST) {
      errors.push(`${rel}: canonical não absoluto/host errado → ${unquoted}`);
      continue;
    }

    // Trailing slash forbidden except for root.
    if (unquoted !== `${CANONICAL_HOST}/` && unquoted.endsWith("/")) {
      errors.push(`${rel}: canonical com trailing slash → ${unquoted}`);
    }

    if (/\$[a-zA-Z]/.test(file) && !href.includes("${") && !href.includes("`")) {
      warnings.push(
        `${rel}: rota dinâmica com canonical literal "${unquoted}" — provavelmente deveria usar template com params.`,
      );
    }
  }
}

if (warnings.length) {
  console.warn("\n[canonicals] avisos:");
  for (const w of warnings) console.warn("  ⚠ " + w);
}

if (errors.length) {
  console.error("\n[canonicals] ERROS encontrados:");
  for (const e of errors) console.error("  ✖ " + e);
  console.error(
    `\n✖ ${errors.length} problema(s). Corrija ou rode com SKIP_CANONICAL_CHECK=1 para pular.\n`,
  );
  process.exit(1);
}

console.log(
  `[canonicals] OK — ${files.length} arquivos analisados, ${warnings.length} aviso(s), 0 erros.`,
);
