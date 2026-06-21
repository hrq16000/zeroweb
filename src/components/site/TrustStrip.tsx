import { ShieldCheck, ShieldAlert, Globe2, Activity, Server, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { icon: LucideIcon; title: string; desc: string };

const ITEMS: Item[] = [
  { icon: ShieldCheck, title: "SSL grátis", desc: "Certificado auto-renovado em todos os planos" },
  { icon: ShieldAlert, title: "Anti-DDoS", desc: "Proteção empresarial Cloudflare inclusa" },
  { icon: Globe2, title: "Edge CDN global", desc: "300+ pontos de presença · carrega em milissegundos" },
  { icon: Activity, title: "100% de uptime", desc: "SLA garantido · sem janela de manutenção" },
  { icon: Server, title: "Hospedagem inclusa", desc: "1º ano grátis em todos os sites entregues" },
  { icon: LifeBuoy, title: "Suporte pós-entrega", desc: "3 meses de acompanhamento sem custo" },
];

type Props = {
  variant?: "full" | "compact";
  className?: string;
};

/**
 * Selos de infraestrutura técnica que acompanham toda entrega da 0WEB.
 * - `full`: grid 2/3/6 colunas com ícone + título + descrição (usar em /servicos/* e /solicitar-orcamento)
 * - `compact`: linha horizontal scrollável apenas com ícone + título (usar logo abaixo do Hero)
 */
export function TrustStrip({ variant = "full", className = "" }: Props) {
  if (variant === "compact") {
    return (
      <section
        aria-label="Infraestrutura inclusa em todos os projetos"
        className={`border-y border-border bg-muted/30 ${className}`}
      >
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-4 overflow-x-auto">
          <ul className="flex items-center gap-6 lg:gap-10 whitespace-nowrap text-sm font-medium text-foreground/80 justify-between">
            {ITEMS.map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-2 shrink-0">
                <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                {title}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="trust-strip-title"
      className={`py-14 lg:py-20 bg-muted/30 border-y border-border ${className}`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Infraestrutura inclusa
          </p>
          <h2 id="trust-strip-title" className="mt-2 text-3xl lg:text-4xl font-bold font-display">
            Tudo o que seu site precisa para rodar — já vem incluso.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Você não paga separado por SSL, proteção, CDN ou hospedagem. Toda entrega da 0WEB sobe
            em infraestrutura de nível empresarial, com SLA real e suporte humano.
          </p>
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-elegant transition"
            >
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-4">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
