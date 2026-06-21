# Plano de melhorias — port de 0web.site → 0web.com.br

Baseado em análise lado-a-lado entre o site internacional (`0web.site`, EN, USD, foco em hand-code + edge hosting) e o site BR (`0web.com.br`, PT-BR, foco em SEO local + tráfego + IA + GBP).

Escolhas confirmadas:
1. Bloco de infra / selos de confiança
2. Tier Pro + padronização de pricing
3. Cluster educacional (site vs app vs landing page)
4. + exploração extra (abaixo, marcadas como **Bônus**)

---

## Etapa A — TrustStrip (Selos de infra & confiança)

**Objetivo:** comunicar diferencial técnico que o `.site` usa bem e o `.br` esconde — converte hesitantes.

**Arquivos novos**
- `src/components/site/TrustStrip.tsx` — componente client, 6 selos em grid responsivo (2 col mobile / 6 desktop), ícones lucide, microcopy curta.

**Selos**
| Selo | Microcopy |
|---|---|
| SSL grátis | Certificado auto-renovado |
| Anti-DDoS | Proteção empresarial Cloudflare |
| Edge CDN | 300+ PoPs globais |
| 100% uptime | SLA garantido |
| Hospedagem inclusa | 1º ano grátis em todos os planos |
| Suporte pós-entrega | 3 meses inclusos |

**Onde injetar**
- `src/components/site/Hero.tsx` — abaixo do CTA (variante compacta, 1 linha scrollável no mobile).
- `src/routes/servicos.criacao-de-sites.tsx`, `servicos.site-express.tsx`, `servicos.site-24h.tsx` — bloco completo acima do FAQ.
- `src/routes/solicitar-orcamento.tsx` — lateral do form (reduz objeção).

**Schema:** estende `Service.hasOfferCatalog` com `additionalProperty` listando os benefícios (rich result).

**Critério de aceite:** TrustStrip visível em 4 rotas-chave; Lighthouse mobile sem regressão de CLS; copy 100% PT-BR (não traduzir literalmente do EN).

---

## Etapa B — Tier "Site Pro" + padronização de pricing

**Objetivo:** fechar a lacuna entre `site-express` (entrada) e orçamento sob medida (enterprise). O `.site` usa 3 tiers (Single $250 / Multi $850 / Pro $2.500) — modelo psicologicamente superior.

**Rota nova**
- `src/routes/servicos.site-pro.tsx`
  - Tagline: "10+ páginas, ranqueamento Google posição 1–5, SEO incluso"
  - Preço: **a partir de R$ 7.900** (calibrar com você)
  - Inclui: 10+ páginas custom, estratégia de palavras-chave, SEO técnico + on-page, GMN, 6 meses suporte
  - Diferencial vs Express: meta de ranking auditada mês a mês

**Padronização de pricing nos `/servicos/*`**
- Auditar 8 rotas de serviço e garantir formato uniforme: `<PriceTag from="R$ X" period="único|mensal" />`
- Componente novo `src/components/site/PriceTag.tsx` (já temos `is-solution.ts` pra decidir Solução vs Produto).
- Rotas a auditar: `criacao-de-sites`, `site-express`, `site-24h`, `seo`, `trafego-pago`, `trafego-pago-local`, `google-meu-negocio`, `gestao-redes-sociais`, `presenca-digital`, `marketplace`.
- Solução (sem preço) mantém badge "Sob consulta" — não inventar valor.

**Atualizações de catálogo**
- `src/lib/services-data.ts` — adicionar `site-pro` com `slug`, `name`, `title`, `description`, `serviceType`, `priceFrom`.
- `src/routes/sitemap-pages[.]xml.ts` — incluir nova URL.
- Cross-sell em `site-express` e `criacao-de-sites`: card "Precisa de mais? Veja o **Site Pro**".

**Critério de aceite:** todos `/servicos/*` mostram preço OU badge "Sob consulta"; `site-pro` indexado; `scripts/validate-jsonld.mjs` verde.

---

## Etapa C — Cluster educacional de topo de funil

**Objetivo:** capturar buscas informacionais ("o que é um site", "site ou landing page", "site vs sistema web") e canalizar para `/servicos/*`.

**4 posts novos em `src/routes/blog.$slug.tsx`** (entradas em `src/lib/blog-data.ts`):

