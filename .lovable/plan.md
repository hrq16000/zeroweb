## Já está pronto no projeto (não vou refazer — seria regressão)

| Pedido | Status | Onde |
| --- | --- | --- |
| Header dropdown de serviços do banco (`show_in_menu` + `display_order`) | ✅ | `src/components/site/Header.tsx` consome `listServicesNav()` |
| Footer lê `show_in_footer` ordenado | ✅ | `src/components/site/Footer.tsx` |
| Grade de 4 cards na home (`show_in_home_featured`) com imagem real + CTA | ✅ | `src/components/site/FeaturedServices.tsx` |
| `sitemap-services.xml` respeita `show_in_sitemap` | ✅ | `src/routes/sitemap-services[.]xml.ts` |
| `ServiceCTA` com funil por local + fallback `funnels.default` | ✅ | `src/components/site/ServiceCTA.tsx` |
| Painel admin permite editar `show_in_*`, `display_order`, `funnels`, checklist de publicação | ✅ | `src/routes/_authenticated/app.servicos.tsx` (ondas anteriores) |
| Carrinho drawer + Add-to-cart + login nudge Google | ✅ | `CartDrawer.tsx`, `AddToCartButton.tsx`, `cart.ts` |
| Campos comerciais (`price`, `pricePeriod`, `deliveryDays`, `conditions`) na vitrine e no detalhe | ✅ | `servicos.index.tsx` linhas 501-513, `servicos.$slug.tsx` linhas 130-205 |
| Categorias e itens relacionados no catálogo com Add-to-cart | ✅ | `servicos.index.tsx` (filtros por categoria) + `RelatedLinksGrid.tsx` |
| Tela admin de leads/visitas por etapa do funil | ✅ parcial | `/app/usuarios` (aba Leads/Funis) + `/app/dynamic-funnels` |

## Próxima onda (executo agora, sem perguntar)

Foco em 3 entregas pequenas, independentes, todas plugadas ao admin:

### Onda A — Histórico persistido de seo-diff + auditoria legacy
- Migração: tabela `seo_audit_history` (`id`, `kind` enum `seo_diff|legacy_links`, `ran_at`, `summary jsonb`, `details jsonb`, `delta_pct`, `status`, `approved_by`, `approved_at`, `notes`) + GRANTs + RLS admin-only.
- ServerFn `adminListSeoAuditHistory` (filtros por data/kind/status) e `adminApproveSeoAudit({id, approved})`.
- Os scripts `scripts/run-seo-diff.mjs` e a serverFn de legacy-audit passam a gravar 1 row por execução.
- UI em `/app/seo-404s` ganha aba "Histórico" com tabela + filtros + botão "Aprovar".

### Onda B — Checkout ligado ao funil do carrinho
- Migração: tabela `cart_funnel_progress` (`id`, `user_id`, `visitor_id`, `step`, `cart_snapshot jsonb`, `payment_status`, `payment_channel` enum `site|whatsapp`, `updated_at`) + GRANTs + RLS por `auth.uid()` / admin.
- ServerFn `saveCartFunnelStep` chamada pelo `CartDrawer` e por `checkout.tsx` em cada transição.
- Webhook Stripe (já existente em `routes/api/public/hooks/stripe.ts`) atualiza `payment_status` para `paid|failed`.
- O drawer "Finalizar pelo WhatsApp" marca `payment_channel=whatsapp` e `step=handoff_whatsapp`.
- Aparece em `/app/usuarios` → drawer do usuário → nova aba "Carrinho/Funil".

### Onda C — QA + SEO finais
- Rodo `scripts/smoke-servicos.mjs`, `scripts/validate-canonicals.mjs`, `scripts/validate-jsonld.mjs`, `scripts/validate-catalog-images.mjs` e `scripts/validate-sitemaps.mjs` em paralelo.
- Corrijo o que vier vermelho (links mortos, scroll-to-top, schema FAQ ausente em algum slug).
- Se Lighthouse já roda no CI, só anoto resultado; não vou re-orquestrar.

### Fora desta onda (regressão)
- Refazer Header/Footer/Featured/CTA/cart/checklist — já existem.
- Tela nova de "leads por etapa" do zero — `/app/usuarios` e `/app/dynamic-funnels` já cobrem; vou só adicionar link cruzado se faltar.
- Trocar provider de pagamento — escopo separado.

Critério de pronto por onda: migração aplicada, serverFn protegida por admin role, UI plugada ao painel, build verde.
