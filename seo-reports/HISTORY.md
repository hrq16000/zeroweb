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
