CREATE OR REPLACE FUNCTION public.pgrst_reload_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END $$;

REVOKE ALL ON FUNCTION public.pgrst_reload_schema() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pgrst_reload_schema() TO service_role;

CREATE OR REPLACE FUNCTION public.db_required_tables_check(_tables text[])
RETURNS TABLE(tbl text, present boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t AS tbl,
         EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = t
         ) AS present
  FROM unnest(_tables) AS t
$$;

REVOKE ALL ON FUNCTION public.db_required_tables_check(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.db_required_tables_check(text[]) TO service_role;
