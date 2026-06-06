/**
 * Parser for Google Search Console "Coverage" CSV exports.
 *
 * Expected GSC export columns (Portuguese & English variants):
 *   - URL | Página | Página da Web
 *   - Last crawled | Último rastreamento
 *   - Issue type | Tipo de problema | Estado | Status
 *
 * The parser is forgiving: it picks the first matching column header.
 */

export type ParsedGscRow = {
  url: string;
  issue_type: "404" | "soft_404" | "redirect" | "excluded" | "server_error" | "blocked_robots" | "noindex" | "other";
  status_code?: number;
  message?: string;
};

const URL_HEADERS = ["url", "página", "pagina", "página da web", "pagina da web"];
const ISSUE_HEADERS = ["issue type", "tipo de problema", "estado", "status", "issue", "problem"];

const TYPE_MAP: Array<{ test: RegExp; type: ParsedGscRow["issue_type"]; code?: number }> = [
  { test: /soft.?404/i, type: "soft_404", code: 200 },
  { test: /\bnot found\b|404|n[ãa]o encontrad/i, type: "404", code: 404 },
  { test: /redirect|redirec/i, type: "redirect", code: 301 },
  { test: /server error|5\d\d|erro do servidor/i, type: "server_error", code: 500 },
  { test: /noindex/i, type: "noindex" },
  { test: /robots|blocked/i, type: "blocked_robots" },
  { test: /excluded|exclu[ií]/i, type: "excluded" },
];

function classify(raw: string): { type: ParsedGscRow["issue_type"]; code?: number } {
  for (const m of TYPE_MAP) if (m.test.test(raw)) return { type: m.type, code: m.code };
  return { type: "other" };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') { cur += '"'; i++; }
      else q = !q;
    } else if (c === "," && !q) {
      out.push(cur); cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseGscCsv(text: string): ParsedGscRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const urlIdx = headers.findIndex((h) => URL_HEADERS.some((u) => h.includes(u)));
  const issueIdx = headers.findIndex((h) => ISSUE_HEADERS.some((u) => h.includes(u)));
  if (urlIdx < 0 || issueIdx < 0) {
    throw new Error("CSV não reconhecido: cabeçalhos esperados (URL, Tipo de problema).");
  }
  const rows: ParsedGscRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const url = cols[urlIdx];
    const raw = cols[issueIdx] ?? "";
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const { type, code } = classify(raw);
    rows.push({ url, issue_type: type, status_code: code, message: raw || undefined });
  }
  return rows;
}
