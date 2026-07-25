
-- 1) Audit log table for sensitive field changes
CREATE TABLE public.field_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  row_id uuid NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  actor uuid,
  actor_is_admin boolean,
  operation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.field_audit_log TO authenticated;
GRANT ALL ON public.field_audit_log TO service_role;

ALTER TABLE public.field_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_audit_log_admin_read" ON public.field_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_field_audit_log_row ON public.field_audit_log(table_name, row_id, created_at DESC);
CREATE INDEX idx_field_audit_log_actor ON public.field_audit_log(actor, created_at DESC);

-- 2) Generic audit trigger for sensitive fields
CREATE OR REPLACE FUNCTION public.audit_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fields text[];
  v_field text;
  v_old jsonb;
  v_new jsonb;
  v_actor uuid;
  v_is_admin boolean;
BEGIN
  v_actor := auth.uid();
  v_is_admin := public.is_admin_or_super(v_actor);
  v_old := to_jsonb(OLD);
  v_new := to_jsonb(NEW);

  IF TG_TABLE_NAME IN ('companies','providers') THEN
    v_fields := ARRAY['verified','status','rating_avg','rating_count','views_count'];
  ELSIF TG_TABLE_NAME = 'partners' THEN
    v_fields := ARRAY['status','kind','approved_at','approved_by'];
  ELSE
    v_fields := ARRAY[]::text[];
  END IF;

  FOREACH v_field IN ARRAY v_fields LOOP
    IF (v_old ->> v_field) IS DISTINCT FROM (v_new ->> v_field) THEN
      INSERT INTO public.field_audit_log(
        table_name, row_id, field_name, old_value, new_value,
        actor, actor_is_admin, operation
      ) VALUES (
        TG_TABLE_NAME, NEW.id, v_field, v_old ->> v_field, v_new ->> v_field,
        v_actor, v_is_admin, TG_OP
      );
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

CREATE TRIGGER audit_companies_fields
  AFTER UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_fields();

CREATE TRIGGER audit_providers_fields
  AFTER UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_fields();

CREATE TRIGGER audit_partners_fields
  AFTER UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_fields();

-- 3) Audit table for wa_funnel_update_session RPC
CREATE TABLE public.wa_funnel_update_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_row_id uuid NOT NULL,
  session_id text NOT NULL,
  actor uuid,
  changed_fields text[] NOT NULL,
  old_values jsonb,
  new_values jsonb,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wa_funnel_update_audit TO authenticated;
GRANT ALL ON public.wa_funnel_update_audit TO service_role;

ALTER TABLE public.wa_funnel_update_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_funnel_audit_admin_read" ON public.wa_funnel_update_audit
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_wa_funnel_audit_row ON public.wa_funnel_update_audit(session_row_id, created_at DESC);

-- 4) Rewrite wa_funnel_update_session RPC with stricter validation + audit
CREATE OR REPLACE FUNCTION public.wa_funnel_update_session(
  p_id uuid,
  p_session_id text,
  p_current_step integer DEFAULT NULL,
  p_answers jsonb DEFAULT NULL,
  p_completed boolean DEFAULT NULL,
  p_completed_at timestamptz DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.wa_funnel_sessions%ROWTYPE;
  v_new public.wa_funnel_sessions%ROWTYPE;
  v_changed text[] := ARRAY[]::text[];
  v_old_json jsonb := '{}'::jsonb;
  v_new_json jsonb := '{}'::jsonb;
  v_updated int := 0;
  v_success boolean := false;
BEGIN
  -- Strict input validation
  IF p_id IS NULL THEN RETURN false; END IF;
  IF p_session_id IS NULL OR length(p_session_id) < 8 OR length(p_session_id) > 128 THEN
    RETURN false;
  END IF;
  IF p_session_id !~ '^[A-Za-z0-9_\-]+$' THEN
    RETURN false;
  END IF;
  IF p_current_step IS NOT NULL AND (p_current_step < 0 OR p_current_step > 500) THEN
    RETURN false;
  END IF;
  IF p_answers IS NOT NULL AND jsonb_typeof(p_answers) <> 'object' THEN
    RETURN false;
  END IF;
  IF p_answers IS NOT NULL AND pg_column_size(p_answers) > 32768 THEN
    RETURN false;
  END IF;
  IF p_completed_at IS NOT NULL AND (p_completed_at > now() + interval '5 minutes'
                                     OR p_completed_at < now() - interval '24 hours') THEN
    RETURN false;
  END IF;

  SELECT * INTO v_old
    FROM public.wa_funnel_sessions
   WHERE id = p_id
     AND session_id = p_session_id
     AND created_at > now() - interval '24 hours';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  UPDATE public.wa_funnel_sessions
     SET current_step = COALESCE(p_current_step, current_step),
         answers_json = COALESCE(p_answers, answers_json),
         completed = COALESCE(p_completed, completed),
         completed_at = COALESCE(p_completed_at, completed_at)
   WHERE id = p_id
     AND session_id = p_session_id
     AND created_at > now() - interval '24 hours'
  RETURNING * INTO v_new;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  v_success := v_updated > 0;

  IF v_success THEN
    IF v_new.current_step IS DISTINCT FROM v_old.current_step THEN
      v_changed := v_changed || 'current_step';
      v_old_json := v_old_json || jsonb_build_object('current_step', v_old.current_step);
      v_new_json := v_new_json || jsonb_build_object('current_step', v_new.current_step);
    END IF;
    IF v_new.answers_json IS DISTINCT FROM v_old.answers_json THEN
      v_changed := v_changed || 'answers_json';
      -- Log only key set to avoid PII bloat
      v_old_json := v_old_json || jsonb_build_object('answers_keys', (SELECT jsonb_agg(k) FROM jsonb_object_keys(COALESCE(v_old.answers_json,'{}'::jsonb)) k));
      v_new_json := v_new_json || jsonb_build_object('answers_keys', (SELECT jsonb_agg(k) FROM jsonb_object_keys(COALESCE(v_new.answers_json,'{}'::jsonb)) k));
    END IF;
    IF v_new.completed IS DISTINCT FROM v_old.completed THEN
      v_changed := v_changed || 'completed';
      v_old_json := v_old_json || jsonb_build_object('completed', v_old.completed);
      v_new_json := v_new_json || jsonb_build_object('completed', v_new.completed);
    END IF;
    IF v_new.completed_at IS DISTINCT FROM v_old.completed_at THEN
      v_changed := v_changed || 'completed_at';
      v_old_json := v_old_json || jsonb_build_object('completed_at', v_old.completed_at);
      v_new_json := v_new_json || jsonb_build_object('completed_at', v_new.completed_at);
    END IF;

    IF array_length(v_changed, 1) > 0 THEN
      INSERT INTO public.wa_funnel_update_audit(
        session_row_id, session_id, actor, changed_fields, old_values, new_values, success
      ) VALUES (
        p_id, p_session_id, auth.uid(), v_changed, v_old_json, v_new_json, true
      );
    END IF;
  END IF;

  RETURN v_success;
END $$;
