
-- ============ SECURITY FIX: user_roles only super_admin can mutate ============
DROP POLICY IF EXISTS "admins manage user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
CREATE POLICY "super_admin manages user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "users read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()));

-- ============ 1. ETAPAS ============
CREATE TABLE IF NOT EXISTS public.dynamic_form_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT 'Etapa',
  subtitle text,
  cta_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dynamic_form_steps TO anon, authenticated;
GRANT ALL ON public.dynamic_form_steps TO service_role;
ALTER TABLE public.dynamic_form_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads steps of published forms" ON public.dynamic_form_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.dynamic_forms df WHERE df.id = form_id AND df.status = 'published'));
CREATE POLICY "admins manage steps" ON public.dynamic_form_steps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_dfs_updated BEFORE UPDATE ON public.dynamic_form_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.dynamic_form_questions
  ADD COLUMN IF NOT EXISTS step_id uuid REFERENCES public.dynamic_form_steps(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_dfq_step_id ON public.dynamic_form_questions(step_id);

-- backfill: 1 etapa por form, todas as perguntas vão pra ela
DO $$
DECLARE f record;
DECLARE new_step uuid;
BEGIN
  FOR f IN SELECT id, name FROM public.dynamic_forms LOOP
    IF NOT EXISTS (SELECT 1 FROM public.dynamic_form_steps WHERE form_id = f.id) THEN
      INSERT INTO public.dynamic_form_steps(form_id, order_index, title)
        VALUES (f.id, 0, 'Etapa 1') RETURNING id INTO new_step;
      UPDATE public.dynamic_form_questions SET step_id = new_step
        WHERE form_id = f.id AND step_id IS NULL;
    END IF;
  END LOOP;
END $$;

-- ============ 2. SCORING + TAGS ============
ALTER TABLE public.dynamic_form_leads
  ADD COLUMN IF NOT EXISTS score int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS intent_level text NOT NULL DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'novo',
  ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_dfl_stage ON public.dynamic_form_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_dfl_score ON public.dynamic_form_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_dfl_tags ON public.dynamic_form_leads USING GIN(tags);

-- ============ 3. PIPELINE RULES + STAGE HISTORY ============
CREATE TABLE IF NOT EXISTS public.lead_pipeline_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger jsonb NOT NULL DEFAULT '{}'::jsonb,
  action jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_pipeline_rules TO authenticated;
GRANT ALL ON public.lead_pipeline_rules TO service_role;
ALTER TABLE public.lead_pipeline_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage pipeline rules" ON public.lead_pipeline_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_lpr_updated BEFORE UPDATE ON public.lead_pipeline_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.lead_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.dynamic_form_leads(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  actor uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.lead_stage_history TO authenticated;
GRANT ALL ON public.lead_stage_history TO service_role;
ALTER TABLE public.lead_stage_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read stage history" ON public.lead_stage_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));
CREATE POLICY "service writes stage history" ON public.lead_stage_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- trigger to log stage changes
CREATE OR REPLACE FUNCTION public.dfl_log_stage_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    INSERT INTO public.lead_stage_history(lead_id, from_stage, to_stage, actor, reason)
      VALUES (NEW.id, NULL, NEW.pipeline_stage, NULL, 'created');
  ELSIF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    INSERT INTO public.lead_stage_history(lead_id, from_stage, to_stage, actor, reason)
      VALUES (NEW.id, OLD.pipeline_stage, NEW.pipeline_stage, auth.uid(), NULL);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_dfl_stage_log ON public.dynamic_form_leads;
CREATE TRIGGER trg_dfl_stage_log AFTER INSERT OR UPDATE OF pipeline_stage ON public.dynamic_form_leads
  FOR EACH ROW EXECUTE FUNCTION public.dfl_log_stage_change();

-- ============ 4. VERSIONAMENTO ============
CREATE TABLE IF NOT EXISTS public.dynamic_form_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.dynamic_forms(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  snapshot jsonb NOT NULL,
  notes text,
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(form_id, version_number)
);
GRANT SELECT, INSERT ON public.dynamic_form_versions TO authenticated;
GRANT ALL ON public.dynamic_form_versions TO service_role;
ALTER TABLE public.dynamic_form_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage versions" ON public.dynamic_form_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

ALTER TABLE public.dynamic_forms
  ADD COLUMN IF NOT EXISTS published_version_id uuid REFERENCES public.dynamic_form_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_version int NOT NULL DEFAULT 0;
