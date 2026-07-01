# Plano de Execução — Consolidação 0web.com.br

Você pediu ~25 itens. Vou entregar em ondas priorizadas por impacto/risco. Cada onda é auto-contida (pode ir ao ar) e valida a próxima.

## Onda 1 — Segurança & Infra crítica (bloqueadora)
Objetivo: eliminar findings ativos e destravar entregas do CMS.

1. **RLS de PII** — `companies`, `providers` e `service_catalog`
   - Remover policies `... public read active` e `service_catalog_read` (USING true).
   - Criar view pública `public.companies_public` / `public.providers_public` projetando somente colunas seguras (nome, slug, categoria, cidade, rating, avatar) — sem `email`, `phone`, `whatsapp`, `cnpj`.
   - Nova SELECT policy `TO anon` restrita à view (via SECURITY INVOKER + grant). Leitura autenticada continua vendo tudo.
   - `service_catalog`: SELECT apenas para `authenticated` + admin.
   - Atualizar `.functions.ts` públicos para consultar as views.

2. **Proxy de imagens** — `src/routes/api/public/landing-image.$page.$file.tsx`
   - Server route com allow-list (`page ∈ {site-express, site-pro, trafego-pago, ...}`), validação de `file` por regex `^[a-z0-9-]+\.(webp|jpg|png)$`.
   - `supabaseAdmin.storage.from("service-images").createSignedUrl` (5 min) → refetch e stream com `Cache-Control: public, max-age=31536000, immutable` + `Content-Type` correto + `ETag`.
   - Fallback 404 -> `og-default.jpg`.

3. **URLs de preview** — publish + retornar `x-deployment-id` de `zeroweb.lovable.app`, `id-preview--*.lovable.app` e `0web.com.br` para você diferenciar.

## Onda 2 — Performance / CWV
4. **Hydration mismatch em `FeaturedServices`**
   - Mover `services-nav` para o `loader` da rota Home via `queryOptions` (`ensureQueryData`) → SSR renderiza itens ou nada de forma determinística.
   - Remover flag `on("featured_services")` inconsistente entre SSR/CSR — passa a depender só de dado do loader.

5. **Quebrar mega-Suspense da Home**
   - Dividir em 4 chunks lógicos: `HeroBlock` (SSR), `PitchBlock` (Problems/Loss/Solutions), `ProofBlock` (Cases/Stats/Testimonials/SocialProof), `ConvertBlock` (Plans/Process/CTA). Cada um com `<Suspense fallback={<Skel/>}>` próprio.
   - `IntersectionObserver` para montar `ProofBlock`/`ConvertBlock` só quando `~600px` do viewport.

6. **Unificar listeners de scroll**
   - Criar `src/lib/scroll-bus.ts`: um único `scroll` listener com `{ passive: true }` + `requestAnimationFrame` throttle publicando `{ y, dir, pct, viewportEnter }` para subscribers.
   - Reescrever `ScrollTracker`, `SocialProof` e `ExitIntent` como subscribers (sem listeners próprios).

7. **WebP + placeholders**
   - Habilitar `vite-imagetools` para assets locais; helpers `?w=800;1200&format=webp;jpg&as=picture`.
   - `<Picture>` wrapper com `aspect-ratio` + LQIP blur (`?w=24&blur=20`).
   - Preload apenas do LCP da rota atual.

## Onda 3 — Admin CMS (gerenciamento 100%)
8. **Painel `/app/landing-overrides`**
   - Lista por `page/key` (FAQ, benefits, pricing, gallery, seo).
   - Editor dinâmico com JSON Schema por key (`zod` no client + server fn `saveLandingOverride` validando antes de gravar). JSON inválido → toast + bloqueio.
   - Fluxo `draft → publish → unpublish` com histórico (coluna `published_value` + `draft_value` já existente).
   - Preview em iframe apontando `/servicos/<slug>?preview=<id>`.

9. **CRUD unificado de serviços em `/app/servicos`**
   - Formulário completo: nome, slug, short/long description, cover, galeria, `price_from`, `price_ref`, `sla_days`, condições, tags, meta (title/description/canonical/og), flags (`show_in_home_featured`, `show_in_catalog`).
   - Bulk edit + drag-and-drop para `display_order`.
   - `sanitize_public` mantém a normalização já existente.

10. **Padronizar pricing eyebrow** — Tráfego Pago, Consultoria, GMN
    - Novo componente `<PricingHero eyebrow="a partir de R$" from={...} note="Mídia à parte">` reaproveitável (mesmo do Site Pro).
    - Aplicar em 3 rotas; dados vêm de `services` (não hardcoded).

11. **Reestruturar Site 24h × Site Express**
    - Site 24h: foco em **agilidade** (SLA, escopo enxuto de 1 página, entrega expressa).
    - Site Express: foco em **turnkey profissional** (até 5 páginas, revisões, blog).
    - Duas seções `Diferenças` cruzadas + tabela comparativa dinâmica de `services`.

