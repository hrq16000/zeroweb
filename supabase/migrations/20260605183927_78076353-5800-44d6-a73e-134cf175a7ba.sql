DO $$ BEGIN
  CREATE TYPE public.plan_period AS ENUM ('month','year','project','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents bigint,
  price_label text,
  period public.plan_period NOT NULL DEFAULT 'month',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlight boolean NOT NULL DEFAULT false,
  cta_label text NOT NULL DEFAULT 'Quero esse plano',
  cta_href text NOT NULL DEFAULT '#contato',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plans_active_order_idx ON public.plans(active, sort_order);

GRANT SELECT ON public.plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active plans" ON public.plans;
CREATE POLICY "Public can read active plans"
  ON public.plans FOR SELECT
  USING (active = true OR public.has_role(auth.uid(),'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage plans" ON public.plans;
CREATE POLICY "Admins manage plans"
  ON public.plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role) OR public.is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS plans_touch_updated_at ON public.plans;
CREATE TRIGGER plans_touch_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

INSERT INTO public.plans (slug, name, description, price_cents, price_label, period, features, highlight, sort_order)
VALUES
  ('landing-page', 'Landing Page', 'Sua presença online profissional, sem complicação.',
    9999, NULL, 'month',
    '["Landing page de alta conversão","Design responsivo premium","Formulário + WhatsApp integrado","SEO básico on-page","Hospedagem e SSL inclusos","Suporte por e-mail"]'::jsonb,
    false, 10),
  ('start', 'Start', 'Para empresas que precisam estar online com qualidade.',
    24900, NULL, 'month',
    '["Site institucional até 5 páginas","Design responsivo premium","SEO básico on-page","Formulário + WhatsApp","Hospedagem inclusa","Suporte 30 dias"]'::jsonb,
    false, 20),
  ('pro', 'Pro', 'O plano mais escolhido. Site + estratégia + IA.',
    64900, NULL, 'month',
    '["Tudo do Start","Até 12 páginas + blog","SEO técnico avançado","Integração com CRM","Chatbot IA no WhatsApp","Painel de métricas","Suporte 90 dias"]'::jsonb,
    true, 30),
  ('enterprise', 'Enterprise', 'Sistemas SaaS, e-commerce e automações sob medida.',
    NULL, 'Sob consulta', 'custom',
    '["Tudo do Pro","Desenvolvimento sob medida","Arquitetura escalável","Agentes IA customizados","Integrações ilimitadas","SLA dedicado","Suporte 12 meses"]'::jsonb,
    false, 40)
ON CONFLICT (slug) DO NOTHING;