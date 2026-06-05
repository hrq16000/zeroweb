
CREATE OR REPLACE FUNCTION public.can_manage_settings(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid AND role IN ('admin','admin_integrations')
  )
$$;

CREATE TABLE IF NOT EXISTS public.app_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  old_value text,
  new_value text,
  action text NOT NULL CHECK (action IN ('create','update','delete','rollback')),
  rolled_back_from_id uuid REFERENCES public.app_settings_history(id) ON DELETE SET NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_settings_history_key_time
  ON public.app_settings_history(key, changed_at DESC);

GRANT SELECT, INSERT ON public.app_settings_history TO authenticated;
GRANT ALL ON public.app_settings_history TO service_role;
ALTER TABLE public.app_settings_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings managers read history"
  ON public.app_settings_history FOR SELECT TO authenticated
  USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "settings managers write history"
  ON public.app_settings_history FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_settings(auth.uid()));

CREATE TABLE IF NOT EXISTS public.integration_status (
  key text PRIMARY KEY,
  last_status text NOT NULL DEFAULT 'unknown' CHECK (last_status IN ('ok','error','unknown')),
  last_message text,
  last_tested_at timestamptz,
  last_tested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.integration_status TO authenticated;
GRANT ALL ON public.integration_status TO service_role;
ALTER TABLE public.integration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings managers read status"
  ON public.integration_status FOR SELECT TO authenticated
  USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "settings managers write status"
  ON public.integration_status FOR ALL TO authenticated
  USING (public.can_manage_settings(auth.uid()))
  WITH CHECK (public.can_manage_settings(auth.uid()));

CREATE OR REPLACE FUNCTION public.app_settings_audit_trg()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor uuid; v_action text; v_old text; v_new text; v_key text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_actor := OLD.updated_by; v_action := 'delete';
    v_old := OLD.value; v_new := NULL; v_key := OLD.key;
  ELSIF TG_OP = 'INSERT' THEN
    v_actor := NEW.updated_by; v_action := 'create';
    v_old := NULL; v_new := NEW.value; v_key := NEW.key;
  ELSE
    IF NEW.value IS NOT DISTINCT FROM OLD.value THEN RETURN NEW; END IF;
    v_actor := NEW.updated_by; v_action := 'update';
    v_old := OLD.value; v_new := NEW.value; v_key := NEW.key;
  END IF;
  IF v_actor IS NULL THEN v_actor := auth.uid(); END IF;
  INSERT INTO public.app_settings_history(key, old_value, new_value, action, changed_by)
    VALUES (v_key, v_old, v_new, v_action, v_actor);
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS app_settings_audit ON public.app_settings;
CREATE TRIGGER app_settings_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.app_settings_audit_trg();

INSERT INTO public.integration_status(key) VALUES
  ('uazapi'), ('supabase'), ('lovable_ai')
ON CONFLICT (key) DO NOTHING;
