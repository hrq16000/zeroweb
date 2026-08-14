DO $$
DECLARE
  v_form uuid;
  v_step uuid;
BEGIN
  -- ============ funnel-lgpd ============
  IF NOT EXISTS (SELECT 1 FROM public.dynamic_forms WHERE slug = 'funnel-lgpd') THEN
    INSERT INTO public.dynamic_forms (slug, name, description, status, config_json)
    VALUES ('funnel-lgpd', 'Solicitação LGPD', 'Canal exclusivo para titulares de dados exercerem seus direitos.', 'published', '{"auto_advance_ms":400}'::jsonb)
    RETURNING id INTO v_form;

    INSERT INTO public.dynamic_form_steps (form_id, order_index, title, subtitle)
    VALUES (v_form, 0, 'Solicitação LGPD', 'Responda 5 perguntas rápidas.')
    RETURNING id INTO v_step;

    INSERT INTO public.dynamic_form_questions (form_id, step_id, key, type, label, order_index, required, options_json) VALUES
      (v_form, v_step, 'tipo_solicitacao', 'radio', 'Qual é a sua solicitação?', 0, true,
        '[{"value":"acesso","label":"Acessar meus dados"},{"value":"correcao","label":"Corrigir meus dados"},{"value":"exclusao","label":"Excluir meus dados"},{"value":"revogacao","label":"Revogar consentimento"},{"value":"outro","label":"Outro assunto de privacidade"}]'::jsonb),
      (v_form, v_step, 'detalhes', 'long_text', 'Descreva sua solicitação', 1, false, '[]'::jsonb),
      (v_form, v_step, 'nome', 'short_text', 'Qual é o seu nome completo?', 2, true, '[]'::jsonb),
      (v_form, v_step, 'email', 'email', 'Seu e-mail para retorno', 3, true, '[]'::jsonb),
      (v_form, v_step, 'whatsapp', 'phone', 'Seu WhatsApp com DDD', 4, true, '[]'::jsonb);
  END IF;

  -- ============ funnel-order-support ============
  IF NOT EXISTS (SELECT 1 FROM public.dynamic_forms WHERE slug = 'funnel-order-support') THEN
    INSERT INTO public.dynamic_forms (slug, name, description, status, config_json)
    VALUES ('funnel-order-support', 'Suporte ao Pedido', 'Atendimento para clientes com pedido em andamento.', 'published', '{"auto_advance_ms":400}'::jsonb)
    RETURNING id INTO v_form;

    INSERT INTO public.dynamic_form_steps (form_id, order_index, title, subtitle)
    VALUES (v_form, 0, 'Suporte ao pedido', 'Vamos localizar seu pedido.')
    RETURNING id INTO v_step;

    INSERT INTO public.dynamic_form_questions (form_id, step_id, key, type, label, order_index, required, options_json) VALUES
      (v_form, v_step, 'pedido_ref', 'short_text', 'Número ou protocolo do pedido', 0, false, '[]'::jsonb),
      (v_form, v_step, 'tipo_ajuda', 'radio', 'Como podemos ajudar?', 1, true,
        '[{"value":"status","label":"Status do pedido"},{"value":"pagamento","label":"Pagamento ou nota fiscal"},{"value":"alteracao","label":"Alterar algo no pedido"},{"value":"problema","label":"Relatar um problema"},{"value":"outro","label":"Outro assunto"}]'::jsonb),
      (v_form, v_step, 'detalhes', 'long_text', 'Conte o que está acontecendo', 2, false, '[]'::jsonb),
      (v_form, v_step, 'nome', 'short_text', 'Qual é o seu nome?', 3, true, '[]'::jsonb),
      (v_form, v_step, 'whatsapp', 'phone', 'Seu WhatsApp com DDD', 4, true, '[]'::jsonb);
  END IF;
END $$;