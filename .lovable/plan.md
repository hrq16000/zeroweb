Plano sequencial — uma entrega por vez, validando antes da próxima.

## Entrega 1 — Auto-linking de partners.user_id

Casar parceiros aprovados ao usuário recém-criado pelo email.

- Migration: estender `handle_new_user_profile()` (trigger AFTER INSERT em `auth.users`) para também executar:
  `UPDATE public.partners SET user_id = NEW.id WHERE LOWER(email) = LOWER(NEW.email) AND user_id IS NULL AND status = 'approved'`
- Registrar em `partner_audit_log` (action: `auto_linked`) quando ocorrer.
- Sem alteração de frontend.

## Entrega 2 — Attribution no formulário de orçamento

Capturar `0web_partner` cookie e atribuir ao lead após sucesso.

- Localizar o(s) formulário(s) de orçamento existente(s) (`/orcamento`, `/contato`, etc.).
- No `onSubmit`, ler `document.cookie` por `0web_partner`.
- Após sucesso do insert em `lead_submissions`, chamar `attachAttributionToLead({ leadId, code })`.
- Fire-and-forget (não bloqueia UX); log silencioso se falhar.

## Entrega 3 — computeCommission

Calcular comissão a partir de `commission_rules` e persistir.

- Nova tabela `partner_commissions`: `partner_id`, `attribution_id`, `rule_id`, `base_amount`, `commission_amount`, `commission_type`, `status` (pending/approved/paid/cancelled), `period`, `notes`, timestamps.
- Server fn `computeCommission({ attributionId, baseAmount })`:
  - Busca regra ativa do `partner.kind` (ou regra default), aplica `percent`/`fixed`/`tiered`.
  - Insere `partner_commissions` com status `pending`.
- Botão no admin (PartnersTab) para "Calcular comissões pendentes" a partir de atribuições convertidas.

## Entrega 4 — Sugestão por território

Sugerir representante ativo ao receber lead com city/state.

- Server fn `suggestPartnerForLead({ leadId, city, state })`:
  - Query `partner_territories` por match (state obrigatório, city opcional), priorizando matches mais específicos.
  - Filtra parceiros `status = 'approved'` e `kind` representativo.
- Trigger DB ou hook server: ao inserir `lead_submission` sem `partner_attribution`, popular `partner_attributions` com o melhor match (registrar `source = 'territory'`).
- Admin: badge "Sugerido por território" na lista de leads.

## Entrega 5 — Anti-spam em /parceiros

Rate-limit por IP (janela deslizante) + honeypot, sem captcha externo.

- Migration: tabela `rate_limit_buckets` (`scope` text, `ip_hash` text, `created_at` timestamptz). Index parcial em (scope, ip_hash, created_at).
- Função SQL `check_and_record_rate_limit(scope, ip_hash, window_seconds, max_hits)` → boolean (true = permitido).
- Form `/parceiros`: campo honeypot oculto (`website_url`) — se preenchido, descarta silenciosamente.
- Server fn `applyAsPartner`: lê IP do header, faz SHA-256, chama RPC de rate-limit (10 req / 1h por IP em `partner_signup`). Valida com Zod estrita (email, telefone, max-lengths).
- Cleanup: incluir purge de `rate_limit_buckets` antigos na rotina LGPD existente.

## Detalhes Técnicos

- Triggers: `SECURITY DEFINER`, `search_path = public`, sempre em DO blocks idempotentes.
- Server fns sob `src/lib/*.functions.ts`; importar `client.server` apenas dentro do `.handler()` com `await import()`.
- RLS: `partner_commissions` legível pelo dono (`user_id = auth.uid()` via partner_id) e por admin; `rate_limit_buckets` sem grant para anon/authenticated (apenas service_role).
- Cookie `0web_partner` já é setado em `/r/$code` (60 dias) — não alterar.
- Logs: `console.error` em falhas, sem expor PII.

## Ordem de execução

1 → validação → 2 → validação → 3 → validação → 4 → validação → 5. Cada entrega = 1 migration (se aplicável) + arquivos de código + nota no chat antes de prosseguir.
