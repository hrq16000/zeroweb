
-- 1) profiles.user_ref
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_ref text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='profiles_user_ref_key') THEN
    CREATE UNIQUE INDEX profiles_user_ref_key ON public.profiles(user_ref) WHERE user_ref IS NOT NULL;
  END IF;
END $$;

-- 2) visitantes_rastreio.user_ref
ALTER TABLE public.visitantes_rastreio
  ADD COLUMN IF NOT EXISTS user_ref text;

CREATE INDEX IF NOT EXISTS visitantes_rastreio_user_ref_idx ON public.visitantes_rastreio(user_ref);
CREATE INDEX IF NOT EXISTS visitantes_rastreio_visitor_id_idx ON public.visitantes_rastreio(visitor_id);

-- 3) Função para gerar user_ref único (USR-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_user_ref()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
  attempts int := 0;
BEGIN
  LOOP
    candidate := 'USR-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_ref = candidate);
    attempts := attempts + 1;
    IF attempts > 20 THEN
      candidate := 'USR-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
      EXIT;
    END IF;
  END LOOP;
  RETURN candidate;
END $$;

-- 4) Backfill para perfis existentes
UPDATE public.profiles SET user_ref = public.generate_user_ref() WHERE user_ref IS NULL;

-- 5) Trigger: criar profile + user_ref no insert de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, user_ref, display_name, avatar_url)
  VALUES (
    NEW.id,
    public.generate_user_ref(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET user_ref = COALESCE(public.profiles.user_ref, EXCLUDED.user_ref);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 6) Função RPC server-side para costura de identidade (chamada do callback com supabaseAdmin)
CREATE OR REPLACE FUNCTION public.stitch_visitor_identity(p_visitor_id text, p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref text;
  v_count integer;
BEGIN
  IF p_visitor_id IS NULL OR p_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT user_ref INTO v_ref FROM public.profiles WHERE id = p_user_id;

  IF v_ref IS NULL THEN
    v_ref := public.generate_user_ref();
    UPDATE public.profiles SET user_ref = v_ref WHERE id = p_user_id AND user_ref IS NULL;
  END IF;

  WITH u AS (
    UPDATE public.visitantes_rastreio
       SET user_id = p_user_id,
           user_ref = v_ref
     WHERE visitor_id = p_visitor_id
     RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM u;

  RETURN COALESCE(v_count, 0);
END $$;

GRANT EXECUTE ON FUNCTION public.stitch_visitor_identity(text, uuid) TO service_role;
