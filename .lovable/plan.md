## Escopo

Cinco evoluções no módulo de Funis/Leads do painel admin. Todas backwards-compatible com o funil `diagnostico-0web` já em produção.

---

### 1. Drag-and-drop com @dnd-kit (perguntas e etapas)

- Adicionar `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Em `app.funis.$id.tsx` (aba Perguntas), substituir botões ↑/↓ por handles ⋮⋮ com `SortableContext` (estratégia vertical).
- Persistir nova ordem em lote: UPDATE de `order_index` em `dynamic_form_questions` via serverFn `reorderQuestions({ formId, orderedIds })`.
- Acessibilidade: keyboard sensor habilitado (Space/Setas), `aria-label` por item.
- Mesmo padrão para reordenar Etapas (ver item 2).

### 2. Conceito de Etapas no builder

**DB** (já parcialmente planejado):
- Nova tabela `dynamic_form_steps(id, form_id, order_index, title, subtitle, cta_label, created_at, updated_at)` com GRANTs + RLS (admin via `has_role`).
- Coluna nova em `dynamic_form_questions`: `step_id uuid NULL REFERENCES dynamic_form_steps(id) ON DELETE SET NULL`. Mantém `step_index` legado nullable para compat.
- Migração de dados: para cada form existente sem steps, cria 1 etapa "Etapa 1" e associa todas as perguntas a ela. `diagnostico-0web` ganha 2 etapas (Qualificação / Contato) pré-configuradas.

**Builder UI** (`app.funis.$id.tsx`):
- Sidebar esquerda lista Etapas (DnD, +Nova Etapa, editar título/subtítulo/CTA).
- Canvas central mostra perguntas da etapa selecionada (DnD interno).
- Mover pergunta entre etapas: arrastar para outra etapa na sidebar.

**Runner** (`FunnelRunner.tsx`):
- Renderiza todas as perguntas da etapa atual numa única tela (validação Zod por etapa).
- Progresso: "Etapa X de N" + barra proporcional.
- Condições `skip_to` continuam funcionando: se target estiver em etapa futura, salta direto pra ela; se na mesma etapa, oculta perguntas intermediárias visualmente.

### 3. Pipeline de leads (Kanban + bulk)

**DB**:
- Coluna `pipeline_stage text NOT NULL DEFAULT 'novo'` em `dynamic_form_leads` (enum lógico: novo, contatado, qualificado, perdido, ganho).
- Tabela `lead_pipeline_rules(id, form_id NULL, trigger jsonb, action jsonb, enabled, priority, created_at)` — ex.: `{ when: { score_gte: 70 }, then: { stage: 'qualificado', tags: ['hot'] } }`.
- Tabela `lead_stage_history(lead_id, from_stage, to_stage, actor, reason, created_at)`.
- Trigger `apply_pipeline_rules_on_insert` aplica regras automaticamente.

**UI** (`app.funis.leads.tsx`):
- Toggle Tabela ↔ Kanban (5 colunas, DnD entre colunas via @dnd-kit).
- Seleção múltipla (checkbox) → barra de ações: mover etapa, atribuir tags, exportar, marcar perdido.
- Editor de regras em `/app/funis/pipeline/regras`.

### 4. Lead scoring + tags automáticas

**DB**:
- Colunas em `dynamic_form_leads`: `score int DEFAULT 0`, `score_breakdown jsonb`, `tags text[] DEFAULT '{}'`, `intent_level text` (cold/warm/hot).
- Tabela `lead_scoring_rules(id, form_id, question_id, condition jsonb, points int, tag text NULL)` — admin define no builder, aba nova "Scoring".

**Server**:
- Em `submitDynamicFunnelLead`, após gravar respostas, computar score:
  - Investimento R$3k+ → +30 / R$1.5k+ → +20 / R$399 → +5
  - Tem site → +5; objetivo "vender mais" → +10; clientes/mês 200+ → +15
  - Origem indicação → +10; segmento alvo (advocacia, saúde, etc) → +5
  - Telefone+email preenchidos → +10
- Tags automáticas baseadas em respostas: `["google-ads"]` se serviço principal contém Google; `["instagram"]` idem; `["pme"]` se 11-50 funcionários; `["enterprise"]` se 50+.
- `intent_level` derivado: ≥70 hot, ≥40 warm, senão cold.

**UI**:
- Coluna Score (badge colorida) e chips de tags na tabela/kanban.
- Filtros por tag e por intent.

### 5. Preview + versionamento

**DB**:
- Tabela `dynamic_form_versions(id, form_id, version_number, snapshot jsonb, published_at, published_by, notes)` — snapshot completo (form + steps + questions + conditions + scoring rules + WA templates).
- Coluna `published_version_id uuid` em `dynamic_forms`. Coluna `is_draft boolean` no form.

**Server**:
- `publishFunnelDraft(formId)` → cria nova versão (auto-increment), define como published.
- `rollbackFunnelTo(formId, versionId)` → restaura snapshot na tabela ativa.
- Rota pública `/f/:slug` lê **published_version_id** snapshot (não a draft). Admin preview lê draft.

**UI**:
- Botão "Pré-visualizar" no builder abre `/f/:slug?preview=DRAFT_TOKEN` em nova aba (token assinado, 1h).
- Botão "Publicar" com diff resumido (X perguntas adicionadas, Y editadas).
- Aba "Histórico" lista versões com Restaurar/Visualizar.

---

## Arquivos (resumo)

**Migrações** (3, em sequência):
1. Etapas + scoring + tags + score columns
2. Pipeline (stage, rules, history, trigger)
3. Versionamento (versions table + columns)

**Novos arquivos** (~14):
- `src/lib/funnel-builder.functions.ts` (reorder, scoring CRUD, etapas CRUD)
- `src/lib/funnel-publish.functions.ts` (publish, rollback, preview token)
- `src/lib/lead-pipeline.functions.ts` (bulk move, apply rules)
- `src/lib/lead-scoring.ts` (motor puro, testável)
- `src/components/funnel/builder/StepsSidebar.tsx`
- `src/components/funnel/builder/QuestionsCanvas.tsx`
- `src/components/funnel/builder/ScoringTab.tsx`
- `src/components/funnel/builder/VersionsTab.tsx`
- `src/components/funnel/builder/PreviewButton.tsx`
- `src/components/leads/KanbanBoard.tsx`
- `src/components/leads/BulkActionsBar.tsx`
- `src/routes/_authenticated/app.funis.pipeline.regras.tsx`
- `src/lib/lead-scoring.test.ts`
- `src/lib/funnel-conditions.ts` (helper já planejado)

**Editados** (~6):
- `app.funis.$id.tsx`, `app.funis.leads.tsx`, `FunnelRunner.tsx`, `funil.$slug.tsx`, `types.ts`, `package.json`.

---

## Detalhes técnicos relevantes

- DnD: `useSortable` + `restrictToVerticalAxis`; persist em debounce 400ms.
- Scoring é determinístico e roda server-side em `submitDynamicFunnelLead` (não confiar em cliente).
- Pipeline trigger usa `SECURITY DEFINER` + `search_path=public` e roda BEFORE INSERT.
- Versão preview-only: token JWT curto assinado com `SUPABASE_SERVICE_ROLE_KEY` (HS256), validado em `getPublishedFunnel({ preview })`.
- Rollback é não-destrutivo: cria nova versão a partir do snapshot antigo (preserva histórico linear).

## Posso seguir?
