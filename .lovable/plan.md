
# Plano de execução — 4 ondas

Memorizei: **Home / Soluções / Serviços** são frentes distintas. Soluções pode usar IA + SEO agressivo (Discovery). Serviços = fotos reais. Item sem price → Solução.

---

## ONDA 1 — Página de Gestão de Redes Sociais (enriquecer)

Arquivo único: `src/routes/servicos.gestao-redes-sociais.tsx` (já existe, vou expandir).

1. **Entregáveis detalhados por plano** (cards expansíveis): posts/semana, stories/semana, reels, roteiros, artes, copy, gravação/edição, revisão de calendário, relatório mensal — com números exatos e exemplos reais ("Ex.: 2 posts carrossel + 2 posts estáticos por semana").
2. **Tabela comparativa visual** dos 4 planos com colunas: Canais · Posts/mês · Stories/mês · Reels · Mídia incluída · SLA aprovação · Suporte · Relatórios. Highlight no plano Profissional.
3. **Seção "Exemplos reais"**:
   - Mockup de calendário editorial (HTML/CSS puro, sem imagem) com posts plotados.
   - Mockup de painel de métricas (cards com alcance, engajamento, seguidores) — números reais médios.
   - Mockup de layout de relatório mensal (PDF preview em HTML).
   - 3 fotos reais Unsplash de feed/posts (sem IA).
4. **Simulador de plano** (componente novo `RedesSimulator.tsx`): inputs de nicho (select), nº de canais (1-4), objetivo (alcance/engajamento/vendas) → recomenda plano + CTA "Diagnóstico no WhatsApp".

## ONDA 2 — Correções de catálogo (Serviços/Soluções)

5. **Vitrine `/servicos`**: confirmar que produtos com price real aparecem; ajustar query/filtro se houver bug. Já populamos preços; validar UI.
6. **`/solucoes`**: adicionar grid linkando para páginas de itens **sem price** (Soluções), com CTA "Solicitar cadastro/orçamento". Cada card → rota da solução ou fallback.
7. **Fallback de rota sem price**: no `servicos.$slug.tsx`, se `price` for nulo, renderizar variante "Solução" (sem botão de compra, com CTA de diagnóstico e link cruzado para /solucoes).
8. **Validação no painel**: em `app.servicos`, ao salvar item marcado como Produto (is_solution=false) sem price > 0, mostrar warning/bloqueio e sugerir marcar como Solução.

## ONDA 3 — Suavização visual da loja

9. Aplicar bordas mais arredondadas (`rounded-3xl`), sombras suaves multi-camada, gradientes sutis nos cards de `/servicos` e `/solucoes`. Tipografia mais aerada. Hover com lift + glow. Tokens em `src/styles.css` (`--shadow-soft`, `--radius-card`).

## ONDA 4 — Testes E2E + SEO Discovery em Soluções

10. Playwright/Vitest: navegação `/servicos` ↔ `/solucoes`, estado vazio + CTA, render de fallback sem price.
11. Reforço SEO em `/solucoes/*`: JSON-LD `Article` + `Product`, og:image (IA permitida), headings agressivos, breadcrumb, FAQPage.

---

## Recomendação

Começar pela **ONDA 1** agora (é a continuação direta da página que acabamos de criar — alto impacto, escopo claro). As demais ondas vou tocar em sequência após sua confirmação de cada uma, para não atropelar e manter os PRs pequenos.

**Confirma começar pela Onda 1?** (Se quiser priorizar outra onda primeiro, me diga qual.)
