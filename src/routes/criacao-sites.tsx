import { createFileRoute } from "@tanstack/react-router";
import { IntentLanding, buildHead } from "@/components/site/IntentLanding";

const URL = "https://0web.com.br/criacao-sites";
const TITLE = "Criação de Sites Profissionais · 0WEB";
const DESC = "Sites rápidos, responsivos e otimizados para conversão. Entregamos seu novo site em até 14 dias.";

export const Route = createFileRoute("/criacao-sites")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: () => (
    <IntentLanding
      slug="criacao-sites"
      intent="criacao-sites"
      offerSlug="avaliacao-site"
      eyebrow="Criação de sites"
      headline="Sites profissionais que vendem todos os dias"
      subheadline="Design moderno, performance máxima e SEO técnico desde o primeiro pixel."
      ctaLabel="Avaliar meu site"
      whatsappMessage="Quero criar um site profissional com a 0WEB."
      benefits={[
        { title: "Entrega em até 14 dias", description: "Time dedicado para acelerar o time-to-market." },
        { title: "Performance 90+", description: "Core Web Vitals dentro do limite Google." },
        { title: "SEO técnico incluso", description: "Schema, sitemap, og tags e canonical configurados." },
        { title: "Conversão por design", description: "CTAs e provas sociais validados em A/B." },
      ]}
      faq={[
        { q: "Quanto tempo leva?", a: "Sites institucionais ficam prontos em 7 a 14 dias úteis." },
        { q: "Vocês fazem manutenção?", a: "Sim, oferecemos planos mensais de manutenção e evolução." },
        { q: "Eu sou dono do código?", a: "Sim. Você recebe acesso completo após o pagamento final." },
      ]}
      socialProof={[
        { name: "Bruno", role: "Mestre dos Serviços", quote: "Aumentamos 3x as solicitações depois do novo site." },
        { name: "Carla", role: "Autoescola Curitiba", quote: "Site rápido e ranqueando no Google em 30 dias." },
        { name: "Diego", role: "Empório Saudável", quote: "Vendas online cresceram 60% no primeiro mês." },
      ]}
      schemaService={{ name: "Criação de Sites", description: DESC }}
    />
  ),
});
