import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TrendingDown, ArrowRight } from "lucide-react";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function LossCalculator() {
  const { open: openFunnel } = useWaFunnel();
  const [visitors, setVisitors] = useState(3000);
  const [ticket, setTicket] = useState(800);
  const [conv, setConv] = useState(1);

  const result = useMemo(() => {
    const currentLeads = visitors * (conv / 100);
    const potentialLeads = visitors * 0.04; // 4% benchmark
    const lostLeads = Math.max(0, potentialLeads - currentLeads);
    const monthly = lostLeads * ticket;
    return { lostLeads: Math.round(lostLeads), monthly, annual: monthly * 12 };
  }, [visitors, ticket, conv]);

  return (
    <section id="calculadora" className="py-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-destructive">
            <TrendingDown className="w-3.5 h-3.5" /> Calculadora de perda
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Quanto sua empresa está <span className="text-gradient">perdendo todos os meses?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Veja em tempo real quanto faturamento escapa por falta de otimização de conversão.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-card p-8 space-y-6">
            {[
              { label: "Visitantes por mês", value: visitors, set: setVisitors, min: 100, max: 100000, step: 100, suffix: "" },
              { label: "Ticket médio (R$)", value: ticket, set: setTicket, min: 50, max: 20000, step: 50, suffix: "" },
              { label: "Taxa de conversão atual (%)", value: conv, set: setConv, min: 0.1, max: 10, step: 0.1, suffix: "%" },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">{f.label}</label>
                  <span className="font-mono font-semibold text-primary">
                    {f.label.includes("Ticket") ? fmt(f.value) : `${f.value}${f.suffix}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={f.value}
                  onChange={(e) => {
                    f.set(Number(e.target.value));
                    trackEvent("calculator_change", { field: f.label });
                  }}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-foreground text-background p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-destructive/20 blur-3xl" />
            <p className="text-xs uppercase tracking-wider text-accent font-semibold relative">
              Receita desperdiçada
            </p>
            <div className="relative mt-6 space-y-5">
              <Metric label="Leads perdidos / mês" value={`${result.lostLeads}`} />
              <Metric label="Faturamento mensal perdido" value={fmt(result.monthly)} highlight />
              <Metric label="Receita anual desperdiçada" value={fmt(result.annual)} />
            </div>
            <button
              type="button"
              onClick={() => {
                trackConversion("contact_cta_click", { location: "calculator", value: result.monthly });
                openFunnel("calculator");
              }}
              className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-foreground font-semibold px-6 py-3.5"
            >
              Recuperar essa receita <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-baseline justify-between border-b border-background/10 pb-3"
    >
      <span className="text-sm text-background/70">{label}</span>
      <span className={`font-display font-bold ${highlight ? "text-3xl text-accent" : "text-xl"}`}>
        {value}
      </span>
    </motion.div>
  );
}
