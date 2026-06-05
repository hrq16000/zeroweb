
# Plano de implementação

## Sprint atual — Tracking server-side (executar agora)

### 1. Middleware global em `src/start.ts`
Adicionar `visitorTrackingMiddleware` que roda **depois** de `globalBlockMiddleware`:

- Reusa o `shouldSkip(pathname)` existente (já filtra `.png/.jpg/.css/.js/.svg/_build/_server/assets/...`) → retorna `next()` imediato para assets.
- Lê cookie `0web_vid`. Se ausente, gera `crypto.randomUUID()` e seta:
  ```
  Set-Cookie: 0web_vid=<uuid>; Path=/; Max-Age=63072000; HttpOnly; Secure; SameSite=Lax
  ```
- Lê cookie `0web_consent_v1` (server-side). Se `analytics_storage !== "granted"` → usa `visitor_id` efêmero por request (não persiste cookie, não escreve no banco — apenas conta agregado opcional). Decisão: **pular o insert** quando consentimento negado.
- Extrai `cf-connecting-ip`, `cf-ipcountry`, `cf-ipcity`, `cf-ip-asn`, `user-agent`, `referer`, UTMs da query.
- Calcula `ip_hash` (sha256 com salt diário, mesmo padrão de `trackVisit`).
- Dispara `ctx.waitUntil(insertPromise)` via `getEvent().context.cloudflare?.ctx?.waitUntil(...)` (fallback: `void promise` se não disponível em dev local).
- Insert usa **upsert com chave composta** `onConflict: "ip_hash,day,path"` para 1 registro por (visitante × dia × pathname).

### 2. Migration — índice único para dedup por página
```sql
CREATE UNIQUE INDEX IF NOT EXISTS visitantes_rastreio_dedup_page
  ON public.visitantes_rastreio (ip_hash, day, path);
```
(complementa o índice existente `ip_hash,day` que dedup por visitante/dia inteiro)

### 3. Remover duplicação no client
- `src/components/site/AnalyticsBootstrap.tsx`: remover o bloco `void track({...})` e o `useServerFn(trackVisit)` — manter apenas a parte de GA4/GTM/consent.
- `trackVisit` server fn permanece (usada por outras rotas / fallback), mas não é mais chamada no bootstrap.

### 4. Consentimento
- Cookie `0web_consent_v1` já é gravado pelo `ConsentBanner` → expor via `document.cookie` (não-HttpOnly) para o middleware ler.
- Middleware: se negado, gera UUID efêmero (não persiste) e **não** insere.

---

## Próximos sprints sugeridos

### Sprint 20 — SEO Remoto (após autorizar Search Console)
- Sync diário de coverage/sitemap via cron `/api/public/hooks/seo-monitor`
- Painel admin com erros de indexação, CTR/posição por URL, alertas de queda
- Sitemap auto-submit ao Search Console

### Sprint 21 — Anti-bot reforçado
- Fingerprint client-side (canvas/WebGL hash) cruzado com `visitor_id`
- Blocklist por ASN datacenter (já tem base em `blocked_asns`) → UI admin para curar
- Rate-limit por fingerprint + IP combinado
- Challenge JS leve (proof-of-work) para IPs suspeitos

### Sprint 22 — CRM Kanban + Propostas PDF
- Drag-and-drop em `/app/crm` com colunas por `status`
- Gerador de proposta PDF a partir de `lead_submissions` + template
- Assinatura digital embutida (link único, audit trail)
- Disparo automático ao mudar status para "proposta_enviada"

### Sprint 23 — Alertas e webhooks
- TOTP real (QR + recovery codes) — completar Sprint 19
- Webhooks Slack/Discord para: anomalias, uptime <99%, leads quentes
- Digest diário por e-mail/WhatsApp do estado das integrações

### Sprint 24 — Performance & SEO técnico
- Preload da imagem LCP via `head().links` em rotas-chave
- Conversão de imagens bundled para AVIF/WebP via `vite-imagetools`
- Schema.org LD-JSON dinâmico (Organization, LocalBusiness, Service, Article)
- Core Web Vitals tracking dedicado em `visitor_events`

### Sprint 25 — Multi-tenant / White-label
- Aproveitar `portals` existente → tema/domínio por portal
- Admin por portal isolado via RLS (`has_portal_role`)
- Faturamento por portal (Stripe Connect)

---

## Decisões abertas
1. **Consentimento**: pular insert totalmente quando negado, ou inserir versão anonimizada (sem `ip_hash`, sem UTMs)? Recomendo pular.
2. **Dedup**: chave `(ip_hash, day, path)` vs `(visitor_id_cookie, day, path)`? Cookie é mais estável (sobrevive a mudança de IP no mobile). Recomendo migrar para `visitor_id` do cookie.
3. **Ordem dos próximos sprints**: confirmar prioridade — sugiro 20 (SEO) → 22 (CRM/PDF) → 21 (anti-bot) → 23 → 24.

Aprove para eu executar o Sprint atual e me diga qual dos próximos atacar em seguida.
