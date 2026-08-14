import { Search, FileText, Code2, Rocket, LifeBuoy } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Entendimento do projeto",
    body: "Mapeamos objetivo, público e concorrência antes de escrever uma linha de código. Sem diagnóstico não existe resultado previsível.",
  },
  {
    icon: FileText,
    title: "Proposta clara e objetiva",
    body: "Escopo, prazo e valor fechados por escrito. Você sabe exatamente o que recebe — sem surpresa na fatura.",
  },
  {
    icon: Code2,
    title: "Execução organizada",
    body: "Entregas por blocos, com acompanhamento e ajustes durante o processo. Nada de projeto que some por semanas.",
  },
  {
    icon: Rocket,
    title: "Entrega técnica completa",
    body: "Performance, SEO técnico, dados estruturados e rastreamento de conversão configurados antes de ir ao ar.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte pós-entrega",
    body: "Acompanhamento após a publicação, correções e evolução contínua com base nos dados reais de tráfego.",
  },
];

/**
 * Bloco de prova de método (quebra de objeção "como funciona?").
 * Reutilizável em LPs de serviço e hubs de categoria.
 */
export function WorkProcess({ className = "" }: { className?: string }) {
  return (
    <section className={`py-16 ${className}`} aria-labelledby="processo-trabalho">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Como trabalhamos</p>
        <h2 id="processo-trabalho" className="mt-3 text-2xl lg:text-3xl font-bold">
          Processo de trabalho em 5 etapas
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Método transparente do primeiro contato ao suporte, para você saber exatamente o que
          acontece em cada fase do projeto.
        </p>

        <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <s.icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
