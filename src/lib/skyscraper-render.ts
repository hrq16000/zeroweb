// Sprint Skyscraper — Renderização de artigo completo a partir do blueprint
// Gera prosa estruturada (H2/H3 + parágrafos), tabelas, visuais descritivos,
// trilha de links internos e CTA final. Mantém tom 0web (autoridade, sem
// promessa de "preço baixo"), parágrafos curtos, dados embutidos.

import type { SkyscraperArticle } from "./skyscraper-calendar";

export type RenderedArticle = {
  slug: string;
  title: string;
  meta: string;
  intro: string;
  bodyHtml: string;
  faq: Array<{ q: string; a: string }>;
  internalLinks: Array<{ href: string; label: string }>;
  imagePrompts: {
    cover: string;
    inline: Array<{ id: string; alt: string; prompt: string }>;
  };
  cta: { primary: string; secondary?: string; href: string };
  wordCount: number;
  readingTimeMinutes: number;
};

const PARAGRAPH_OPENERS = [
  "Na prática,",
  "Em projetos auditados pela 0web,",
  "O dado que muda a conversa:",
  "Para quem está saindo do zero,",
  "A leitura honesta é simples:",
  "Quem opera no dia a dia já percebeu:",
];

function p(n: number, sentence: string) {
  return `<p>${PARAGRAPH_OPENERS[n % PARAGRAPH_OPENERS.length]} ${sentence}</p>`;
}

