
-- 1. analytics_events
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  visitor_id TEXT,
  event_name TEXT NOT NULL,
  page TEXT,
  path TEXT,
  location TEXT,
  hero_variant TEXT,
  cta_variant TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  device_type TEXT,
  metadata_json JSONB
);
CREATE INDEX idx_ae_created ON public.analytics_events (created_at DESC);
CREATE INDEX idx_ae_event ON public.analytics_events (event_name);
CREATE INDEX idx_ae_path ON public.analytics_events (path);
CREATE INDEX idx_ae_variant ON public.analytics_events (hero_variant, cta_variant);
GRANT SELECT, INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_events" ON public.analytics_events FOR INSERT TO anon WITH CHECK (
  event_name IS NOT NULL AND length(event_name) <= 64
);
CREATE POLICY "auth_insert_events" ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (
  event_name IS NOT NULL AND length(event_name) <= 64
);
CREATE POLICY "public_read_events" ON public.analytics_events FOR SELECT TO anon, authenticated USING (true);

-- 2. lead_submissions (contains PII)
CREATE TABLE public.lead_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  landing_page TEXT,
  hero_variant TEXT,
  cta_variant TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  payload_json JSONB,
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE INDEX idx_leads_created ON public.lead_submissions (created_at DESC);
GRANT INSERT ON public.lead_submissions TO anon;
GRANT INSERT ON public.lead_submissions TO authenticated;
GRANT ALL ON public.lead_submissions TO service_role;
ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_leads" ON public.lead_submissions FOR INSERT TO anon WITH CHECK (
  (name IS NULL OR length(name) <= 200)
  AND (email IS NULL OR length(email) <= 200)
  AND (phone IS NULL OR length(phone) <= 40)
);
CREATE POLICY "auth_insert_leads" ON public.lead_submissions FOR INSERT TO authenticated WITH CHECK (
  (name IS NULL OR length(name) <= 200)
  AND (email IS NULL OR length(email) <= 200)
  AND (phone IS NULL OR length(phone) <= 40)
);

-- 3. wa_funnel_sessions (contains PII via answers)
CREATE TABLE public.wa_funnel_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  current_step INT NOT NULL DEFAULT 0,
  total_steps INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  landing_page TEXT,
  hero_variant TEXT,
  cta_variant TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  answers_json JSONB
);
CREATE INDEX idx_waf_created ON public.wa_funnel_sessions (created_at DESC);
CREATE INDEX idx_waf_session ON public.wa_funnel_sessions (session_id);
GRANT INSERT, UPDATE ON public.wa_funnel_sessions TO anon;
GRANT INSERT, UPDATE ON public.wa_funnel_sessions TO authenticated;
GRANT ALL ON public.wa_funnel_sessions TO service_role;
ALTER TABLE public.wa_funnel_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_waf" ON public.wa_funnel_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "auth_insert_waf" ON public.wa_funnel_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "anon_update_waf" ON public.wa_funnel_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_waf" ON public.wa_funnel_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 4. experiments
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (experiment_name, variant)
);
GRANT SELECT, INSERT, UPDATE ON public.experiments TO anon;
GRANT SELECT, INSERT, UPDATE ON public.experiments TO authenticated;
GRANT ALL ON public.experiments TO service_role;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_exp" ON public.experiments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_exp" ON public.experiments FOR INSERT TO anon WITH CHECK (length(experiment_name) <= 64 AND length(variant) <= 64);
CREATE POLICY "auth_insert_exp" ON public.experiments FOR INSERT TO authenticated WITH CHECK (length(experiment_name) <= 64 AND length(variant) <= 64);
CREATE POLICY "anon_update_exp" ON public.experiments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "auth_update_exp" ON public.experiments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Atomic counter helper for experiments
CREATE OR REPLACE FUNCTION public.bump_experiment(
  p_name TEXT, p_variant TEXT, p_impressions INT DEFAULT 0, p_clicks INT DEFAULT 0, p_conversions INT DEFAULT 0
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.experiments (experiment_name, variant, impressions, clicks, conversions, updated_at)
  VALUES (p_name, p_variant, GREATEST(p_impressions,0), GREATEST(p_clicks,0), GREATEST(p_conversions,0), now())
  ON CONFLICT (experiment_name, variant) DO UPDATE
    SET impressions = public.experiments.impressions + EXCLUDED.impressions,
        clicks = public.experiments.clicks + EXCLUDED.clicks,
        conversions = public.experiments.conversions + EXCLUDED.conversions,
        updated_at = now();
END $$;
GRANT EXECUTE ON FUNCTION public.bump_experiment(TEXT, TEXT, INT, INT, INT) TO anon, authenticated;
