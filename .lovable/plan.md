## Resumo da execução

### Bloco 1 — Redirects 301 (JÁ IMPLEMENTADO ✅)
As 12 rotas legadas já têm `beforeLoad → redirect` 301. Vou apenas **manter** os destinos atuais (que apontam para os slugs reais existentes no banco):
- `/automacao` → `/servicos/automacao-com-ia`
- `/criacao-sites` → `/servicos/criacao-de-sites`
- `/desenvolvimento` → `/servicos/desenvolvimento-saas`
- `/ia` → `/servicos/automacao-com-ia`
- `/redes-sociais` → `/servicos/gestao-redes-sociais`
- demais 7 → slug homônimo

> O briefing pedia `/automacao → /servicos/automacao`, mas esse slug não existe no DB (existe `automacao-com-ia`). Vou **manter o redirect atual** para não gerar 404. **Confirme se está OK** ou se quer que eu crie aliases no DB.

### Bloco 2 — `<RelatedLinksGrid />` em 8 páginas legadas
Adicionar `<RelatedLinksGrid only={[...]} />` antes do Footer em:
`servicos.consultoria`, `servicos.google-meu-negocio`, `servicos.marketplace`, `servicos.parceiros`, `servicos.presenca-digital`, `servicos.site-24h`, `servicos.site-express`, `servicos.trafego-pago`.

Ajuste necessário no mapeamento (slugs reais do DB):
- `consultoria` → seo, trafego-pago, presenca-digital
- `google-meu-negocio` → seo, trafego-pago-local, presenca-digital
- `marketplace` → criacao-**de-**sites, presenca-digital, **gestao-**redes-sociais
- `parceiros` → consultoria, presenca-digital, landing-pages
- `presenca-digital` → seo, **gestao-**redes-sociais, google-meu-negocio
- `site-24h` → criacao-**de-**sites, landing-pages, presenca-digital
- `site-express` → criacao-**de-**sites, landing-pages, site-24h
- `trafego-pago` → trafego-pago-local, seo, landing-pages

### Bloco 3 — Post → Serviço relacionado
- **Migration**: `ALTER TABLE editorial_calendar ADD COLUMN related_service_slug TEXT`
- **`blog-data.ts`** (fonte estática atual dos posts): adicionar campo opcional `relatedServiceSlug?: string` em `BlogPost`. Os posts existentes ficam com `undefined` por padrão; o card só aparece quando preenchido. Sem alteração nos posts atuais.
- **`blog.$slug.tsx`**: depois da seção de "Conteúdos relacionados", renderizar card "Serviço relacionado" se `relatedServiceSlug` existir.
- **Hubs por tema** (`blog.seo`, `blog.ia`, `blog.trafego-pago`, `blog.trafego-pago-local`, `blog.automacao`, `blog.conversao`, `blog.google-meu-negocio`, `blog.landing-pages`, `blog.marketing-local`, `blog.sites`, `blog.vendas`): adicionar banner no topo da `HubPage` via prop opcional `relatedServiceSlug`. Mapeamento embutido nos próprios arquivos de hub.

> Os hubs usam `<HubPage>` compartilhado. Vou estender `HubPage` para aceitar `relatedServiceSlug?: string` opcional e renderizar o banner — mudança aditiva, não quebra nada.

### Bloco 4 — `<Breadcrumbs />`
Adicionar logo abaixo do Header (antes do Hero/título) em:
- `blog.$slug`, `blog.seo`, `blog.ia`, `blog.trafego-pago`, `blog.trafego-pago-local`, `blog.automacao`, `blog.conversao`, `blog.google-meu-negocio`, `blog.landing-pages`, `blog.marketing-local`, `blog.sites`, `blog.vendas`
- `cases.$slug`, `cases.index`
- `servicos.consultoria`, `servicos.google-meu-negocio`, `servicos.marketplace`, `servicos.parceiros`, `servicos.presenca-digital`, `servicos.site-24h`, `servicos.site-express`, `servicos.trafego-pago`
- `sobre`, `faq`

> Os hubs de blog renderizam via `<HubPage>` — vou adicionar Breadcrumbs dentro de `HubPage` automaticamente (com `["Blog", cluster.name]`). Os 8 serviços legados usam `<IntentLanding>` — adiciono Breadcrumbs dentro de `IntentLanding`.

### Bloco 5 — Header e Footer
- **Header**: remover do menu desktop os links `Cases`, `Planos`, `FAQ`. Manter `Início, Serviços (dropdown), Soluções, Sobre, Blog, Contato (botão), Entrar (botão)`. Mobile mantém todos os links.
- **Footer**: reestruturar em **4 colunas fixas**:
  1. Logo + tagline curta + redes sociais
  2. Serviços: 6 principais slugs (`criacao-de-sites`, `seo`, `trafego-pago`, `presenca-digital`, `automacao-com-ia`, `gestao-redes-sociais`)
  3. Empresa: Sobre, Cases, Parceiros, Blog, Planos
  4. Suporte: FAQ, Contato, Mapa do site, Política de Privacidade, Termos
- Linha final: "© 0WEB · Desenvolvido por 0web"

> Vou remover a estrutura dinâmica `buildDbCols` do Footer (vira fixa, mais previsível).

### Bloco 6 — Página 404 enriquecida
`NotFoundComponent` em `__root.tsx` ganha:
- Header + Footer visíveis
- Título "Página não encontrada" + subtítulo
- Grid com 4 cards de serviços (busca via `listServicesNav` — mesma fonte do Header)
- Botão primário "Ir para o início" + secundário "Ver todos os serviços"
- Mantém o `logNotFound` atual

---

## Pontos para você confirmar antes da execução

1. **Bloco 1**: deixo os redirects atuais (apontam para slugs reais do DB) ou você quer que eu crie aliases novos no banco (`automacao`, `criacao-sites`, `desenvolvimento`, `ia`, `redes-sociais`)?
2. **Bloco 3**: OK ampliar o componente compartilhado `HubPage` para suportar o banner de serviço relacionado (mapeamento embutido em cada arquivo de hub)?

Se ambos OK, executo na sequência: 2 → 3 → 4 → 5 → 6.