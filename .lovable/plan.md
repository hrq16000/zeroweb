# Plano em rodadas (1 por vez)

Cada rodada termina entregável, testável e independente. Você aprova → eu executo → seguimos para a próxima.

---

## Rodada 1 — Catálogo /servicos com imagens reais

**Objetivo:** cada card mostra a imagem única do registro do serviço; cada card abre `/servicos/{slug}`; o detalhe usa a mesma imagem em destaque.

- Validar `<Link to="/servicos/$slug" params>` em todos os cards (sem `href` quebrado).
- Garantir `imageUrl` (signed URL 7 dias) populado para todos os registros ativos; serviços sem `image_path` recebem um placeholder neutro com aviso no admin (não imagem genérica de IA).
- No detalhe `/servicos/$slug`: mover hero image para acima da fold (depois do H1, antes do CTA) com `loading="eager"` + `fetchpriority="high"` e `aspect-ratio` reservado para evitar CLS.
- Sincronizar `og:image`, `twitter:image` e `Service.image` com a mesma URL.
- Script de auditoria: listar serviços ativos sem `image_path` (saída no admin /app/servicos).

---

## Rodada 2 — SEO: Lighthouse + Rich Results

- Rodar Lighthouse (workflow já tem as URLs) e Rich Results para `/servicos` e `/servicos/criacao-de-sites`.
- Auditar duplicidade de `BreadcrumbList` e `FAQPage` no `@graph`:
  - `/servicos` mantém um único `FAQPage` agregado + um `FAQPage` Site Express (com `@id` distinto e `about`).
  - `/servicos/{slug}` só emite `FAQPage` se o serviço tiver FAQ próprio; sem reaproveitar perguntas do hub.
  - `BreadcrumbList` apenas no leaf (`/servicos/{slug}`) e no hub, nunca no `__root`.
- Validar canonical único por rota com `scripts/validate-canonicals.mjs`.

---

## Rodada 3 — /obrigado + persistência de leads

- Migration `lead_submissions` já existe; adicionar:
  - `dedup_key` (hash email|phone normalizados) com índice único parcial.
  - Trigger `leads_dedup_same_day` já trata o caso; estender para dedup global por 30 dias.
  - Enum `lead_status`: `novo`, `contatado`, `qualificado`, `descartado`.
- Server fn `submitLead` com Zod (nome, email, telefone BR, mensagem, consentimento LGPD).
- Página `/obrigado?lead=<id>`: resumo dos dados enviados (lendo apenas campos públicos) + CTA WhatsApp + JSON-LD `ContactPage`.
- Redirect após submit do formulário principal.

---

## Rodada 4 — Painel /app/indexacao (export + ações)

- Filtros: tipo de issue, período, status (já existem? confirmar).
- Botão **Exportar CSV** (server fn → stream) e **Exportar PDF** (server fn com `@react-pdf/renderer` ou HTML → render no cliente).
- Em `/app/indexacao/$urlId`:
  - Botões de ação sugerida: "Revisar canonical", "Atualizar robots/meta", "Marcar redirect aplicado", "Reenviar para Search Console".
  - Cada ação grava em `index_coverage_actions` (nova tabela: `id`, `url_id`, `action`, `actor`, `notes`, `created_at`).
  - Checklist visual derivado das ações já registradas + histórico cronológico.

---

## Rodada 5 — Tracking GA4 + página /solicitar-diagnostico

- Eventos GA4 (via `trackEvent` existente):
  - `funnel_step_view` (step_id, step_index, form_id).
  - `funnel_time_on_step` (segundos, disparado em blur/navegação).
  - `diagnostico_wa_click` (separado do `cta_click` genérico).
- Página `/solicitar-diagnostico`: medir tempo total na página com `performance.now()`, enviar `diagnostico_page_dwell` no `beforeunload`.
- Mirror Meta Pixel: `Lead` no envio + `CustomEvent` por step.

---

## Rodada 6 — Debug admin + atribuição via cookie

- **Debug ao vivo** em `/app/admin` (nova aba "Eventos"):
  - Hook `useEventStream` espelha `trackEvent`/`trackConversion` num `BroadcastChannel` + ring buffer (últimos 100).
  - Tabela em tempo real: timestamp, evento, params, destino (GA4/Meta), status (sent/queued/failed).
  - Filtro por prefixo `thank_you_*` e botão "Limpar".
- **Atribuição persistente:**
  - Cookie `0web_attr` (1ª-party, SameSite=Lax, 90 dias) com `{source, medium, campaign, content, term, gclid, fbclid, ts}`.
  - Hierarquia de leitura: URL > sessionStorage > cookie > default.
  - Persistido também via server fn (para SSR ler antes do hydrate).
  - Refresh de dispositivo e back/forward preservam atribuição.

---

## Detalhes técnicos compartilhados

- Server fns sempre em `*.functions.ts` (nunca em `src/server/`).
- Loaders públicos com `errorComponent` + `notFoundComponent`.
- RLS: `lead_submissions` mantém `INSERT` para `anon` com rate-limit por IP (`check_and_record_rate_limit`); `SELECT` apenas para `authenticated` com `has_role('admin')` ou `'admin_integrations'`.
- Storage: `service-images` continua privado; URLs assinadas geradas server-side.
- Sem segredos novos.

---

**Aprovação:** confirme "começar pela Rodada 1" (ou ajustes) e eu sigo.
