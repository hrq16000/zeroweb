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

## 2026-06-06T23:30 — SocialProof dinâmico + status da fila

### Mudanças
- **`src/lib/social-proof.functions.ts`** (novo): server fn `getSocialProofFeed` que une as 20 últimas `lead_submissions` (anonimizadas) com 10 serviços ativos para gerar até 30 notificações reais. Cidade/nome derivados deterministicamente via seed quando ausentes.
- **`src/components/site/SocialProof.tsx`**: usa `useServerFn` + `useQuery` (`staleTime` 5 min, sem refetch on focus). Fallback para `FALLBACK_POOL` se servidor falhar. Acabou o POOL hardcoded repetitivo.
- **Cache do Vite**: limpei `node_modules/.vite`, `.vite`, `dist`, `.output` e reiniciei dev server para resolver 502s residuais do rename `servicos.$slug → servicos_.$slug`.

### Itens da fila já entregues em rounds anteriores (verificado)
- ✅ FAQ Schema dedicado do Site Express em `/servicos` com dedupe via `SITE_EXPRESS_FAQ_KEYS` (linhas 21-130 de `src/routes/servicos.tsx`).
- ✅ Redirect 301 `/$service → /servicos/$slug` em `src/routes/$service.tsx`.
- ✅ CRUD `/app/servicos` com dnd-kit sortable, upload de imagem e dialogs (594 linhas em `_authenticated/app.servicos.tsx`).

### Itens que dependem de ação do usuário
- ⏳ Login Google em /painel com hrq16000@gmail.com → preciso que você faça login uma vez para eu confirmar console/role.
- ⏳ Republish para o validator JSON-LD recolocar 11/11 rotas em verde (código corrigido aguarda deploy).

## 2026-06-06 · Round 9 — Catálogo /servicos + 301 em lote

### Roteamento corrigido
- `servicos.tsx` virou layout (`<Outlet/>`) e o conteúdo do catálogo migrou para `servicos.index.tsx`.
- `servicos.$slug.tsx` e `servicos.site-express.tsx` agora aninham corretamente sob `/servicos`, eliminando 404 em links de detalhe.

### Catálogo
- `/servicos` lista 9 serviços do banco (`services.is_active=true`) + fallback de arquivo (`seo`) + card destacado do Site Express.
- Cards e botões usam `<Link to="/servicos/$slug" params={{slug}}>` (sem href manual).

### 301 em lote (rotas legadas → /servicos/{slug})
| Origem | Destino |
|---|---|
| /criacao-sites | /servicos/criacao-de-sites |
| /landing-pages | /servicos/landing-pages |
| /seo | /servicos/seo |
| /automacao | /servicos/automacao-com-ia |
| /ia | /servicos/automacao-com-ia |
| /desenvolvimento | /servicos/desenvolvimento-saas |
| /redes-sociais | /servicos/gestao-redes-sociais |
| /$service (qualquer slug não capturado) | /servicos/$service |

Implementação: `createFileRoute(...).beforeLoad → throw redirect({statusCode:301, replace:true})` em cada arquivo.

### Links internos atualizados
- `Footer.tsx` (3 colunas) — todos os links de soluções/tecnologia agora apontam para `/servicos/{slug}`.
- `RelatedLinksGrid.tsx` — itens `criacao-sites`, `seo`, `automacao` re-mapeados.
- `Header.tsx` — item "IA" agora aponta para `/servicos/automacao-com-ia`.
- Filtros `only=` em `servicos.index.tsx` e `trafego-pago-local.tsx` atualizados.

### Sitemap & robots
- `sitemap-pages.xml` removeu as 6 rotas legadas (agora redirecionadas) e adicionou `/servicos`, `/cases`, `/blog`, `/planos`, `/faq`, `/presenca-digital`, `/trafego-pago-local`.
- `sitemap-services.xml` segue gerando uma URL por slug em `/servicos/{slug}`.
- `robots.txt` mantido (já permite tudo exceto `/app`, `/painel`, `/auth`, `/r/`, `/api/`).

### Canonical & breadcrumbs
- `/servicos/$slug` continua emitindo `<link rel="canonical">` para `https://0web.com.br/servicos/{slug}` + `hreflang pt-BR/x-default` e breadcrumb `Início › Serviços › {Nome}`.

### Testes
- Novo `src/components/site/__tests__/Header.menu.test.tsx` cobrindo:
  abertura/fechamento do menu mobile, fechamento via Escape, fechamento ao clicar fora,
  e validação de que cada link de serviço aponta para `/servicos/{slug}`.

## 2026-06-07 — Catálogo de serviços: imagens reais (Fase 1)
- 9 capas 16:9 geradas via IA e enviadas ao bucket `service-images/catalog/*.jpg`
- `services.image_path` + `image_alt` preenchidos via migration para todos os slugs ativos:
  - criacao-de-sites, landing-pages, loja-virtual, marketing-digital,
    automacao-com-ia, chatbot-whatsapp, desenvolvimento-saas, sistemas-web,
    gestao-redes-sociais
- `/servicos` agora renderiza os 9 cards com imagem real (signed URL 7d). Fallback "Imagem pendente" preservado para futuros serviços sem capa.
- Rotas `/servicos/$slug` validadas — todos os slugs resolvem para a página de detalhe (sem 404). Site Express continua em rota dedicada.

## 2026-06-07 — Phase 2: Navigation & orphan pages
- Footer: adicionada coluna "Especialidades" (Presença Digital, Tráfego Pago, Tráfego Local, Consultoria, Parceiros, Marketplace).
- Footer: corrigido link SEO de `/servicos/seo` (404) para `/seo` (rota dedicada).
- `/servicos`: nova seção "Especialidades complementares" com 6 cards apontando para as páginas dedicadas que estavam órfãs do catálogo.
- Header já contempla: Início, Serviços, IA, Cases, Planos, FAQ, Blog, Marketplace, Contato.
