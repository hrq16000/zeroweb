# Plano — "Só Funil" fora da loja

## Regra oficial

**Fora da loja** (qualquer rota que não seja `/servicos`, `/servicos/$slug`, `/checkout`, `/pedido/*`, `/obrigado`, carrinho e admin autenticado):

- Todo botão/CTA de contato abre o **FunnelRunner** (modal).
- **Nada** de link direto para WhatsApp, telefone (`tel:`) ou e-mail (`mailto:`).
- Número de WhatsApp e endereço de e-mail **não aparecem em texto** em nenhuma página pública — nem no footer, nem em políticas, nem em blog, nem em cards, nem em JSON-LD.
- Painel/admin autenticado continua enxergando contatos (só o site público é afetado).
- Após o funil, a 0WEB entra em contato — a página de agradecimento só diz "entraremos em contato", sem expor canais.

**Funil escolhido pelo contexto da página:**


| Página                                                                                          | Funil                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Home, sobre, blog, FAQ, mapa do site, 404, contato                                              | `funnel-service` (diagnóstico geral)                    |
| Soluções (`/trafego-pago`, `/seo`, `/ia`, `/automacao`, etc.)                                   | `funnel-service` com `serviceSlug` da solução           |
| Cidades/bairros (`/cidade/$slug`, `/bairros-bh/$slug`, `/bairros-cwb/$slug`, `/$city/$service`) | `funnel-service` com contexto local (cidade no payload) |
| Empresa/profissional (`/empresa/$slug`, `/profissional/$slug`)                                  | `funnel-service` com contexto do marketplace            |
| Cases (`/cases/*`)                                                                              | `funnel-service` do serviço relacionado                 |
| Planos, calculadora, parceiros                                                                  | `funnel-service`                                        |


## O que muda no código

### 1. Componente único de CTA

- Criar `src/components/site/ContactCTAButton.tsx`: recebe `label`, `variant`, `size`, `funnelSlug?`, `serviceSlug?`, `city?`, `context?`. Ao clicar, abre o `FunnelRunner` via `FunnelModalWrapper`. Dispara `cta_click` no analytics.
- Substituir todos os botões de "Falar com especialista", "Falar no WhatsApp", "Solicitar diagnóstico", "Entre em contato", "Fale conosco" fora da loja por este componente.

### 2. Neutralizar helpers de WhatsApp fora da loja

- `src/lib/site-config.ts`: remover `WHATSAPP.number` do bundle público (mover para variável só usada dentro do checkout/admin). `whatsappUrl()` passa a lançar erro se chamada em contexto público — auditoria via ESLint rule ou grep no CI.
- Manter uso permitido só em: `src/routes/checkout.tsx`, `src/routes/_authenticated/**`, `src/lib/payment-settings.functions.ts` (admin salva o número), `src/components/site/CartDrawer.tsx` (fluxo de compra).

### 3. Páginas a reescrever

**Footer (**`src/components/site/Footer.tsx`**)**

- Remover número de WhatsApp e e-mail. Substituir por botão "Falar com a 0WEB" que abre o funil.

**Página** `/contato`

- Reescrever: sem número, sem e-mail, sem `mailto:`. A página inteira vira o FunnelRunner embutido + explicação curta.

**Políticas (**`/privacidade`**,** `/politica-privacidade`**,** `/termos`**)**

- Remover e-mail do DPO/contato. Substituir por: "Para exercer seus direitos LGPD, [inicie o formulário]" que abre o funil marcando `origem=lgpd`.
- **Ciente do risco LGPD** — vou deixar registrado nos comentários do arquivo e num aviso no `.lovable/plan.md`.

**Rotas de cidade / bairro / empresa / profissional / vertical de site / cases**

- Trocar `href="https://wa.me/..."` e `<a href="mailto:...">` pelo `ContactCTAButton`, passando o contexto (cidade, serviço, empresa).

**Blog (**`src/lib/blog-data.ts`**)**

- Rodar substituição: todo `https://wa.me/...` no markdown vira `[texto do link](/contato)` ou é removido. Não altera lógica de renderização.

**Skyscraper (**`src/lib/skyscraper-render.ts`**)**

- Remover geração automática de link WhatsApp; CTA final do post aponta para `/contato`.

