
CREATE OR REPLACE FUNCTION public.normalize_phone(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT NULLIF(regexp_replace(COALESCE(p,''), '\D', '', 'g'), '')
$$;

CREATE OR REPLACE FUNCTION public.leads_dedup_same_day()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_phone text;
  v_existing_id uuid;
BEGIN
  v_phone := public.normalize_phone(NEW.phone);
  IF v_phone IS NULL OR length(v_phone) < 8 THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_existing_id
    FROM public.lead_submissions
   WHERE public.normalize_phone(phone) = v_phone
     AND created_at >= date_trunc('day', now())
     AND created_at <  date_trunc('day', now()) + interval '1 day'
   ORDER BY created_at ASC
   LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.lead_submissions
       SET last_interaction = now(),
           updated_at = now(),
           payload_json = COALESCE(payload_json, '{}'::jsonb)
             || jsonb_build_object(
                  'duplicate_attempts',
                  COALESCE((payload_json->>'duplicate_attempts')::int, 0) + 1,
                  'last_duplicate_at', to_jsonb(now()),
                  'last_duplicate_payload', COALESCE(NEW.payload_json, '{}'::jsonb)
                )
     WHERE id = v_existing_id;

    INSERT INTO public.lead_history(lead_id, kind, to_value, note, actor)
      VALUES (v_existing_id, 'note', 'duplicate_same_day',
              'Tentativa duplicada no mesmo dia ('||COALESCE(NEW.source,'?')||')', 'system');

    -- Skip the insert
    RETURN NULL;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_leads_dedup_same_day ON public.lead_submissions;
CREATE TRIGGER trg_leads_dedup_same_day
  BEFORE INSERT ON public.lead_submissions
  FOR EACH ROW EXECUTE FUNCTION public.leads_dedup_same_day();

CREATE INDEX IF NOT EXISTS idx_leads_phone_norm_day
  ON public.lead_submissions (public.normalize_phone(phone), created_at DESC)
  WHERE phone IS NOT NULL;
