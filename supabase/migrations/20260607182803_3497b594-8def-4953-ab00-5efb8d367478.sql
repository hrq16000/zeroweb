
-- =========================================================================
-- Fase 1: ampliar services para vitrine de loja virtual 100% gerenciável
-- =========================================================================

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS price numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_period text,
  ADD COLUMN IF NOT EXISTS delivery_days text,
  ADD COLUMN IF NOT EXISTS conditions text,
  ADD COLUMN IF NOT EXISTS show_in_menu boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_in_footer boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_in_home_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_in_sitemap boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS funnels jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sections jsonb NOT NULL DEFAULT '[]'::jsonb;

-- =========================================================================
-- Backfill: 10 serviços órfãos hoje em src/lib/services-data.ts
-- Sem image_path → aparecem como "Capa pendente" no painel para upload.
-- Conteúdo mínimo aqui; refinamento profundo virá pelo editor de seções.
-- =========================================================================

INSERT INTO public.services
  (slug, name, category, title, h1, description, service_type,
   problems, benefits, process, faq, keywords,
   cta_label, is_active, is_featured, display_order,
   show_in_menu, show_in_footer, show_in_home_featured, show_in_sitemap)
VALUES
  ('site-express','Site Express em 24h','Web',
   'Site Express em 24h — entrega rápida','Site profissional pronto em 24 horas',
   'Site institucional moderno entregue em até 24 horas, com SEO básico e responsivo.','WebsiteCreation',
   '["Não tenho tempo de esperar semanas","Site atual está obsoleto"]'::jsonb,
   '["Entrega em 24h","SEO básico","Responsivo","Hospedagem inclusa primeiro mês"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["site rapido","site 24h","site express"]'::jsonb,
   'Quero meu site em 24h', true, true, 15, true, true, true, true),

  ('site-24h','Site em 24 horas','Web',
   'Site em 24 horas','Site profissional em 24 horas',
   'Variante do Site Express com foco em landing de conversão.','WebsiteCreation',
   '["Preciso vender já"]'::jsonb,'["Entrega rápida","Foco em conversão"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["site 24 horas","landing rapida"]'::jsonb,
   'Solicitar agora', true, false, 16, true, true, false, true),

  ('consultoria','Consultoria Estratégica','Consultoria',
   'Consultoria Digital Estratégica','Consultoria estratégica de marketing digital',
   'Diagnóstico completo e plano de ação para crescer no digital.','Consulting',
   '["Não sei por onde começar","Investimento sem retorno"]'::jsonb,
   '["Diagnóstico completo","Plano de ação","Acompanhamento mensal"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["consultoria digital","mentoria marketing"]'::jsonb,
   'Agendar diagnóstico', true, false, 80, true, true, false, true),

  ('seo','SEO','SEO',
   'SEO — Otimização para Google','SEO técnico, on-page e off-page',
   'Estratégia completa de SEO técnico, on-page e off-page para tráfego orgânico sustentável.','SEOServices',
   '["Site não aparece no Google","Tráfego orgânico baixo"]'::jsonb,
   '["Auditoria técnica","Conteúdo otimizado","Link building","Relatórios mensais"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["seo","otimizacao google","trafego organico"]'::jsonb,
   'Quero ranquear no Google', true, true, 30, true, true, true, true),

  ('marketplace','Marketplace de Serviços','Marketplace',
   'Marketplace de Serviços 0WEB','Conecte-se a profissionais qualificados',
   'Plataforma que conecta empresas a prestadores de serviço verificados.','Marketplace',
   '["Difícil achar bom profissional"]'::jsonb,
   '["Profissionais verificados","Pagamento seguro","Avaliações reais"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["marketplace servicos","profissionais"]'::jsonb,
   'Acessar marketplace', true, false, 90, true, true, false, true),

  ('parceiros','Programa de Parceiros','Parceria',
   'Programa de Parceiros 0WEB','Indique e ganhe comissão recorrente',
   'Programa de afiliados com comissões recorrentes e materiais prontos.','AffiliateProgram',
   '["Quero monetizar minha audiência"]'::jsonb,
   '["Comissão recorrente","Materiais prontos","Dashboard em tempo real"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["programa parceiros","afiliados"]'::jsonb,
   'Quero ser parceiro', true, false, 95, true, true, false, true),

  ('trafego-pago','Tráfego Pago','Tráfego',
   'Tráfego Pago — Google Ads e Meta Ads','Campanhas pagas com ROI mensurável',
   'Gestão profissional de Google Ads e Meta Ads com foco em ROI.','DigitalMarketing',
   '["Estou queimando dinheiro em ads","Não sei medir retorno"]'::jsonb,
   '["Campanhas otimizadas","ROI mensurável","Relatórios semanais"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["trafego pago","google ads","meta ads"]'::jsonb,
   'Quero campanhas que vendem', true, true, 25, true, true, true, true),

  ('trafego-pago-local','Tráfego Pago Local','Tráfego',
   'Tráfego Pago Local — Negócios físicos','Atraia clientes da sua cidade',
   'Campanhas geolocalizadas para negócios locais (Google Ads + Meta).','DigitalMarketing',
   '["Quero clientes da minha região"]'::jsonb,
   '["Segmentação por bairro","Anúncios no Google Maps","Remarketing local"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["trafego local","ads local"]'::jsonb,
   'Quero clientes locais', true, false, 26, true, true, false, true),

  ('presenca-digital','Presença Digital','Marketing',
   'Presença Digital Completa','Site + Google + Redes Sociais',
   'Pacote completo: site, Google Meu Negócio e redes sociais sincronizados.','DigitalMarketing',
   '["Minha marca não aparece online"]'::jsonb,
   '["Site profissional","GMN otimizado","Posts mensais"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["presenca digital","marketing completo"]'::jsonb,
   'Quero presença completa', true, false, 50, true, true, false, true),

  ('google-meu-negocio','Google Meu Negócio','Local',
   'Otimização Google Meu Negócio','Apareça no Google Maps e Buscas Locais',
   'Otimização e gestão do perfil Google Meu Negócio.','LocalSEO',
   '["Concorrência aparece e eu não"]'::jsonb,
   '["Perfil otimizado","Fotos profissionais","Gestão de avaliações"]'::jsonb,
   '[]'::jsonb,'[]'::jsonb,'["google meu negocio","gmn","maps"]'::jsonb,
   'Quero aparecer no Maps', true, true, 40, true, true, true, true)
ON CONFLICT (slug) DO NOTHING;
