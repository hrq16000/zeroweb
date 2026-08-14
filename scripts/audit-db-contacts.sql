-- Auditoria de contatos públicos no banco (wa.me, api.whatsapp.com, tel:, mailto:).
-- Uso: psql -f scripts/audit-db-contacts.sql
-- Resultado: NOTICE "HIT <tabela>.<coluna> => N linhas" para cada ocorrência.
DO $$
DECLARE r record; n bigint; hits int := 0;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema
     AND t.table_name = c.table_name
     AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text','character varying','jsonb','json')
  LOOP
    EXECUTE format(
      'SELECT count(*) FROM public.%I WHERE %I::text ~* %L',
      r.table_name, r.column_name,
      '(wa\.me|api\.whatsapp\.com|whatsapp\.com/send|tel:\+?[0-9]|mailto:)'
    ) INTO n;
    IF n > 0 THEN
      hits := hits + 1;
      RAISE NOTICE 'HIT %.% => % linhas', r.table_name, r.column_name, n;
    END IF;
  END LOOP;
  RAISE NOTICE 'Auditoria concluída: % coluna(s) com contato público.', hits;
END $$;
