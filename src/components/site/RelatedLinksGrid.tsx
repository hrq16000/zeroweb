import { Link } from "@tanstack/react-router";
import { ArrowRight, Megaphone, Globe, Search, Bot, Layers, Award, HelpCircle, MessageCircle } from "lucide-react";

type Item = {
  to: string;
  title: string;
  desc: string;
  anchor: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ALL: Item[] = [
  { to: "/trafego-pago-local", title: "Tráfego pago para negócios locais", desc: "Anúncios no Google e Meta a partir de R$499/mês, sem contrato.", anchor: "Ver tráfego pago local", icon: Megaphone },
  { to: "/servicos/criacao-de-sites", title: "Criação de sites profissionais", desc: "Sites rápidos, otimizados para SEO e prontos para converter.", anchor: "Criar meu site agora", icon: Globe },
  { to: "/servicos/seo", title: "SEO e primeiras posições no Google", desc: "Plano de SEO local e nacional com foco em ROI mensurável.", anchor: "Quero rankear no Google", icon: Search },
  { to: "/servicos/automacao-com-ia", title: "Automação e IA no WhatsApp", desc: "Atendimento, qualificação de leads e fluxos com IA no WhatsApp.", anchor: "Automatizar meu atendimento", icon: Bot },
  { to: "/planos", title: "Planos e preços", desc: "Compare os planos da 0WEB e escolha o ideal para o seu momento.", anchor: "Ver planos completos", icon: Layers },
  { to: "/cases", title: "Cases de sucesso", desc: "Histórias reais de empresas que cresceram com a 0WEB.", anchor: "Ver cases reais", icon: Award },
  { to: "/faq", title: "Perguntas frequentes", desc: "Tire dúvidas sobre prazos, valores, contratos e suporte.", anchor: "Tirar minhas dúvidas", icon: HelpCircle },
  { to: "/contato", title: "Falar com a 0WEB", desc: "Diagnóstico gratuito em até 24h. Sem compromisso.", anchor: "Falar agora", icon: MessageCircle },
];

type Props = {
  title?: string;
  subtitle?: string;
  /** Restringe a subset; default = todos. */
  only?: string[];
  className?: string;
};

export function RelatedLinksGrid({
  title = "Veja também na 0WEB",
  subtitle = "Páginas e conteúdos que aceleram o seu crescimento digital.",
  only,
  className,
}: Props) {
  const items = only ? ALL.filter((i) => only.includes(i.to)) : ALL;
  return (
    <section className={className ?? "py-14"} aria-label={title}>
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <h2 className="font-display text-2xl lg:text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              preload="render"
              className="group block rounded-2xl border border-border bg-card p-5 hover:border-primary transition-colors"
            >
              <div className="w-10 h-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
                <i.icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 font-semibold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{i.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {i.anchor} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
