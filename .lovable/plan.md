## Objetivo
Tornar `/servicos` uma loja virtual real, com 100% do conteúdo (cards, páginas de produto, home, menu, footer, sitemap, funis por CTA) editável em `/app/servicos` — sem precisar tocar em código.

---

## Fase 1 — Fonte única no banco (acaba a duplicação)

1. **Migração de schema** — adicionar em `services`:
   - `price`, `price_period` ("único", "/mês", "/projeto")
   - `delivery_days` (prazo) e `conditions` (texto curto)
   - `show_in_menu`, `show_in_footer`, `show_in_home_featured`, `show_in_sitemap` (booleans)
   - `funnels jsonb` → `{ default, header, hero, card, detail, footer }` (slug do funil por local; `default` é fallback)
   - `gallery jsonb` → array de `{ image_path, alt }` para galeria de produto
   - `sections jsonb` → array ordenada `{ kind, title, body, items[] }` (hero, benefícios, processo, FAQ, depoimentos, CTA)

2. **Backfill** dos 10 órfãos hoje em `services-data.ts` (`site-express`, `site-24h`, `consultoria`, `seo`, `marketplace`, `parceiros`, `trafego-pago`, `trafego-pago-local`, `presenca-digital`, `google-meu-negocio`) — copiar conteúdo (problems/benefits/process/faq/keywords) para o banco com `image_path = NULL` (aparecem como "Capa pendente" no painel para você subir depois).

3. **Apagar** `src/lib/services-data.ts`, o mapa `FALLBACK_COVERS` e os imports de JPG locais — fim do bug de "Capa SEO" quebrada.

---

## Fase 2 — Rotas: mover produtos para `/servicos/$slug`

Rotas a **deletar** (redirect 301 para `/servicos/<slug>`):
- `/seo` → `/servicos/seo`
- `/criacao-sites` → `/servicos/criacao-de-sites`
- `/landing-pages` → `/servicos/landing-pages`
- `/trafego-pago` → `/servicos/trafego-pago`
- `/trafego-pago-local` → `/servicos/trafego-pago-local`
- `/google-meu-negocio` → `/servicos/google-meu-negocio`
- `/consultoria` → `/servicos/consultoria`
- `/marketplace` → `/servicos/marketplace`
- `/parceiros` → `/servicos/parceiros`
- `/presenca-digital` → `/servicos/presenca-digital`
- `/redes-sociais` → `/servicos/gestao-redes-sociais`
- `/automacao` + `/ia` → `/servicos/automacao-com-ia`
- `/desenvolvimento` → `/servicos/desenvolvimento-saas`
- `/servicos.site-24h.tsx` etc. (rotas literais por slug) → removidas em favor de `/servicos/$slug` dinâmico

Os 301 entram em `redirects` (tabela já existente) e são servidos pelo middleware de redirect.

---

## Fase 3 — Página `/servicos/$slug` (página de produto)

Lê 100% do banco via `getServicePublic`:
- Galeria (capa + miniaturas)
- Nome, preço, prazo, condições
- Tabs/seções gerenciáveis (ordem definida no painel)
- CTAs em 4 posições (header, hero, card lateral, footer) — cada um aciona `funnels.<posição>` ou cai no `funnels.default`

Sem conteúdo duplicado: tudo que estava na home/raiz vive aqui.

---

## Fase 4 — Vitrine `/servicos` (cara de loja)

- Hero curto + busca + filtro por categoria + sort (relevância/preço/novo)
- Grid 2/3/4 colunas com card: capa 16:9, badge categoria, título, preço, CTA único
- Skeleton loaders, lazy-load de imagem, `loading="lazy"`, `aspect-ratio` fixo (zero CLS)
- `scrollRestoration: true` no router + `scrollToTop` em todo Link de navegação (acaba o "clica e fica no nada")

---

## Fase 5 — Home enxuta + Footer + Mapa do Site (do banco)

- **Home**: hero + 4 destaques (`show_in_home_featured=true`, ordenados por `display_order`) + 1 CTA "Ver todos os serviços". Remover blocos longos duplicados.
- **Footer**: coluna "Serviços" gerada do banco (`show_in_footer=true`).
- **Header menu**: dropdown "Serviços" listando `show_in_menu=true` por categoria.
- **`/mapa-do-site`** pública: lista 100% das páginas por seção (serviços, blog, cases, institucional) — direto do banco.

---

## Fase 6 — Painel `/app/servicos` ampliado (gerência total)

Adicionar ao dialog de edição:
- Aba **Comercial**: preço, período, prazo, condições
- Aba **Galeria**: upload múltiplo + reorder
- Aba **Conteúdo**: editor de seções drag-and-drop (hero, benefícios, processo, FAQ, depoimentos, CTA)
- Aba **Funis**: 6 dropdowns (default, header, hero, card, detail, footer) com os funis existentes — preview do funil ao lado
- Aba **Visibilidade**: 4 toggles (menu, footer, home destaque, sitemap)
- Aba **SEO**: title/description override + og_image

Painel mostra alerta de saúde: serviços sem capa, sem preço, sem funil, sem seções.

---

## Fase 7 — Funis nos botões (100% configurável)

Componente `<ServiceCTA service location="hero|card|header|footer|detail" />`:
- Resolve `funnel = service.funnels[location] ?? service.funnels.default ?? globalDefaultFunnel`
- Abre modal embutido com `<FunnelRunner slug={funnel} />` (componente já existe)
- Toda CTA do site passa a usar esse componente — zero hardcode

---

## Fase 8 — Limpeza final

- Remover `src/lib/services-data.ts`, `FALLBACK_COVERS`, 9 imports de JPG, 7 rotas literais `servicos.<slug>.tsx`
- Validar com `scripts/validate-route-files.mjs`
- Rodar smoke test `scripts/smoke-servicos.mjs`
- Auditoria de links órfãos (script novo) — falha o build se uma rota existe mas não está em menu/footer/sitemap

---

## Ordem de execução proposta

1. Migração de schema + backfill (Fase 1) — **sem quebrar nada visível**
2. Página `/servicos/$slug` lendo novos campos (Fase 3) + vitrine (Fase 4)
3. Painel ampliado (Fase 6) + componente CTA com funis (Fase 7) — **você já consegue gerenciar tudo**
4. Redirects 301 + remoção de rotas duplicadas (Fase 2) + home/footer/mapa (Fase 5)
5. Limpeza (Fase 8)

Cada fase deploya independente; após a Fase 3 você já tem `/servicos` funcionando como vitrine real e os SEO/Site24h voltam com imagem (placeholder no painel até você subir).

---

## Sobre as imagens dos 10 órfãos

Conforme sua resposta — **gerência 100% pelo painel**. Os 10 entram com `image_path = NULL` e aparecem com placeholder "Subir capa" tanto na vitrine quanto no painel. Você sobe quando quiser pelo `/app/servicos`. Sem IA, sem palpite.