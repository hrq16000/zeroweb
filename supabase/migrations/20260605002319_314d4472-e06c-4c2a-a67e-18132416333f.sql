
-- ── Extend lead_submissions ────────────────────────────────────
ALTER TABLE public.lead_submissions
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS assignee text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS last_interaction timestamptz,
  ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_label text NOT NULL DEFAULT 'baixa',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.lead_submissions(status);
CREATE INDEX IF NOT EXISTS idx_leads_assignee ON public.lead_submissions(assignee);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.lead_submissions(score DESC);

-- ── CRM settings (singleton) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.crm_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  distribution_mode text NOT NULL DEFAULT 'manual',
  assignees text[] NOT NULL DEFAULT '{}',
  fixed_assignee text,
  round_robin_pointer integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.crm_settings TO authenticated;
GRANT ALL ON public.crm_settings TO service_role;
ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_settings_admin_only_select" ON public.crm_settings FOR SELECT TO authenticated USING (false);

INSERT INTO public.crm_settings (singleton, distribution_mode)
VALUES (true, 'manual') ON CONFLICT (singleton) DO NOTHING;

-- ── Lead history ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.lead_submissions(id) ON DELETE CASCADE,
  kind text NOT NULL,
  from_value text,
  to_value text,
  note text,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead ON public.lead_history(lead_id, created_at DESC);

GRANT SELECT, INSERT ON public.lead_history TO authenticated;
GRANT ALL ON public.lead_history TO service_role;
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_history_locked" ON public.lead_history FOR SELECT TO authenticated USING (false);

-- ── Scoring + distribution + history triggers ─────────────────
CREATE OR REPLACE FUNCTION public.compute_lead_score(p_row public.lead_submissions)
RETURNS TABLE(score integer, label text)
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE s integer := 0;
BEGIN
  IF p_row.name IS NOT NULL AND length(p_row.name) > 2 THEN s := s + 15; END IF;
  IF p_row.email IS NOT NULL THEN s := s + 20; END IF;
  IF p_row.phone IS NOT NULL THEN s := s + 25; END IF;
  IF p_row.company IS NOT NULL THEN s := s + 10; END IF;
  IF p_row.utm_source IS NOT NULL THEN s := s + 10; END IF;
  IF p_row.utm_campaign IS NOT NULL THEN s := s + 5; END IF;
  IF p_row.source = 'whatsapp' THEN s := s + 15; END IF;
  IF p_row.source = 'form' THEN s := s + 10; END IF;
  RETURN QUERY SELECT s, CASE WHEN s >= 70 THEN 'alta' WHEN s >= 40 THEN 'media' ELSE 'baixa' END;
END $$;

CREATE OR REPLACE FUNCTION public.leads_before_insert()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  s_score integer; s_label text;
  cfg public.crm_settings%ROWTYPE;
  next_idx integer;
BEGIN
  SELECT score, label INTO s_score, s_label FROM public.compute_lead_score(NEW);
  NEW.score := s_score; NEW.score_label := s_label;
  IF NEW.last_interaction IS NULL THEN NEW.last_interaction := now(); END IF;

  IF NEW.assignee IS NULL THEN
    SELECT * INTO cfg FROM public.crm_settings WHERE singleton = true LIMIT 1;
    IF cfg.distribution_mode = 'fixed' AND cfg.fixed_assignee IS NOT NULL THEN
      NEW.assignee := cfg.fixed_assignee;
    ELSIF cfg.distribution_mode = 'round_robin' AND array_length(cfg.assignees, 1) > 0 THEN
      next_idx := (cfg.round_robin_pointer % array_length(cfg.assignees, 1)) + 1;
      NEW.assignee := cfg.assignees[next_idx];
      UPDATE public.crm_settings SET round_robin_pointer = cfg.round_robin_pointer + 1, updated_at = now() WHERE singleton = true;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_leads_before_insert ON public.lead_submissions;
CREATE TRIGGER trg_leads_before_insert BEFORE INSERT ON public.lead_submissions
FOR EACH ROW EXECUTE FUNCTION public.leads_before_insert();

CREATE OR REPLACE FUNCTION public.leads_after_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.lead_history(lead_id, kind, to_value, note, actor)
    VALUES (NEW.id, 'created', NEW.status, COALESCE('Origem: ' || NEW.source, 'Lead criado'), 'system');
    IF NEW.assignee IS NOT NULL THEN
      INSERT INTO public.lead_history(lead_id, kind, to_value, actor) VALUES (NEW.id, 'assignment', NEW.assignee, 'system');
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.lead_history(lead_id, kind, from_value, to_value, actor)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status, 'admin');
    NEW.last_interaction := now();
  END IF;
  IF NEW.assignee IS DISTINCT FROM OLD.assignee THEN
    INSERT INTO public.lead_history(lead_id, kind, from_value, to_value, actor)
    VALUES (NEW.id, 'assignment', OLD.assignee, NEW.assignee, 'admin');
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_leads_after_insert ON public.lead_submissions;
CREATE TRIGGER trg_leads_after_insert AFTER INSERT ON public.lead_submissions
FOR EACH ROW EXECUTE FUNCTION public.leads_after_change();

DROP TRIGGER IF EXISTS trg_leads_before_update ON public.lead_submissions;
CREATE TRIGGER trg_leads_before_update BEFORE UPDATE ON public.lead_submissions
FOR EACH ROW EXECUTE FUNCTION public.leads_after_change();