**Hero da loja (**`ShopHero.tsx`**)** — a loja pode ficar? Sim, mas este componente aparece em `/servicos`. Vou tirar o link direto e usar o mesmo padrão só por consistência de UX (funil quando é "tirar dúvida", carrinho quando é comprar).

**ErrorState, WaFunnelModal**

- `WaFunnelModal` só é usada em fluxo pós-compra/checkout — mantém.
- `ErrorState` — remover o botão de WhatsApp; deixar só "Recarregar" e "Iniciar diagnóstico" (funil).

### 4. Chatbot da home

- **Marcado como revisão pendente** conforme sua orientação. Não mexo agora. Adiciono um TODO no topo do `HomeChatbot.tsx` e uma entrada em `.lovable/plan.md`.

### 5. Guard-rail permanente

- Script `scripts/validate-no-public-contact.mjs`: falha se encontrar `wa.me`, `api.whatsapp`, `mailto:`, número `5541…` ou `payments.whatsapp_number` fora da allowlist (checkout, admin, payment-settings).
- Adicionar ao `.husky/pre-commit` e ao workflow do GitHub Actions.

### 6. Analytics

- `ContactCTAButton` dispara `cta_click` + `funnel_open` com `{page, context, service_slug?, city?}`.

## Áreas técnicas afetadas (checklist)

```
src/components/site/Footer.tsx
src/components/site/ContactCTAButton.tsx        (novo)
src/components/site/ErrorState.tsx
src/components/site/ShopHero.tsx
src/components/site/Header.tsx                   (auditoria — trocar "Falar" por CTA)
src/lib/site-config.ts                           (WHATSAPP restrito à loja)
src/lib/blog-data.ts                             (sanitização de links)
src/lib/skyscraper-render.ts                    (CTAs → /contato ou funil)
src/routes/contato.tsx                           (reescrever: só funil)
src/routes/privacidade.tsx                       (sem e-mail)
src/routes/politica-privacidade.tsx              (sem e-mail)
src/routes/termos.tsx                            (auditoria)
src/routes/empresa.$slug.tsx
src/routes/profissional.$slug.tsx
src/routes/sites.$vertical.tsx
src/routes/bairros-bh.$slug.tsx
src/routes/bairros-cwb.$slug.tsx
src/routes/cidade.$slug.tsx
src/routes/$city.$service.tsx
src/routes/cases.$slug.tsx
scripts/validate-no-public-contact.mjs           (novo)
.husky/pre-commit                                (chama o validator)
.lovable/plan.md                                 (registro da regra + revisão do chatbot)
```

## Ordem de execução

1. Criar `ContactCTAButton` + hook para escolher funil por contexto.
2. Reescrever Footer, `/contato`, políticas.
3. Sanitizar rotas dinâmicas (cidade/bairro/empresa/profissional/vertical/cases).
4. Sanitizar `blog-data.ts` e `skyscraper-render.ts` (regex + revisão).
5. Neutralizar `WHATSAPP` fora da allowlist.
6. Script validador + hook.
7. Rodar validador, corrigir sobras, rodar `bunx tsgo` para checar tipos.
8. Registrar TODO do chatbot em `.lovable/plan.md`.

## Riscos e ressalvas

- **LGPD**: esconder o e-mail do DPO em `/privacidade` **pode** ser questionado num pedido do titular. Você confirmou que aceita. Vou deixar comentário no arquivo e uma frase clara no rodapé da política: "Contato do encarregado exclusivamente via formulário".
- **SEO local**: JSON-LD `LocalBusiness` costuma ter `telephone`. Vou remover — pode reduzir rich result no Google Meu Negócio. Mantenho o endereço/cidade, tiro o telefone.
- **Custom domain**: nada muda no DNS/hosting; só código.
- **Fluxo de checkout Stripe fallback WhatsApp**: continua funcionando (é dentro da loja).

## Perguntas antes de executar

1. **Volume**: são ~20 arquivos + limpeza no `blog-data.ts` (posts com `wa.me` no meio do markdown). Posso mexer no conteúdo dos posts trocando "fale no WhatsApp" por "inicie um diagnóstico com a 0WEB" — ok?
2. `/contato`: prefere a página abrir o funil já expandido (formulário grande no meio da tela) ou uma hero curta + botão que abre o modal?
3. **Header — botão "Falar com especialista"**: mantém no topo em todas as páginas ou só em algumas (home, soluções)?

