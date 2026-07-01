
-- Companies: remove public PII exposure, create safe public view
DROP POLICY IF EXISTS "companies public read active" ON public.companies;

CREATE OR REPLACE VIEW public.companies_public
WITH (security_invoker = true)
AS
SELECT id, slug, trade_name, logo_url, cover_url, description,
       website, city, state, service_regions, categories, social,
       status, verified, rating_avg, rating_count, views_count, created_at
FROM public.companies
WHERE status = 'active';

GRANT SELECT ON public.companies_public TO anon, authenticated;

-- Preserve public discoverability but only through the safe view
CREATE POLICY "companies public read active via view"
ON public.companies FOR SELECT TO anon
USING (status = 'active');
-- Restrict PII columns via column-level revoke on base table for anon
REVOKE SELECT ON public.companies FROM anon;
GRANT SELECT (id, slug, trade_name, logo_url, cover_url, description, website,
              city, state, service_regions, categories, social, status,
              verified, rating_avg, rating_count, views_count, created_at)
  ON public.companies TO anon;

-- Providers: same treatment
DROP POLICY IF EXISTS "providers public read active" ON public.providers;

CREATE OR REPLACE VIEW public.providers_public
WITH (security_invoker = true)
AS
SELECT id, slug, display_name, headline, bio, avatar_url, cover_url,
       city, state, service_regions, specialties, social, status, verified,
       rating_avg, rating_count, views_count, created_at
FROM public.providers
WHERE status = 'active';

GRANT SELECT ON public.providers_public TO anon, authenticated;

CREATE POLICY "providers public read active via view"
ON public.providers FOR SELECT TO anon
USING (status = 'active');
REVOKE SELECT ON public.providers FROM anon;
GRANT SELECT (id, slug, display_name, headline, bio, avatar_url, cover_url,
              city, state, service_regions, specialties, social, status,
              verified, rating_avg, rating_count, views_count, created_at)
  ON public.providers TO anon;

-- service_catalog: internal, restrict to authenticated only
DROP POLICY IF EXISTS "service_catalog_read" ON public.service_catalog;

CREATE POLICY "service_catalog authenticated read"
ON public.service_catalog FOR SELECT TO authenticated
USING (true);
REVOKE SELECT ON public.service_catalog FROM anon;
