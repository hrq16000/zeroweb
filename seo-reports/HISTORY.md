# Histórico de validações SEO/JSON-LD

## 2026-06-06T18-50-04-408Z — https://0web.com.br
- Rotas: **11** | Falhas: **11** | Relatório: `seo-reports/2026-06-06T18-50-04-408Z.json`
  - ❌ (2) `/servicos`
  - ❌ (5) `/servicos/criacao-de-sites`
  - ❌ (5) `/servicos/landing-pages`
  - ❌ (5) `/servicos/loja-virtual`
  - ❌ (4) `/servicos/seo`
  - ❌ (5) `/servicos/marketing-digital`
  - ❌ (5) `/servicos/automacao-com-ia`
  - ❌ (5) `/servicos/chatbot-whatsapp`
  - ❌ (5) `/servicos/desenvolvimento-saas`
  - ❌ (5) `/servicos/sistemas-web`
  - ❌ (5) `/servicos/gestao-redes-sociais`

## 2026-06-06T18-52-26-667Z — https://0web.com.br
- Rotas: **11** | Falhas: **11** | Relatório: `seo-reports/2026-06-06T18-52-26-667Z.json`
  - ❌ (2) `/servicos`
  - ❌ (5) `/servicos/criacao-de-sites`
  - ❌ (5) `/servicos/landing-pages`
  - ❌ (5) `/servicos/loja-virtual`
  - ❌ (4) `/servicos/seo`
  - ❌ (5) `/servicos/marketing-digital`
  - ❌ (5) `/servicos/automacao-com-ia`
  - ❌ (5) `/servicos/chatbot-whatsapp`
  - ❌ (5) `/servicos/desenvolvimento-saas`
  - ❌ (5) `/servicos/sistemas-web`
  - ❌ (5) `/servicos/gestao-redes-sociais`

## 2026-06-06T21-08-56-715Z — https://0web.com.br
- Rotas: **11** | Falhas: **11** | Relatório: `seo-reports/2026-06-06T21-08-56-715Z.json`
  - ❌ (2) `/servicos`
  - ❌ (5) `/servicos/criacao-de-sites`
  - ❌ (5) `/servicos/landing-pages`
  - ❌ (5) `/servicos/loja-virtual`
  - ❌ (4) `/servicos/seo`
  - ❌ (5) `/servicos/marketing-digital`
  - ❌ (5) `/servicos/automacao-com-ia`
  - ❌ (5) `/servicos/chatbot-whatsapp`
  - ❌ (5) `/servicos/desenvolvimento-saas`
  - ❌ (5) `/servicos/sistemas-web`
  - ❌ (5) `/servicos/gestao-redes-sociais`

## 2026-06-06T21-10-09-853Z — sitemap/robots — https://0web.com.br
- Checks: **7** | Falhas: **0** | Relatório: `seo-reports/sitemaps-2026-06-06T21-10-09-853Z.json`

## 2026-06-06T22-01-28-853Z — sitemap/robots — https://0web.com.br
- Checks: **7** | Falhas: **0** | Relatório: `seo-reports/sitemaps-2026-06-06T22-01-28-853Z.json`

## 2026-06-06T22-01-37-605Z — https://0web.com.br
- Rotas: **11** | Falhas: **11** | Relatório: `seo-reports/2026-06-06T22-01-37-605Z.json`
  - ❌ (2) `/servicos`
  - ❌ (5) `/servicos/criacao-de-sites`
  - ❌ (5) `/servicos/landing-pages`
  - ❌ (5) `/servicos/loja-virtual`
  - ❌ (4) `/servicos/seo`
  - ❌ (5) `/servicos/marketing-digital`
  - ❌ (5) `/servicos/automacao-com-ia`
  - ❌ (5) `/servicos/chatbot-whatsapp`
  - ❌ (5) `/servicos/desenvolvimento-saas`
  - ❌ (5) `/servicos/sistemas-web`
  - ❌ (5) `/servicos/gestao-redes-sociais`


## 2026-06-06T22:02 — Rodada 6 (Header + republish pendente)
- **Header**: trocado `/#contato` por `Link to="/contato"` (desktop + mobile). Adicionado fechamento automático do menu mobile em mudança de rota. Outside-click já funcionava via `headerRef`.
- **Sitemaps/robots**: 7/7 checks verdes em produção.
- **JSON-LD em `/servicos/{slug}`**: 6 rotas ainda com 5 issues (BreadcrumbList duplicado, FAQPage duplicada, `#org` duplicado, hreflang ausente). Todos já corrigidos no código — aguardando **republish** do frontend. Após publicar, rodar `node scripts/validate-jsonld.mjs --with-validator` para revalidar contra Schema.org.
## 2026-06-06T23-09-55-934Z — https://0web.com.br
- Rotas: **11** | Falhas: **11** | Relatório: `seo-reports/2026-06-06T23-09-55-934Z.json`
  - ❌ (1) `/servicos`
  - ❌ (3) `/servicos/automacao-com-ia`
  - ❌ (3) `/servicos/chatbot-whatsapp`
  - ❌ (3) `/servicos/criacao-de-sites`
  - ❌ (3) `/servicos/desenvolvimento-saas`
  - ❌ (3) `/servicos/gestao-redes-sociais`
  - ❌ (3) `/servicos/landing-pages`
  - ❌ (3) `/servicos/loja-virtual`
  - ❌ (3) `/servicos/marketing-digital`
  - ❌ (3) `/servicos/seo`
  - ❌ (3) `/servicos/sistemas-web`

## 2026-06-06T23-10-01-934Z — sitemap/robots — https://0web.com.br
- Checks: **7** | Falhas: **0** | Relatório: `seo-reports/sitemaps-2026-06-06T23-10-01-934Z.json`


## 2026-06-06T23:15 — Round 7: corrigir duplicidade JSON-LD em /servicos/{slug}

**Causa raiz (produção pós-publish anterior):**
- `servicos.tsx` era pai (layout) de `servicos.$slug.tsx` e `servicos.site-express.tsx` no roteamento flat do TanStack. Resultado: o `head().scripts` de `/servicos` (CollectionPage + BreadcrumbList + FAQPage agregado + Site Express FAQ) era concatenado em todo `/servicos/{slug}`, gerando BreadcrumbList × 2 e FAQPage × 2~3.
- `SocialProofBlock.tsx` reemitia uma `Organization` com `@id=https://0web.com.br/#org` — colidindo com a Organization do layout raiz.

**Correções aplicadas (aguardando publish):**
1. Renomeado `servicos.$slug.tsx` → `servicos_.$slug.tsx` e `servicos.site-express.tsx` → `servicos_.site-express.tsx`. O sufixo `_` quebra a herança de layout/head mantendo a URL pública (`/servicos/$slug`, `/servicos/site-express`).
2. `SocialProofBlock.tsx`: removida a Organization duplicada; agora emite somente `AggregateRating` + `Review[]` referenciando `#org` via `itemReviewed`, com `@id` único por contexto.

**Estado atual em produção (antes do novo publish):** 11/11 rotas ainda falham com os mesmos sintomas (esperado — código novo ainda não está no ar). Rodar `node scripts/validate-jsonld.mjs https://0web.com.br --with-validator` depois do próximo publish.

**Sitemap/robots:** 7/7 verdes.