Aprove ou me diga o que ajustar.

&nbsp;

Quero que você revise e ajuste o plano “Só Funil” da 0WEB antes de qualquer implementação.

&nbsp;

A direção estratégica está aprovada, mas a regra precisa ser reformulada para evitar problemas de conversão, acessibilidade, LGPD, SEO e dependência excessiva de JavaScript.

&nbsp;

NOVA REGRA OFICIAL

&nbsp;

Adote o conceito:

&nbsp;

Funnel-first fora da loja.

&nbsp;

Isso significa:

&nbsp;

- Todo CTA comercial público deve iniciar o funil.

- Não deve haver WhatsApp, telefone ou e-mail exposto diretamente nas páginas públicas.

- Devem existir exceções controladas para LGPD, suporte transacional, checkout, pedido e contingência técnica.

- O funil deve ser o principal caminho de contato, mas nunca pode se tornar uma barreira que impeça o usuário de enviar uma solicitação.

&nbsp;

Não execute mudanças ainda. Primeiro faça uma auditoria completa e apresente o relatório.

&nbsp;

---

&nbsp;

1. ESCOPO DA REGRA

&nbsp;

Em páginas públicas fora dos fluxos transacionais:

&nbsp;

- Nenhum CTA comercial deve usar diretamente "wa.me", "api.whatsapp.com", "tel:" ou "mailto:".

- Número de telefone e e-mail comercial não devem aparecer em texto, HTML, JSON-LD, dados estruturados, markdown, scripts, atributos, payloads públicos ou bundle frontend.

- Todo CTA comercial deve usar o componente central de contato e iniciar o FunnelRunner.

- Todo CTA precisa possuir fallback navegável para "/contato", preservando contexto e origem.

- Admin autenticado, checkout, carrinho, pedido, pós-compra e suporte transacional seguem regras específicas.

&nbsp;

A regra correta para a loja será:

&nbsp;

- Comprar: carrinho e checkout.

- Tirar dúvida comercial: funil.

- Suporte de pedido, pagamento ou pós-compra: canal transacional permitido.

- A existência da rota "/servicos" não autoriza WhatsApp direto de forma genérica.

&nbsp;

---

&nbsp;

2. CRIAR UMA ARQUITETURA CENTRAL DE INTENÇÃO

&nbsp;

Não espalhe "funnelSlug", "serviceSlug", "city" e "context" como parâmetros independentes sem governança.

&nbsp;

Crie uma estrutura tipada semelhante a:

&nbsp;

type ContactIntent = {

  purpose:

    | 'commercial'

    | 'diagnosis'

    | 'proposal'

    | 'partnership'

    | 'lgpd'

    | 'order-support';

&nbsp;

  source: string;

  pagePath: string;

  placement:

    | 'header'

    | 'hero'

    | 'section'

    | 'article'

    | 'footer'

    | 'sticky-mobile'

    | 'case-final'

    | 'error-state'

    | 'contact-page';

&nbsp;

  serviceSlug?: string;

  citySlug?: string;

  neighborhoodSlug?: string;

  companySlug?: string;

  professionalSlug?: string;

  caseSlug?: string;

  contentSlug?: string;

  campaign?: string;

};

&nbsp;

Criar um resolver central:

&nbsp;

resolveFunnelFromIntent(intent)

&nbsp;

As páginas não devem escolher livremente qualquer funil. Elas devem fornecer a intenção e o resolver central decide o fluxo correto.

&nbsp;

---

&nbsp;

3. COMPONENTE CENTRAL DE CTA

&nbsp;

Criar:

&nbsp;

src/components/site/ContactCTAButton.tsx

&nbsp;

O componente deve receber:

&nbsp;

- "label"

- "variant"

- "size"

- "intent"

- "fallbackHref"

- demais props acessíveis necessárias

&nbsp;

Comportamento:

&nbsp;

1. Registrar o clique.

2. Tentar abrir o FunnelRunner.

3. Confirmar que o funil abriu.

4. Caso o modal falhe, redirecionar para "/contato" com os parâmetros da intenção.

5. Não gerar CTA morto caso JavaScript, hidratação ou modal falhe.

6. Funcionar com teclado.

7. Preservar foco.

8. Possuir "aria-label" adequado.

9. Impedir duplo clique.

