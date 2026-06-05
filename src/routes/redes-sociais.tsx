import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/redes-sociais";
const TITLE = "Gestão de Redes Sociais · Instagram, TikTok e LinkedIn · 0WEB";
const DESC =
  "Gestão de redes sociais com estratégia, conteúdo e performance: Instagram, TikTok, LinkedIn, Facebook e YouTube. Planejamento mensal, design, copy e relatórios.";

export const Route = createFileRoute("/redes-sociais")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="redes-sociais"
      intent="redes-sociais"
      offerSlug="gestao-redes-sociais"
      eyebrow="Redes Sociais"
      headline="Gestão de redes sociais que constrói marca e gera vendas"
      subheadline="Planejamento estratégico, conteúdo profissional e performance integrada para Instagram, TikTok, LinkedIn, Facebook e YouTube."
      ctaLabel="Quero gestão profissional"
      whatsappMessage="Quero gestão profissional das minhas redes sociais."
      benefits={[
        { title: "Planejamento mensal estratégico", description: "Calendário editorial alinhado a campanhas e datas comerciais." },
        { title: "Design e copy profissionais", description: "Identidade visual consistente, copy persuasiva e CTAs claros." },
        { title: "Reels, TikToks e Shorts", description: "Roteiro, edição e trilhas que aumentam alcance orgânico." },
        { title: "Gestão de comunidade", description: "Resposta a comentários, DMs e qualificação de leads." },
        { title: "Anúncios integrados", description: "Tráfego pago Meta, TikTok e LinkedIn com criativos próprios." },
        { title: "Relatórios mensais", description: "Alcance, engajamento, seguidores e conversões em dashboard." },
      ]}
      faq={[
        { q: "Quantos posts por mês?", a: "De 12 a 30 posts conforme o plano, incluindo Reels e Stories." },
        { q: "Vocês produzem fotos e vídeos?", a: "Sim. Temos fotógrafos e editores parceiros em todo Brasil." },
        { q: "Fazem anúncios também?", a: "Sim, integramos gestão orgânica com tráfego pago." },
        { q: "Atendem MEI e pequenas empresas?", a: "Sim, com planos acessíveis e foco em resultado." },
      ]}
      schemaService={{ name: "Gestão de Redes Sociais", description: DESC }}
    />
  ),
});
