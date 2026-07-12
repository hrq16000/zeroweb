import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Check, ArrowRight, TrendingUp, Shield, Zap, MessageCircle, Sparkles } from "lucide-react";
import { ORIGIN } from "@/lib/seo";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

export const Route = createFileRoute("/calculadora-orcamento")({
  head: () => ({
    meta: [
      { title: "Calculadora de Orçamento de Marketing Digital | 0web" },
      {
        name: "description",
        content:
          "Descubra em 30 segundos quanto investir em marketing digital para o seu porte e objetivo. A 0web entrega até 40% mais performance pelo mesmo investimento.",
      },
      { property: "og:title", content: "Calculadora de Orçamento de Marketing Digital | 0web" },
      {
        property: "og:description",
        content:
          "Plano personalizado de marketing digital com faixa de investimento, ROI estimado e proposta direta no WhatsApp.",
      },
      { property: "og:url", content: `${ORIGIN}/calculadora-orcamento` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/calculadora-orcamento` }],
  }),
  component: CalculadoraPage,
});

// =====================================================================
// Lógica de preços — viés agressivo (0web entrega +40% performance)
// =====================================================================
type ServiceKey = "seo" | "ads" | "social" | "site" | "full";
type SizeKey = "mei" | "pequena" | "media" | "grande";
type GoalKey = "leads" | "vendas" | "marca" | "local";

const SERVICES: Record<ServiceKey, { label: string; base: [number, number]; desc: string }> = {
  seo: { label: "SEO Orgânico", base: [1800, 4500], desc: "Tráfego perene e autoridade no Google" },
  ads: { label: "Google & Meta Ads", base: [2500, 8000], desc: "Leads e vendas com mídia paga" },
  social: { label: "Gestão de Redes Sociais", base: [1500, 4000], desc: "Conteúdo, design e comunidade" },
  site: { label: "Criação de Site / Landing", base: [3500, 18000], desc: "Site robusto, rápido e que converte" },
  full: { label: "Operação Completa (Full Funnel)", base: [6000, 22000], desc: "SEO + Mídia + Social + Site integrados" },
};

const SIZE_MULT: Record<SizeKey, { label: string; mult: number }> = {
  mei: { label: "MEI / Autônomo", mult: 0.7 },
  pequena: { label: "Pequena empresa (até 20 colab.)", mult: 1.0 },
  media: { label: "Média empresa (20–100 colab.)", mult: 1.6 },
  grande: { label: "Grande empresa (100+ colab.)", mult: 2.4 },
};

const GOALS: Record<GoalKey, { label: string; bonus: number; kpi: string }> = {
  leads: { label: "Gerar mais leads qualificados", bonus: 1.0, kpi: "Custo por Lead (CPL)" },
  vendas: { label: "Aumentar vendas / faturamento", bonus: 1.15, kpi: "ROAS (retorno sobre o investimento)" },
  marca: { label: "Fortalecer marca e autoridade", bonus: 0.9, kpi: "Alcance qualificado e share of voice" },
  local: { label: "Atrair clientes da minha região", bonus: 0.85, kpi: "Ligações, rotas e visitas locais" },
};

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function CalculadoraPage() {
  const { open } = useWaFunnel();
  const [service, setService] = useState<ServiceKey | "">("");
  const [size, setSize] = useState<SizeKey | "">("");
  const [goal, setGoal] = useState<GoalKey | "">("");
  const [step, setStep] = useState<"form" | "result">("form");

  const result = useMemo(() => {
    if (!service || !size || !goal) return null;
    const [lo, hi] = SERVICES[service].base;
    const m = SIZE_MULT[size].mult * GOALS[goal].bonus;
    const min = Math.round((lo * m) / 100) * 100;
    const max = Math.round((hi * m) / 100) * 100;
    // Concorrência praticando 40% acima para a mesma entrega
    const marketMin = Math.round((min * 1.4) / 100) * 100;
    const marketMax = Math.round((max * 1.4) / 100) * 100;
    return {
      min,
      max,
      marketMin,
      marketMax,
      service: SERVICES[service],
      size: SIZE_MULT[size],
      goal: GOALS[goal],
    };
  }, [service, size, goal]);

  const canSubmit = !!service && !!size && !!goal;

  function handleCalcular() {
    if (!canSubmit) return;
    trackEvent("calculator_submit", { service, size, goal });
    setStep("result");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleWhats() {
    if (!result) return;
    trackConversion("contact_cta_click", { location: "calculator_result", value: result.max, service: result.service.label });
    open("calculator_result");
  }

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-5 lg:px-8 py-16 lg:py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Calculator className="w-3.5 h-3.5" /> Calculadora gratuita · 30 segundos
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
            Quanto sua empresa <span className="text-gradient">deveria investir</span> em marketing digital?
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
            Receba em 30 segundos uma faixa de investimento personalizada para o seu porte e objetivo —
            com base em mais de 200 operações reais da 0web.
            <strong className="text-foreground"> Entregamos até 40% mais performance pelo mesmo orçamento</strong> que as
            agências tradicionais cobram.
          </p>

          <ul className="mt-8 grid sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
            {[
              { Icon: TrendingUp, t: "Baseado em dados reais", d: "200+ operações ativas em SEO, Ads e Sites" },
              { Icon: Shield, t: "Sem cadastro obrigatório", d: "Resultado na hora, sem captura de e-mail" },
              { Icon: Zap, t: "Plano personalizado", d: "Faixa de preço + KPIs + próximos passos" },
            ].map(({ Icon, t, d }) => (
              <li key={t} className="flex gap-3 rounded-2xl border border-border bg-card/60 backdrop-blur p-4">
                <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{t}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CALCULADORA */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl"
              >
                <Field
                  label="1. Qual serviço você precisa?"
                  options={Object.entries(SERVICES).map(([k, v]) => ({
                    value: k,
                    label: v.label,
                    hint: v.desc,
                  }))}
                  value={service}
                  onChange={(v) => setService(v as ServiceKey)}
                />
                <Field
                  label="2. Qual o porte da sua empresa?"
                  options={Object.entries(SIZE_MULT).map(([k, v]) => ({ value: k, label: v.label }))}
                  value={size}
                  onChange={(v) => setSize(v as SizeKey)}
                />
                <Field
                  label="3. Qual o seu principal objetivo?"
                  options={Object.entries(GOALS).map(([k, v]) => ({ value: k, label: v.label }))}
                  value={goal}
                  onChange={(v) => setGoal(v as GoalKey)}
                />

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleCalcular}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground font-semibold px-6 py-4 disabled:opacity-50 hover:bg-primary/90 transition"
                >
                  Calcular meu plano <ArrowRight className="w-4 h-4" />
                </button>
                <p className="mt-3 text-xs text-center text-muted-foreground">
                  100% gratuito · sem cadastro · resultado imediato
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {result && (
                  <>
                    <div className="rounded-3xl bg-foreground text-background p-8 sm:p-10 relative overflow-hidden">
                      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
                      <p className="relative inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                        <Sparkles className="w-3.5 h-3.5" /> Seu plano personalizado
                      </p>
                      <h2 className="relative mt-4 text-2xl sm:text-3xl font-display font-bold">
                        {result.service.label} · {result.size.label}
                      </h2>
                      <p className="relative mt-1 text-background/70">Objetivo: {result.goal.label}</p>

                      <div className="relative mt-8 grid sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-background/5 border border-background/10 p-5">
                          <p className="text-xs uppercase tracking-wider text-background/60">Investimento 0web</p>
                          <p className="mt-2 text-3xl sm:text-4xl font-display font-bold text-accent">
                            {fmtBRL(result.min)}
                            <span className="text-lg text-background/60"> a </span>
                            {fmtBRL(result.max)}
                          </p>
                          <p className="text-xs text-background/60 mt-1">/mês · sem fidelidade abusiva</p>
                        </div>
                        <div className="rounded-2xl bg-background/5 border border-background/10 p-5">
                          <p className="text-xs uppercase tracking-wider text-background/60">Mercado tradicional</p>
                          <p className="mt-2 text-2xl font-display font-semibold line-through decoration-destructive/70 text-background/60">
                            {fmtBRL(result.marketMin)} a {fmtBRL(result.marketMax)}
                          </p>
                          <p className="text-xs text-accent mt-1 font-semibold">
                            +40% de performance pelo mesmo investimento
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-8 grid sm:grid-cols-2 gap-3 text-sm">
                        <Bullet>
                          KPI principal: <strong>{result.goal.kpi}</strong>
                        </Bullet>
                        <Bullet>Relatórios quinzenais com dados reais (sem maquiagem)</Bullet>
                        <Bullet>Equipe sênior dedicada — nada de estagiário</Bullet>
                        <Bullet>Setup completo em até 7 dias úteis</Bullet>
                      </div>

                      <button
                        type="button"
                        onClick={handleWhats}
                        className="relative mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-accent text-foreground font-semibold px-7 py-4 hover:brightness-110 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Falar com especialista no WhatsApp
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        ← Refazer cálculo com outros parâmetros
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* VANTAGENS */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center">
            Por que o orçamento da 0web rende mais
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
            Não competimos por preço — competimos por entrega. Veja por que clientes migram de agências
            tradicionais e nunca mais voltam.
          </p>
          <ul className="mt-10 grid md:grid-cols-2 gap-4">
            {[
              "Estrutura enxuta e tecnológica: menos camadas, mais execução na ponta",
              "Time sênior com automações próprias de SEO, mídia e CRO",
              "Dashboards transparentes em tempo real — você vê cada R$ investido",
              "Contratos sem fidelidade abusiva e sem letras miúdas",
              "Foco obsessivo em ROI: tudo que fazemos é medido por receita gerada",
              "Atendimento direto com estrategista — zero telefone sem fim",
            ].map((t) => (
              <li key={t} className="flex gap-3 rounded-2xl border border-border bg-card p-5">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-8">
      <p className="font-semibold mb-3">{label}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`text-left rounded-xl border p-4 transition ${
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 ${
                    active ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                />
                <div>
                  <p className="font-medium text-sm leading-tight">{o.label}</p>
                  {o.hint && <p className="text-xs text-muted-foreground mt-1">{o.hint}</p>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-background/90">
      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
