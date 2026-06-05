
-- ============= ENUM =============
DO $$ BEGIN
  CREATE TYPE public.portal_role AS ENUM ('super_admin','portal_admin','operator','commercial','client','provider','partner');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============= PORTALS =============
CREATE TABLE IF NOT EXISTS public.portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  logo_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  social JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portals TO authenticated;
GRANT ALL ON public.portals TO service_role;
ALTER TABLE public.portals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS portals_domain_idx ON public.portals(domain);
CREATE INDEX IF NOT EXISTS portals_status_idx ON public.portals(status);

CREATE TRIGGER portals_touch BEFORE UPDATE ON public.portals
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ============= PORTAL MEMBERS =============
CREATE TABLE IF NOT EXISTS public.portal_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.portal_role NOT NULL DEFAULT 'operator',
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (portal_id, user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_members TO authenticated;
GRANT ALL ON public.portal_members TO service_role;
ALTER TABLE public.portal_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS portal_members_user_idx ON public.portal_members(user_id);
CREATE INDEX IF NOT EXISTS portal_members_portal_idx ON public.portal_members(portal_id);
CREATE TRIGGER portal_members_touch BEFORE UPDATE ON public.portal_members
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ============= HELPERS =============
CREATE OR REPLACE FUNCTION public.is_super_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.portal_members WHERE user_id=_uid AND role='super_admin')
$$;

CREATE OR REPLACE FUNCTION public.has_portal_role(_uid uuid, _portal uuid, _role public.portal_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_uid) OR EXISTS(
    SELECT 1 FROM public.portal_members WHERE user_id=_uid AND portal_id=_portal AND role=_role
  )
$$;

CREATE OR REPLACE FUNCTION public.user_portal_ids(_uid uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT portal_id FROM public.portal_members WHERE user_id=_uid
$$;

CREATE OR REPLACE FUNCTION public.default_portal_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.portals WHERE is_default=true LIMIT 1
$$;

-- ============= POLICIES PORTALS =============
DROP POLICY IF EXISTS portals_read_public ON public.portals;
CREATE POLICY portals_read_public ON public.portals FOR SELECT USING (status='active');

DROP POLICY IF EXISTS portals_super_admin_write ON public.portals;
CREATE POLICY portals_super_admin_write ON public.portals FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============= POLICIES PORTAL MEMBERS =============
DROP POLICY IF EXISTS pm_self_read ON public.portal_members;
CREATE POLICY pm_self_read ON public.portal_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS pm_super_admin_write ON public.portal_members;
CREATE POLICY pm_super_admin_write ON public.portal_members FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============= M2M MARKETPLACE =============
CREATE TABLE IF NOT EXISTS public.portal_providers (
  portal_id UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portal_id, provider_id)
);
GRANT SELECT ON public.portal_providers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_providers TO authenticated;
GRANT ALL ON public.portal_providers TO service_role;
ALTER TABLE public.portal_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY pp_read ON public.portal_providers FOR SELECT USING (true);
CREATE POLICY pp_admin_write ON public.portal_providers FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.portal_companies (
  portal_id UUID NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portal_id, company_id)
);
GRANT SELECT ON public.portal_companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_companies TO authenticated;
GRANT ALL ON public.portal_companies TO service_role;
ALTER TABLE public.portal_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY pc_read ON public.portal_companies FOR SELECT USING (true);
CREATE POLICY pc_admin_write ON public.portal_companies FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============= ADD portal_id TO EXISTING TABLES =============
ALTER TABLE public.lead_submissions ADD COLUMN IF NOT EXISTS portal_id UUID REFERENCES public.portals(id);
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS portal_id UUID REFERENCES public.portals(id);
ALTER TABLE public.experiments     ADD COLUMN IF NOT EXISTS portal_id UUID REFERENCES public.portals(id);
ALTER TABLE public.wa_funnel_sessions ADD COLUMN IF NOT EXISTS portal_id UUID REFERENCES public.portals(id);
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS portal_id UUID REFERENCES public.portals(id);

CREATE INDEX IF NOT EXISTS leads_portal_idx ON public.lead_submissions(portal_id);
CREATE INDEX IF NOT EXISTS analytics_portal_idx ON public.analytics_events(portal_id);
CREATE INDEX IF NOT EXISTS experiments_portal_idx ON public.experiments(portal_id);
CREATE INDEX IF NOT EXISTS wa_portal_idx ON public.wa_funnel_sessions(portal_id);
CREATE INDEX IF NOT EXISTS sr_portal_idx ON public.service_requests(portal_id);

-- ============= SEED DEFAULT PORTAL =============
INSERT INTO public.portals (slug, name, domain, aliases, status, is_default, brand, contact, seo, social)
VALUES (
  '0web',
  '0web',
  '0web.com.br',
  ARRAY['grow-evolution-engine.lovable.app','localhost'],
  'active',
  true,
  jsonb_build_object('primary','#0ea5e9','accent','#22d3ee','tagline','Sites e marketing digital'),
  jsonb_build_object('whatsapp','','email','contato@0web.com.br','phone',''),
  jsonb_build_object('title','0web — Sites e marketing','description','Sites profissionais e geração de leads'),
  jsonb_build_object()
)
ON CONFLICT (slug) DO NOTHING;

-- Seed roadmap portals (inactive placeholders)
INSERT INTO public.portals (slug, name, domain, status, brand)
VALUES
  ('precisodeumtecnico','Preciso de um Técnico','precisodeumtecnico.com','draft',jsonb_build_object('primary','#f97316')),
  ('precisodeumprofissional','Preciso de um Profissional','precisodeumprofissional.com','draft',jsonb_build_object('primary','#8b5cf6')),
  ('encontreumtecnico','Encontre um Técnico','encontreumtecnico.com.br','draft',jsonb_build_object('primary','#10b981')),
  ('encontreumprofissional','Encontre um Profissional','encontreumprofissional.com.br','draft',jsonb_build_object('primary','#ef4444'))
ON CONFLICT (slug) DO NOTHING;

-- Backfill existing rows to default portal
UPDATE public.lead_submissions SET portal_id = public.default_portal_id() WHERE portal_id IS NULL;
UPDATE public.analytics_events SET portal_id = public.default_portal_id() WHERE portal_id IS NULL;
UPDATE public.experiments     SET portal_id = public.default_portal_id() WHERE portal_id IS NULL;
UPDATE public.wa_funnel_sessions SET portal_id = public.default_portal_id() WHERE portal_id IS NULL;
UPDATE public.service_requests SET portal_id = public.default_portal_id() WHERE portal_id IS NULL;

-- Backfill marketplace M2M from existing single-portal data
INSERT INTO public.portal_providers (portal_id, provider_id)
SELECT public.default_portal_id(), id FROM public.providers
ON CONFLICT DO NOTHING;
INSERT INTO public.portal_companies (portal_id, company_id)
SELECT public.default_portal_id(), id FROM public.companies
ON CONFLICT DO NOTHING;
