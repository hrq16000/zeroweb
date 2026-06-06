
-- Function to apply pipeline rules on lead insert
CREATE OR REPLACE FUNCTION public.apply_pipeline_rules_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  cond jsonb;
  act jsonb;
  ok boolean;
  v_answers jsonb;
  ans_key text;
  ans_val jsonb;
  match_val jsonb;
  tags_to_add text[];
  tags_to_remove text[];
BEGIN
  v_answers := COALESCE(NEW.answers_json, '{}'::jsonb);

  FOR r IN
    SELECT * FROM public.lead_pipeline_rules
     WHERE enabled = true
       AND (form_id IS NULL OR form_id = NEW.form_id)
     ORDER BY priority DESC, created_at ASC
  LOOP
    cond := r.trigger;
    act  := r.action;
    ok := true;

    -- score_gte
    IF cond ? 'score_gte' AND COALESCE(NEW.score, 0) < (cond->>'score_gte')::int THEN ok := false; END IF;
    -- score_lte
    IF ok AND cond ? 'score_lte' AND COALESCE(NEW.score, 0) > (cond->>'score_lte')::int THEN ok := false; END IF;
    -- intent_in
    IF ok AND cond ? 'intent_in' THEN
      IF NOT (cond->'intent_in') ? COALESCE(NEW.intent_level, '') THEN ok := false; END IF;
    END IF;
    -- has_any_tag
    IF ok AND cond ? 'has_any_tag' THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(cond->'has_any_tag') t
        WHERE t.value = ANY(COALESCE(NEW.tags, ARRAY[]::text[]))
      ) THEN ok := false; END IF;
    END IF;
    -- answer match: { question_key, equals|contains|in }
    IF ok AND cond ? 'answer' THEN
      ans_key := cond->'answer'->>'question_key';
      ans_val := v_answers -> ans_key;
      IF ans_val IS NULL THEN ok := false;
      ELSIF cond->'answer' ? 'equals' THEN
        IF (ans_val #>> '{}') IS DISTINCT FROM (cond->'answer'->>'equals') THEN ok := false; END IF;
      ELSIF cond->'answer' ? 'contains' THEN
        IF position(lower(cond->'answer'->>'contains') in lower(ans_val #>> '{}')) = 0 THEN ok := false; END IF;
      ELSIF cond->'answer' ? 'in' THEN
        match_val := cond->'answer'->'in';
        IF NOT match_val ? (ans_val #>> '{}') THEN ok := false; END IF;
      END IF;
    END IF;

    IF ok THEN
      IF act ? 'stage' THEN NEW.pipeline_stage := act->>'stage'; END IF;
      IF act ? 'add_tags' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(act->'add_tags')) INTO tags_to_add;
        NEW.tags := ARRAY(SELECT DISTINCT unnest(COALESCE(NEW.tags, ARRAY[]::text[]) || tags_to_add));
      END IF;
      IF act ? 'remove_tags' THEN
        SELECT ARRAY(SELECT jsonb_array_elements_text(act->'remove_tags')) INTO tags_to_remove;
        NEW.tags := ARRAY(SELECT t FROM unnest(COALESCE(NEW.tags, ARRAY[]::text[])) t WHERE NOT (t = ANY(tags_to_remove)));
      END IF;
      EXIT; -- first matching rule wins
    END IF;
  END LOOP;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_dfl_apply_rules ON public.dynamic_form_leads;
CREATE TRIGGER trg_dfl_apply_rules
  BEFORE INSERT ON public.dynamic_form_leads
  FOR EACH ROW EXECUTE FUNCTION public.apply_pipeline_rules_on_insert();
