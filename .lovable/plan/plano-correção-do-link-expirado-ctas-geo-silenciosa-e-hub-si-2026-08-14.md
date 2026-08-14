# Plano — Correção do link expirado, CTAs, geo silenciosa e hub "Sites Robustos"

O pedido reúne ~20 frentes. Abaixo está o que é compatível hoje, em ordem de impacto, dividido em 4 turnos executáveis. O que não cabe está listado no fim, com o motivo.

## Diagnóstico confirmado

- `/r/whatsapp/:token` tem TTL de 15 min (`WHATSAPP_TOKEN_TTL_MS`) e, ao expirar, mostra uma página morta cujo único botão aponta para `/contato` (`src/routes/r.whatsapp.$token.ts:273`). Foi exatamente a tela do print. Não existe caminho de "refazer" — o visitante perde o lead já capturado.
- 13 arquivos ainda navegam para `/contato` como CTA principal (Header, `servicos.index`, `planos`, `solucoes`, `faq`, `HomeSpotlight`, `IntentLanding`, entre outros), contrariando o modelo funnel-first.
- A captura de cidade existe (`src/lib/geo-location.ts`, IP + GPS opcional, cache em sessionStorage) mas não alimenta o funil nem a mensagem do WhatsApp de forma silenciosa.
- O token já grava `funnel_session_id`; `destination_digits`/`message` seguem como colunas legadas.

## Turno 1 — Link expirado deixa de ser beco sem saída (crítico)

1. Aumentar o TTL para 24 h e adicionar janela de reuso maior para o mesmo lead (hoje 60 s).
2. Na página de expiração, trocar o botão `/contato` por **"Reenviar minha solicitação"**, que chama uma rota server-side de reemissão: valida o token expirado, confirma que o lead existe, emite novo token e redireciona direto ao WhatsApp com a mesma mensagem reconstruída. Rate-limitado por IP.
3. Página de erro passa a mostrar o protocolo do lead, para o atendimento localizar a solicitação mesmo sem clique.
4. Aplicar identidade visual da 0WEB na página (hoje é HTML cru).

## Turno 2 — CTAs funnel-first + geo silenciosa

1. Substituir os CTAs de `/contato` pelos componentes de funil já existentes (`FunnelCTAButton` / `ProductActionGate`) nos 13 arquivos mapeados. Links de navegação e "ver detalhes"/"comprar agora" ficam intactos — só intenção de orientação abre o funil.
2. Manter `/contato` como fallback real para no-JS (link em `<noscript>` e no rodapé).
3. Captura silenciosa de cidade/bairro: no primeiro load, resolver IP-geo em background e gravar `city`, `region` e bairro inferido (quando o visitante veio de `/bairros-*`) no `origin_snapshot` da sessão de funil. Nada é exibido se a resolução falhar; sem prompt de GPS não solicitado.
4. Essa cidade/bairro entra na seção LOCALIDADE da mensagem do WhatsApp automaticamente.

## Turno 3 — Hub "Criação de Sites Robustos" (pilar + 5 satélites)

Rota `/sites-robustos` (pilar, 1.800+ palavras) e 5 satélites:

- `/sites-robustos/velocidade-e-core-web-vitals`
- `/sites-robustos/seo-tecnico-para-sites-institucionais`
- `/sites-robustos/site-que-converte-estrutura-de-paginas`
- `/sites-robustos/integracoes-e-automacoes`
- `/sites-robustos/manutencao-seguranca-e-escala`

Cada página: H1 único, 4-6 H2, FAQ com JSON-LD, CTA de funil, bloco de patrocínio/oferta, link para o pilar; o pilar linka os 5 e a `/areas-de-atendimento`. Inclusão em `sitemap-pages.xml` + breadcrumb JSON-LD.

Inspiração aplicada do concorrente (Berger Soluções): três pilares de solução na dobra inicial, seção "processo de trabalho" numerado, prova de stack técnica e "atendimento direto sem intermediários" — adaptados ao nosso tom comercial e sem copiar texto.

## Turno 4 — Skyscraper (infográfico + vídeo) e CI de SEO

1. `skyscraper-render.ts` passa a gerar um infográfico resumido em SVG inline (dados do próprio artigo — sem imagem externa, CLS 0) e um slot de vídeo com `lite-embed` (thumb estática + iframe só no clique).
2. Interlinking automático: cada skyscraper linka o pilar Sites Robustos e a `/areas-de-atendimento`; o pilar lista os skyscrapers relacionados.
3. Workflow GitHub Actions `seo-guard.yml`: roda `validate-jsonld`, `validate-schemas`, `validate-canonicals`, `snapshot-meta` e `run-seo-diff` a cada push; falha o build em regressão de Rich Results.
4. Relatório HTML consolidado do diff de snapshots (canonical, og:image, og:url, robots) publicado como artefato.
5. Checagem de Twitter Card (`twitter:image` presente e ≥ 1200×630) no audit, cobrindo `/pedido/$id` e `/servicos/$slug`.

## Fora de escopo agora (e por quê)

- **Playwright E2E completo (produto → funil → lead → redirect), testes de sessionStorage e `/app/leads`**: o ambiente de preview não roda WhatsApp externo nem tem seed determinístico; posso entregar como turno 5 dedicado, depois que os CTAs pararem de mudar.
- **Remoção física de `destination_digits`/`message`**: exige janela sem tokens legados vivos; agendo para depois do TTL novo estabilizar.
- **QA Lighthouse dos bairros**: rodo depois do turno 4, porque o infográfico/vídeo altera as métricas.
- **Política de Privacidade** (visitor_id, snapshots, pré-lead, redirect): incluo no turno 2, é barato e obrigatório junto da geo silenciosa.

## Notas técnicas

- Reemissão de token: nova rota `src/routes/r/whatsapp/reissue.$token.ts` (server handler), RPC `reissue_whatsapp_redirect_token` validando `lead_id` e limitando a 3 reemissões por lead.
- `origin_snapshot` passa a ser objeto aninhado `{ page, geo, utm, cart }` — revalidado no servidor; preços do carrinho relidos do banco no submit, nunca do cliente.
- Nenhum número, e-mail ou `wa.me` entra em código cliente; `validate-client-privacy.mjs` roda contra `dist/` no final de cada turno.
