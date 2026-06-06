-- Serviço de teste para validar fluxo admin → frontend → SEO
INSERT INTO public.services (
  slug, name, category, title, h1, description, service_type,
  problems, benefits, process, faq, keywords, cta_label,
  is_active, display_order
) VALUES (
  'servico-de-teste-qa',
  'Serviço de Teste QA',
  'Web',
  'Serviço de Teste QA · 0WEB',
  'Serviço de Teste — validação end-to-end',
  'Página de serviço de teste usada para validar o fluxo completo de cadastro no admin, exibição no catálogo /servicos e renderização da página de detalhe /servicos/{slug}, incluindo imagem, processo, FAQ e CTA.',
  'Serviço de validação técnica',
  '["Conteúdo desatualizado","Falta de imagens","FAQ inconsistente"]'::jsonb,
  '["Catálogo sempre atualizado","SEO automatizado","Edição em 1 clique"]'::jsonb,
  '[{"step":"Briefing","desc":"Levantamento rápido do escopo."},{"step":"Configuração","desc":"Cadastro no painel admin."},{"step":"Publicação","desc":"Conteúdo no ar com SEO e JSON-LD."}]'::jsonb,
  '[{"q":"Esse serviço é real?","a":"Não, é apenas um item de QA para verificar o fluxo end-to-end."},{"q":"Posso editar?","a":"Sim, basta acessar /app/servicos no painel."}]'::jsonb,
  '["teste","qa","validação","admin"]'::jsonb,
  'Falar com a equipe',
  true,
  999
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  process = EXCLUDED.process,
  faq = EXCLUDED.faq,
  keywords = EXCLUDED.keywords,
  updated_at = now();
