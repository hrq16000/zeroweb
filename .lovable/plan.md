## Escopo aprovado

Quatro frentes em uma única entrega. GSC fica como stub manual (importação CSV + endpoint webhook), sem connector OAuth por enquanto.

---

### 1) Atribuição consistente (source/channel/UTM)

Fonte única já existe em `src/lib/lead-attribution.ts`. Vou:

- **Persistir snapshot de atribuição em `sessionStorage`** no momento do submit do form (`ContactFormWhatsApp`, `DiagnosticForm`, `WaFunnelModal`, `FunnelRunner`), com TTL e chave `0web_last_lead_attr_v1`.
- **`/obrigado`** lê esse snapshot (fallback para query params `?source=`) — garante consistência após refresh e back navigation, mesmo quando UTM já saiu da URL.
- **`ThankYouModal`** passa a derivar `source/channel/utm` do mesmo snapshot quando aberto após submit (hoje só usa prop `source`).
- **`useWhatsappTracking`** (return fallback) já recebe baseParams; vou garantir que `whatsapp_return` carrega `source/channel/utm` idênticos ao `whatsapp_click` original (snapshot por click em ref).
- **GA4/Pixel**: padronizar `attributionToEventParams()` como única função que monta payload de evento — auditar `trackConversion` calls em modal, /obrigado, WA hook, FunnelRunner para usar.
- **Testes**: arquivo `src/lib/lead-attribution.test.ts` cobrindo merge de UTMs, fallback de query param, TTL do snapshot.

### 2) Painel /indexacao ↔ Search Console (stub manual)

Sem OAuth agora. Entrego a fundação para ligar depois:

- **Importação CSV** no painel `/app/indexacao`: upload do export padrão GSC (Coverage → Export), parse client-side, chamada a `upsertIndexIssue` em lote.
- **Endpoint webhook** `src/routes/api/public/hooks/gsc-ingest.ts` autenticado por HMAC (`GSC_INGEST_SECRET`) — pronto para receber jobs externos (Apps Script, n8n) que façam o pull do GSC e empurrem o CSV/JSON.
- **Campo `source`** já existe na tabela; vou usar `'gsc_csv'` / `'gsc_webhook'` para distinguir do `'manual'`.

### 3) Alertas de queda de cobertura + detalhe por URL

- **Snapshot diário**: nova tabela `index_coverage_snapshots` (day, issue_type, count, open_count) populada por cron `src/routes/api/public/hooks/index-coverage-snapshot.ts` (HMAC).
- **Detector de anomalia**: server fn `checkIndexCoverageDrops` compara últimas 24h vs média 7d por `issue_type`; se queda > 30% **ou** alta > 50% em volume de novos issues, grava em `anomaly_alerts` (já existe) com `kind='index_coverage'`.
- **UI no `/app/indexacao`**: faixa de alertas no topo + botão "verificar agora".
- **Página de detalhe** `src/routes/_authenticated/app.indexacao.$urlId.tsx`:
  - Histórico de detecções/resoluções do issue (lista cronológica).
  - Evidências de schema (fetch da URL via server fn, extrai JSON-LD do HTML, mostra blocos `Organization/LocalBusiness/Product/etc`).
  - Ações sugeridas por tipo (404 → adicionar redirect 301; soft 404 → revisar conteúdo; redirect chain → consolidar; noindex → revisar meta robots), com link direto pro admin de redirects quando aplicável.

### 4) Taxonomia de eventos do /obrigado

Documento canônico + implementação alinhada:

- **`src/lib/event-taxonomy.ts`**: dicionário tipado com `THANK_YOU_EVENTS` (nome exato, params obrigatórios/opcionais, mapeamento Pixel).
- **Eventos**:
  - `thank_you_view` — pageview do funil de obrigado (modal ou rota). Params: `source, channel, utm_*, surface (modal|page)`.
  - `thank_you_cta_plans` — clique no card Planos. Params base + `cta_id=plans, position, target=/planos`.
  - `thank_you_cta_faq` — clique no FAQ. Params base + `cta_id=faq, target=/faq`.
  - `thank_you_cta_diagnostico` — clique no CTA final (diagnóstico/orçamento). Params base + `cta_id=diagnostico, target=<dinâmico>`.
  - `thank_you_cta_whatsapp` — clique WhatsApp do obrigado. Params base + `location=thankyou_<channel>`.
  - `thank_you_dismiss` — fecha modal sem clicar.
- **Mapeamento Pixel**: cada evento mapeado para `fbq('trackCustom', ...)` com mesmo nome + `Lead` padrão no `thank_you_view`.
- **Refatorar** `ThankYouModal` e `src/routes/obrigado.tsx` para usar as constantes da taxonomia.
- **Docs**: bloco JSDoc + tabela em comentário no topo do arquivo (GTM-ready).

---

### Arquivos previstos

**Novos**
- `src/lib/event-taxonomy.ts`
- `src/lib/lead-attribution-snapshot.ts`
- `src/lib/lead-attribution.test.ts`
- `src/lib/gsc-csv.ts` (parser)
- `src/lib/index-coverage-detail.functions.ts` (detalhe + schema scrape)
- `src/lib/index-coverage-alerts.functions.ts` (detector)
- `src/routes/_authenticated/app.indexacao.$urlId.tsx`
- `src/routes/api/public/hooks/gsc-ingest.ts`
- `src/routes/api/public/hooks/index-coverage-snapshot.ts`
- Migração: `index_coverage_snapshots` + GRANTs

**Editados**
- `src/components/site/ThankYouModal.tsx` (snapshot + taxonomia)
- `src/components/site/ContactFormWhatsApp.tsx` (gravar snapshot)
- `src/components/site/DiagnosticForm.tsx` (idem)
- `src/components/site/WaFunnelModal.tsx` (idem)
- `src/components/funnel/FunnelRunner.tsx` (idem)
- `src/lib/use-whatsapp-tracking.ts` (snapshot por click)
- `src/lib/lead-attribution.ts` (read/write snapshot)
- `src/routes/obrigado.tsx` (consumir snapshot + taxonomia)
- `src/routes/_authenticated/app.indexacao.tsx` (upload CSV, alertas, link p/ detalhe)

**Segredo necessário**: `GSC_INGEST_SECRET` (HMAC do webhook). Pedirei via `add_secret` após aprovação do plano.

### Detalhes técnicos

- O snapshot vai em `sessionStorage` (não localStorage) para não vazar entre abas/usuários, com `{ value, expires_at }` (TTL 30min).
- O parser CSV usa apenas APIs do browser (sem dep nova) — formato GSC: `URL, Last crawled, Issue type, ...`.
- O scrape de schema no detalhe usa `fetch` server-side com timeout 5s e extrai `<script type="application/ld+json">`.
- Detector de queda usa janela móvel; thresholds configuráveis via `app_settings` (chave `index_coverage_alert_thresholds`).
- Eventos novos não quebram dashboards existentes — `thank_you_cta_click` legacy continua sendo emitido em paralelo durante 1 sprint, com flag `legacy=true`.
- Os 3 findings de segurança (companies/providers/reviews PII em policies públicas) serão tratados no final via views públicas sem PII + restrição das policies — vou perguntar antes se preferir esconder os campos para anônimos ou pedir autenticação.

Posso seguir?
