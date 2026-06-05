
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
BEGIN
  -- Cria/garante profile com user_ref
  INSERT INTO public.profiles(id, user_ref, display_name, avatar_url)
  VALUES (
    NEW.id,
    public.generate_user_ref(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET user_ref = COALESCE(public.profiles.user_ref, EXCLUDED.user_ref);

  -- Auto-linking de parceiros aprovados com mesmo email
  IF NEW.email IS NOT NULL THEN
    UPDATE public.partners
       SET user_id = NEW.id,
           updated_at = now()
     WHERE LOWER(email) = LOWER(NEW.email)
       AND user_id IS NULL
       AND status = 'approved'
    RETURNING id INTO v_partner_id;

    IF v_partner_id IS NOT NULL THEN
      INSERT INTO public.partner_audit_log(partner_id, actor, action, payload)
        VALUES (v_partner_id, NEW.id, 'auto_linked',
                jsonb_build_object('email', NEW.email, 'reason', 'new_user_email_match'));
    END IF;
  END IF;

  RETURN NEW;
END $$;
