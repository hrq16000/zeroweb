
CREATE TYPE public.partner_kind AS ENUM ('afiliado','representante','parceiro_comercial','agencia','franqueado');
CREATE TYPE public.partner_status AS ENUM ('pendente','aprovado','suspenso','bloqueado');
CREATE TYPE public.commission_type AS ENUM ('fixo','percentual','recorrente','vitalicio','por_produto','por_categoria');
CREATE TYPE public.territory_scope AS ENUM ('cidade','regiao','estado','nacional');
CREATE TYPE public.territory_exclusivity AS ENUM ('exclusivo','compartilhado');
CREATE TYPE public.material_kind AS ENUM ('apresentacao','proposta','treinamento','material','link','download');

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.partner_kind NOT NULL DEFAULT 'afiliado',
  status public.partner_status NOT NULL DEFAULT 'pendente',
  name text NOT NULL,
  company text,
  email text NOT NULL,
  email_lower text GENERATED ALWAYS AS (lower(email)) STORED,
  phone text,
  city text,
  state text,
  areas text[] NOT NULL DEFAULT '{}',
  specialties text[] NOT NULL DEFAULT '{}',
  bio text,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX partners_email_unique ON public.partners (email_lower);
CREATE INDEX partners_user_idx ON public.partners (user_id);
CREATE INDEX partners_status_idx ON public.partners (status);
GRANT SELECT, INSERT, UPDATE ON public.partners TO authenticated;
GRANT INSERT ON public.partners TO anon;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_self_select" ON public.partners FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));
CREATE POLICY "partners_self_update" ON public.partners FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));
CREATE POLICY "partners_authed_insert" ON public.partners FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "partners_public_apply" ON public.partners FOR INSERT TO anon
  WITH CHECK (status = 'pendente' AND user_id IS NULL);

CREATE TABLE public.partner_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  label text,
  target_path text NOT NULL DEFAULT '/',
  campaign text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_links_partner_idx ON public.partner_links (partner_id);
GRANT SELECT ON public.partner_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_links TO authenticated;
GRANT ALL ON public.partner_links TO service_role;
ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_links_read_all" ON public.partner_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "partner_links_owner_write" ON public.partner_links FOR ALL TO authenticated
  USING (EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))))
  WITH CHECK (EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))));

CREATE TABLE public.partner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.partner_links(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  ip_hash text,
  country text,
  city text,
  referer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_clicks_partner_idx ON public.partner_clicks (partner_id, created_at DESC);
GRANT SELECT ON public.partner_clicks TO authenticated;
GRANT ALL ON public.partner_clicks TO service_role;
ALTER TABLE public.partner_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_clicks_owner_read" ON public.partner_clicks FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid())))
);

CREATE TABLE public.partner_attributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  link_id uuid REFERENCES public.partner_links(id) ON DELETE SET NULL,
  lead_id uuid,
  conversion_type text NOT NULL DEFAULT 'lead',
  value_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'aberta',
  campaign text,
  landing_path text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_attr_partner_idx ON public.partner_attributions (partner_id, created_at DESC);
CREATE INDEX partner_attr_lead_idx ON public.partner_attributions (lead_id);
GRANT SELECT ON public.partner_attributions TO authenticated;
GRANT ALL ON public.partner_attributions TO service_role;
ALTER TABLE public.partner_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_attr_owner_read" ON public.partner_attributions FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid())))
);

CREATE TABLE public.commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  kind_target public.partner_kind,
  type public.commission_type NOT NULL,
  value numeric(12,2) NOT NULL,
  scope_product text,
  scope_category text,
  recurrence_months integer,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commission_rules TO authenticated;
GRANT ALL ON public.commission_rules TO service_role;
ALTER TABLE public.commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commission_read" ON public.commission_rules FOR SELECT TO authenticated USING (
  partner_id IS NULL OR EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid())))
);
CREATE POLICY "commission_admin_write" ON public.commission_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE TABLE public.partner_territories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  scope public.territory_scope NOT NULL,
  value text NOT NULL,
  exclusivity public.territory_exclusivity NOT NULL DEFAULT 'compartilhado',
  starts_at date,
  ends_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_territories_partner_idx ON public.partner_territories (partner_id);
CREATE INDEX partner_territories_scope_idx ON public.partner_territories (scope, value);
GRANT SELECT ON public.partner_territories TO authenticated;
GRANT ALL ON public.partner_territories TO service_role;
ALTER TABLE public.partner_territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "territories_read" ON public.partner_territories FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.partners p WHERE p.id = partner_id AND (p.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid())))
);
CREATE POLICY "territories_admin_write" ON public.partner_territories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE TABLE public.partner_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.material_kind NOT NULL,
  title text NOT NULL,
  description text,
  url text NOT NULL,
  visible_to_kinds public.partner_kind[] NOT NULL DEFAULT '{afiliado,representante,parceiro_comercial,agencia,franqueado}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_materials TO authenticated;
GRANT ALL ON public.partner_materials TO service_role;
ALTER TABLE public.partner_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_read_all_authed" ON public.partner_materials FOR SELECT TO authenticated USING (active = true);
CREATE POLICY "materials_admin_write" ON public.partner_materials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE TABLE public.partner_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE SET NULL,
  actor uuid REFERENCES auth.users(id),
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX partner_audit_partner_idx ON public.partner_audit_log (partner_id, created_at DESC);
GRANT SELECT ON public.partner_audit_log TO authenticated;
GRANT ALL ON public.partner_audit_log TO service_role;
ALTER TABLE public.partner_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_admin_read" ON public.partner_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) OR public.is_super_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.partners_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER partners_touch BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.partners_touch_updated_at();
CREATE TRIGGER commission_touch BEFORE UPDATE ON public.commission_rules FOR EACH ROW EXECUTE FUNCTION public.partners_touch_updated_at();

CREATE OR REPLACE FUNCTION public.partners_audit_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.partner_audit_log(partner_id, actor, action, payload)
      VALUES (NEW.id, NEW.user_id, 'created', jsonb_build_object('kind', NEW.kind, 'status', NEW.status));
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.partner_audit_log(partner_id, actor, action, payload)
      VALUES (NEW.id, auth.uid(), 'status_change', jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER partners_audit AFTER INSERT OR UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.partners_audit_status();

CREATE OR REPLACE VIEW public.partner_ranking_30d AS
SELECT
  p.id AS partner_id,
  p.name,
  p.kind,
  COALESCE(c.clicks,0) AS clicks_30d,
  COALESCE(a.leads,0) AS leads_30d,
  COALESCE(a.conversions,0) AS conversions_30d,
  COALESCE(a.revenue_cents,0) AS revenue_cents_30d
FROM public.partners p
LEFT JOIN (
  SELECT partner_id, COUNT(*) AS clicks FROM public.partner_clicks
  WHERE created_at >= now() - interval '30 days' GROUP BY partner_id
) c ON c.partner_id = p.id
LEFT JOIN (
  SELECT partner_id,
    COUNT(*) FILTER (WHERE conversion_type='lead') AS leads,
    COUNT(*) FILTER (WHERE conversion_type='sale') AS conversions,
    SUM(value_cents) FILTER (WHERE conversion_type='sale') AS revenue_cents
  FROM public.partner_attributions
  WHERE created_at >= now() - interval '30 days' GROUP BY partner_id
) a ON a.partner_id = p.id
WHERE p.status = 'aprovado';
GRANT SELECT ON public.partner_ranking_30d TO authenticated, service_role;
