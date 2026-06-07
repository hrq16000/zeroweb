
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL DEFAULT 'servicos',
  eyebrow text,
  title text NOT NULL,
  subtitle text,
  badge text,
  image_path text,
  image_url text,
  bg_gradient text,
  cta_label text,
  cta_href text,
  cta_secondary_label text,
  cta_secondary_href text,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides public read"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "hero_slides admin write"
  ON public.hero_slides FOR ALL
  TO authenticated
  USING (public.can_manage_settings(auth.uid()))
  WITH CHECK (public.can_manage_settings(auth.uid()));

CREATE TRIGGER hero_slides_touch
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

CREATE INDEX IF NOT EXISTS hero_slides_page_active_idx
  ON public.hero_slides (page, is_active, sort_order);

INSERT INTO public.hero_slides (page, eyebrow, title, subtitle, badge, bg_gradient, cta_label, cta_href, cta_secondary_label, cta_secondary_href, sort_order)
VALUES
  ('servicos', 'Catálogo completo', 'Tudo para crescer no digital, em um só lugar', 'Sites, SEO, tráfego pago, automações com IA e sistemas sob medida — escolha como em uma loja.', 'Loja 0WEB', 'linear-gradient(135deg,#1e3a8a,#4f46e5)', 'Ver todos os serviços', '#catalogo', 'Falar no WhatsApp', 'https://wa.me/5511999999999', 10),
  ('servicos', 'Mais procurado', 'Site Express em 24h · a partir de R$ 499', 'Site profissional pronto em 24h, mobile-first, focado em WhatsApp. Briefing em 5 minutos.', 'Entrega 24h', 'linear-gradient(135deg,#c2410c,#f97316)', 'Quero meu site agora', '/servicos/site-express', 'Ver detalhes', '/servicos/site-express', 20),
  ('servicos', 'Novidade', 'Automação com IA para WhatsApp', 'Chatbot que qualifica leads 24/7 e dispara automações para o seu time vender mais.', 'IA + WhatsApp', 'linear-gradient(135deg,#065f46,#10b981)', 'Conhecer automações', '/servicos/automacao', 'Ver casos', '/cases', 30)
ON CONFLICT DO NOTHING;
