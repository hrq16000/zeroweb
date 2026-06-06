# Plano de Ação — Serviços, SEO e Admin

Execução **um item por turno com QA**, conforme combinado. Cada fase é independente e termina com checagem visual/SEO antes de seguir.

---

## Fase 1 — FAQ Schema dedicado do Site Express em /servicos
**Objetivo:** Mapear perguntas do Site Express no JSON-LD da página `/servicos` sem duplicar com o FAQ agregado já existente.

- Extrair as 10+ FAQs do Site Express para uma constante reutilizável (`src/lib/site-express-faq.ts`), fonte única usada por `/servicos/site-express` e pelo hub `/servicos`.
- No `head()` de `/servicos`, adicionar um segundo bloco JSON-LD `@type: FAQPage` com `@id` próprio (`#faq-site-express`) e `about: { @id: '#service-site-express' }`, marcando claramente que pertence ao Site Express.
- Deduplicar: o FAQ agregado já existente passa a excluir perguntas cujo `normalizedKey` esteja no conjunto Site Express (evita o mesmo `Question` aparecer em dois `FAQPage`).
- Renderizar a seção visual do Site Express dentro do hub usando Accordion animado já existente, lendo da mesma constante.
- **QA:** validar com Rich Results Test (visual) lendo o HTML SSR e conferindo que cada pergunta aparece exatamente 1x no `@graph`.

## Fase 2 — CRUD admin de serviços
**Objetivo:** Gerenciar 100% dos serviços via Painel Administrativo, com imagem única, ordenação e status.

### Backend
- Tabela `public.services`: `slug` (unique), `title`, `tagline`, `description`, `price_from`, `category`, `image_path`, `image_alt`, `is_active`, `is_featured`, `display_order`, `seo_title`, `seo_description`, `faq` (jsonb), `benefits` (jsonb), `cta_label`, `cta_target`.
- GRANTs + RLS: `SELECT` público (`anon`+`authenticated`) só onde `is_active=true`; `ALL` apenas para `service_role` e usuários com `has_role(auth.uid(), 'admin')`.
- Bucket Storage público `service-images` com policy de upload restrita a admin.
- Seed: migrar `SERVICES` (hardcoded em `src/lib/services-data.ts`) para a tabela preservando `slug` (compatibilidade com rotas atuais).

### ServerFns
- `listServicesPublic` (admin client, projeta colunas seguras) — usado pelos loaders SSR de `/servicos` e `/servicos/$slug`.
- `listServicesAdmin`, `upsertService`, `deleteService`, `reorderServices`, `getUploadSignedUrl` — todos com `requireSupabaseAuth` + checagem de role admin.

### UI Admin em `/painel/servicos`
- Tabela com drag-and-drop (dnd-kit) para `display_order`, toggles de `is_active` / `is_featured`.
- Modal de criar/editar com upload de imagem única (preview, crop opcional, validação de tamanho/tipo), todos os campos SEO e FAQ inline.
- Botão excluir com confirmação dupla.

### Frontend público
- `/servicos` e `/servicos/$slug` passam a ler da tabela; cards usam `image_path` resolvido via URL pública do bucket; ordem respeitada.

**QA:** criar 1 serviço de teste via admin, conferir aparecimento ordenado em `/servicos`, abrir página de detalhe, validar OG image e JSON-LD; excluir e confirmar 404.

## Fase 3 — Migração 301 `/$service` → `/servicos/$slug` + Interlinking
**Objetivo:** URL canônica única, sem perder SEO, e garantir que todo item de menu tem página própria e acessível.

### Migração de rotas
- Mover/renomear arquivos `src/routes/$service.tsx` (ex.: `trafego-pago-local.tsx`, `presenca-digital.tsx`, `site-express.tsx` etc.) para `src/routes/servicos.$slug.tsx` quando ainda existirem fora; consolidar lógica no template único da Fase 2.
- Popular `public.redirects` em lote: `{old_path: '/trafego-pago-local', new_path: '/servicos/trafego-pago-local', status: 301}` para cada serviço.
- Server route `/api/public/r/$` (catch-all) e middleware leve em `__root.tsx` para lookup runtime; canonical tag SSR aponta sempre para `/servicos/$slug`.
- Sitemap regenerado a partir da tabela `services`; rotas antigas saem do sitemap.

### Auditoria de interlinking
- Script `scripts/audit-links.ts`: varre `src/routes/**/*` e `src/components/**/*`, lista todo `<Link to=...>` e `href=...`, compara com a árvore de rotas + tabela `redirects`. Falha se algum item do menu (Header/Footer/MegaMenu/MobileNav) não tiver página correspondente.
- Corrigir links quebrados, garantir bloco "Serviços relacionados" no rodapé de cada `/servicos/$slug`, e breadcrumbs `Home → Serviços → {slug}` em todas.
- Footer e Header revistos para listar todos os serviços ativos vindos do banco (não hardcoded).

**QA:** rodar script de auditoria (0 erros), `curl -I` em 3 URLs antigas conferindo `301` + `Location` correto, navegar manualmente pelo menu completo no preview mobile.

---

## Ordem e dependências
```text
Fase 1 (FAQ Schema)            ← isolado, ~10 min
   ↓
Fase 2 (CRUD admin)            ← cria fonte de verdade que a Fase 3 consome
   ↓
Fase 3 (301 + interlinking)    ← depende da tabela services existir
```

## Itens fora deste plano (já feitos / não pertinentes)
- Login Google em `/painel` — bug do enum `partner_status` já corrigido nesta sessão.
- Botão flutuante WhatsApp na home — bug de visibilidade já corrigido nesta sessão.

Aprove para eu começar pela **Fase 1**.
