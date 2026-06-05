// ============================================================================
// Sprint 5 — Deterministic content variation engine.
// Same (city, service) input → same output every render. No randomness.
// Picks among curated templates so each programmatic page reads differently
// even with the same data. Designed to avoid thin/duplicate content penalties.
// ============================================================================

import type { CityInfo } from "./geo-data";
import type { ServiceData } from "./services-data";

function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h;
}

export function pick<T>(seed: string, options: readonly T[]): T {
  return options[hash(seed) % options.length];
}

// ----- Hero subtitle templates -----
const HERO_SUBTITLES = [
  "Agência especializada em {service} para empresas em {city}, {state}. Time sênior, entrega ágil e foco em resultado real.",
  "{Service} sob medida para o mercado de {city} — {flavor}. Tecnologia moderna, processo enxuto e ROI mensurável.",
  "Empresas em {city} contam com a 0WEB para {serviceLower}: estratégia, execução e otimização contínua.",
  "Soluções de {serviceLower} para negócios {gentilico_pl}. Atendimento remoto e dedicado, do diagnóstico ao resultado.",
] as const;

// ----- Local-context paragraph templates -----
const LOCAL_CONTEXT = [
  "{City} é {flavor}. Empresas locais que investem em {serviceLower} ganham vantagem competitiva em um mercado cada vez mais digital.",
  "Como {flavor}, {City} ({stateCode}) reúne públicos exigentes — e {serviceLower} bem executado é o que separa marcas que crescem das que estagnam.",
  "Atendemos negócios de {City} e região metropolitana de {state}. {Service} com sotaque local: linguagem, oferta e estratégia ajustadas ao seu mercado.",
  "A população {gentilico_pl} de {City} consome digital intensamente. {Service} estratégico transforma essa atenção em receita.",
] as const;

// ----- City-specific FAQ items (added on top of service FAQ) -----
const CITY_FAQ_BANKS: { q: string; a: string }[][] = [
  [
    { q: "Vocês atendem empresas em {city}?", a: "Sim. Atendemos {gentilico_pl} de toda a região metropolitana de {city} ({stateCode}) de forma 100% remota, com mesma qualidade de quem está ao lado." },
    { q: "Precisa visita presencial?", a: "Não. Todo o processo é feito por reuniões online — mais rápido para você e mais barato (você não paga deslocamento)." },
    { q: "Qual o prazo médio para projetos em {city}?", a: "O prazo independe da cidade: depende do escopo. Em geral, projetos de {serviceLower} em {city} ficam prontos no mesmo SLA que demais clientes Brasil." },
  ],
  [
    { q: "0WEB atende a região de {city}?", a: "Sim, atendemos {city} e todas as cidades de {state}. O processo é remoto e ágil." },
    { q: "Como é a comunicação com clientes em {city}?", a: "Reuniões por Google Meet ou WhatsApp, com SLA de resposta em horário comercial. Sem ruído, sem atraso." },
    { q: "Preciso emitir nota em {state}?", a: "Sim, emitimos NF-e regular. Atendemos PJs em qualquer estado do Brasil, incluindo {state} ({stateCode})." },
  ],
  [
    { q: "Por que escolher uma agência remota em vez de uma local em {city}?", a: "Você acessa um time sênior nacional pelo mesmo investimento de uma agência local, sem comprometer entrega e suporte." },
    { q: "Vocês entendem o mercado de {city}?", a: "Sim. Antes de propor qualquer ação, fazemos imersão no seu mercado em {city}, concorrência e público {gentilico} antes de qualquer entrega." },
    { q: "Onde fica a 0WEB?", a: "Operamos remotamente em todo o Brasil, com base em Curitiba (PR). Atendemos {city} ({stateCode}) com a mesma proximidade." },
  ],
];

// ----- Helpers -----

function gentilicoPlural(g: string): string {
  // simple PT-BR pluralizer for gentílicos used in templates
  if (g.endsWith("ão")) return g.slice(0, -2) + "ões";
  if (g.endsWith("s")) return g;
  return g + "s";
}

function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function buildVars(city: CityInfo, service: ServiceData): Record<string, string> {
  return {
    city: city.name,
    City: city.name,
    state: city.state,
    State: city.state,
    stateCode: city.stateCode,
    region: city.region,
    flavor: city.flavor,
    gentilico: city.gentilico,
    gentilico_pl: gentilicoPlural(city.gentilico),
    ddd: city.ddd,
    service: service.name,
    Service: service.name,
    serviceLower: service.name.toLowerCase(),
  };
}

// ----- Public API -----

export function heroSubtitle(city: CityInfo, service: ServiceData): string {
  const tpl = pick(`hero:${city.slug}:${service.slug}`, HERO_SUBTITLES);
  return fill(tpl, buildVars(city, service));
}

export function localContext(city: CityInfo, service: ServiceData): string {
  const tpl = pick(`ctx:${city.slug}:${service.slug}`, LOCAL_CONTEXT);
  return fill(tpl, buildVars(city, service));
}

export function cityFaq(city: CityInfo, service: ServiceData): { q: string; a: string }[] {
  const bank = pick(`faq:${city.slug}:${service.slug}`, CITY_FAQ_BANKS);
  const vars = buildVars(city, service);
  return bank.map((it) => ({ q: fill(it.q, vars), a: fill(it.a, vars) }));
}

/** Combined FAQ: service-level FAQ + 2-3 city-specific items. */
export function combinedFaq(city: CityInfo, service: ServiceData) {
  return [...service.faq, ...cityFaq(city, service)];
}

/** Page title variations — different from the canonical service title. */
const TITLE_TEMPLATES = [
  "{Service} em {City} ({stateCode}) · 0WEB",
  "{Service} para empresas em {City} · 0WEB",
  "Agência de {Service} em {City} · 0WEB",
  "{Service} {City} | Time sênior, ROI mensurável · 0WEB",
] as const;

export function pageTitle(city: CityInfo, service: ServiceData): string {
  return fill(pick(`title:${city.slug}:${service.slug}`, TITLE_TEMPLATES), buildVars(city, service));
}

const DESCRIPTION_TEMPLATES = [
  "{Service} em {City} ({stateCode}): agência sênior, processo enxuto e resultado mensurável. Solicite orçamento sem compromisso.",
  "Empresa de {serviceLower} atendendo {City} e {state}. Estratégia, execução e otimização — orçamento gratuito.",
  "Procurando {serviceLower} em {City}? Time sênior 0WEB, atendimento {gentilico} dedicado. Fale com um especialista.",
  "{Service} em {City} com a 0WEB: tecnologia moderna, foco em ROI e suporte contínuo. Orçamento sem compromisso.",
] as const;

export function pageDescription(city: CityInfo, service: ServiceData): string {
  return fill(pick(`desc:${city.slug}:${service.slug}`, DESCRIPTION_TEMPLATES), buildVars(city, service));
}
