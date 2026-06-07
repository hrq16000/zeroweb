ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS og_image_path text,
  ADD COLUMN IF NOT EXISTS og_type text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS schema_jsonld jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rich_html text;

COMMENT ON COLUMN public.services.og_image_path IS 'Storage path (bucket service-images) usado para og:image quando definido. Cai no image_path se nulo.';
COMMENT ON COLUMN public.services.og_type IS 'og:type — website | article | product.';
COMMENT ON COLUMN public.services.schema_jsonld IS 'Array de blocos JSON-LD adicionais a serem injetados na head() da página de serviço.';
COMMENT ON COLUMN public.services.rich_html IS 'Bloco HTML/Markdown rico migrado de rotas literais, exibido na página de produto entre process e FAQ.';