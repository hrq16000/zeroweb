
-- ========== ECOSYSTEMS ==========
CREATE TABLE public.ecosystems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  description text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ecosystems TO authenticated;
GRANT ALL ON public.ecosystems TO service_role;
ALTER TABLE public.ecosystems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecosystems read auth" ON public.ecosystems FOR SELECT TO authenticated USING (true);
CREATE POLICY "ecosystems super write" ON public.ecosystems FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_ecosystems_touch BEFORE UPDATE ON public.ecosystems
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ========== ECOSYSTEM PORTALS ==========
CREATE TABLE public.ecosystem_portals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid NOT NULL REFERENCES public.ecosystems(id) ON DELETE CASCADE,
  portal_id uuid NOT NULL REFERENCES public.portals(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ecosystem_id, portal_id)
);
GRANT SELECT ON public.ecosystem_portals TO authenticated;
GRANT ALL ON public.ecosystem_portals TO service_role;
ALTER TABLE public.ecosystem_portals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eco_portals read auth" ON public.ecosystem_portals FOR SELECT TO authenticated USING (true);
CREATE POLICY "eco_portals super write" ON public.ecosystem_portals FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== CUSTOMER IDENTITIES (360°) ==========
CREATE TABLE public.customer_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE SET NULL,
  primary_email text,
  primary_phone text,
  full_name text,
  document text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ci_email ON public.customer_identities(primary_email);
CREATE INDEX idx_ci_phone ON public.customer_identities(primary_phone);
CREATE INDEX idx_ci_eco ON public.customer_identities(ecosystem_id);
GRANT SELECT ON public.customer_identities TO authenticated;
GRANT ALL ON public.customer_identities TO service_role;
ALTER TABLE public.customer_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci read super" ON public.customer_identities FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "ci write super" ON public.customer_identities FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER trg_ci_touch BEFORE UPDATE ON public.customer_identities
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ========== CUSTOMER IDENTITY LINKS ==========
CREATE TABLE public.customer_identity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  link_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
CREATE INDEX idx_cil_identity ON public.customer_identity_links(identity_id);
GRANT SELECT ON public.customer_identity_links TO authenticated;
GRANT ALL ON public.customer_identity_links TO service_role;
ALTER TABLE public.customer_identity_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cil super" ON public.customer_identity_links FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== CUSTOMER TOUCHPOINTS ==========
CREATE TABLE public.customer_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id uuid NOT NULL REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE SET NULL,
  kind text NOT NULL,
  title text,
  description text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ct_identity_time ON public.customer_touchpoints(identity_id, occurred_at DESC);
CREATE INDEX idx_ct_portal ON public.customer_touchpoints(portal_id);
GRANT SELECT ON public.customer_touchpoints TO authenticated;
GRANT ALL ON public.customer_touchpoints TO service_role;
ALTER TABLE public.customer_touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ct super read" ON public.customer_touchpoints FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "ct super write" ON public.customer_touchpoints FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== DATA WAREHOUSE ==========
CREATE TABLE public.dw_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE SET NULL,
  portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  identity_id uuid REFERENCES public.customer_identities(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  source text,
  entity_type text,
  entity_id uuid,
  numeric_value numeric,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dw_eco_time ON public.dw_events(ecosystem_id, occurred_at DESC);
CREATE INDEX idx_dw_portal_time ON public.dw_events(portal_id, occurred_at DESC);
CREATE INDEX idx_dw_type ON public.dw_events(event_type);
GRANT SELECT ON public.dw_events TO authenticated;
GRANT ALL ON public.dw_events TO service_role;
ALTER TABLE public.dw_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dw super" ON public.dw_events FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== LEAD ROUTING ==========
CREATE TABLE public.lead_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE CASCADE,
  portal_id uuid REFERENCES public.portals(id) ON DELETE CASCADE,
  name text NOT NULL,
  priority int NOT NULL DEFAULT 100,
  enabled boolean NOT NULL DEFAULT true,
  match_city text,
  match_state text,
  match_category text,
  match_specialty text,
  match_source text,
  target_kind text NOT NULL,
  target_id uuid,
  target_pool jsonb NOT NULL DEFAULT '[]'::jsonb,
  strategy text NOT NULL DEFAULT 'round_robin',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lead_routing_rules TO authenticated;
GRANT ALL ON public.lead_routing_rules TO service_role;
ALTER TABLE public.lead_routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lrr super" ON public.lead_routing_rules FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_lrr_touch BEFORE UPDATE ON public.lead_routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

CREATE TABLE public.lead_routing_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  rule_id uuid REFERENCES public.lead_routing_rules(id) ON DELETE SET NULL,
  target_kind text,
  target_id uuid,
  score int,
  reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lrl_lead ON public.lead_routing_log(lead_id);
GRANT SELECT ON public.lead_routing_log TO authenticated;
GRANT ALL ON public.lead_routing_log TO service_role;
ALTER TABLE public.lead_routing_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lrl super" ON public.lead_routing_log FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== CROSS SELL OPPORTUNITIES ==========
CREATE TABLE public.cross_sell_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE SET NULL,
  identity_id uuid REFERENCES public.customer_identities(id) ON DELETE CASCADE,
  from_portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  to_portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  offer_slug text,
  offer_title text,
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cso_identity ON public.cross_sell_opportunities(identity_id);
CREATE INDEX idx_cso_status ON public.cross_sell_opportunities(status);
GRANT SELECT ON public.cross_sell_opportunities TO authenticated;
GRANT ALL ON public.cross_sell_opportunities TO service_role;
ALTER TABLE public.cross_sell_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cso super" ON public.cross_sell_opportunities FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_cso_touch BEFORE UPDATE ON public.cross_sell_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();

-- ========== BI SNAPSHOTS ==========
CREATE TABLE public.bi_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE CASCADE,
  portal_id uuid REFERENCES public.portals(id) ON DELETE SET NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  scope text NOT NULL DEFAULT 'portal',
  kpis jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ecosystem_id, portal_id, snapshot_date, scope)
);
CREATE INDEX idx_bi_eco_date ON public.bi_snapshots(ecosystem_id, snapshot_date DESC);
GRANT SELECT ON public.bi_snapshots TO authenticated;
GRANT ALL ON public.bi_snapshots TO service_role;
ALTER TABLE public.bi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi super" ON public.bi_snapshots FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ========== HELPER: resolve_identity ==========
CREATE OR REPLACE FUNCTION public.resolve_or_create_identity(
  p_email text, p_phone text, p_name text, p_ecosystem_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF p_email IS NULL AND p_phone IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v_id FROM public.customer_identities
   WHERE (p_email IS NOT NULL AND primary_email = p_email)
      OR (p_phone IS NOT NULL AND primary_phone = p_phone)
   ORDER BY created_at ASC LIMIT 1;
  IF v_id IS NOT NULL THEN
    UPDATE public.customer_identities
       SET last_seen_at = now(),
           primary_email = COALESCE(primary_email, p_email),
           primary_phone = COALESCE(primary_phone, p_phone),
           full_name = COALESCE(full_name, p_name)
     WHERE id = v_id;
    RETURN v_id;
  END IF;
  INSERT INTO public.customer_identities(primary_email, primary_phone, full_name, ecosystem_id)
    VALUES (p_email, p_phone, p_name, p_ecosystem_id) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

-- Seed default ecosystem
INSERT INTO public.ecosystems(slug, name, description)
VALUES ('grupo-0web', 'Grupo 0web', 'Ecossistema nacional integrado de portais 0web')
ON CONFLICT (slug) DO NOTHING;
