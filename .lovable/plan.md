# Plano de Melhorias — Backlog consolidado

Origem: pedido do usuário (todas as melhorias, sem regressão). Itens marcados ✅ já estavam prontos ou foram entregues nesta rodada.

## SEO / Schema / FAQ
- ✅ /faq já tem canonical absoluto, meta robots index,follow, OG, FAQPage JSON-LD e BreadcrumbList JSON-LD.
- ✅ /faq agora tem âncoras por pergunta (`#q-<slug>`) + scroll-mt para deep link.
- [ ] Rerodar scan SEO + Lighthouse após mudanças (tool: seo_chat--trigger_scan, ação do usuário).
- [ ] CI: endpoint/script que renderiza rotas críticas e valida presença de JSON-LD, OG e BreadcrumbList (vitest + ssr fetch).
- [ ] Teste automatizado garantindo 301 em todas as 8 URLs legadas → /servicos/*.

## Chatbot home
- [ ] Eventos analytics (start, step_completed, lead_created, redirect_servico) — adicionar via `analytics.track()`.
- [ ] Pré-preenchimento WaFunnel: estender `FloatingFunnelCTA`/funil para aceitar `prefill: { nome, telefone, contexto, plano }`.
- [ ] Validação de campos obrigatórios antes do insert em `dynamic_form_leads`.

## Espaçamento / Design System
- [ ] Criar tokens globais em `src/styles.css` (`--space-section-y`, `--space-section-y-tight`, `--space-hero-top`) e utility `.section-y`.
- [ ] Padronizar Breadcrumbs: remover prop `className`/variações por rota; usar somente token global.
- [ ] Auditoria automática (script Node) que percorre `src/routes/**` e flagga `pt-*`/`py-*` acima de 24 e `mt-*` topo > 16; gera relatório em `/mnt/documents/spacing-audit.md`.
- [ ] Corrigir páginas fora do padrão após auditoria.
- [ ] Visual regression em /servicos/* (playwright snapshot do topo) — bloquear quando espaço acima do H1 > N px.

## Debug mode
- [ ] Overlay dev (Alt+D): outline em todos os elementos, badges com padding/margin top, listagem em tempo real dos componentes fora do padrão por rota. Só ativo em `import.meta.env.DEV`.

## Header / Navegação
- [ ] Mobile: refinar tipografia, hierarquia e contraste.
- [ ] Keyboard nav: ordem de foco, `/` foca busca, `Esc` fecha drawer, testes a11y (vitest + @testing-library).
- [ ] Framer Motion: shrink/transform do header no scroll, respeitando `prefers-reduced-motion`.

## Loja virtual / Produtos
- [ ] Breadcrumbs em todas as páginas de produto (já existe em `/servicos/$slug`; estender a `categoria.$slug`, `f.$slug`, etc).
- [ ] CTA fixo visível em página de produto que direciona ao funil (WaFunnel pré-preenchido com o item).

## URLs legadas
- ✅ Mantidos 301 conforme decisão do usuário.

---

## Aplicado nesta rodada
1. Âncoras por pergunta no /faq com `scroll-mt-24`.
2. Header de Breadcrumbs com spacing token unificado.
3. Esta lista de plano.
