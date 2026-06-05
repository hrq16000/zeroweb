
-- 1. integration_schemas
CREATE TABLE public.integration_schemas (
  key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  testable boolean NOT NULL DEFAULT false,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 100,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_schemas TO authenticated;
GRANT ALL ON public.integration_schemas TO service_role;
ALTER TABLE public.integration_schemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schemas managers read" ON public.integration_schemas
  FOR SELECT TO authenticated USING (public.can_manage_settings(auth.uid()));
CREATE POLICY "schemas managers write" ON public.integration_schemas
  FOR ALL TO authenticated
  USING (public.can_manage_settings(auth.uid()))
  WITH CHECK (public.can_manage_settings(auth.uid()));

-- 2. Critical flag + reason + alert dedup
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS is_critical boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_settings_history ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.integration_status ADD COLUMN IF NOT EXISTS last_alert_at timestamptz;

-- 3. Trigger now reads reason from a per-tx session var
CREATE OR REPLACE FUNCTION public.app_settings_audit_trg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid; v_action text; v_old text; v_new text; v_key text; v_reason text;
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
  v_reason := NULLIF(current_setting('app.change_reason', true), '');
  INSERT INTO public.app_settings_history(key, old_value, new_value, action, changed_by, reason)
    VALUES (v_key, v_old, v_new, v_action, v_actor, v_reason);
  RETURN COALESCE(NEW, OLD);
END $$;

-- 4. Seeds
INSERT INTO public.integration_schemas(key, label, description, testable, sort_order, fields) VALUES
('uazapi', 'uazapi (WhatsApp)', 'Envio de alertas via WhatsApp', true, 10,
 '[
   {"key":"uazapi.base_url","label":"Base URL","type":"url","critical":true,"required":true,"placeholder":"https://api.uazapi.com"},
   {"key":"uazapi.token","label":"Token","type":"secret","critical":true,"required":true},
   {"key":"uazapi.alert_number","label":"Número de alerta","type":"text","critical":false,"required":true,"placeholder":"5511999999999"}
 ]'::jsonb),
('supabase', 'Lovable Cloud (banco)', 'Conexão administrativa ao banco', true, 20, '[]'::jsonb),
('lovable_ai', 'Lovable AI Gateway', 'Gateway de modelos de IA', true, 30, '[]'::jsonb),
('google_search_console', 'Google Search Console', 'Cobertura, sitemap e métricas SEO (requer autorização do conector)', true, 40,
 '[
   {"key":"gsc.site_url","label":"Site verificado","type":"url","critical":false,"required":false,"placeholder":"https://exemplo.com/"}
 ]'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  label=EXCLUDED.label, description=EXCLUDED.description, testable=EXCLUDED.testable,
  fields=EXCLUDED.fields, sort_order=EXCLUDED.sort_order, updated_at=now();

-- Mark current critical keys
UPDATE public.app_settings SET is_critical = true WHERE key IN ('uazapi.token','uazapi.base_url');