10. Não bloquear navegação por leitores de tela.

&nbsp;

Exemplo conceitual:

&nbsp;

<ContactCTAButton

  label="Solicitar diagnóstico"

  intent={intent}

  fallbackHref="/contato?origem=hero&servico=seo"

/>

&nbsp;

O fallback não pode depender do FunnelRunner.

&nbsp;

---

&nbsp;

4. PÁGINA "/CONTATO"

&nbsp;

Não abrir modal automaticamente dentro da página "/contato".

&nbsp;

Reescrever a rota com:

&nbsp;

- Hero curto.

- Explicação objetiva.

- FunnelRunner embutido e já visível.

- Formulário iniciando logo após uma introdução curta.

- Contexto recebido por query string.

- Estado de erro.

- Opção de recarregar.

- Preservação dos dados já preenchidos.

- Confirmação de envio.

- Boa experiência mobile.

- Navegação acessível.

&nbsp;

A página deve funcionar como fallback universal dos CTAs.

&nbsp;

O formulário não deve exibir WhatsApp, telefone ou e-mail comercial.

&nbsp;

---

&nbsp;

5. LGPD: FLUXO SEPARADO DO FUNIL COMERCIAL

&nbsp;

Não misturar solicitações LGPD com leads comerciais.

&nbsp;

Criar uma intenção específica:

&nbsp;

purpose: 'lgpd'

source: 'privacy-policy'

&nbsp;

O canal LGPD deve:

&nbsp;

- Ser separado do pipeline de vendas.

- Não adicionar o titular a campanhas.

- Não solicitar consentimento de marketing.

- Identificar claramente o controlador e o encarregado ou responsável pelo canal.

- Permitir o exercício dos direitos do titular.

- Gerar confirmação de recebimento.

- Gerar protocolo.

- Registrar data e origem.

- Possuir armazenamento seguro.

- Ter proteção contra spam.

- Permitir acompanhamento interno.

- Permanecer funcional mesmo que o funil comercial esteja indisponível.

&nbsp;

Nas políticas, utilizar uma frase clara, como:

&nbsp;

“Para exercer seus direitos relacionados à proteção de dados pessoais, utilize o formulário exclusivo de privacidade.”

&nbsp;

O botão ou link deve abrir o fluxo LGPD, não o funil comercial comum.

&nbsp;

Não basta colocar um comentário dizendo que existe risco. O fluxo precisa ser tecnicamente adequado.

&nbsp;

---

&nbsp;

6. CONTATO SENSÍVEL SOMENTE NO SERVIDOR

&nbsp;

Remover o número de WhatsApp de qualquer módulo cliente ou configuração importável pelo frontend.

&nbsp;

Não considerar como seguro apenas esconder o número atrás de uma rota autenticada.

&nbsp;

Criar separação explícita:

&nbsp;

src/lib/contact.server.ts

src/lib/funnel-intent.ts

src/lib/public-contact-policy.ts

&nbsp;

Regras:

&nbsp;

- Módulos ".server.ts" nunca podem ser importados por componentes cliente.

- Checkout e suporte transacional devem obter o destino por função server-side.

- Não enviar o número bruto para o frontend quando não for necessário.

- Preferir redirecionamento server-side ou URL temporária.

- Inspecionar "dist", chunks e sourcemaps.

- Confirmar que número e e-mail não aparecem no bundle.

- Criar regra de ESLint impedindo importação de módulos server-only no cliente.

&nbsp;

Não implemente uma função "whatsappUrl()" que decide em runtime se o contexto é público. Prefira impossibilidade estrutural de importação.

&nbsp;

---

&nbsp;

7. HEADER, FOOTER E CTAS

&nbsp;

Header

&nbsp;

Manter CTA nas páginas públicas relevantes.

&nbsp;

Usar textos adaptados ao contexto:

&nbsp;

- Home: “Encontrar a solução ideal”

- Soluções: “Solicitar diagnóstico”

- Cases: “Quero um projeto semelhante”

- Blog: “Avaliar meu negócio”

- Loja: “Tirar uma dúvida”

&nbsp;

Ocultar ou adaptar o CTA em:

&nbsp;

- Checkout

- Pedido

- Obrigado

- Admin

- Fluxo LGPD

- Momentos críticos do carrinho

&nbsp;

Footer

&nbsp;

