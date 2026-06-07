
# Plano de execução sequencial — 7 fases

Cada fase é entregue isolada, com um checkpoint de validação antes de avançar para a próxima. Se algo quebrar numa fase, a próxima não inicia.

---

## Fase 1 — Imagens do catálogo de serviços
**Objetivo:** popular os 9 cards de `/servicos` com capas visuais coerentes.

- Gerar 9 capas (16:9, estilo 0WEB: gradiente azul/laranja, mockup minimalista) com `imagegen` em `src/assets/services/{slug}.jpg`.
- Subir os 9 arquivos para o bucket `service-images` do Storage (público).
- Migration `UPDATE services SET image_path = '...' WHERE slug = '...'` para os 9 slugs.
- Render do card em `servicos.index.tsx` já lê `image_path` — só validar que aparece.

**Checkpoint:** `/servicos` mostra os 9 cards com imagem. Nenhum card antigo quebrado.

---

## Fase 2 — Navegação completa (páginas órfãs)
**Objetivo:** garantir que toda página pública seja alcançável.

- Adicionar ao menu (`Header.tsx`): Cases, Planos, FAQ.
- Adicionar ao Footer: Parceiros, Consultoria, Marketplace.
- Incluir `presenca-digital`, `trafego-pago`, `trafego-pago-local`, `google-meu-negocio` como cards extras no catálogo `/servicos` (sem migrar slug — só linkar).
- Atualizar teste `Header.menu.test.tsx` com os novos links.

**Checkpoint:** rodar `bun test src/components/site/__tests__/Header.menu.test.tsx` — verde.

---

## Fase 3 — Páginas 403 / 404 / 500 amigáveis + diagnóstico de rota
**Objetivo:** UX consistente quando algo falha.

- Componente compartilhado `src/components/site/ErrorState.tsx` (ilustração, mensagem, CTA voltar/contato/WhatsApp).
- `notFoundComponent` no `__root.tsx` → usa ErrorState 404.
- `errorComponent` no `__root.tsx` → ErrorState 500 + (dev only) bloco de diagnóstico: caminho da rota, hint "limpar cache Vite: `rm -rf node_modules/.vite .vite .output && restart`".
- Página `/403` standalone (acesso negado) usada pelo gate `_authenticated`.
- Detector de "Failed to load url …/routes/…" → mensagem amigável + instruções de limpeza no overlay dev.

**Checkpoint:** acessar `/rota-inexistente` → 404 amigável. Forçar erro em loader → 500 amigável.

---

## Fase 4 — Guardrails de build & dev server
**Objetivo:** impedir blank screen por arquivo de rota faltando.

- Script `scripts/validate-route-files.mjs`: lê `routeTree.gen.ts`, valida que cada `import('./routes/X')` resolve para arquivo existente. Falha com mensagem amigável listando os arquivos ausentes.
- Hook no `package.json` `prebuild` e `pre-commit` (.husky).
- Plugin Vite leve `vite-plugin-route-watcher.ts`: observa `src/routes/` por add/unlink e força full reload (`server.ws.send({ type: 'full-reload' })`) quando `routeTree.gen.ts` ficar dessincronizado por > 2s.

**Checkpoint:** simular remoção de um arquivo de rota → build aborta com mensagem clara em vez de erro críptico.

---

## Fase 5 — Sitemap de serviços automatizado + monitoramento 404
**Objetivo:** sitemap sempre alinhado com o catálogo; rastrear 404 e redirects.

- `sitemap-services.xml.ts`: ler `services` direto do Supabase (slugs ativos) — já existe parcialmente, garantir que reflita 100% do banco e remova slugs legados.
- Tabela `route_404_log` (migration) + handler em `__root.tsx#notFoundComponent` que faz fire-and-forget de `logNotFound(path, referrer)` via server fn.
- Rota admin `/app/seo/404s` lista agregada (top 50 paths, contagem, último visto).
- Append automático ao `seo-reports/HISTORY.md` em cada deploy via script `scripts/log-deploy.mjs`.

**Checkpoint:** adicionar slug fake no banco → aparece no `/sitemap-services.xml` automaticamente. Acessar URL inexistente → linha aparece em `route_404_log`.

---

## Fase 6 — Testes E2E Playwright (smoke)
**Objetivo:** prevenir regressões silenciosas.

- Adicionar `@playwright/test` como devDependency + config básica.
- Suite `tests/e2e/smoke.spec.ts`:
  1. `/` carrega, header visível.
  2. `/servicos` lista ≥ 10 cards com imagem.
  3. Clicar em cada card de serviço → `/servicos/{slug}` 200 + breadcrumb correto.
  4. Menu mobile abre, fecha no Escape, fecha ao clicar fora.
  5. `/rota-falsa` → 404 amigável (não blank).
- Workflow `.github/workflows/e2e.yml` rodando em PR.

**Checkpoint:** `bunx playwright test` verde local.

---

## Fase 7 — Publish + validação de produção
**Objetivo:** confirmar tudo no ar.

- Sinalizar para publicar.
- Rodar `node scripts/validate-jsonld.mjs https://0web.com.br --with-validator` → esperado 11/11 verde.
- Rodar `node scripts/validate-sitemaps.mjs` → esperado 7/7 verde.
- `curl -I https://0web.com.br/criacao-sites` etc. → confirmar `HTTP/2 301` server-side para cada legado.
- Adicionar relatório final ao `seo-reports/HISTORY.md`.

**Checkpoint:** todos os validators verdes em produção.

---

## Regras transversais (em todas as fases)
- Toda mudança vai com seu próprio teste antes de avançar.
- Nenhum arquivo `_authenticated/*` é tocado (escopo zero em auth).
- Nenhum schema de banco existente é alterado destrutivamente — só `ADD COLUMN` / nova tabela.
- `mem://` consultado antes de qualquer mudança de design (paleta/tipografia segue Core).
- Após cada fase eu te entrego um diff curto + checkpoint para você aprovar antes da próxima.

---

## Detalhes técnicos resumidos

| Fase | Arquivos novos | Arquivos editados | Migrations |
|---|---|---|---|
| 1 | 9× `src/assets/services/*.jpg` | `servicos.index.tsx` (fallback img) | 1 (UPDATE services.image_path) |
| 2 | — | `Header.tsx`, `Footer.tsx`, `servicos.index.tsx`, testes | — |
| 3 | `ErrorState.tsx`, `403.tsx` | `__root.tsx` | — |
| 4 | `scripts/validate-route-files.mjs`, `vite-plugin-route-watcher.ts` | `package.json`, `vite.config.ts`, `.husky/pre-commit` | — |
| 5 | `app.seo.404s.tsx`, `scripts/log-deploy.mjs` | `sitemap-services.xml.ts`, `__root.tsx` | 1 (CREATE TABLE route_404_log + GRANT + RLS) |
| 6 | `tests/e2e/smoke.spec.ts`, `playwright.config.ts`, `.github/workflows/e2e.yml` | `package.json` | — |
| 7 | — | `seo-reports/HISTORY.md` | — |

**Estimativa de turnos:** 1 turno por fase = 7 turnos no total, com aprovação rápida entre cada um.

Confirma e começo pela **Fase 1 (imagens do catálogo)**?