| Slug | Título | Palavra-chave alvo | Link interno |
|---|---|---|---|
| `o-que-e-um-site` | O que é um site, para que serve e quanto custa em 2026 | "o que é um site" | → /servicos/criacao-de-sites |
| `site-vs-landing-page` | Site institucional vs landing page: qual escolher para vender mais | "site ou landing page" | → /servicos/site-express |
| `site-vs-sistema-web` | Site, web app ou sistema: diferenças, custos e quando usar cada um | "diferença site e sistema" | → /servicos/criacao-de-sites + futuro `/servicos/sistemas` |
| `quanto-custa-um-site-profissional` | Quanto custa um site profissional no Brasil (tabela 2026) | "quanto custa um site" | → /servicos/site-pro |

**Schema:** `Article` + `FAQPage` + `BreadcrumbList` (já automatizado em `IntentLanding.tsx`).

**Interlinking:** atualizar `src/lib/interlinking.ts` para que `/servicos/*` linkem de volta os posts (link mútuo = boost SEO).

**Critério de aceite:** 4 posts publicados, cada um com 1.200+ palavras, JSON-LD válido, links bidirecionais.

---

## Etapa D — **Bônus** explorável (não confirmado, listo p/ você escolher depois)

### D1. Página `/infraestrutura` (institucional técnica)
Hoje o `.br` não tem nada explicando *por que* os sites são rápidos. O `.site` faz isso na seção "Why Businesses Choose Us". Página de 1 scroll explicando:
- Cloudflare edge (300+ PoPs)
- 100% hand-coded (sem WordPress/Wix)
- WebP/AVIF + lazy loading
- Schema.org em todas as páginas
- Lighthouse 95+ garantido

Boa para link em propostas comerciais.

### D2. Hub `/sites/[vertical]` — landings por nicho
O `.site` lista verticais (E-commerce, Restaurant, Admin Panel, Enterprise). Replicar em PT-BR com foco local:
- `/sites/restaurante` — cardápio digital + reservas + delivery
- `/sites/clinica` — agenda + prontuário básico + LGPD
- `/sites/advocacia` — captação de leads + área restrita
- `/sites/imobiliaria` — busca de imóveis + integração CRM
- `/sites/e-commerce` — loja completa

Cada uma = landing SEO com `Service` schema + `FAQPage`. Alvo: "site para [vertical]" (busca de alto intent).

### D3. Versão EN (`/en/*`) com hreflang
Hreflang já está pronto no `IntentLanding.tsx`. Faltam as rotas. Reaproveita conteúdo do `0web.site` para abrir canal internacional sem manter dois domínios.
- `/en/` (home)
- `/en/services`
- `/en/websites`, `/en/webapps`, `/en/seo`
- Linguagem de marca: "0WEB — Performance-grade websites & growth marketing"

Decisão pendente: manter `0web.site` como showcase visual e usar `0web.com.br/en` como canônico? Ou redirecionar `0web.site` → `0web.com.br/en`?

### D4. Página `/cases` com filtro por tipo
Você tem `/cases/$slug` mas falta o **índice navegável**. O `.site` faz bem em "Website Projects" com filtros (Static / E-commerce / Web App). Adicionar:
- Grid com screenshots reais (não AI — regra do projeto)
- Filtro por vertical + por serviço
- CTA "Quero um igual" → `/solicitar-orcamento?ref=case-{slug}`

### D5. Componente `StatsBar` no Hero
Números fortes convertem. O `.site` usa "50+ projects · 100% uptime · Edge · Free SSL". Versão BR:
- **150+** sites entregues
- **98%** dos clientes na 1ª página do Google
- **24h** prazo mínimo (Site Express)
- **5 anos** de operação

(Calibrar números reais com você antes de publicar — não vou inventar.)

---

## Ordem sugerida de execução

1. **Etapa A (TrustStrip)** — rápida (~1h código), impacto imediato em conversão. **Começa aqui.**
2. **Etapa B (Site Pro + pricing)** — 2-3h, fecha gap de oferta.
3. **Etapa C (Cluster educacional)** — maior volume de texto, melhor fazer após validar A+B.
4. **Bônus D1–D5** — escolher 1-2 conforme prioridade comercial.

---

## Perguntas que preciso responder antes de codar

1. **Preço do Site Pro:** R$ 7.900 está OK ou tem outro número de referência?
2. **Números do StatsBar (D5):** quantos sites entregues, % de clientes em 1ª página, anos de operação?
3. **Hreflang EN (D3):** mantém `0web.site` separado ou unifica em `0web.com.br/en`?
4. **Verticais prioritárias para D2:** se for fazer, quais 3 nichos importam mais? (sugiro restaurante, clínica, advocacia pelo CPL).

Responda só as perguntas que afetam o que quer começar agora — o resto fica para quando chegar a vez.