Remover:

&nbsp;

- Número de telefone

- WhatsApp

- E-mail comercial

- "wa.me"

- "mailto:"

&nbsp;

Adicionar:

&nbsp;

- Botão “Falar com a 0WEB”

- Abertura do funil comercial

- Fallback para "/contato"

&nbsp;

O footer das políticas pode possuir acesso ao formulário exclusivo de privacidade.

&nbsp;

---

&nbsp;

8. ROTAS DINÂMICAS

&nbsp;

Auditar e migrar:

&nbsp;

- Cidade

- Bairro

- Empresa

- Profissional

- Vertical

- Serviço

- Cases

- Planos

- Calculadora

- Parceiros

- FAQ

- Sobre

- Home

- Sitemap

- 404

&nbsp;

Cada página deve montar um "ContactIntent" completo.

&nbsp;

Exemplos:

&nbsp;

Cidade

&nbsp;

{

  purpose: 'diagnosis',

  source: 'city-page',

  pagePath,

  placement: 'hero',

  citySlug,

  serviceSlug

}

&nbsp;

Case

&nbsp;

{

  purpose: 'proposal',

  source: 'case-page',

  pagePath,

  placement: 'case-final',

  caseSlug,

  serviceSlug

}

&nbsp;

Empresa ou profissional

&nbsp;

{

  purpose: 'commercial',

  source: 'marketplace-profile',

  pagePath,

  placement: 'profile-cta',

  companySlug,

  professionalSlug

}

&nbsp;

Não permitir objetos genéricos sem origem e posicionamento.

&nbsp;

---

&nbsp;

9. BLOG E CONTEÚDO

&nbsp;

Não fazer substituição textual cega por regex em todo o conteúdo.

&nbsp;

Primeiro inventariar os links e analisar o contexto de cada CTA.

&nbsp;

Substituir textos de acordo com a intenção real:

&nbsp;

- “Inicie uma avaliação”

- “Solicite uma proposta”

- “Avalie seu site”

- “Fale sobre uma parceria”

- “Solicite um diagnóstico”

- “Descubra a solução ideal”

&nbsp;

Criar marcador estruturado no conteúdo, semelhante a:

&nbsp;

{{contact_cta

  label="Solicitar avaliação"

  purpose="diagnosis"

  service="seo"

  source="blog"

}}

&nbsp;

O renderer deve transformar o marcador no componente central de CTA.

&nbsp;

Em links simples dentro do texto, utilizar "/contato" com parâmetros de origem e contexto.

&nbsp;

Não deixar links para WhatsApp ou e-mail em markdown, HTML ou dados dos posts.

&nbsp;

---

&nbsp;

10. SKYSCRAPER E POSTS PROGRAMÁTICOS

&nbsp;

Remover geração automática de links de WhatsApp.

&nbsp;

O CTA final deve:

&nbsp;

- Usar o componente central quando renderizado como React.

- Usar fallback para "/contato" quando o conteúdo for HTML ou markdown.

- Enviar "contentSlug", "serviceSlug", "source" e "placement".

- Não gerar URL direta para WhatsApp.

&nbsp;

---

&nbsp;

11. CHATBOT DA HOME

&nbsp;

Não reformular o chatbot nesta rodada, mas ele deve ser auditado agora.

&nbsp;

Verificar:

&nbsp;

- "wa.me"

- "api.whatsapp.com"

- "mailto:"

- "tel:"

- Número em texto

- E-mail em texto

- Respostas automáticas com contatos

- Botões externos

- Configurações vindas do banco

- Mensagens de fallback

- Links gerados dinamicamente

&nbsp;

Corrigir imediatamente qualquer violação da política Funnel-first.

&nbsp;

Depois, registrar em ".lovable/plan.md" apenas as melhorias funcionais que ficarem pendentes.

&nbsp;

Um simples "TODO" não substitui a auditoria de conformidade.

&nbsp;

---

&nbsp;

12. ANALYTICS

&nbsp;

Separar claramente os eventos:

&nbsp;

contact_cta_click

funnel_open

funnel_start

funnel_step_complete

funnel_submit

funnel_error

thank_you_view

lead_created

&nbsp;

Regras:

&nbsp;

- "contact_cta_click": usuário clicou.

- "funnel_open": funil abriu com sucesso.

