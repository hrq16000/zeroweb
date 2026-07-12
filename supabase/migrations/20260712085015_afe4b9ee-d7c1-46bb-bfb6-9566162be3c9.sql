
DROP VIEW IF EXISTS public.companies_public CASCADE;
DROP VIEW IF EXISTS public.providers_public CASCADE;

DROP POLICY IF EXISTS "companies public read active via view" ON public.companies;
CREATE VIEW public.companies_public AS
SELECT id, slug, trade_name, logo_url, description, city, state, categories,
       verified, rating_avg, rating_count, status, created_at
FROM public.companies
WHERE status = 'active';
GRANT SELECT ON public.companies_public TO anon, authenticated;

DROP POLICY IF EXISTS "providers public read active via view" ON public.providers;
CREATE VIEW public.providers_public AS
SELECT id, slug, display_name, headline, avatar_url, city, state, specialties,
       verified, rating_avg, rating_count, status, created_at
FROM public.providers
WHERE status = 'active';
GRANT SELECT ON public.providers_public TO anon, authenticated;

DROP POLICY IF EXISTS exp_anon_insert ON public.experiments;
DROP POLICY IF EXISTS exp_anon_update ON public.experiments;

DROP POLICY IF EXISTS partners_public_apply ON public.partners;

DROP POLICY IF EXISTS "reviews insert any" ON public.reviews;

DROP POLICY IF EXISTS "requests insert any" ON public.service_requests;

DROP POLICY IF EXISTS anon_update_waf ON public.wa_funnel_sessions;
CREATE POLICY anon_update_waf ON public.wa_funnel_sessions
  FOR UPDATE TO anon
  USING (completed = false AND created_at > (now() - interval '24 hours'))
  WITH CHECK (created_at > (now() - interval '24 hours'));
