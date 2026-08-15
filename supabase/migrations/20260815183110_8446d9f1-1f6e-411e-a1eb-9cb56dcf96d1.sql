-- Turno 1: minimizacao da tabela whatsapp_redirect_tokens (compatibilidade retroativa)

COMMENT ON COLUMN public.whatsapp_redirect_tokens.destination_digits IS
  'LEGADO (somente leitura durante transicao). Novos registros devem ser NULL; o destino e resolvido no servidor no consumo do token.';
COMMENT ON COLUMN public.whatsapp_redirect_tokens.message IS
  'LEGADO (somente leitura durante transicao). Novos registros devem ser NULL; a mensagem e remontada no servidor no consumo do token.';

-- Bloqueia criacao de novos registros no formato legado, preservando os antigos
CREATE OR REPLACE FUNCTION public.whatsapp_tokens_block_legacy_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.destination_digits IS NOT NULL OR NEW.message IS NOT NULL THEN
      RAISE EXCEPTION 'whatsapp_redirect_tokens: formato legado desativado (destination_digits/message devem ser NULL)';
    END IF;
    IF NEW.funnel_session_id IS NULL AND NEW.lead_id IS NULL THEN
      RAISE EXCEPTION 'whatsapp_redirect_tokens: token precisa de funnel_session_id ou lead_id';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Permite apenas limpar (nunca preencher) os campos legados
    IF NEW.destination_digits IS DISTINCT FROM OLD.destination_digits
       AND NEW.destination_digits IS NOT NULL THEN
      RAISE EXCEPTION 'whatsapp_redirect_tokens: destination_digits e legado e nao pode ser preenchido';
    END IF;
    IF NEW.message IS DISTINCT FROM OLD.message AND NEW.message IS NOT NULL THEN
      RAISE EXCEPTION 'whatsapp_redirect_tokens: message e legado e nao pode ser preenchido';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_tokens_block_legacy ON public.whatsapp_redirect_tokens;
CREATE TRIGGER trg_whatsapp_tokens_block_legacy
  BEFORE INSERT OR UPDATE ON public.whatsapp_redirect_tokens
  FOR EACH ROW EXECUTE FUNCTION public.whatsapp_tokens_block_legacy_insert();

-- Indices de seguranca/performance
CREATE INDEX IF NOT EXISTS idx_wa_tokens_expires_at
  ON public.whatsapp_redirect_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_wa_tokens_funnel_session
  ON public.whatsapp_redirect_tokens (funnel_session_id)
  WHERE funnel_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_tokens_lead
  ON public.whatsapp_redirect_tokens (lead_id)
  WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_tokens_active
  ON public.whatsapp_redirect_tokens (token, expires_at)
  WHERE used_at IS NULL;
