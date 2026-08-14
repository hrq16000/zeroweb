UPDATE public.services
SET faq = faq || '[
  {"q":"Em quanto tempo começo a ver resultado?","a":"As campanhas entram no ar em até 72h após o briefing e a aprovação dos anúncios. A maioria dos clientes recebe os primeiros contatos na primeira semana; a otimização de custo por lead amadurece entre 30 e 60 dias."},
  {"q":"A conta do Google Ads fica no meu nome?","a":"Sim. A conta é sua, com seu cartão e seu histórico. Você mantém total acesso e propriedade dos dados mesmo se encerrar a gestão."},
  {"q":"Como acompanho os resultados?","a":"Você recebe relatório mensal com investimento, cliques, custo por lead e volume de contatos, além de acesso direto ao painel da conta a qualquer momento."},
  {"q":"E se eu quiser cancelar?","a":"Basta avisar antes da próxima renovação mensal. Não há multa, fidelidade nem taxa de saída — a conta e as campanhas continuam com você."}
]'::jsonb,
    seo_description = 'Gestão de Google Ads a partir de R$ 299/mês: campanhas configuradas, otimizadas e com leads direto no WhatsApp. Sem fidelidade, conta no seu nome e relatório mensal.'
WHERE slug = 'google-ads-299';

REVOKE ALL ON public.companies FROM anon;
REVOKE ALL ON public.providers FROM anon;
REVOKE ALL ON public.service_catalog FROM anon;