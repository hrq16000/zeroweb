# Plano de execução — Loja Virtual + SEO Migration

Atualizado: 2026-06-07.

## Entrega ATUAL (esta rodada)

**Loja virtual `/servicos` (UX visível)**

- [x] Tabela `hero_slides` (admin-managed, RLS pública read + admin write)
- [x] 3 slides iniciais para `page = 'servicos'` (Catálogo, Site Express, Automação IA)
- [x] Server fn `listHeroSlides({ page })` em `src/lib/hero-slides.functions.ts`
- [x] Componente `ShopHero` — carrossel 3 slides + autoplay + dots/setas
- [x] Componente `SmartServiceSearch` — autocomplete com sugestões (nome + categoria + keywords)
- [x] Refatorar `src/routes/servicos.index.tsx` em modo loja: Hero carrossel → busca grande → categorias → grid de produtos (recentes primeiro + shuffle leve)
- [x] Home (`Hero.tsx`) — CTA principal aponta para `/servicos` (já estava; reforçado visualmente)
- [x] Página dinâmica `/servicos/$slug` continua usando o mesmo Header do site

## Próximas rodadas (uma por vez, na ordem)

### Rodada 2 — Admin de slides + Featured manual
- CRUD de `hero_slides` na rota `/app/site-config` (ou aba dentro de `/app/servicos`)
- Upload de imagem para `service-images/hero/` (já existe bucket)
- Drag-and-drop reorder
- Preview ao vivo
- Flag `show_in_home_featured` já existe em `services` → usar na home

### Rodada 3 — Migração SEO automática .tsx → DB
- Script `scripts/migrate-services-seo.mjs` que:
  1. Lê cada `src/routes/servicos.<slug>.tsx`
  2. Extrai `head()` (title, description, JSON-LD, OG)
  3. Extrai JSX principal e converte para HTML sanitizado em `rich_html`
  4. Faz upsert no banco preservando seções (benefícios, garantia, depoimentos)
- Dry-run + `--apply`
- Relatório por serviço (campos preenchidos vs vazios)

### Rodada 4 — Importador JSX → rich_html (server fn)
- Server fn `importServiceFromLiteralRoute({ slug })`
- Acessível via botão "Importar conteúdo da rota antiga" no painel
- Usa o mesmo parser do script da Rodada 3
- Mostra diff antes de salvar

### Rodada 5 — Checklist de publicação no painel
- Nova aba "Publicação" no editor de serviço
- Validações antes de habilitar `is_active`:
  - [ ] Title (≤60 chars)
  - [ ] Description (≤160 chars)
  - [ ] OG image presente
  - [ ] Canonical estável
  - [ ] JSON-LD válido (parse + Service schema obrigatório)
  - [ ] Fallback rico (rich_html OU benefits + process + faq)
- Bloqueia "Publicar" se algum item vermelho; permite "Salvar rascunho"
- Score visual (0–100) com peso configurável em `app_settings`

### Rodada 6 — CI seo-diff
- GitHub Action `seo-diff.yml` que roda em PR
- Para cada slug alterado, executa `getServiceSeoDiff` e compara
- Modos configuráveis via `app_settings.seo_diff_rules` (JSON):
  ```json
  {
    "title":       { "mode": "block",  "threshold": 0 },
    "description": { "mode": "block",  "threshold": 0 },
    "og_image":    { "mode": "warn",   "threshold": 1 },
    "jsonld":      { "mode": "score",  "threshold": 90 },
    "canonical":   { "mode": "block",  "threshold": 0 }
  }
  ```
- Painel admin edita esse JSON com presets (Estrito / Tolerante / Score)
- Action lê o JSON via API pública `/api/public/seo-diff-rules` (read-only)
- Bloqueia merge quando `mode=block` falha ou `score < threshold`

### Rodada 7 — Limpeza final
- Após todos os serviços migrados e validados, deletar rotas literais `servicos.<slug>.tsx`
- Adicionar redirect 301 do antigo path para `/servicos/<slug>` (já tratado pelo TanStack)
- Atualizar `sitemap-services.xml` para usar apenas o DB