- "funnel_start": primeira etapa iniciada.

- "funnel_submit": formulário enviado.

- "lead_created": somente após confirmação real no servidor.

- Não considerar clique como lead.

- Não disparar "funnel_open" antes da abertura efetiva.

&nbsp;

Payload mínimo:

&nbsp;

{

  funnel_session_id,

  page_path,

  source,

  placement,

  purpose,

  service_slug,

  city_slug,

  neighborhood_slug,

  company_slug,

  professional_slug,

  case_slug,

  content_slug,

  campaign

}

&nbsp;

Não enviar dados pessoais para GA4, GTM ou ferramentas de analytics.

&nbsp;

---

&nbsp;

13. PÁGINA DE AGRADECIMENTO

&nbsp;

A página "/obrigado" deve:

&nbsp;

- Confirmar o recebimento.

- Informar que a 0WEB entrará em contato.

- Não exibir telefone, WhatsApp ou e-mail comercial.

- Não gerar novo lead ao recarregar.

- Não reenviar o formulário.

- Preservar um identificador não sensível da solicitação.

- Permitir retorno ao site.

- Disparar "thank_you_view".

- Não disparar "lead_created" sem confirmação server-side.

&nbsp;

---

&nbsp;

14. JSON-LD E SEO

&nbsp;

Remover telefone e e-mail do JSON-LD quando esses contatos não forem canais públicos.

&nbsp;

Auditar:

&nbsp;

- "Organization"

- "LocalBusiness"

- "ProfessionalService"

- "ContactPoint"

- "Service"

- Dados de empresa

- Schemas de cidade

- Schemas de páginas locais

- Schemas de marketplace

- Schemas inseridos por CMS

&nbsp;

Não inventar um telefone alternativo.

&nbsp;

Manter informações válidas:

&nbsp;

- Nome

- URL

- Logo

- Endereço, quando aplicável

- Área atendida

- Serviços

- Redes sociais oficiais

- Identidade organizacional

&nbsp;

Apresentar no relatório o impacto estimado da remoção do telefone em SEO local, sem bloquear a implementação.

&nbsp;

---

&nbsp;

15. GUARD-RAILS

&nbsp;

Criar:

&nbsp;

scripts/validate-no-public-contact.mjs

&nbsp;

O validador deve procurar:

&nbsp;

- "wa.me"

- "api.whatsapp.com"

- "whatsapp://"

- "mailto:"

- "tel:"

- Números configurados

- E-mails comerciais

- "payments.whatsapp_number"

- Variáveis de ambiente públicas contendo contato

- Dados estruturados com telefone ou e-mail

- Links montados dinamicamente

- Strings ofuscadas ou concatenadas simples

&nbsp;

Allowlist mínima e explícita:

&nbsp;

- Código server-side de checkout

- Suporte de pedido

- Admin autenticado

- Configuração administrativa server-side

- Testes e fixtures estritamente necessários

&nbsp;

Não liberar diretórios inteiros sem necessidade.

&nbsp;

Adicionar o validador:

&nbsp;

- Ao pre-commit

- Ao CI

- Ao build de produção

- Aos testes de regressão

&nbsp;

Também criar uma segunda verificação sobre os arquivos gerados em "dist".

&nbsp;

---

&nbsp;

16. TESTES OBRIGATÓRIOS

&nbsp;

Criar testes para:

&nbsp;

1. CTA abre o funil.

2. "funnel_open" dispara somente após abertura.

3. Falha do modal redireciona para "/contato".

4. "/contato" funciona com o formulário embutido.

5. Contexto da URL é carregado no formulário.

6. Navegação por teclado.

7. Foco ao abrir e fechar modal.

8. Escape fecha o modal.

9. Bloqueio de duplo clique.

10. CTA funciona após hidratação tardia.

11. Nenhum contato aparece no HTML público.

12. Nenhum contato aparece no JSON-LD.

13. Nenhum contato aparece nos chunks de produção.

14. Fluxo LGPD não dispara eventos comerciais.

15. Fluxo LGPD não adiciona lead a marketing.

16. Checkout continua funcionando.

17. Suporte de pedido continua funcionando.

18. Carrinho continua funcionando.

19. Página de obrigado não duplica envio.

20. Chatbot não expõe contato.

21. Blog não contém links proibidos.

22. Skyscraper não gera WhatsApp.

