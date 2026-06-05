-- blocked_asns: remove public read
DROP POLICY IF EXISTS "public read blocked_asns" ON public.blocked_asns;
CREATE POLICY "admins read blocked_asns" ON public.blocked_asns
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- campaigns: super_admin read only
DROP POLICY IF EXISTS "campaigns_read" ON public.campaigns;
CREATE POLICY "campaigns_admin_read" ON public.campaigns
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
REVOKE SELECT ON public.campaigns FROM anon;

-- ecosystems: members or super_admin
DROP POLICY IF EXISTS "ecosystems read auth" ON public.ecosystems;
CREATE POLICY "ecosystems read members" ON public.ecosystems
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.ecosystem_portals ep
      JOIN public.portal_members pm ON pm.portal_id = ep.portal_id
      WHERE ep.ecosystem_id = ecosystems.id AND pm.user_id = auth.uid()
    )
  );

-- ecosystem_portals: members of that portal or super_admin
DROP POLICY IF EXISTS "eco_portals read auth" ON public.ecosystem_portals;
CREATE POLICY "eco_portals read members" ON public.ecosystem_portals
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin(auth.uid())
    OR public.is_portal_member(auth.uid(), portal_id)
  );

-- remarketing_audiences: super_admin only
DROP POLICY IF EXISTS "ra_admin_read" ON public.remarketing_audiences;
CREATE POLICY "ra_super_admin_read" ON public.remarketing_audiences
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));