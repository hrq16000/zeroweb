## Contexto

O projeto **já tem** boa parte da fundação:

- Tabelas `dynamic_forms`, `dynamic_form_questions`, `dynamic_form_conditions`, `dynamic_form_leads` com RLS.
- Builder admin em `/app/funis/$id` e listagem em `/app/funis`.
- `FunnelRunner.tsx` que executa formulários.
- 1 form publicado: `diagnostico-0web` (Diagnóstico Digital 0web).

Faltam: **conceito de "Etapa/Step"**, **drag & drop** real, **lógica condicional na UI do builder**, **runner com transições/progress bar refinados**, **captura de geo-IP no servidor**, **mensagem WhatsApp hierárquica**, **seed dos 13 campos pedidos**.

## Mudanças no banco

1 migration:

- Adicionar `step_index INT NOT NULL DEFAULT 0` em `dynamic_form_questions` (campos de uma mesma `step_index` aparecem na mesma tela).
- Adicionar tabela `dynamic_form_steps(id, form_id, order_index, title, subtitle, cta_label)` para títulos/CTA por etapa (opcional — se uma etapa não tiver row, usa defaults).
- Adicionar em `dynamic_form_leads`: `ip_address inet`, `isp text`, `geo_city text`, `geo_region text`, `geo_country text`, `user_agent text`, `referer text`, `utm_json jsonb`.
- Seed do funil `diagnostico-0web` com as 13 perguntas pedidas, agrupadas em 2 etapas, com options dos selects pré-preenchidos.

GRANTs e RLS já existentes cobrem; só ajustar policies para incluir nova tabela `dynamic_form_steps` (admin manage + public read quando form published).

## Server functions (novas)

Em `src/lib/funnel.functions.ts`:

- `submitDynamicFunnelLead({ formId, answers, clientMeta })` — pública (sem auth). Lê IP do header (`getRequestIP`), faz fetch em `https://ipapi.co/{ip}/json/` (ou ip-api.com como fallback) para enriquecer `isp/city/region/country`, persiste em `dynamic_form_leads` via `supabaseAdmin`, dispara o alerta WhatsApp existente (UAZAPI), retorna `{ leadId, waUserUrl }`.
- `getPublishedFunnel({ slug })` — pública, retorna form + steps + questions + conditions de forma agrupada.

A formatação da mensagem WhatsApp (hierárquica, com `*negrito*`, quebras, seção "📋 Respostas" + "🌐 Metadados") fica num helper puro `src/lib/funnel-wa-message.ts` para ser testável.

## Builder admin (refatorar `app.funis.$id.tsx`)

UI dividida em 3 zonas:

```text
┌─────────────────┬──────────────────────────┬──────────────────┐
│ Sidebar Etapas  │ Canvas (campos da etapa) │ Inspector campo  │
│ + drag/reorder  │ + drag/reorder de campos │ (label/options/  │
│                 │                          │  validação/      │
│                 │                          │  condições)      │
└─────────────────┴──────────────────────────┴──────────────────┘
```

- Drag & drop com `@dnd-kit/core` + `@dnd-kit/sortable` (já são leves; instalar).
- Inspector com aba "Condições" que cria rows em `dynamic_form_conditions` (operador, valor, action `skip_to`/`end_form`).
- Botão "Pré-visualizar" abre o runner em modo preview.
- Toggle de status draft/published direto no header.

## Runner (refatorar `FunnelRunner.tsx`)

- Dark mode sofisticado com tokens do `src/styles.css` (verde esmeralda + azul claro já existem como `--success`/`--info`-like; adicionar se faltar).
- Barra de progresso fixa no topo ("Etapa X de N").
- Transições com `framer-motion` (já no projeto) — fade/slide entre etapas.
- Radio renderizado como **cards clicáveis** grandes (mobile-first, min-height 56px).
- Validação por etapa usando `zod` (já no projeto). Botão "Continuar" desabilitado até passar.
- Avaliador de condições: ao mudar resposta, recomputa quais perguntas/etapas estão visíveis e qual é o "skip_to".
- CTA final muda label para "QUERO MAIS CLIENTES" (configurável via `whatsapp_config.final_cta`).
- Ao submeter: chama `submitDynamicFunnelLead`, depois `window.location.href = waUserUrl` (wa.me já formatado).

## Página pública

Rota nova `src/routes/funil.$slug.tsx` (pública, SSR) — renderiza `<FunnelRunner slug={slug} />`. Reaproveita captura de UTM do `lead-attribution-snapshot.ts`.

## Arquivos

**Novos**
- `supabase/migrations/<ts>_funnel_steps_geo.sql`
- `src/lib/funnel.functions.ts`
- `src/lib/funnel-wa-message.ts` (+ teste)
- `src/lib/funnel-conditions.ts` (avaliador puro + teste)
- `src/components/funnel/builder/StepsSidebar.tsx`
- `src/components/funnel/builder/FieldCanvas.tsx`
- `src/components/funnel/builder/FieldInspector.tsx`
- `src/components/funnel/builder/ConditionsEditor.tsx`
- `src/routes/funil.$slug.tsx`

**Editados**
- `src/components/funnel/FunnelRunner.tsx` (steps + progress + framer + cards radio + zod)
- `src/routes/_authenticated/app.funis.$id.tsx` (nova UI 3 zonas)
- `src/routes/_authenticated/app.funis.leads.tsx` (mostrar geo/ISP/UTM nos detalhes)
- `src/integrations/supabase/types.ts` (regen após migration)
- `package.json` (dnd-kit)

## Stack & decisões técnicas

- **Banco**: continua Postgres (Supabase). `answers_json` em JSONB já cobre flexibilidade.
- **Geo-IP**: `ipapi.co` (free tier 1k/dia, sem chave); fallback `ip-api.com`. Roda no server (TanStack server fn) — não vaza no cliente.
- **WhatsApp**: usa `UAZAPI_*` secrets já configurados para alerta interno + `wa.me/<numero>?text=` para redirecionar o lead.
- **Drag & drop**: `@dnd-kit` (acessível, leve, suportado em workers/edge).

## Ordem de execução

1. Migration + seed (gera approval) → tipos regenerados.
2. Helpers puros (`funnel-wa-message`, `funnel-conditions`) + testes.
3. Server functions (`funnel.functions.ts`).
4. Runner refatorado + rota pública.
5. Builder admin (drag&drop + inspector + condições).
6. Lista de leads enriquecida.

Posso seguir?