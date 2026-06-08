## Objetivo

Entregar uma onda **funcional ponta-a-ponta**: ao final, todo serviço tem conteúdo SEO no banco (rich_html + JSON-LD) e a página pública `/servicos/$slug` renderiza esse conteúdo, sem depender mais dos arquivos `src/routes/servicos.<nome>.tsx`. Isso destrava as ondas seguintes (checklist de publicação, navegação configurável, remoção de duplicatas com 301).

Escopo intencionalmente **pequeno e funcional** — sem regressão, sem mexer em checkout/busca/admin nessa onda.

## O que entra

1. **Schema** — garantir colunas no `services`:
   - `rich_html text` (HTML do corpo da página)
   - `schema_jsonld jsonb` (JSON-LD Service/Product)
   - `seo_title text`, `seo_description text`, `og_image text`, `canonical_path text`
   - `published boolean default false`
   (criar só as que faltarem; migração idempotente com GRANTs)

2. **Importador `.tsx` → banco** (`src/lib/seo-importer.functions.ts`, server fn admin):
   - Lê cada arquivo `src/routes/servicos.<slug>.tsx` do disco do worker (lista hardcoded dos slugs existentes — site-express, trafego-pago, seo, google-meu-negocio, presenca-digital, consultoria, marketplace, parceiros, site-24h, trafego-pago-local).
   - Extrai via regex/AST simples: `<h1>`, blocos de benefícios (`<ul>`/cards), garantia, depoimentos, FAQ, CTA.
   - Monta `rich_html` preservando essas seções com classes utilitárias (`prose`, `grid`, etc).
   - Gera `schema_jsonld` (Service + FAQPage quando houver).
   - Faz `upsert` em `services` por `slug`. Não toca em `published`.
   - Roda via botão no admin `/app/services` → "Importar SEO dos .tsx".

3. **Render dinâmico em `/servicos/$slug`**:
   - Refatorar `src/routes/servicos.$slug.tsx` para: loader chama `getServicePublic({slug})` → retorna `{name, rich_html, schema_jsonld, og_image, seo_title, seo_description, price, ...}`.
   - `head()` usa esses campos (title/desc/OG/canonical/JSON-LD).
   - Componente renderiza imagem (com `ServiceImageFallback` quando vazio), `rich_html` sanitizado (DOMPurify já no projeto ou `dangerouslySetInnerHTML` com sanitização server-side), e CTA "Adicionar ao carrinho" + "Falar no WhatsApp".
   - Mantém o layout sticky de loja (`/servicos` outlet) — sem mudanças no topo.

4. **Fallback seguro**: se `rich_html` vazio → renderiza descrição curta + CTA (não quebra páginas ainda não migradas).

## O que NÃO entra nessa onda (vai nas próximas)

- Checklist de publicação no admin (onda 2)
- Remoção dos `.tsx` legacy + 301 (onda 3, só depois de confirmar paridade visual)
- Admin de navegação + auditoria de links legacy (onda 4)
- CI seo-diff (depois das 4 ondas, como você pediu)

## Detalhes técnicos

- Migração SQL idempotente (`ADD COLUMN IF NOT EXISTS`), com `GRANT SELECT ON services TO anon` mantido.
- Importador é admin-only (`requireSupabaseAuth` + check `is_admin_or_super`).
- Sanitização do `rich_html` no server fn antes de devolver (allowlist de tags: h1-h4, p, ul/ol/li, strong, em, a, img, section, div com classes utilitárias).
- `servicos.$slug.tsx` continua público (loader chama server fn que usa `supabaseAdmin` internamente, só projeta colunas seguras).
- Sem mudança no `routeTree.gen.ts` manualmente.

## Critério de pronto

- Rodo "Importar SEO" no admin → 10 serviços ficam com `rich_html` e `schema_jsonld` preenchidos.
- Abro `/servicos/site-express` → vejo o mesmo conteúdo de hoje, mas vindo do banco (confirmo via DevTools que o HTML veio do loader).
- `/servicos/<slug-novo-criado-no-admin>` também funciona, mesmo sem `.tsx` correspondente.
- Nenhum `.tsx` antigo é deletado ainda (zero risco de 404).

Confirma essa onda? Se sim, executo direto.