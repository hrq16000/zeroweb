DROP INDEX IF EXISTS public.visitantes_rastreio_dedupe_idx;
CREATE UNIQUE INDEX IF NOT EXISTS visitantes_rastreio_dedupe_page_idx
  ON public.visitantes_rastreio (ip_hash, day, COALESCE(path, ''));