23. Lighthouse e acessibilidade sem regressão crítica.

24. Typecheck e build limpos.

&nbsp;

Quando possível, incluir teste com JavaScript indisponível ou fallback progressivo.

&nbsp;

---

&nbsp;

17. AUDITORIA INICIAL ANTES DAS ALTERAÇÕES

&nbsp;

Antes de implementar qualquer coisa, faça uma auditoria somente-leitura e entregue:

&nbsp;

Inventário

&nbsp;

- Todos os arquivos com "wa.me"

- Todos os arquivos com "api.whatsapp.com"

- Todos os "mailto:"

- Todos os "tel:"

- Todos os números em texto

- Todos os e-mails públicos

- Todos os JSON-LD com telefone ou e-mail

- Todas as configurações de contato

- Todos os CTAs comerciais

- Todos os componentes que geram URLs dinamicamente

- Todos os dados provenientes do banco

- Todas as referências no chatbot

- Todas as referências em conteúdo, blog e skyscraper

- Todas as referências em arquivos gerados

&nbsp;

Classificação

&nbsp;

Classifique cada ocorrência como:

&nbsp;

- Remover

- Migrar para funil

- Migrar para fluxo LGPD

- Manter como suporte transacional

- Manter no admin server-side

- Falso positivo

- Requer decisão

&nbsp;

Impacto

&nbsp;

Informar:

&nbsp;

- Quantidade real de arquivos afetados.

- Risco de regressão.

- Rotas críticas.

- Dependências compartilhadas.

- Possíveis contatos carregados do banco.

- Possíveis contatos presentes no bundle.

- Riscos de acessibilidade.

- Riscos jurídicos.

- Riscos de SEO.

- Riscos de perda de conversão.

&nbsp;

Não aceite a estimativa prévia de aproximadamente 20 arquivos sem verificar.

&nbsp;

---

&nbsp;

18. ORDEM DE IMPLEMENTAÇÃO APÓS O RELATÓRIO

&nbsp;

Depois que o relatório for aprovado, a execução deve seguir esta ordem:

&nbsp;

1. Criar tipos de intenção e resolver central.

2. Criar "ContactCTAButton".

3. Criar fallback universal.

4. Reestruturar "/contato".

5. Separar fluxo LGPD.

6. Separar configurações server-only.

7. Ajustar header e footer.

8. Migrar páginas institucionais.

9. Migrar rotas dinâmicas.

10. Migrar loja para a regra compra versus dúvida.

11. Migrar blog e conteúdos.

12. Migrar skyscraper.

13. Auditar e corrigir chatbot.

14. Ajustar analytics.

15. Ajustar JSON-LD.

16. Criar validator de código-fonte.

17. Criar validator do build.

18. Adicionar CI e pre-commit.

19. Rodar testes.

20. Entregar relatório final.

&nbsp;

---

&nbsp;

19. RESTRIÇÕES

&nbsp;

- Não alterar slugs.

- Não remover páginas.

- Não quebrar checkout.

- Não quebrar pedidos.

- Não quebrar admin.

- Não quebrar carrinho.

- Não alterar DNS.

- Não alterar domínio.

- Não publicar.

- Não inventar contato.

- Não inserir avaliações falsas.

- Não misturar LGPD com vendas.

- Não fazer substituição destrutiva em massa.

- Não ocultar erros de build ou teste.

- Não considerar CTA clicado como lead.

- Não deixar fallback dependente do mesmo JavaScript do modal.

- Não guardar telefone em variável "VITE_*".

- Não importar módulo server-only no cliente.

&nbsp;

---

&nbsp;

20. ENTREGA DESTA PRIMEIRA ETAPA

&nbsp;

Nesta etapa, entregue apenas:

&nbsp;

1. Auditoria completa.

2. Lista exata de ocorrências.

3. Arquivos e rotas afetados.

4. Classificação de cada ocorrência.

5. Arquitetura recomendada.

6. Plano de migração atualizado.

7. Testes necessários.

8. Riscos encontrados.

9. Inconsistências do plano original.

10. Ordem segura de execução.

&nbsp;

Não altere código até apresentar esse relatório.

&nbsp;

Ao final, inclua:

&nbsp;

Status: AUDITORIA CONCLUÍDA — NENHUMA ALTERAÇÃO APLICADA