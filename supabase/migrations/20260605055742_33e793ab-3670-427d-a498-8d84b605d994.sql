
-- Sprint 14: Foundation for Franchise/White-label/Licensing
-- Extends existing 'portals' (tenant) with license, templates, catalog, audit, usage.

-- 1. New roles for hierarchy (franqueadora, gestor)
ALTER TYPE public.portal_role ADD VALUE IF NOT EXISTS 'franqueadora';
ALTER TYPE public.portal_role ADD VALUE IF NOT EXISTS 'gestor';

-- 2. Licenses
CREATE TYPE public.license_type AS ENUM ('master','franqueadora','licenciado','white_label','trial');
CREATE TYPE public.license_status AS ENUM ('active','suspended','expired','cancelled','trial','pending');

CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  parent_license_id uuid REFERENCES public.licenses(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  type public.license_type NOT NULL DEFAULT 'licenciado',
  status public.license_status NOT NULL DEFAULT 'pending',
  plan text NOT NULL DEFAULT 'starter',
  limits jsonb NOT NULL DEFAULT '{"max_users":5,"max_leads":1000,"max_projects":20,"max_domains":1}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  starts_at timestamptz NOT NULL DEFAULT now(),
  renews_at timestamptz,
  expires_at timestamptz,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX licenses_portal_idx ON public.licenses(portal_id);
CREATE INDEX licenses_parent_idx ON public.licenses(parent_license_id);
CREATE INDEX licenses_status_idx ON public.licenses(status);

GRANT SELECT ON public.licenses TO authenticated;
GRANT ALL ON public.licenses TO service_role;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY licenses_read ON public.licenses FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.is_portal_member(auth.uid(), portal_id));
CREATE POLICY licenses_write ON public.licenses FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_licenses_updated_at BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- 3. License audit log
CREATE TABLE public.license_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid REFERENCES public.licenses(id) ON DELETE CASCADE,
  portal_id uuid REFERENCES public.portals(id) ON DELETE CASCADE,
  actor uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX license_audit_license_idx ON public.license_audit_log(license_id, created_at DESC);
CREATE INDEX license_audit_portal_idx ON public.license_audit_log(portal_id, created_at DESC);

GRANT SELECT ON public.license_audit_log TO authenticated;
GRANT ALL ON public.license_audit_log TO service_role;
ALTER TABLE public.license_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY license_audit_read ON public.license_audit_log FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.is_portal_member(auth.uid(), portal_id));

-- 4. Usage metrics (snapshots per day)
CREATE TABLE public.license_usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  portal_id uuid NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT current_date,
  users_count int NOT NULL DEFAULT 0,
  leads_count int NOT NULL DEFAULT 0,
  projects_count int NOT NULL DEFAULT 0,
  visits_count int NOT NULL DEFAULT 0,
  storage_mb int NOT NULL DEFAULT 0,
  custom jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (license_id, day)
);
CREATE INDEX license_usage_portal_day_idx ON public.license_usage_metrics(portal_id, day DESC);
GRANT SELECT ON public.license_usage_metrics TO authenticated;
GRANT ALL ON public.license_usage_metrics TO service_role;
ALTER TABLE public.license_usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY license_usage_read ON public.license_usage_metrics FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.is_portal_member(auth.uid(), portal_id));

-- 5. Content templates (LP, funis, paginas, emails, materiais)
CREATE TYPE public.template_kind AS ENUM ('landing_page','funnel','page','email','material','config');

CREATE TABLE public.content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid REFERENCES public.portals(id) ON DELETE CASCADE,
  kind public.template_kind NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  is_global boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (portal_id, kind, slug)
);
CREATE INDEX content_templates_kind_idx ON public.content_templates(kind, status);
GRANT SELECT ON public.content_templates TO authenticated;
GRANT ALL ON public.content_templates TO service_role;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_templates_read ON public.content_templates FOR SELECT TO authenticated
  USING (is_global OR public.is_super_admin(auth.uid()) OR (portal_id IS NOT NULL AND public.is_portal_member(auth.uid(), portal_id)));
CREATE POLICY content_templates_write ON public.content_templates FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()) OR (portal_id IS NOT NULL AND public.has_portal_role(auth.uid(), portal_id, 'portal_admin')))
  WITH CHECK (public.is_super_admin(auth.uid()) OR (portal_id IS NOT NULL AND public.has_portal_role(auth.uid(), portal_id, 'portal_admin')));

CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON public.content_templates
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- 6. Service catalog (global) + per-portal activation
CREATE TABLE public.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  default_price numeric(12,2),
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_catalog TO authenticated, anon;
GRANT ALL ON public.service_catalog TO service_role;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_catalog_read ON public.service_catalog FOR SELECT USING (true);
CREATE POLICY service_catalog_write ON public.service_catalog FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TABLE public.portal_services (
  portal_id uuid NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.service_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  custom_price numeric(12,2),
  custom_name text,
  custom_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (portal_id, service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_services TO authenticated;
GRANT ALL ON public.portal_services TO service_role;
ALTER TABLE public.portal_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY portal_services_read ON public.portal_services FOR SELECT TO authenticated
  USING (public.is_portal_member(auth.uid(), portal_id));
CREATE POLICY portal_services_write ON public.portal_services FOR ALL TO authenticated
  USING (public.has_portal_role(auth.uid(), portal_id, 'portal_admin'))
  WITH CHECK (public.has_portal_role(auth.uid(), portal_id, 'portal_admin'));

-- 7. Helper: monitor view for super admins (license summary)
CREATE OR REPLACE VIEW public.license_overview AS
SELECT
  l.id,
  l.code,
  l.type,
  l.status,
  l.plan,
  l.starts_at,
  l.renews_at,
  l.expires_at,
  l.limits,
  p.id AS portal_id,
  p.name AS portal_name,
  p.slug AS portal_slug,
  p.domain,
  (SELECT COUNT(*) FROM public.portal_members pm WHERE pm.portal_id = p.id) AS users_count,
  (SELECT COUNT(*) FROM public.lead_submissions ls WHERE ls.portal_id = p.id) AS leads_count
FROM public.licenses l
JOIN public.portals p ON p.id = l.portal_id;

GRANT SELECT ON public.license_overview TO authenticated;
