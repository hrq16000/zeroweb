// Fonte única de verdade para o FAQ do Site Express.
// Usada por /servicos/site-express (página de detalhe) e por /servicos (hub),
// garantindo deduplicação no JSON-LD agregado.

export type FaqQA = { q: string; a: string };

export const SITE_EXPRESS_FAQ: FaqQA[] = [
  {
    q: "Em quanto tempo o site fica pronto mesmo?",
    a: "Após briefing e pagamento confirmados, nosso time monta o site sob medida e entrega chave-na-mão. Você não precisa mexer em nada.",
  },
  {
    q: "Por que é tão mais barato que uma agência tradicional?",
    a: "Nosso processo é enxuto: você manda um áudio no WhatsApp, nosso time produz e entrega — sem reuniões longas, sem orçamentos infinitos e sem retrabalho. Por isso conseguimos cobrar R$ 499 onde agência cobraria R$ 3.000+.",
  },
  {
    q: "Posso pedir alterações depois da entrega?",
    a: "Sim. Você revisa a prévia antes da publicação e pode pedir ajustes finos. Após entrega, oferecemos suporte para alterações pontuais por até 30 dias.",
  },
  {
    q: "E o domínio (www.meusite.com.br) está incluso?",
    a: "Sim. Cuidamos do registro do domínio, configuração de DNS, certificado SSL e hospedagem profissional no primeiro ano — tudo já incluso nos R$ 499.",
  },
  {
    q: "Preciso entender de tecnologia para usar?",
    a: "Zero. Você só conta o que seu negócio faz pelo WhatsApp. Nós cuidamos de tudo: design, textos, fotos, configuração e publicação.",
  },
  {
    q: "O site funciona bem no celular?",
    a: "100% mobile-first. Mais de 80% dos visitantes acessam pelo celular, então projetamos primeiro pro celular e depois adaptamos pro desktop. Carrega rápido e converte.",
  },
  {
    q: "Vocês integram com WhatsApp e Google?",
    a: "Sim. Toda página tem botão flutuante de WhatsApp com mensagem pré-preenchida, integração com Google Maps e perfil do Google Meu Negócio quando aplicável.",
  },
  {
    q: "E se eu quiser adicionar mais páginas ou vender online depois?",
    a: "O Site Express já vem com base profissional. Quando quiser evoluir para mais páginas, blog, e-commerce ou agendamento online, temos pacotes de upgrade — sem refazer do zero.",
  },
  {
    q: "Como funciona o pagamento? Tem mensalidade?",
    a: "R$ 499 é pagamento único, à vista no Pix ou parcelado no cartão. Não tem mensalidade. A partir do segundo ano, cobramos só uma anuidade simbólica de hospedagem e domínio (R$ 29/mês).",
  },
  {
    q: "Vocês fazem o conteúdo (textos e fotos) do site?",
    a: "Sim. Escrevemos os textos persuasivos com base no briefing e usamos imagens profissionais do nosso banco. Se você tiver fotos próprias (loja, equipe, trabalhos), incorporamos sem custo extra.",
  },
  {
    q: "Funciona pra qualquer tipo de negócio?",
    a: "Funciona pra praticamente todo prestador de serviço local ou pequeno comércio: assistência técnica, salão, eletricista, instalador, consultor, construção, autônomo, loja, clínica, escritório. Se a sua dúvida é específica, manda pelo WhatsApp.",
  },
  {
    q: "Posso cancelar ou pedir reembolso?",
    a: "Sim. Se em 7 dias após a entrega você não estiver satisfeito e a gente não conseguir resolver, devolvemos 100% do valor pago — sem perguntas.",
  },
];

export function normalizeFaqKey(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const SITE_EXPRESS_FAQ_KEYS = new Set(
  SITE_EXPRESS_FAQ.map((f) => normalizeFaqKey(f.q)),
);
