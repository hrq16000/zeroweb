import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/automacao";
const TITLE = "Automação Comercial e Operacional · 0WEB";
const DESC = "Automatize captação, atendimento e operação com integrações de WhatsApp, CRM e n8n.";

export const Route = createFileRoute("/automacao")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="automacao"
      intent="automacao"
      offerSlug="diagnostico-gratuito"
      eyebrow="Automação"
      headline="Sua operação no piloto automático"
      subheadline="Conectamos site, WhatsApp, CRM e ferramentas para eliminar tarefas manuais."
      ctaLabel="Quero automatizar"
      whatsappMessage="Quero automatizar minha operação com a 0WEB."
      benefits={[
        { title: "Integrações sob medida", description: "WhatsApp, CRM, planilhas, n8n e APIs próprias." },
        { title: "Roteamento de leads", description: "Distribuição automática para o vendedor certo." },
        { title: "Notificações inteligentes", description: "Alertas em tempo real para sua equipe." },
        { title: "Painel de execução", description: "Visualize fluxos rodando 24/7." },
      ]}
      faq={[
        { q: "Funciona com meu sistema atual?", a: "Sim, integramos com qualquer ferramenta que tenha API." },
        { q: "Quanto tempo leva?", a: "Automações simples ficam prontas em 1 semana." },
        { q: "Vocês mantêm depois?", a: "Sim, oferecemos suporte mensal de monitoramento." },
      ]}
      schemaService={{ name: "Automação Comercial", description: DESC }}
    />
  ),
});
