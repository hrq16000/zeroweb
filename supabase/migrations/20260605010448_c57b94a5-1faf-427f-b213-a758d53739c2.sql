
CREATE OR REPLACE FUNCTION public.is_portal_member(_uid uuid, _portal uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_uid) OR EXISTS (
    SELECT 1 FROM public.portal_members WHERE user_id = _uid AND portal_id = _portal
  )
$$;

CREATE TABLE IF NOT EXISTS public.visitantes_rastreio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  visitor_id text,
  session_id text,
  user_id uuid,
  portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  tenant_slug text,
  ip_address inet,
  ip_hash text NOT NULL,
  country text, region text, city text, asn text,
  user_agent text, ua_browser text, ua_os text, ua_device text,
  is_bot boolean NOT NULL DEFAULT false,
  method text, path text, query text, referer text, landing_page text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  gclid text, fbclid text,
  risk_score integer NOT NULL DEFAULT 0,
  blocked boolean NOT NULL DEFAULT false,
  block_reason text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS visitantes_rastreio_dedupe_idx ON public.visitantes_rastreio (ip_hash, day);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_created_idx ON public.visitantes_rastreio (created_at DESC);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_portal_idx ON public.visitantes_rastreio (portal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_path_idx ON public.visitantes_rastreio (path);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_utm_idx ON public.visitantes_rastreio (utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_country_idx ON public.visitantes_rastreio (country);

GRANT SELECT ON public.visitantes_rastreio TO authenticated;
GRANT ALL ON public.visitantes_rastreio TO service_role;

ALTER TABLE public.visitantes_rastreio ENABLE ROW LEVEL SECURITY;

CREATE POLICY vr_super_admin_all ON public.visitantes_rastreio
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY vr_portal_member_read ON public.visitantes_rastreio
  FOR SELECT TO authenticated
  USING (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id));

-- experiments
DROP POLICY IF EXISTS public_read_exp ON public.experiments;
DROP POLICY IF EXISTS anon_insert_exp ON public.experiments;
DROP POLICY IF EXISTS anon_update_exp ON public.experiments;
DROP POLICY IF EXISTS auth_insert_exp ON public.experiments;
DROP POLICY IF EXISTS auth_update_exp ON public.experiments;
CREATE POLICY exp_admin_all ON public.experiments
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY exp_anon_insert ON public.experiments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY exp_anon_update ON public.experiments FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- wa_funnel_sessions
ALTER TABLE public.wa_funnel_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wa_read ON public.wa_funnel_sessions;
DROP POLICY IF EXISTS wa_admin ON public.wa_funnel_sessions;
DROP POLICY IF EXISTS wa_portal_read ON public.wa_funnel_sessions;
DROP POLICY IF EXISTS wa_admin_write ON public.wa_funnel_sessions;
CREATE POLICY wa_portal_read ON public.wa_funnel_sessions
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR public.has_role(auth.uid(),'admin')
    OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id))
  );
CREATE POLICY wa_admin_write ON public.wa_funnel_sessions
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- lead_submissions
DROP POLICY IF EXISTS leads_portal_read ON public.lead_submissions;
DROP POLICY IF EXISTS leads_admin_write ON public.lead_submissions;
CREATE POLICY leads_portal_read ON public.lead_submissions
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR public.has_role(auth.uid(),'admin')
    OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id))
  );
CREATE POLICY leads_admin_write ON public.lead_submissions
  FOR UPDATE TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR public.has_role(auth.uid(),'admin')
    OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id))
  )
  WITH CHECK (true);

-- analytics_events
DROP POLICY IF EXISTS public_read_events ON public.analytics_events;
CREATE POLICY events_portal_read ON public.analytics_events
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR public.has_role(auth.uid(),'admin')
    OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id))
  );

-- service_requests
DROP POLICY IF EXISTS sr_portal_read ON public.service_requests;
CREATE POLICY sr_portal_read ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = requester_user_id
    OR public.is_super_admin(auth.uid())
    OR public.has_role(auth.uid(),'admin')
    OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id))
  );

-- profiles
DROP POLICY IF EXISTS "profiles public read" ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- editorial_calendar
DROP POLICY IF EXISTS "authenticated manage editorial_calendar" ON public.editorial_calendar;
CREATE POLICY editorial_admin_all ON public.editorial_calendar
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- content_metrics
DROP POLICY IF EXISTS "authenticated read content_metrics" ON public.content_metrics;
DROP POLICY IF EXISTS "authenticated insert content_metrics" ON public.content_metrics;
CREATE POLICY cm_admin_read ON public.content_metrics
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY cm_admin_write ON public.content_metrics
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
