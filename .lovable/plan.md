
# Escopo aprovado

Tudo gerenciável pelo painel admin. Hreflang fica fora (só pt-BR). Vou entregar em **4 lotes** para manter cada migração curta e auditável.

---

## Lote 1 — CRUD de Planos (banco + painel + landing)

**Banco** (`plans` table):
- Campos: slug, nome, preço (centavos), período (mês/ano/projeto/sob_consulta), descrição, lista de features (jsonb), destaque (bool), cta_label, cta_href, ordem, ativo.
- RLS: leitura pública (`anon` + `authenticated`); escrita só `super_admin`/`admin` (`has_role`).
- Trigger `updated_at`. Seed com os 4 planos atuais (Landing R$ 99,99, Start R$ 249, Pro R$ 649, Enterprise sob consulta).

**Server functions** (`src/lib/plans.functions.ts`):
- `listPlansPublic()` (público), `listPlansAdmin()`, `upsertPlan()`, `deletePlan()`, `reorderPlans()` com `requireSupabaseAuth` + checagem de role.

**UI**:
- `src/components/site/Plans.tsx` passa a ler do banco com `useSuspenseQuery` (mantém fallback estático se erro).
- Nova aba **Planos** em `/painel`: tabela com criar/editar/excluir/duplicar/reordenar (drag handles), preview ao vivo.

---

## Lote 2 — Redirects 301 gerenciáveis

**Banco** (`redirects` table):
- Campos: from_path (unique), to_path, status_code (301/302/308), enabled, hits, last_hit_at, notas.
- RLS: leitura `service_role` (consumida server-side), escrita admin.

**Middleware** (`src/start.ts` requestMiddleware):
- Lookup em cache (TTL 60s) na entrada de cada request HTML; se match → `Response` 301/308.
- Normalizações automáticas no mesmo middleware: força sem-trailing-slash (exceto `/`), e força host canônico (`0web.com.br`) quando vier de www/preview/custom.

**UI** em /painel → **Redirects**: tabela CRUD + métricas (hits, último acesso) + import CSV.

---

## Lote 3 — Validação de canônicos no build + paginação

**Script** `scripts/validate-canonicals.ts`:
- Faz crawl do build (`dist/`) lendo o HTML SSR de cada rota do sitemap.
- Verifica: exatamente 1 `<link rel=canonical>` por página; URL absoluta com host correto; canonical aponta para si mesmo (self-referential) OU para alvo declarado; nenhuma rota indexável aponta para 404.
- Roda como `postbuild` no `package.json`; falha o build com lista clara de erros.

**Paginação consistente** (`blog.index`, `blog.cluster.$cluster`, `categoria.$slug`):
- Página `?p=2` recebe canonical apontando para si mesma + `<link rel="prev/next">` (já que Google reverteu o comportamento mas Bing ainda usa). Sem paginação ⇒ canonical limpo.
- Garantir que cluster e categoria nunca dupliquem listagem do `/blog` (canonical próprio + JSON-LD CollectionPage exclusivo).

---

## Lote 4 — Search Console gerenciável pelo painel

**Banco** (`gsc_settings` singleton + `gsc_coverage_snapshots`):
- Settings: property_url, verification_meta_token, enabled.
- Snapshots: coletados periodicamente — total_indexed, total_excluded, soft_404, errors, last_synced_at.

**UI** em /painel → **Search Console**:
- Passo 1: copiar meta verification (renderizada no `__root.tsx` quando configurada).
- Passo 2: botão "Conectar GSC" → fluxo do connector Google Search Console.
- Passo 3: dashboard com últimas métricas + botão "Sincronizar agora".

**Server fn** `syncGscCoverage()` que chama `connector-gateway.lovable.dev/google_search_console/webmasters/v3/sites/.../urlInspection` e grava snapshot. Cron diário via pg_cron opcional.

---

## Sequência de execução

Começo pelo **Lote 1** agora (migração + UI + landing dinâmica) porque é o que mais muda o site visível. Lotes 2/3/4 nas próximas mensagens — peço sua confirmação ao final do Lote 1 antes de seguir.

## Decisões pendentes que assumo se não houver objeção

- Preços armazenados em **centavos** (BIGINT) para evitar float.
- Período como enum: `month` | `year` | `project` | `custom`.
- Redirects: default **308** (preserva método; é o substituto moderno do 301 e Google trata igual).
- Validador roda em `postbuild` mas pode ser desabilitado por env `SKIP_CANONICAL_CHECK=1` para hotfixes.
