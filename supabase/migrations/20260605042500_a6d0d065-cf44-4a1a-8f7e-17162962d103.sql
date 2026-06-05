CREATE TABLE public.site_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page, key)
);

GRANT SELECT ON public.site_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_sections TO authenticated;
GRANT ALL ON public.site_sections TO service_role;

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_sections public read"
  ON public.site_sections FOR SELECT
  USING (true);

CREATE POLICY "site_sections admin write"
  ON public.site_sections FOR ALL
  TO authenticated
  USING (public.can_manage_settings(auth.uid()))
  WITH CHECK (public.can_manage_settings(auth.uid()));

CREATE TRIGGER site_sections_touch
  BEFORE UPDATE ON public.site_sections
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

INSERT INTO public.site_sections (page, key, label, enabled, sort_order) VALUES
  ('home', 'hero',            'Hero',                       true,  10),
  ('home', 'trustbar',        'Barra de confiança',         true,  20),
  ('home', 'problems',        'Problemas',                  true,  30),
  ('home', 'loss_calculator', 'Calculadora de perda',       false, 40),
  ('home', 'solutions',       'Soluções',                   true,  50),
  ('home', 'ai_section',      'Seção de IA',                true,  60),
  ('home', 'diagnostic_form', 'Formulário de diagnóstico',  true,  70),
  ('home', 'differentials',   'Diferenciais',               true,  80),
  ('home', 'cases',           'Cases',                      true,  90),
  ('home', 'process',         'Processo',                   true, 100),
  ('home', 'plans',           'Planos',                     true, 110),
  ('home', 'social_proof',    'Prova social',               true, 120),
  ('home', 'faq',             'FAQ',                        true, 130),
  ('home', 'cta',             'CTA final',                  true, 140);