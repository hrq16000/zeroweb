
-- 1) commission_rules: restrict global rules read to admins
DROP POLICY IF EXISTS commission_read ON public.commission_rules;
CREATE POLICY commission_read ON public.commission_rules
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR (partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.partners p
       WHERE p.id = commission_rules.partner_id AND p.user_id = auth.uid()
    ))
  );

-- 2) Prevent owners from escalating privileged fields via triggers
CREATE OR REPLACE FUNCTION public.prevent_owner_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_priv boolean;
BEGIN
  is_priv := public.is_admin_or_super(auth.uid());
  IF is_priv THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'companies' OR TG_TABLE_NAME = 'providers' THEN
    IF NEW.verified IS DISTINCT FROM OLD.verified
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.rating_avg IS DISTINCT FROM OLD.rating_avg
       OR NEW.rating_count IS DISTINCT FROM OLD.rating_count
       OR NEW.views_count IS DISTINCT FROM OLD.views_count THEN
      RAISE EXCEPTION 'Not authorized to modify moderation/metric fields'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  ELSIF TG_TABLE_NAME = 'partners' THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.kind IS DISTINCT FROM OLD.kind
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by THEN
      RAISE EXCEPTION 'Not authorized to modify status/kind/approval fields'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_companies_prevent_owner_priv ON public.companies;
CREATE TRIGGER trg_companies_prevent_owner_priv
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_privileged_updates();

DROP TRIGGER IF EXISTS trg_providers_prevent_owner_priv ON public.providers;
CREATE TRIGGER trg_providers_prevent_owner_priv
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_privileged_updates();

DROP TRIGGER IF EXISTS trg_partners_prevent_owner_priv ON public.partners;
CREATE TRIGGER trg_partners_prevent_owner_priv
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_privileged_updates();
