CREATE TABLE IF NOT EXISTS public._svc_copy_staging (
  slug text PRIMARY KEY,
  description text NOT NULL,
  seo_description text NOT NULL
);
GRANT ALL ON public._svc_copy_staging TO service_role, authenticated;
ALTER TABLE public._svc_copy_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only" ON public._svc_copy_staging FOR ALL USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));