## Onda 4 — Calculadora de Orçamento (CRO)
12. Validações Zod + `useForm`, estados `idle|loading|error|success`, mensagens amigáveis.
13. Seção **Detalhamento** no resultado: tabela itens × faixas × período × estimativa mensal, chart mini-bar.
14. Formulário pós-resultado (nome, email, empresa, checkbox LGPD) → `POST /api/public/crm-webhook` com HMAC + insert em `lead_submissions` (source=`calculadora`).
15. Schema.org `SoftwareApplication` + `FAQPage` + `BreadcrumbList` + meta específicos.
16. A/B test em H1/bullets/CTA WhatsApp (3 variantes) via `experiments` + tracking.

## Onda 5 — SEO contínuo & Discover
17. **Snippets em destaque**: bloco de resposta curta (`<p><strong>...`) + `<ul>`/`<ol>` no topo dos artigos-alvo (SEO, Tráfego Pago, Sites); JSON-LD `Question`/`HowTo`.
18. **NewsArticle**: seção `/blog/noticias` com schema `NewsArticle`, `datePublished`, `dateModified`, autor, publisher, imagem 1200×675.
19. **Monitor de canibalização semanal**: server route `/api/public/cron/canonicals` (auth via `CRON_SECRET`) que consulta pares (`/seo` × `/servicos/seo` etc), avalia sobreposição de queries via Search Console API (quando conectada) e grava alertas em `seo_audit_history`. Painel `/app/seo-auditoria` ganha aba **Canibalização** com sugestão de merge + 301.
20. **Refresh a cada 15 dias**: worker `/api/public/cron/content-refresh` marca artigos com `updated_at < now()-15d` como `needs_refresh=true` e envia notificação ao admin.
21. **Sitemap & interlinking do cluster educativo**: script `scripts/validate-cluster-links.mjs` (varre `blog-data`, `content-taxonomy`, `sitemap-*.xml`) e falha se algum artigo não estiver indexável ou sem link recíproco.

## Onda 6 — CRO extra
22. **Exit-intent com oferta “Orçamento em 30 min via WhatsApp”** em rotas de serviço/calculadora; tracking `experiments`.
23. **Google Business Profile scheduler** — `/app/gbp`
    - Tabela `gbp_posts (id, scheduled_at, body, cta, media_url, status)` + `gbp_qa (id, question, answer, published_at)`.
    - Cron `/api/public/cron/gbp-publish` chama Google Business Profile API (secret `GBP_REFRESH_TOKEN` a solicitar).
    - Painel com editor semanal (3 posts/semana), fila e log de respostas às perguntas.

## Onda 7 — CI/CD Gates
24. **GitHub Action `deploy-gates.yml`** com jobs em série:
    - `validate-jsonld` → `bun run scripts/validate-jsonld.mjs`
    - `validate-offers` → `node scripts/validate-public-offers.mjs $PREVIEW_URL`
    - `validate-cluster-links`
    - `lhci` → Lighthouse CI com budgets (LCP<2.5s, CLS<0.1, TBT<200ms, SEO≥95, A11y≥95). Falha → bloqueia publish.
    - Upload de artefatos em `lhci_runs` (tabela já existe) + comentário no PR.
25. **Alertas de regressão**: server fn `notifyLighthouseRegression` compara com baseline em `lhci_runs`, dispara e-mail/WhatsApp via UAZAPI quando score cai > 5 pts.

## Onda 8 — Verificação
26. Teste E2E Playwright: navegação entre 5 rotas + âncoras, valida `window.scrollY===0` ao trocar rota e persistência do LeadWidget. Screenshot antes/depois.
27. Lighthouse mobile em `/`, `/servicos`, `/servicos/site-express`, `/blog`, `/calculadora-orcamento`. Relatório HTML consolidado em `/admin/lighthouse`.

---

## Sequenciamento sugerido de execução
Vou executar agora, nesta ordem, parando para você validar após cada onda:

1. **Ondas 1 + 2** juntas (segurança + hydration + scroll bus + proxy imagens + preview URLs). ← começo por aqui
2. Ondas 3 + 4 (admin CMS + calculadora).
3. Ondas 5 + 6 (SEO contínuo + GBP + exit intent).
4. Ondas 7 + 8 (gates CI + verificação).

## Detalhes técnicos relevantes
- Novas rotas server: `/api/public/landing-image/$page/$file`, `/api/public/crm-webhook`, `/api/public/cron/canonicals`, `/api/public/cron/content-refresh`, `/api/public/cron/gbp-publish` — todas com verificação HMAC/`CRON_SECRET` e input validado com Zod.
- Novas migrations: views `companies_public` / `providers_public`, tabelas `gbp_posts`, `gbp_qa`, colunas `services.meta_*`.
- Novos secrets a solicitar via `add_secret`: `LANDING_IMAGE_SIGNING_KEY`, `CRM_WEBHOOK_URL`, `GBP_REFRESH_TOKEN`, `LHCI_SERVER_TOKEN`.
- Nenhum arquivo autogerado (`routeTree.gen.ts`, `types.ts`, `client.ts`) será tocado.

## Fora deste plano (para não inflar)
- Migração para Cloudflare Images (fica no runbook existente).
- Rewriting completo do editorial-review (mantém o painel atual).

Confirmo e sigo pela **Onda 1 + 2** assim que você aprovar.