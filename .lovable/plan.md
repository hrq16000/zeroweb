# Plano em 3 ondas

Cada onda é entregue, testada e aprovada antes da próxima.

---

## Onda 1 — UX & Suavidade (entrega agora)

Objetivo: dar a sensação imediata de "está acontecendo algo" quando o usuário clica, e elegância nas transições.

1. **Loader global de navegação com a logo 0WEB**
   - Componente `RouteLoader` em `__root.tsx` que escuta o estado de pending do TanStack Router (`useRouterState({ select: s => s.isLoading || s.isTransitioning })`).
   - Overlay com a logo pulsando + barra de progresso fina no topo (estilo NProgress), fade-in após 120ms (não pisca em navegações instantâneas).
   - Preload em hover já está ativo (`defaultPreload: "intent"`), mas reforçamos `preloadDelay` baixo.

2. **Transições entre páginas**
   - Fade + leve translate-y nas trocas de rota usando `framer-motion` `AnimatePresence` no `<Outlet />` do root, com `mode="wait"`.
   - Respeita `prefers-reduced-motion`.

3. **Hero da loja com fade/cross suave**
   - Refatorar `ShopHero.tsx`: crossfade entre slides (opacity + scale 1.02 → 1.0), Ken Burns sutil na imagem de fundo, easing `cubic-bezier(0.4, 0, 0.2, 1)`.
   - Duração 1200ms, autoplay 7s, pausa no hover (já existe).
   - Pré-carrega a próxima imagem.

4. **Busca sticky em todas as páginas da loja**
   - Extrair `SmartServiceSearch` para o layout `src/routes/servicos.tsx` (que hoje é só `<Outlet />`), com header sticky `top-0 z-40 backdrop-blur` contendo: logo mini + busca + ícone do carrinho (badge com contador).
   - Aparece em `/servicos`, `/servicos/$slug` e futuras subrotas.

5. **Micro-interações globais**
   - Botões: `active:scale-[0.98] transition-transform`.
   - Links de produto: hover com shadow-glow.

---

## Onda 2 — Loja completa (produto + carrinho híbrido)

1. **Página de produto enriquecida (`/servicos/$slug`)**
   - Breadcrumb: Loja › Categoria › Produto.
   - Botão grande "Adicionar ao carrinho" + "Comprar agora".
   - Bloco "Outras categorias" (chips horizontais).
   - Bloco "Itens relacionados" (mesma categoria, exclui o atual, 4 cards).

2. **Carrinho híbrido**
   - Tabela `cart_items` no banco + fallback `localStorage` para anônimos.
   - Drawer lateral (`Sheet` do shadcn) aberto pelo ícone no header sticky.
   - 1º item: livre. 2º item: toast "Salve seu carrinho com Google" + CTA login (não bloqueia).
   - Ao logar, faz merge do localStorage → DB.

3. **Catálogo: chips de categoria persistentes**
   - Já existe parcialmente — promover para componente reutilizável usado em todas as views da loja.

---

## Onda 3 — Checkout via funil + Google + Pagamento (duplo caminho)

1. **Tabela `orders`** (id, user_id, items jsonb, total, status, payment_method, whatsapp_handoff_at, stripe_session_id).

2. **Fluxo de checkout = funil dinâmico existente**
   - Reutilizar o motor de `dynamic_forms` para coletar: dados do negócio, prazo, observações.
   - Passos do funil somam ao "cadastro universal" (`customer_identities` já existe).
   - Login Google obrigatório no passo final via `lovable.auth.signInWithOAuth("google")`.

3. **Tela final com 2 CTAs equivalentes**
   - **Pagar agora**: Stripe integrado da Lovable (`payments--enable_stripe_payments`) → checkout session → success page.
   - **Falar no WhatsApp**: gera link `wa.me` com resumo do pedido + ID + dados; marca `whatsapp_handoff_at` na order.

4. **Painel do cliente** (`/app`)
   - Aba "Meus pedidos" listando orders com status (aguardando pagamento / em conversa no WhatsApp / pago / em produção).

---

## Detalhes técnicos

**Stack já presente**: TanStack Start + Router (preload intent ativo), framer-motion disponível, shadcn/ui, Supabase, `lovable.auth` para Google, `dynamic_forms` para funil.

**Bibliotecas a adicionar**: nenhuma — `framer-motion` já está no projeto.

**Migrations previstas**:
- Onda 2: `cart_items (id, user_id nullable, session_id, service_id, qty, created_at)`.
- Onda 3: `orders` + `order_items` + extensão de `customer_identities` se necessário.

**Pagamento**: ativaremos `enable_stripe_payments` no início da Onda 3 (form do usuário).

---

Começo agora pela **Onda 1**. Após aprovação visual, sigo pra Onda 2.
