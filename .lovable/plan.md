# Plano de melhorias (5 ondas)

O escopo pedido é grande; vou executar em ondas pequenas e independentes para não regredir nada. Cada onda entrega valor sozinha e plugada ao painel admin. Vou tocar **somente o que está marcado como melhoria**.

## Onda 1 — Checklist de publicação no admin (`services`)
- Adicionar painel "Validação de publicação" em `/app/servicos` no drawer do serviço.
- Checklist server-side (serverFn admin) validando por serviço:
  - `seo_title` 30–60 chars
  - `seo_description` 80–160 chars
  - `og_image` ou `image_path` presente (URL acessível)
  - `canonical_path` consistente com `/servicos/<slug>`
  - `schema_jsonld` válido (`@context`, `@type`)
  - `rich_html` não vazio
- Botão "Publicar" só habilita se 100% verde. Persiste `published=true`.
- Migration idempotente para colunas em falta caso necessário.

## Onda 2 — Upload de imagens dos serviços órfãos
- Nova rota admin `/app/servicos/imagens` listando serviços sem `image_path`.
- Mostra slug, nome, status público (rota existe?), upload direto no bucket `service-images` (privado → signed URL).
- ServerFn `adminUploadServiceImage` (validação Zod, tamanho/MIME, atualiza `services.image_path` + `og_image`).
- Link cruzado no painel principal de Serviços ("X serviços sem capa").

## Onda 3 — Auditoria de links legacy em `/app/seo-404s`
- Novo bloco "Links internos legacy" na página existente.
- ServerFn admin varre `src/routes/**` + `rich_html` no DB e lista ocorrências de `/seo`, `/criacao-sites`, `/landing-pages`, `/trafego-pago`, `/google-meu-negocio`, etc. fora de `/servicos/$slug`.
- Botão "Exportar CSV" e "Marcar como corrigido".
- Reaproveita o redirect engine já existente.

## Onda 4 — Teste de catálogo (CI)
- Script `scripts/validate-catalog-images.mjs`: para cada serviço esperado (`SERVICOS_ESPERADOS`) garantir `imageUrl` não-nulo + HEAD 200.
- Plugado no `package.json` em `test:catalog` e adicionado ao workflow existente de CI (lighthouse / seo-jsonld).
- Falha o build se algum órfão real.

## Onda 5 — CI seo-diff por PR
- GitHub Action `.github/workflows/seo-diff.yml` rodando `scripts/run-seo-diff.mjs` (a criar) que invoca o serverFn `seo-diff` já existente contra preview do PR.
- Limites configuráveis em `seo-reports/seo-diff.config.json` (delta % máximo para Title/Description/OG/JSON-LD).
- Bloqueia merge se delta > limite. Comenta no PR com diff.

---

### Fora deste plano (já avisado: regressão)
- Trocar carrinho atual / login (já existe Google-only + drawer + funil).
- Refatorar `/servicos/$slug` (já é DB-driven desde a onda anterior).
- Remover `.tsx` legacy de serviços (precisa onda de 301 que você adiou).

### Critério de pronto por onda
Cada onda termina com: rota nova no admin funcional, serverFn protegida por `requireSupabaseAuth` + role admin, build verde, e um teste/smoke quando aplicável.

Vou começar pela **Onda 1** assim que aprovar (ou posso ir direto se preferir — me avise se quer pular alguma).
