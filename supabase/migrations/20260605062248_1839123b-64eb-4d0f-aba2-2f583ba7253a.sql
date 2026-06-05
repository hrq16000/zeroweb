
CREATE TABLE IF NOT EXISTS public.partner_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  attribution_id uuid REFERENCES public.partner_attributions(id) ON DELETE SET NULL,
  rule_id uuid REFERENCES public.commission_rules(id) ON DELETE SET NULL,
  base_amount_cents integer NOT NULL DEFAULT 0,
  commission_amount_cents integer NOT NULL DEFAULT 0,
  commission_type text NOT NULL,
  period text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attribution_id)
);

GRANT SELECT ON public.partner_commissions TO authenticated;
GRANT ALL ON public.partner_commissions TO service_role;

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_commissions_self_read" ON public.partner_commissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_commissions.partner_id
        AND (p.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
    )
  );

CREATE POLICY "partner_commissions_admin_write" ON public.partner_commissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS partner_commissions_partner_idx ON public.partner_commissions(partner_id, status, created_at DESC);

CREATE TRIGGER trg_partner_commissions_updated
  BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW EXECUTE FUNCTION public.mk_touch_updated_at();
