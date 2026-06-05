
-- ============= LEAD SUBMISSIONS — atribuição completa =============
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS gclid TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS fbclid TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS temperature TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS audience_tag TEXT;
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS offer_slug TEXT;

CREATE INDEX IF NOT EXISTS leads_gclid_idx ON public.lead_submissions(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_fbclid_idx ON public.lead_submissions(fbclid) WHERE fbclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_campaign_idx ON public.lead_submissions(utm_campaign, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_offer_idx ON public.lead_submissions(offer_slug);

-- ============= SCORE atualizado =============
CREATE OR REPLACE FUNCTION public.compute_lead_score(p_row public.lead_submissions)
RETURNS TABLE(score integer, label text)
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE s integer := 0;
BEGIN
  IF p_row.name IS NOT NULL AND length(p_row.name) > 2 THEN s := s + 10; END IF;
  IF p_row.email IS NOT NULL THEN s := s + 15; END IF;
  IF p_row.phone IS NOT NULL THEN s := s + 25; END IF;
  IF p_row.company IS NOT NULL THEN s := s + 10; END IF;
  IF p_row.gclid IS NOT NULL THEN s := s + 20; END IF;
  IF p_row.fbclid IS NOT NULL THEN s := s + 15; END IF;
  IF p_row.utm_source IS NOT NULL THEN s := s + 5; END IF;
  IF p_row.utm_campaign IS NOT NULL THEN s := s + 5; END IF;
  IF p_row.utm_content IS NOT NULL THEN s := s + 3; END IF;
  IF p_row.source = 'whatsapp' THEN s := s + 15; END IF;
  IF p_row.source = 'form' THEN s := s + 10; END IF;
  IF p_row.offer_slug IS NOT NULL THEN s := s + 8; END IF;
  RETURN QUERY SELECT s, CASE WHEN s >= 70 THEN 'alta' WHEN s >= 40 THEN 'media' ELSE 'baixa' END;
END $$;

-- Trigger leads_before_insert também precisa setar temperature
CREATE OR REPLACE FUNCTION public.leads_before_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  s_score integer; s_label text;
  cfg public.crm_settings%ROWTYPE;
  next_idx integer;
BEGIN
  SELECT score, label INTO s_score, s_label FROM public.compute_lead_score(NEW);
  NEW.score := s_score; NEW.score_label := s_label;
  NEW.temperature := CASE WHEN s_score >= 70 THEN 'quente' WHEN s_score >= 40 THEN 'morno' ELSE 'frio' END;
  IF NEW.last_interaction IS NULL THEN NEW.last_interaction := now(); END IF;

  IF NEW.assignee IS NULL THEN
    SELECT * INTO cfg FROM public.crm_settings WHERE singleton = true LIMIT 1;
    IF cfg.distribution_mode = 'fixed' AND cfg.fixed_assignee IS NOT NULL THEN
      NEW.assignee := cfg.fixed_assignee;
    ELSIF cfg.distribution_mode = 'round_robin' AND array_length(cfg.assignees, 1) > 0 THEN
      next_idx := (cfg.round_robin_pointer % array_length(cfg.assignees, 1)) + 1;
      NEW.assignee := cfg.assignees[next_idx];
      UPDATE public.crm_settings SET round_robin_pointer = cfg.round_robin_pointer + 1, updated_at = now() WHERE singleton = true;
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- ============= CAMPAIGNS =============
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'google_ads',
  status TEXT NOT NULL DEFAULT 'draft',
  budget_monthly NUMERIC(12,2),
  cpa_target NUMERIC(12,2),
  roas_target NUMERIC(8,2),
  utm_campaign TEXT,
  landing_page TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_read ON public.campaigns FOR SELECT USING (true);
CREATE POLICY campaigns_admin_write ON public.campaigns FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER campaigns_touch BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ============= OFFERS =============
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cta TEXT NOT NULL DEFAULT 'Solicitar agora',
  landing_page TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY offers_read ON public.offers FOR SELECT USING (true);
CREATE POLICY offers_admin_write ON public.offers FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER offers_touch BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

INSERT INTO public.offers (slug, title, description, cta, landing_page) VALUES
  ('diagnostico-gratuito','Diagnóstico digital gratuito','Análise completa da sua presença digital em até 48h.','Quero meu diagnóstico','/contato'),
  ('analise-seo','Análise SEO gratuita','Auditoria técnica e de conteúdo do seu site.','Quero a análise','/seo'),
  ('auditoria-gmn','Auditoria Google Meu Negócio','Avaliação do perfil + plano de otimização.','Quero auditoria','/google-meu-negocio'),
  ('avaliacao-site','Avaliação do seu site atual','Score de UX, performance e conversão.','Avaliar meu site','/criacao-sites'),
  ('planejamento-digital','Planejamento digital 90 dias','Roadmap de canais, ofertas e conversão.','Quero o plano','/consultoria')
ON CONFLICT (slug) DO NOTHING;

-- ============= REMARKETING AUDIENCES =============
CREATE TABLE IF NOT EXISTS public.remarketing_audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remarketing_audiences TO authenticated;
GRANT ALL ON public.remarketing_audiences TO service_role;
ALTER TABLE public.remarketing_audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY ra_admin_write ON public.remarketing_audiences FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY ra_admin_read ON public.remarketing_audiences FOR SELECT TO authenticated USING (true);

INSERT INTO public.remarketing_audiences (slug, name, description, rule) VALUES
  ('visitantes-30d','Visitantes 30 dias','Todos os visitantes nos últimos 30 dias',jsonb_build_object('window_days',30,'kind','visitor')),
  ('leads-90d','Leads 90 dias','Leads cadastrados nos últimos 90 dias',jsonb_build_object('window_days',90,'kind','lead')),
  ('abandono-funil','Abandono de funil','Iniciou e não concluiu funil',jsonb_build_object('kind','funnel_abandon')),
  ('abandono-formulario','Abandono de formulário','Abriu formulário sem enviar',jsonb_build_object('kind','form_abandon')),
  ('abandono-whatsapp','Abandono WhatsApp','Clicou WA e não enviou mensagem',jsonb_build_object('kind','wa_abandon'))
ON CONFLICT (slug) DO NOTHING;
