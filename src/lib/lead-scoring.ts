// Lead scoring engine — deterministic, server-side.
// Receives funnel answers (key => value) and returns score + tags + intent.

export type IntentLevel = "cold" | "warm" | "hot";

export interface ScoreResult {
  score: number;
  breakdown: Record<string, number>;
  tags: string[];
  intent: IntentLevel;
}

const num = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseInt(v.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const has = (v: unknown) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

const lower = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : "");

export function scoreLead(answers: Record<string, unknown>): ScoreResult {
  const breakdown: Record<string, number> = {};
  const tags = new Set<string>();
  const add = (key: string, pts: number) => {
    if (pts === 0) return;
    breakdown[key] = (breakdown[key] ?? 0) + pts;
  };

  // ---- Investimento (campo: investimento) ----
  const inv = lower(answers.investimento);
  if (inv) {
    if (/(3\.?000|3k|3 mil|5\.?000|5k|acima de 3)/.test(inv)) add("investimento_alto", 30);
    else if (/(1\.?500|1\.?5k|2\.?000|2k)/.test(inv)) add("investimento_medio", 20);
    else if (/(800|999|1\.?000)/.test(inv)) add("investimento_baixo", 10);
    else if (/(399|400|500)/.test(inv)) add("investimento_minimo", 5);
  }

  // ---- Serviço principal: Google/Instagram ----
  const servico = lower(answers.servico_principal);
  if (servico) {
    if (servico.includes("google")) { add("servico_google", 8); tags.add("google-ads"); }
    if (servico.includes("instagram") || servico.includes("meta") || servico.includes("face"))
      { add("servico_meta", 8); tags.add("meta-ads"); }
    if (servico.includes("site") || servico.includes("seo")) tags.add("site-seo");
    if (servico.includes("whatsapp")) tags.add("whatsapp-marketing");
  }

  // ---- Tamanho da empresa ----
  const tam = lower(answers.tamanho_empresa);
  if (tam) {
    if (/(1\s*-?\s*5|sozinho|individual|me\b)/.test(tam)) tags.add("solo");
    else if (/(6|7|8|9|10|11|20|50)/.test(tam) && /(-|a|ate)/.test(tam)) tags.add("pme");
    if (/(51|100|200|500|enterprise|grande)/.test(tam)) { tags.add("enterprise"); add("enterprise", 8); }
  }

  // ---- Clientes/mês ----
  const cli = lower(answers.clientes_mes);
  if (cli) {
    if (/(200|500|1000|mais de 100)/.test(cli)) add("alto_volume", 15);
    else if (/(50|100)/.test(cli)) add("medio_volume", 8);
  }

  // ---- Objetivo ----
  const obj = lower(answers.objetivo);
  if (obj) {
    if (/(vender|venda|mais clientes|faturar|crescer)/.test(obj)) add("objetivo_vendas", 10);
    if (/(marca|branding|autoridade)/.test(obj)) add("objetivo_branding", 5);
  }

  // ---- Origem clientes ----
  const origem = lower(answers.origem_clientes);
  if (origem.includes("indica") || origem.includes("boca")) add("origem_indicacao", 10);
  if (origem.includes("google") || origem.includes("instagram") || origem.includes("paga"))
    add("origem_paga_atual", 12);

  // ---- Segmento alvo ----
  const seg = lower(answers.segmento);
  const alvos = ["advoca", "saude", "saúde", "odonto", "medic", "esteti", "imobili", "construcao", "contabil"];
  if (seg && alvos.some((a) => seg.includes(a))) { add("segmento_alvo", 8); tags.add(`seg:${seg.split(" ")[0]}`); }

  // ---- Tem site? ----
  if (lower(answers.tem_site).includes("sim")) add("tem_site", 5);
  else if (lower(answers.tem_site).includes("nao") || lower(answers.tem_site).includes("não"))
    tags.add("precisa-site");

  // ---- Ciência do investimento ----
  if (lower(answers.ciencia_investimento).includes("sim")) add("ciencia_invest", 10);

  // ---- Contato preenchido ----
  if (has(answers.telefone) && has(answers.email)) add("contato_completo", 10);
  else if (has(answers.telefone)) add("contato_phone", 5);
  if (has(answers.instagram)) add("instagram_handle", 3);
  if (has(answers.nome) && has(answers.empresa)) add("identidade_pj", 5);

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const intent: IntentLevel = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  // intent tag
  tags.add(`intent:${intent}`);

  return { score, breakdown, tags: Array.from(tags), intent };
}