function renderTable(t: { title: string; columns: string[]; rowsHint: string }) {
  const head = t.columns.map((c) => `<th scope="col">${c}</th>`).join("");
  // Placeholder rows derived from rowsHint — produz uma tabela visual real
  // com indicação de dados ilustrativos para edição editorial posterior.
  const sample = Array.from({ length: 4 }).map((_, i) => {
    const cells = t.columns
      .map((_c, idx) => (idx === 0 ? `Linha ${i + 1}` : "—"))
      .map((v) => `<td>${v}</td>`)
      .join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `
<figure class="not-prose my-6 overflow-x-auto rounded-2xl border border-border">
  <table class="w-full text-sm">
    <caption class="text-left p-3 font-semibold bg-muted/40">${t.title}</caption>
    <thead class="bg-muted/30"><tr>${head}</tr></thead>
    <tbody>${sample}</tbody>
  </table>
  <figcaption class="px-3 py-2 text-xs text-muted-foreground border-t border-border">
    Estrutura sugerida (${t.rowsHint}). Editar com dados reais antes de publicar.
  </figcaption>
</figure>`;
}

function renderH2Block(h2: string, h3: string[] | undefined, dataFacts: string[], idx: number) {
  const id = h2
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const intro =
    `<p>${h2.replace(/^[0-9]+\s*[-—.]\s*/, "")} é onde a maior parte dos times perde dinheiro — e onde a 0web costuma entrar com o maior ganho rápido. Esta seção destrincha o tema com a profundidade que o nicho exige.</p>`;

  const fact = dataFacts[idx % Math.max(1, dataFacts.length)];
  const factP = fact
    ? `<p><strong>Dado de mercado:</strong> ${fact}. Esse número orienta as decisões de orçamento e priorização descritas a seguir.</p>`
    : "";

  const h3Block = h3 && h3.length
    ? `<ul>${h3.map((s) => `<li><strong>${s}:</strong> ponto crítico para tirar a operação do improviso e medir resultado real.</li>`).join("")}</ul>`
    : "";

  const closing = `
<p>O que separa um time medíocre de um time de elite neste ponto é disciplina de execução, não criatividade. Documente o processo, defina um KPI primário e revise semanalmente — é essa rotina que destrava ranking, conversão e margem.</p>`;

  return `<h2 id="${id}">${h2}</h2>${intro}${factP}${h3Block}${closing}`;
}

function renderInternalLinks(article: SkyscraperArticle): { html: string; list: { href: string; label: string }[] } {
  const list = article.internalLinks.map((href) => ({
    href,
    label: href === "/" ? "Página inicial" : href.replace(/^\//, "").replace(/[-/]/g, " "),
  }));
  const html = `
<section aria-labelledby="links-internos">
  <h2 id="links-internos">Links internos relacionados</h2>
  <ul>
    ${list.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("\n    ")}
  </ul>
</section>`;
  return { html, list };
}

function renderCta(article: SkyscraperArticle) {
  return `
<aside class="not-prose my-10 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6 lg:p-8">
  <p class="text-xs font-semibold uppercase tracking-wider text-primary">Próximo passo</p>
  <h2 class="mt-2 text-2xl font-bold font-display">${article.cta.primary}</h2>
  <p class="mt-2 text-sm text-muted-foreground">
    Diagnóstico técnico em 30 minutos, sem compromisso. A 0web só assume projetos onde consegue entregar resultado mensurável.
  </p>
  <p class="mt-4">
    <a href="${article.cta.href}" class="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary">
      ${article.cta.primary}
    </a>
  </p>
  ${article.cta.secondary ? `<p class="mt-3 text-sm"><a href="/contato?purpose=diagnosis&source=skyscraper&placement=article&pagePath=/blog-skyscraper" class="text-primary underline">${article.cta.secondary}</a></p>` : ""}
</aside>`;
}

function deriveFaq(article: SkyscraperArticle): RenderedArticle["faq"] {
  const base: RenderedArticle["faq"] = [
    {
      q: `${article.title.split(":")[0]} dá retorno real para PME?`,
      a: `Sim, quando há método. A 0web trabalha com KPIs claros (CAC, payback e ROAS) e revisão semanal — é assim que ${article.targetKeyword} deixa de ser custo e vira receita.`,
    },
    {
      q: `Quanto tempo até ver resultado em ${article.targetKeyword}?`,
      a: `Os primeiros sinais aparecem em 30 a 60 dias; ganhos compostos consistentes vêm entre o 3º e o 6º mês, dependendo do nicho e do orçamento alocado.`,
    },
    {
      q: `Qual o investimento mínimo recomendado?`,
      a: `Depende do segmento. Use a calculadora de orçamento da 0web para uma faixa realista — abaixo do mínimo, o aprendizado é caro e o ROI fica negativo.`,
    },
    {
      q: `A 0web atende meu segmento?`,
      a: `A 0web atua com PMEs e médias empresas em Curitiba, RMC, Belo Horizonte e nacional. Solicite um diagnóstico gratuito para validar fit antes de qualquer proposta.`,
    },
  ];
  return base;
}

function deriveImagePrompts(article: SkyscraperArticle): RenderedArticle["imagePrompts"] {
  const brand =
    "Estilo visual 0web: editorial sóbrio, paleta dark com acentos em azul elétrico (#3B82F6) e off-white, tipografia sans-serif moderna, composição assimétrica, profundidade com gradientes sutis. Sem texto sobreposto na imagem.";
  return {
    cover: `Capa editorial 16:9 para o artigo "${article.title}". Conceito: ${article.intro.slice(0, 140)}. ${brand}`,
    inline: article.visuals.map((v, i) => ({
      id: `inline-${i + 1}`,
      alt: v,
      prompt: `Ilustração inline (4:3) representando: ${v}. Linhas finas, isometria leve, números e ícones esquematizados. ${brand}`,
    })),
  };
}

export function renderSkyscraperArticle(article: SkyscraperArticle): RenderedArticle {
  const introHtml = `<p class="lead text-lg leading-relaxed text-foreground/90"><strong>${article.intro}</strong></p>`;

  const sections = article.outline
    .map((o, i) => renderH2Block(o.h2, o.h3, article.data, i))
    .join("\n");

  const tables = article.tables.map(renderTable).join("\n");

  const visuals = `
<section aria-labelledby="visuais">
  <h2 id="visuais">Apoios visuais sugeridos</h2>
  <ul>
    ${article.visuals.map((v) => `<li>${v}</li>`).join("\n    ")}
  </ul>
</section>`;

  const { html: linksHtml, list: linksList } = renderInternalLinks(article);
  const ctaHtml = renderCta(article);
  const faq = deriveFaq(article);
  const faqHtml = `
<section aria-labelledby="faq">
  <h2 id="faq">Perguntas frequentes</h2>
  <dl>
    ${faq.map((f) => `<dt><strong>${f.q}</strong></dt><dd>${f.a}</dd>`).join("\n    ")}
  </dl>
</section>`;

  // Construir prosa real com parágrafos contextuais entre blocos
  const contextualParas = article.data
    .map((d, i) => p(i, `${d}. Esse dado precisa estar no radar de qualquer time que execute ${article.targetKeyword} em 2026.`))
    .join("\n");

  const bodyHtml = [
    introHtml,
    `<p class="text-sm text-muted-foreground">Leitura aproximada: ${Math.max(8, Math.round(article.wordTarget / 220))} minutos · Foco em ${article.targetKeyword}.</p>`,
    `<h2>O panorama brutal de ${article.targetKeyword} em 2026</h2>`,
    contextualParas,
    sections,
    tables,
    visuals,
    linksHtml,
    faqHtml,
    ctaHtml,
  ].join("\n");

  const wordCount = bodyHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

  return {
    slug: article.slug,
    title: article.title,
    meta: article.meta,
    intro: article.intro,
    bodyHtml,
    faq,
    internalLinks: linksList,
    imagePrompts: deriveImagePrompts(article),
    cta: article.cta,
    wordCount,
    readingTimeMinutes: Math.max(8, Math.round(wordCount / 220)),
  };
}
