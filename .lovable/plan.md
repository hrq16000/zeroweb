# Plano de execução — 1 etapa por vez

Vou executar os passos abaixo em ordem. Ao final de cada etapa, te aviso e sigo para a próxima (ou paro se você pedir).

## Etapa 1 — Rastreamento e indexação (código)
- Auditar `src/lib/canonical-redirect.helpers.ts` + tabela `redirects` no banco e eliminar cadeias (A→B→C) achatando para A→C; remover self-loops.
- Varrer todas as rotas `redirect(...)` em `src/routes/*` e garantir 301 direto para a URL final viva (sem hops).
- Atualizar `public/robots.txt`:
  - manter `Disallow` só em `/app`, `/auth`, `/painel*`, `/qa-events`, `/r/`, `/api/` (admin).
  - **liberar explicitamente** assets: `Allow: /assets/`, `Allow: /*.css$`, `Allow: /*.js$`, `Allow: /*.webp$`, `Allow: /*.png$`, `Allow: /*.jpg$`, `Allow: /*.svg$`, `Allow: /*.woff2$`.
- Revalidar `src/routes/sitemap[.]xml.ts` + sub-sitemaps: incluir todas as rotas vivas (incl. `/blog-skyscraper`, `/calculadora-orcamento`), remover URLs 404/redirecionadas.
- Rodar `scripts/validate-legacy-301.mjs` e `scripts/validate-sitemaps.mjs` para confirmar 0 erros.

## Etapa 2 — Schemas estruturados (JSON-LD)
- `__root.tsx` já tem **Organization + LocalBusiness + WebSite** ✅ (manter).
- Garantir **Service** schema em todas as `/servicos/*` (criar helper `buildServiceSchema()` e injetar via `head().scripts`).
- Garantir **FAQPage** em rotas com FAQ (`/faq`, serviços com bloco FAQ, blog cluster).
- Garantir **Article + BreadcrumbList** em `/blog/$slug`, `/blog-skyscraper/$slug`, `/cases/$slug`.
- Garantir **LocalBusiness** repetido com `areaServed` específico em páginas de cidade/bairro (`/cidade/$slug`, `/bairros-cwb/$slug`, `/bairros-bh/$slug`).
- Validar tudo com `scripts/validate-jsonld.mjs` e `scripts/validate-schemas.mjs`.

## Etapa 3 — Performance (LCP < 2.5s / CLS < 0.1 mobile)
- Habilitar `vite-imagetools` no `vite.config.ts` e migrar imagens hero/capa para `?format=webp&w=...`.
- Adicionar `<link rel="preload" as="image">` para o LCP em `head()` de `index.tsx`, `/servicos/$slug`, `/blog/$slug`.
- Definir `width`/`height` explícitos em toda `<img>` de Hero/Featured (corrige CLS).
- `loading="lazy"` + `decoding="async"` em imagens below-the-fold.
- Cache headers nas rotas estáticas/sitemaps (já parcial — padronizar `Cache-Control: public, max-age=3600, s-maxage=86400`).
- Rodar `browser--performance_profile` antes/depois para confirmar metas.

## Etapa 4 — Checklist operacional (entrego como markdown, você executa)
**Cloudflare:**
- Ativar proxy laranja no DNS de `0web.com.br`.
- SSL/TLS → Full (strict).
- Speed → Brotli ON, Early Hints ON, Rocket Loader OFF (quebra TanStack).
- Caching → Cache Rules: `*.css *.js *.woff2 *.webp *.png *.jpg` → Edge TTL 1 mês.
- Speed → Optimization → Polish: Lossy + WebP.
- Rules → Page Rules: `0web.com.br/sitemap*.xml` → Edge Cache TTL 1h.

**Google Business Profile (Perfil da Empresa):**
- Calendário editorial semanal (3 posts/sem): Segunda = oferta, Quarta = case, Sexta = dica/educacional. Templates prontos.
- Q&A: pré-publicar 10 perguntas frequentes (com respostas) no próprio perfil.
- Fotos: 8 categorias obrigatórias (fachada, equipe, bastidores, antes/depois de site, reunião, escritório, logo, capa). Mínimo 20 fotos iniciais.
- Resposta a avaliações em até 24h (template positivo/negativo).

## Diagnóstico técnico (referência)
- Helpers existentes: `src/lib/canonical-redirect.helpers.ts` (chains/loops já detectados), `scripts/validate-*.mjs` (8 validadores prontos), `src/routes/sitemap[.]xml.ts` (índice com 12 sub-sitemaps).
- Sem necessidade de novas dependências exceto `vite-imagetools` (Etapa 3).
- Sem mudanças de banco; sem mudanças em auth.

---
**Vou começar pela Etapa 1.** Me responde "ok" para eu seguir, ou diga para pular/reordenar.
---
## Status atualizado

- **Etapa 1 (Indexação/Redirects)** — concluída.
- **Etapa 2 (Schemas)** — concluída: hreflang pt-BR + x-default e Service.url/serviceType nas rotas que falhavam; LocalBusiness duplicado em /servicos/site-express removido; helper `buildHead` agora emite alternates.
- **Etapa 3 (Performance/Imagens)** — Picture (avif/webp/jpg) + postbuild `scripts/optimize-blog-images.mjs` + preload do LCP em `/` já ativos. `public/_headers` agora versiona o cache (1 ano para assets imutáveis, 30 dias para imagens, 1h para sitemap/robots).
- **Etapa 4 (Cloudflare + GBP + Lighthouse)** — runbook em `docs/runbook-cdn-gbp.md`; Lighthouse CI já roda em `.github/workflows/lighthouse.yml` com metas LCP<2.5s, CLS<0.1, SEO≥95.
