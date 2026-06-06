
-- ============== 1) SEED: substituir perguntas do diagnóstico ==============
DO $$
DECLARE
  v_form_id uuid;
BEGIN
  SELECT id INTO v_form_id FROM public.dynamic_forms WHERE slug = 'diagnostico-0web';
  IF v_form_id IS NULL THEN
    INSERT INTO public.dynamic_forms (slug, name, description, status, config_json, whatsapp_config)
    VALUES ('diagnostico-0web', 'Diagnóstico Digital 0web',
            'Funil de qualificação 0web — Google Ads + Meta Ads + presença digital',
            'published',
            '{"auto_advance_ms": 350}'::jsonb,
            jsonb_build_object(
              'enabled', true,
              'redirect_phone', '5511999999999',
              'alert_phone', '5511999999999',
              'user_message_template',
                E'🚀 *QUERO MAIS CLIENTES — 0web*\n\nOlá! Acabei de preencher o diagnóstico digital.\n\n📋 *Minhas respostas:*\n{{answers}}\n\n🌐 *Metadados:*\n{{metadata}}',
              'alert_message_template',
                E'🔥 *Novo lead — {{form}}*\n\n📋 *Respostas:*\n{{answers}}\n\n🌐 *Metadados:*\n{{metadata}}'
            ))
    RETURNING id INTO v_form_id;
  ELSE
    UPDATE public.dynamic_forms
    SET status = 'published',
        whatsapp_config = COALESCE(whatsapp_config, '{}'::jsonb) || jsonb_build_object(
          'user_message_template',
            E'🚀 *QUERO MAIS CLIENTES — 0web*\n\nOlá! Acabei de preencher o diagnóstico digital.\n\n📋 *Minhas respostas:*\n{{answers}}\n\n🌐 *Metadados:*\n{{metadata}}',
          'alert_message_template',
            E'🔥 *Novo lead — {{form}}*\n\n📋 *Respostas:*\n{{answers}}\n\n🌐 *Metadados:*\n{{metadata}}'
        )
    WHERE id = v_form_id;
  END IF;

  -- Limpa perguntas/condições antigas
  DELETE FROM public.dynamic_form_conditions WHERE form_id = v_form_id;
  DELETE FROM public.dynamic_form_questions WHERE form_id = v_form_id;

  -- Insere as 13 perguntas oficiais
  INSERT INTO public.dynamic_form_questions (form_id, key, type, label, hint, placeholder, order_index, required, options_json) VALUES
    (v_form_id, 'welcome', 'statement',
      'Vamos descobrir como atrair mais clientes para você 🚀',
      'Leva ~90 segundos. Suas respostas montam um diagnóstico personalizado.',
      NULL, 0, false, '[]'::jsonb),

    (v_form_id, 'nome', 'short_text',
      'Qual é o seu nome completo?', NULL, 'Seu nome', 1, true, '[]'::jsonb),

    (v_form_id, 'empresa', 'short_text',
      'Qual é o nome da sua empresa ou marca?', NULL, 'Ex: Pizzaria do João', 2, true, '[]'::jsonb),

    (v_form_id, 'segmento', 'select',
      'Qual é o segmento do seu negócio?', NULL, NULL, 3, true,
      jsonb_build_array(
        jsonb_build_object('value','servicos','label','Prestação de serviços'),
        jsonb_build_object('value','comercio','label','Comércio / loja física'),
        jsonb_build_object('value','ecommerce','label','E-commerce / loja online'),
        jsonb_build_object('value','industria','label','Indústria / fábrica'),
        jsonb_build_object('value','saude','label','Saúde / clínica / consultório'),
        jsonb_build_object('value','educacao','label','Educação / cursos'),
        jsonb_build_object('value','alimentacao','label','Alimentação / restaurante'),
        jsonb_build_object('value','beleza','label','Beleza / estética'),
        jsonb_build_object('value','construcao','label','Construção / reforma'),
        jsonb_build_object('value','imobiliario','label','Imobiliário'),
        jsonb_build_object('value','automotivo','label','Automotivo'),
        jsonb_build_object('value','tecnologia','label','Tecnologia / software'),
        jsonb_build_object('value','outro','label','Outro')
      )),

    (v_form_id, 'servico_principal', 'short_text',
      'Qual serviço ou produto você mais quer vender?',
      'Pense no carro-chefe do seu negócio.',
      'Ex: troca de óleo, consulta odontológica, pacote de marketing…',
      4, true, '[]'::jsonb),

    (v_form_id, 'cidade', 'short_text',
      'Em qual cidade ou região você atua?', NULL, 'Ex: São Paulo - SP', 5, true, '[]'::jsonb),

    (v_form_id, 'tamanho_empresa', 'select',
      'Qual é o tamanho da sua empresa?', NULL, NULL, 6, true,
      jsonb_build_array(
        jsonb_build_object('value','solo','label','Sou eu sozinho(a)'),
        jsonb_build_object('value','2_5','label','2 a 5 pessoas'),
        jsonb_build_object('value','6_20','label','6 a 20 pessoas'),
        jsonb_build_object('value','21_50','label','21 a 50 pessoas'),
        jsonb_build_object('value','50_plus','label','Mais de 50 pessoas')
      )),

    (v_form_id, 'origem_clientes', 'select',
      'Como você consegue clientes hoje?', NULL, NULL, 7, true,
      jsonb_build_array(
        jsonb_build_object('value','indicacao','label','Indicação / boca a boca'),
        jsonb_build_object('value','redes_sociais','label','Redes sociais (Instagram, Facebook)'),
        jsonb_build_object('value','google','label','Google (orgânico ou anúncios)'),
        jsonb_build_object('value','rua','label','Quem passa em frente ao negócio'),
        jsonb_build_object('value','prospeccao','label','Prospecção ativa / vendedores'),
        jsonb_build_object('value','marketplaces','label','Marketplaces / plataformas'),
        jsonb_build_object('value','nenhum','label','Quase não consigo clientes novos')
      )),

    (v_form_id, 'clientes_mes', 'select',
      'Quantos clientes novos você fecha por mês hoje?', NULL, NULL, 8, true,
      jsonb_build_array(
        jsonb_build_object('value','0','label','Nenhum / quase nenhum'),
        jsonb_build_object('value','1_5','label','De 1 a 5'),
        jsonb_build_object('value','6_15','label','De 6 a 15'),
        jsonb_build_object('value','16_50','label','De 16 a 50'),
        jsonb_build_object('value','50_plus','label','Mais de 50')
      )),

    (v_form_id, 'objetivo', 'select',
      'Qual é seu objetivo principal agora?', NULL, NULL, 9, true,
      jsonb_build_array(
        jsonb_build_object('value','mais_clientes','label','Atrair mais clientes / vendas'),
        jsonb_build_object('value','aparecer_google','label','Aparecer mais no Google'),
        jsonb_build_object('value','presenca_digital','label','Profissionalizar a presença digital'),
        jsonb_build_object('value','escalar','label','Escalar e crescer rápido'),
        jsonb_build_object('value','automatizar','label','Automatizar marketing/vendas')
      )),

    (v_form_id, 'investimento', 'select',
      'Quanto pretende investir em marketing por mês?',
      'Inclui mídia paga + gestão.',
      NULL, 10, true,
      jsonb_build_array(
        jsonb_build_object('value','ate_399','label','Até R$ 399'),
        jsonb_build_object('value','400_799','label','R$ 400 – R$ 799'),
        jsonb_build_object('value','800_1500','label','R$ 800 – R$ 1.500'),
        jsonb_build_object('value','1500_3000','label','R$ 1.500 – R$ 3.000'),
        jsonb_build_object('value','3000_plus','label','Acima de R$ 3.000'),
        jsonb_build_object('value','nao_sei','label','Ainda não sei')
      )),

    (v_form_id, 'instagram', 'short_text',
      'Qual é o Instagram da empresa? (opcional)',
      'Sem o @, só o usuário.',
      'minhaempresa', 11, false, '[]'::jsonb),

    (v_form_id, 'tem_site', 'radio',
      'Sua empresa já possui site?', NULL, NULL, 12, true,
      jsonb_build_array(
        jsonb_build_object('value','sim','label','Sim, já tenho site','emoji','✅'),
        jsonb_build_object('value','nao','label','Ainda não tenho','emoji','🚧')
      )),

    (v_form_id, 'ciencia_investimento', 'radio',
      'Tem ciência que o Google e Meta Ads exigem um investimento mensal em anúncios?', NULL, NULL, 13, true,
      jsonb_build_array(
        jsonb_build_object('value','ciente','label','Sim, estou ciente','emoji','👍'),
        jsonb_build_object('value','duvidas','label','Ainda tenho dúvidas','emoji','🤔')
      )),

    (v_form_id, 'telefone', 'phone',
      'Qual é o seu WhatsApp?',
      'Vamos te enviar o diagnóstico por aqui.',
      '(11) 99999-9999', 14, true, '[]'::jsonb),

    (v_form_id, 'email', 'email',
      'E o seu melhor e-mail?', NULL, 'voce@empresa.com', 15, true, '[]'::jsonb);
END $$;

-- ============== 2) FIX SEGURANÇA: service_requests sem ownership binding ==============
-- Remove a policy permissiva e cria uma que exige requester_user_id alinhado ao caller
DROP POLICY IF EXISTS "anyone insert service requests" ON public.service_requests;
DROP POLICY IF EXISTS "public can submit service requests" ON public.service_requests;
DROP POLICY IF EXISTS "anon insert service requests" ON public.service_requests;
DROP POLICY IF EXISTS "service_requests_public_insert" ON public.service_requests;

CREATE POLICY "service_requests_insert_with_ownership"
  ON public.service_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND requester_user_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND requester_user_id = auth.uid())
  );
