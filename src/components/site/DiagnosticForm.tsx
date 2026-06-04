import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

const checks = [
  { key: "site", label: "Possui site profissional?", weight: 25 },
  { key: "gmb", label: "Possui Google Meu Negócio otimizado?", weight: 15 },
  { key: "ads", label: "Faz anúncios pagos (Google/Meta)?", weight: 20 },
  { key: "seo", label: "Investe em SEO técnico?", weight: 20 },
  { key: "auto", label: "Possui automação / IA no atendimento?", weight: 20 },
] as const;

type Key = (typeof checks)[number]["key"];

export function DiagnosticForm() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState({ name: "", company: "", whatsapp: "", email: "", site: "" });
  const { open: openFunnel } = useWaFunnel();
  const [answers, setAnswers] = useState<Record<Key, boolean>>({
    site: false, gmb: false, ads: false, seo: false, auto: false,
  });

  const score = checks.reduce((acc, c) => acc + (answers[c.key] ? c.weight : 0), 0);
  const seo = answers.seo ? 80 : 25;
  const perf = answers.site ? 70 : 30;
  const presence = (answers.site ? 30 : 0) + (answers.gmb ? 35 : 0) + (answers.ads ? 35 : 0);
  const automation = answers.auto ? 85 : 10;

  return (
    <section id="diagnostico" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="w-3.5 h-3.5" /> Diagnóstico Digital Gratuito
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Descubra em minutos o que está <span className="text-gradient">impedindo sua empresa de crescer</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Responda 5 perguntas e receba um score completo de presença digital com plano de ação.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card shadow-elegant overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold">
            {["Dados", "Checklist", "Resultado"].map((s, i) => (
              <div
                key={s}
                className={`px-4 py-3 text-center border-b-2 transition ${
                  step === i ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {i + 1}. {s}
              </div>
            ))}
          </div>

          <div className="p-6 lg:p-10">
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "name", label: "Nome", req: true },
                  { name: "company", label: "Empresa", req: true },
                  { name: "whatsapp", label: "WhatsApp", req: true },
                  { name: "email", label: "E-mail", req: true, type: "email" },
                  { name: "site", label: "Site atual (opcional)", req: false, full: true },
                ].map((f) => (
                  <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {f.label}
                    </label>
                    <input
                      type={f.type || "text"}
                      required={f.req}
                      value={(form as Record<string, string>)[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.name || !form.company || !form.whatsapp || !form.email) return;
                      trackEvent("diagnostic_step", { step: "checklist" });
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                {checks.map((c) => (
                  <label
                    key={c.key}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition"
                  >
                    <span className="text-sm font-medium">{c.label}</span>
                    <input
                      type="checkbox"
                      checked={answers[c.key]}
                      onChange={(e) => setAnswers({ ...answers, [c.key]: e.target.checked })}
                      className="w-5 h-5 accent-primary"
                    />
                  </label>
                ))}
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground">
                    ← Voltar
                  </button>
                  <button
                    onClick={() => {
                      trackConversion("diagnostic_complete", { score, ...answers });
                      setStep(2);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
                  >
                    Ver resultado <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-semibold">Seu diagnóstico</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-6xl font-bold font-display text-gradient">{score}</span>
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">
                    {score < 40
                      ? "Sua empresa está perdendo muitas oportunidades. Vamos corrigir isso."
                      : score < 70
                        ? "Bom começo, mas há grandes ganhos possíveis em conversão e SEO."
                        : "Excelente base — podemos escalar com IA e automação."}
                  </p>
                  <a
                    href={whatsappUrl(
                      `Olá! Sou ${form.name} (${form.company}). Fiz o diagnóstico no site e meu score foi ${score}/100. Quero o plano completo.`,
                      "diagnostico_form",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackConversion("whatsapp_click", { location: "diagnostic_result", score })}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary"
                  >
                    Solicitar Diagnóstico Completo <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "SEO", value: seo },
                    { label: "Performance", value: perf },
                    { label: "Presença Digital", value: presence },
                    { label: "Automação", value: automation },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{m.label}</span>
                        <span className="font-mono text-muted-foreground">{m.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-gradient-primary"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Resultado gerado com base em 5 dimensões críticas
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
