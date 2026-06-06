
-- 1) Table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  h1 text NOT NULL,
  description text NOT NULL,
  service_type text NOT NULL,
  tagline text,
  price_from numeric(10,2),
  problems jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  process jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text NOT NULL DEFAULT 'Solicitar proposta',
  cta_target text,
  image_path text,
  image_alt text,
  seo_title text,
  seo_description text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_active_order ON public.services (is_active, display_order);
CREATE INDEX idx_services_category ON public.services (category);

-- 2) GRANTs (public-readable; mutations gated by RLS to admin)
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

-- 3) RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "services_public_read_active"
  ON public.services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "services_admin_read_all"
  ON public.services FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "services_admin_insert"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "services_admin_update"
  ON public.services FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

CREATE POLICY "services_admin_delete"
  ON public.services FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- 4) updated_at trigger
CREATE OR REPLACE FUNCTION public.services_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.services_set_updated_at();

-- 5) Seed initial services (mirror src/lib/services-data.ts)
INSERT INTO public.services (slug, name, category, title, h1, description, service_type, cta_label, display_order, is_featured, keywords)
VALUES
  ('criacao-de-sites','Criação de Sites','Web','Criação de Sites Profissionais · 0WEB','Criação de sites que vendem','Sites institucionais rápidos, modernos e otimizados para Google. Conversão acima da média do mercado.','Web Design','Quero meu site',10,true,'["criação de sites","desenvolvimento de sites","agência de sites","site profissional"]'::jsonb),
  ('landing-pages','Landing Pages','Conversão','Landing Pages de Alta Conversão · 0WEB','Landing pages que convertem visitantes em clientes','Páginas focadas em conversão para Google Ads e Meta Ads. Taxa de conversão até 4x maior.','Conversion Rate Optimization','Quero minha landing page',20,false,'["landing page","página de conversão","CRO"]'::jsonb),
  ('loja-virtual','Loja Virtual','E-commerce','Criação de Loja Virtual / E-commerce · 0WEB','Loja virtual completa para vender 24/7','E-commerce completo, integrado a meios de pagamento, frete e ERP. Pronto para escalar.','E-commerce Development','Quero minha loja',30,false,'["loja virtual","e-commerce","ecommerce","criar loja online"]'::jsonb),
  ('marketing-digital','Marketing Digital','Tráfego','Marketing Digital · Gestão de Tráfego · 0WEB','Marketing digital que gera vendas, não só curtidas','Gestão completa de tráfego pago e orgânico. Foco em ROI, não em vaidade.','Digital Marketing','Quero crescer agora',40,true,'["marketing digital","tráfego pago","Google Ads","Meta Ads"]'::jsonb),
  ('automacao-com-ia','Automação com IA','IA','Automação com Inteligência Artificial · 0WEB','IA que trabalha por você, 24 horas por dia','Automatize atendimento, qualificação de leads, follow-up e processos internos com inteligência artificial.','AI Automation','Quero automatizar',50,true,'["automação com IA","inteligência artificial","RPA","IA generativa"]'::jsonb),
  ('chatbot-whatsapp','Chatbot WhatsApp','IA','Chatbot WhatsApp com IA · 0WEB','Chatbot WhatsApp que atende como humano','Atendimento automatizado no WhatsApp com IA. Qualifica, agenda e vende sozinho.','Chatbot Development','Quero meu chatbot',60,false,'["chatbot WhatsApp","atendimento automático","WhatsApp Business API"]'::jsonb),
  ('desenvolvimento-saas','Desenvolvimento SaaS','Sistemas','Desenvolvimento de SaaS sob Medida · 0WEB','Desenvolvimento de SaaS do zero ao lançamento','Construímos seu produto SaaS do MVP ao escalonamento. Stack moderno, multi-tenant e seguro.','SaaS Development','Quero desenvolver meu SaaS',70,false,'["desenvolvimento SaaS","criar SaaS","produto digital","MVP"]'::jsonb),
  ('sistemas-web','Sistemas Web','Sistemas','Desenvolvimento de Sistemas Web sob Medida · 0WEB','Sistemas web sob medida para sua operação','ERPs, CRMs, painéis administrativos e integrações. Desenvolvidos sob medida para sua operação.','Custom Software Development','Quero meu sistema',80,false,'["sistemas web","software sob medida","ERP","CRM","painel administrativo"]'::jsonb),
  ('gestao-redes-sociais','Gestão de Redes Sociais','Social','Gestão de Redes Sociais · 0WEB','Redes sociais que vendem, não só postam','Estratégia, conteúdo, design e métricas. Tudo conectado ao seu funil de vendas.','Social Media Management','Quero gestão profissional',90,false,'["gestão redes sociais","social media","Instagram","conteúdo digital"]'::jsonb);
