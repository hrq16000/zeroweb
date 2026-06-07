# Plano: blocos A + B + C + D + validação externa

Você escolheu tudo. São ~6–10 dias de trabalho somados; não cabe em um único turno sem perder qualidade ou deixar pontas soltas (especialmente Kanban + versionamento + automações). Vou entregar em **4 rodadas curtas**, cada uma com algo publicável e testado, na ordem em que destravam mais valor com menos risco.

## Rodada 1 — agora (Bloco A + validação externa)

Foco em fechar a base SEO antes de mexer em produto.

1. **Validador Schema.org no build/CI**
   - Estende `scripts/validate-schemas.mjs` para falhar quando `/servicos` e `/servicos/{slug}` não passarem em checks de Rich Results (Service, FAQPage, BreadcrumbList, WebPage).
   - Roda no `prebuild` (já existe `scripts/validate-jsonld.mjs` — sem duplicar; combinar saídas).
   - `SKIP_SCHEMA_VALIDATION=1` continua disponível para emergência.

2. **Playwright smoke `/servicos`**
   - `tests/e2e/servicos-smoke.spec.ts`: percorre `/servicos` + todos os slugs do `services-data.ts`, falha em blank screen (DOM vazio em `<main>`) ou `console.error`.
   - `tests/e2e/legacy-301.spec.ts`: para cada rota legada (`/trafego-pago`, `/trafego-pago-local`, `/consultoria`, `/google-meu-negocio`, `/marketplace`, `/parceiros`, `/presenca-digital`, `/$service`), valida status 301 e Location final em `/servicos/{slug}`.
   - Integrado ao `package.json` script `test:e2e:smoke`.

3. **Validação externa em paralelo**
   - Rodo Rich Results Test + Schema.org Validator nas URLs publicadas (`https://0web.com.br/servicos`, e 3 slugs representativos).
   - Anexo resultado em `seo-reports/HISTORY.md` com erros/warnings categorizados.

4. **Auditoria de SocialProof no hub e leaf**
   - Confirma carregamento do feed do CRUD em `/servicos` e `/servicos/{slug}` (sem repetição), via teste E2E que lê 6 ciclos consecutivos.

## Rodada 2 — bloco C (dashboard /app/seo-404s)

- Export CSV de redirects quentes e alertas por período em `app.seo-404s.tsx` (server fn `exportRedirectsCsv` em `route-404.functions.ts`).
- Script `scripts/audit-internal-links.mjs`: varre `src/**/*.{tsx,ts,md}` e falha quando encontra link interno fora de `/servicos` apontando para rotas legadas (`/trafego-pago`, `/consultoria`, etc.). Roda no `prebuild`.
- Resultado da auditoria fica disponível no dashboard como aba "Links internos legados".

## Rodada 3 — bloco B (CRM/Funil + Automações)

Dividido em três entregas progressivas dentro da rodada para manter cada commit testável:

- **B.1 Scoring**: painel em `/app/funis/scoring.tsx` listando regras (tags, pesos, thresholds por funil), com preview executando `compute_lead_score` num lead exemplo antes de salvar. Tabela nova `lead_scoring_rules`.
- **B.2 Kanban**: `/app/funis/leads.tsx` ganha modo Kanban (`@dnd-kit`) sobre `lead_submissions.pipeline_stage` com bulk-actions (mover N, aplicar tag, atribuir).
- **B.3 Builder + Versionamento + Automações**:
  - Sidebar visual em `/app/funis/$id` (estágios, ordem, perguntas múltiplas, `skip_to`, progress por estágio).
  - Versionamento: tabela `dynamic_form_versions` já existe — adicionar preview + publish/rollback + diff visual.
  - Automações pós-scoring: novo registro em `lead_pipeline_rules.action` para `whatsapp_send` (UAZAPI), `task_create` e `sheets_append` (via webhook configurável). Disparados no trigger `apply_pipeline_rules_on_insert`.

## Rodada 4 — bloco D (Chatbot + LGPD)

- Dashboard `/app/funis/conversoes.tsx`: funil por etapa, fallback rate, top respostas por pergunta, drill-down por lead.
- Área de testes: simulador embutido que roda funil sem persistir, mostrando branching.
- Registro de consentimento LGPD: tabela `lgpd_consent_log` (lead_id, version_text, given_at, ip_hash, ua), exibido no detalhe do lead.

## O que entrego nesta resposta

Apenas a **Rodada 1** completa. Ao final mostro o resultado dos validadores externos e qual deve ser o próximo "Prossiga".

## Detalhes técnicos (Rodada 1)

- `scripts/validate-schemas.mjs`: adicionar regra que percorre `src/routes/servicos.index.tsx` e `src/routes/servicos.$slug.tsx`, valida presença de `@graph` com `Service`+`FAQPage`+`BreadcrumbList`+`WebPage`, e dedup de FAQ no hub.
- Playwright já está nas devDeps? Se não, `bun add -d @playwright/test` e `playwright.config.ts` mínima (preview URL via env `E2E_BASE_URL`, fallback `http://localhost:8080`).
- Validação externa via `code--fetch_website` no endpoint do Rich Results Test não funciona (precisa de API key/auth). Vou usar:
  1. `scripts/run-schema-validator.mjs` que faz POST para `https://validator.schema.org/validate` e parseia retorno.
  2. Rich Results Test não tem API pública — vou usar o validador estrutural local (já temos) + Schema.org validator oficial + checagem manual via fetch das URLs publicadas, registrando o JSON-LD efetivamente servido.

Se preferir outra ordem das rodadas ou cortar escopo (ex.: pular versionamento em B.3), me diga antes de eu começar.