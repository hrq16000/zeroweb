// Simulador simples — recomenda plano de Gestão de Redes Sociais
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, Target, Hash, Users } from "lucide-react";
import { whatsappUrl } from "@/lib/site-config";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";

type Plan = "Essencial" | "Profissional" | "Avançado" | "Premium";

const PRICES: Record<Plan, string> = {
  Essencial: "R$149,99/mês",
  Profissional: "R$349,90/mês",
  Avançado: "R$699,90/mês",
  Premium: "R$1.290/mês",
};

const NICHOS = [
  "Alimentação / Restaurante",
  "Estética / Beleza",
  "Clínica / Saúde",
  "Advocacia / Contabilidade",
  "Imobiliária / Construção",
  "E-commerce / Loja",
  "Educação / Cursos",
  "Serviços locais (autoescola, oficina, etc.)",
  "Outro",
];

type Objetivo = "alcance" | "engajamento" | "vendas" | "autoridade";

const OBJETIVOS: { id: Objetivo; t: string; d: string }[] = [
  { id: "alcance", t: "Alcance", d: "Ser visto por mais pessoas" },
  { id: "engajamento", t: "Engajamento", d: "Mais curtidas, comentários e DMs" },
  { id: "vendas", t: "Vendas", d: "Gerar pedidos e contatos comerciais" },
  { id: "autoridade", t: "Autoridade", d: "Ser referência no segmento" },
];

function recomenda(canais: number, objetivo: Objetivo): { plano: Plan; razao: string } {
  if (canais >= 4 || objetivo === "vendas") {
    return {
      plano: "Premium",
      razao:
        "Você precisa de presença forte em todos os canais, com tráfego pago e operação completa para gerar vendas reais.",
    };
  }
  if (canais === 3 || objetivo === "autoridade") {
    return {
      plano: "Avançado",
      razao:
        "Para construir autoridade ou ocupar 3 canais com consistência você precisa de produção robusta de Reels e gestão ativa de comunidade.",
    };
  }
  if (canais === 2 || objetivo === "engajamento") {
    return {
      plano: "Profissional",
      razao:
        "Volume ideal para Instagram + Facebook com Reels mensais, copy estratégico e resposta a DMs — onde a maioria das marcas decola.",
    };
  }
  return {
    plano: "Essencial",
    razao:
      "Começo enxuto e consistente: 1 canal bem cuidado entrega presença e prova social sem estourar o orçamento.",
  };
}

export function RedesSimulator() {
  const [nicho, setNicho] = useState(NICHOS[0]);
  const [canais, setCanais] = useState(2);
  const [objetivo, setObjetivo] = useState<Objetivo>("engajamento");
  const [calculou, setCalculou] = useState(false);

  const resultado = useMemo(() => recomenda(canais, objetivo), [canais, objetivo]);

  const handleSubmit = () => {
    setCalculou(true);
    trackEvent("simulador_redes", { nicho, canais, objetivo, plano: resultado.plano });
  };

  const waLink = whatsappUrl(
    `Olá! Usei o simulador da 0WEB. Nicho: ${nicho}. Canais: ${canais}. Objetivo: ${objetivo}. Plano recomendado: ${resultado.plano}. Quero um diagnóstico.`,
    "redes_simulator",
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-6 lg:p-10 shadow-elegant">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Descubra seu plano em 30 segundos
          </p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-bold">
            Qual plano faz <span className="text-gradient">mais sentido</span> pra você?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Responda 3 perguntas e mostramos a recomendação na hora.
          </p>

          <div className="mt-6 space-y-5">
            {/* Nicho */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" /> Seu nicho
              </label>
              <select
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                {NICHOS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Canais */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Quantas redes quer ativar</span>
                <span className="text-primary font-bold text-base">{canais}</span>
              </label>
              <input
                type="range"
                min={1}
                max={4}
                step={1}
                value={canais}
                onChange={(e) => setCanais(Number(e.target.value))}
                className="mt-3 w-full accent-fuchsia-500"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>1 rede</span><span>2</span><span>3</span><span>4 redes</span>
              </div>
            </div>

            {/* Objetivo */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Principal objetivo
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {OBJETIVOS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setObjetivo(o.id)}
                    className={[
                      "rounded-xl border p-3 text-left transition",
                      objetivo === o.id
                        ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/30 ring-2 ring-fuchsia-400"
                        : "border-border hover:border-fuchsia-300",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold">{o.t}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{o.d}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold py-3.5 hover:scale-[1.02] transition shadow-glow-primary"
            >
              Ver plano recomendado
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div
          className={[
            "rounded-2xl p-6 lg:p-8 transition",
            calculou
              ? "bg-gradient-to-br from-slate-950 to-fuchsia-950 text-white ring-2 ring-fuchsia-400"
              : "bg-muted/30 border border-dashed border-border",
          ].join(" ")}
        >
          {!calculou ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">Responda ao lado para ver seu plano ideal aqui.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">
                Recomendado para o seu caso
              </p>
              <h4 className="mt-2 text-3xl font-display font-black">Plano {resultado.plano}</h4>
              <p className="mt-1 text-xl font-bold text-fuchsia-300">{PRICES[resultado.plano]}</p>
              <p className="mt-4 text-sm text-white/85 leading-relaxed">{resultado.razao}</p>

              <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-white/70 space-y-1">
                <p><strong className="text-white">Nicho:</strong> {nicho}</p>
                <p><strong className="text-white">Canais:</strong> {canais}</p>
                <p><strong className="text-white">Objetivo:</strong> {OBJETIVOS.find((o) => o.id === objetivo)?.t}</p>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("redes_simulator_cta", { plano: resultado.plano })}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-fuchsia-400 text-slate-900 font-bold px-5 py-3 hover:scale-[1.02] transition"
              >
                Quero um diagnóstico grátis <ArrowRight className="w-4 h-4" />
              </a>
              <p className="mt-3 text-center text-[11px] text-white/60">
                Sem compromisso · Resposta em até 1h em horário comercial
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
