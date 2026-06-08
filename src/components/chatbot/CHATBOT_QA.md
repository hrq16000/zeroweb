# HomeChatbot — QA Checklist

Use este documento como roteiro manual para o widget de chat da Home
(`src/components/chatbot/HomeChatbot.tsx`). Os testes unitários
relacionados ficam em `chatbot-utils.test.ts`.

---

## 1. Acessibilidade por teclado (sem mouse)

Abra `/` e use **apenas** Tab / Shift+Tab / Enter / Esc / Space.

- [ ] **Tab** chega no botão "Como posso te ajudar?" com anel de foco visível.
- [ ] **Enter / Space** abre o painel. O foco vai automaticamente para o botão "Fechar chat" (`closeBtnRef`).
- [ ] **Tab** percorre, em ordem lógica: Fechar → chips de serviço → chips do passo seguinte (à medida que o fluxo avança).
- [ ] **Enter** em um chip seleciona a opção e avança para o próximo passo.
- [ ] No Step 3: **Tab** percorre Nome → WhatsApp → Checkbox LGPD → "Revisar e enviar".
- [ ] **Enter** dentro de qualquer campo do Step 3 dispara o submit do `<form>` → vai para a tela de revisão.
- [ ] Na tela de revisão: **Tab** percorre "Confirmar e enviar" → "Editar dados".
- [ ] **Esc** fecha o painel em qualquer passo.
- [ ] **Shift+Tab** volta na ordem inversa sem prender o foco.

### Foco no primeiro erro

- [ ] Submeter o Step 3 com nome vazio → foco vai para o campo Nome (`nameRef.current.focus()`), e a mensagem com `role="alert"` é lida pelo leitor de tela.
- [ ] Submeter com WhatsApp inválido → foco vai para o campo WhatsApp e a mensagem aparece com `aria-describedby` apontando para o erro.
- [ ] Submeter sem marcar consentimento → erro global aparece com `role="alert"` e o botão fica desabilitado até marcar.

---

## 2. Persistência (refresh)

- [ ] No Step 0, escolher um serviço → recarregar a página → ao reabrir o widget, o passo permanece em "Step 1" (perfil) com a mensagem do bot já presente.
- [ ] No Step 3, digitar nome e WhatsApp parciais, marcar consentimento e recarregar → ao reabrir, os campos voltam preenchidos e o checkbox marcado.
- [ ] WhatsApp restaurado mantém a **máscara** (ex.: `(11) 99988-7766`) — verificado por `chatbot-utils.test.ts`.
- [ ] Na tela de revisão, recarregar a página → volta direto na tela de revisão (`state.reviewing` persiste).
- [ ] Após envio (Step 4), recarregar → o estado final permanece, com os botões de CTA visíveis.

Os testes unitários em `chatbot-utils.test.ts` cobrem o round-trip via
`sessionStorage` e a re-aplicação da máscara.

---

## 3. Tracking padronizado

Abra o DevTools → `window.dataLayer` e dispare cada evento. Confirme que
**todos** os eventos `chatbot_*` contêm os mesmos 4 campos de atribuição:

- `utm_source` (default `(direct)`)
- `utm_medium` (default `(none)`)
- `utm_campaign` (default `(none)`)
- `page_path` (sempre presente, ex.: `/`)

Eventos disparados pelo widget:

| Evento                  | Quando                                      |
| ----------------------- | ------------------------------------------- |
| `chatbot_open`          | Usuário abre o painel                       |
| `chatbot_close`         | Usuário fecha (Esc ou X)                    |
| `chatbot_step`          | Avança de passo (1, 2, 3, 3+review, 4)      |
| `chatbot_review_edit`   | Clica em "Editar dados" na tela de revisão  |
| `chatbot_input_error`   | Validação local falha (nome/whatsapp/consent) |
| `chatbot_submit_attempt`| Confirmou na revisão e tentou enviar        |
| `chatbot_submit_error`  | Erro de rede ou insert                      |
| `chatbot_lead`          | Conversão (insert OK) — também `trackConversion` |
| `chatbot_cta`           | Cliques nos botões do Step 4                |

> Teste de UTM: visite `/?utm_source=google&utm_medium=cpc&utm_campaign=brand`
> e confirme que os eventos `chatbot_step` e `chatbot_lead` contêm
> `utm_source=google`, `utm_medium=cpc`, `utm_campaign=brand`.

---

## 4. Tela de prévia / revisão (Step 3 → Confirmar)

- [ ] Botão "Revisar e enviar" só fica habilitado com nome ≥ 2 chars + WhatsApp válido + consentimento.
- [ ] Ao clicar, mostra um card com "Confira seus dados" exibindo Nome, WhatsApp e selo de consentimento.
- [ ] "Editar dados" volta ao formulário **sem perder** o que foi digitado.
- [ ] "Confirmar e enviar" faz o insert. Em caso de erro de rede, o card de revisão permanece com os dados, permitindo nova tentativa.
- [ ] Após sucesso, vai para Step 4 com a mensagem final e os CTAs.
