-- 1) Consent audit log -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  visitor_id text,
  ip_hash text,
  user_agent text,
  path text,
  decision text NOT NULL CHECK (decision IN ('granted','denied','default')),
  analytics_storage text,
  ad_storage text,
  source text NOT NULL DEFAULT 'banner',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT ON public.consent_audit_log TO authenticated;
GRANT ALL ON public.consent_audit_log TO service_role;
ALTER TABLE public.consent_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_audit_admin_read"
  ON public.consent_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "consent_audit_anyone_insert"
  ON public.consent_audit_log FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS consent_audit_created_idx
  ON public.consent_audit_log (created_at DESC);

-- 2) LGPD anonymization -------------------------------------------------
CREATE OR REPLACE FUNCTION public.anonymize_visitantes_rastreio_old()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE updated_count integer;
BEGIN
  WITH u AS (
    UPDATE public.visitantes_rastreio
       SET ip_address = NULL,
           user_agent = NULL,
           ua_browser = NULL,
           ua_os = NULL,
           ua_device = NULL,
           utm_source = NULL,
           utm_medium = NULL,
           utm_campaign = NULL,
           utm_content = NULL,
           utm_term = NULL,
           gclid = NULL,
           fbclid = NULL,
           referer = NULL,
           query = NULL,
           city = NULL,
           region = NULL
     WHERE created_at < now() - interval '30 days'
       AND (user_agent IS NOT NULL OR utm_source IS NOT NULL OR referer IS NOT NULL)
    RETURNING 1
  )
  SELECT COUNT(*) INTO updated_count FROM u;
  RETURN COALESCE(updated_count, 0);
END $$;

-- 3) Retention settings (admin-managed via app_settings) ---------------
INSERT INTO public.app_settings (key, value, description)
VALUES
  ('lgpd_anonymize_after_days', '30', 'Dias até anonimizar campos sensíveis de visitantes_rastreio'),
  ('lgpd_purge_after_days',     '180','Dias até apagar definitivamente registros de visitantes_rastreio'),
  ('lgpd_privacy_contact',      '"privacidade@example.com"', 'E-mail de contato para solicitações LGPD')
ON CONFLICT (key) DO NOTHING;