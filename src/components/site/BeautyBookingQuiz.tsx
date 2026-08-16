import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Sparkles, X } from "lucide-react";
import { trackConversion, trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { persistWaFunnelConversion, persistWaFunnelOpen, persistWaFunnelStep } from "@/lib/persistence";

type Theme = "pink" | "gold";
type Answers = { service: string; experience: string; period: string; timing: string; note: string };

type Props = {
  studioName: string;
  theme: Theme;
  service?: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
};

const SERVICES = [
  "Cílios — Volume Egípcio ou Brasileiro",
  "Alongamento de unhas",
  "Sobrancelhas e henna",
  "Spa dos pés / autocuidado",
  "Quero uma orientação para escolher",
];
const EXPERIENCE = [
  "É minha primeira aplicação",
  "Quero fazer manutenção",
  "Já faço, mas quero trocar de profissional",
  "Quero tirar algumas dúvidas antes",
];
const PERIODS = ["Manhã", "Tarde", "Noite", "Tenho flexibilidade"];
const TIMINGS = ["Hoje ou amanhã", "Ainda nesta semana", "Na próxima semana", "Quero a primeira vaga disponível"];

function whatsappMessage(studioName: string, answers: Answers) {
  const lines = [
    "🌷 *PEDIDO DE AGENDAMENTO*",
    "",
    "Olá, Renata! Tudo bem?",
    "",
    "Vi a página do *" + studioName + "* no portal *0WEB.com.br* e achei a sua página fantástica! ✨",
    "Quero agendar um horário e já deixei os detalhes abaixo para facilitar o seu atendimento:",
    "",
    "*PREFERÊNCIAS DO ATENDIMENTO*",
    "• *Procedimento:* " + (answers.service || "Quero orientação para escolher"),
    "• *Momento:* " + (answers.experience || "Quero conversar antes de decidir"),
    "• *Melhor período:* " + (answers.period || "Tenho flexibilidade"),
    "• *Quando gostaria:* " + (answers.timing || "Quero a primeira vaga disponível"),
  ];

  if (answers.note.trim()) lines.push("", "*OBSERVAÇÃO*", answers.note.trim());

  lines.push(
    "",
    "*PRÓXIMO PASSO*",
    "Pode me enviar as próximas vagas disponíveis e confirmar o tempo estimado do atendimento, por favor?",
    "",
    "Obrigada! 💖",
  );
  return lines.join("\n");
}

export function BeautyBookingQuiz({
  studioName,
  theme,
  service,
  className,
  ariaLabel,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ service: service ?? "", experience: "", period: "", timing: "", note: "" });
  const dialogRef = useRef<HTMLDivElement>(null);
  const gold = theme === "gold";
  const accent = gold ? "#D4AF37" : "#f472b6";
  const accentText = gold ? "text-[#D4AF37]" : "text-pink-300";
  const optionClass = gold
    ? "border-[#D4AF37]/35 bg-[#D4AF37]/10 hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/20"
    : "border-pink-400/35 bg-pink-500/10 hover:border-pink-300/80 hover:bg-pink-500/20";
  const primaryClass = gold ? "bg-[#D4AF37] text-black hover:bg-[#ecd080]" : "bg-pink-500 text-white hover:bg-pink-400";
  const services = Array.from(new Set(service ? [service, ...SERVICES] : SERVICES));

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const funnelContext = { location: "beauty_booking_quiz", studio_name: studioName, page_type: "portfolio_demo" };

  const start = () => {
    setAnswers({ service: service ?? "", experience: "", period: "", timing: "", note: "" });
    setStep(0);
    setOpen(true);
    trackConversion("wa_funnel_open", funnelContext);
    void persistWaFunnelOpen(5);
  };

  const choose = (field: keyof Omit<Answers, "note">, value: string) => {
    setAnswers((current) => {
      const next = { ...current, [field]: value };
      const stepIndex = step + 1;
      trackEvent("wa_funnel_step", { ...funnelContext, step_id: field, step_index: stepIndex });
      void persistWaFunnelStep(stepIndex, next);
      return next;
    });
    setStep((current) => current + 1);
  };

  const showMessage = () => {
    const nextStep = 5;
    trackEvent("wa_funnel_step", { ...funnelContext, step_id: "note", step_index: nextStep });
    void persistWaFunnelStep(nextStep, answers);
    setStep(nextStep);
  };

  const completeInWhatsApp = () => {
    const conversion = { ...funnelContext, steps: 5, service: answers.service || "orientacao" };
    trackConversion("wa_funnel_complete", conversion);
    trackWhatsAppClick("beauty_booking_quiz_complete", conversion);
    void persistWaFunnelConversion({ ...answers, studio: studioName, source: "portfolio_demo" });
  };

  const question = step === 0
    ? { label: "1 de 5", title: "Qual atendimento você quer agendar?", subtitle: "Assim já preparamos a melhor orientação para você.", field: "service" as const, options: services }
    : step === 1
      ? { label: "2 de 5", title: "Você já conhece esse procedimento?", subtitle: "Isso ajuda a profissional a entender o seu momento.", field: "experience" as const, options: EXPERIENCE }
      : step === 2
        ? { label: "3 de 5", title: "Qual período costuma ser melhor para você?", subtitle: "Vamos tentar encontrar a vaga mais confortável.", field: "period" as const, options: PERIODS }
        : step === 3
          ? { label: "4 de 5", title: "Quando você gostaria de vir?", subtitle: "Escolha a opção mais próxima da sua necessidade.", field: "timing" as const, options: TIMINGS }
          : null;
  const url = "https://wa.me/554196048639?text=" + encodeURIComponent(whatsappMessage(studioName, answers));

  return (
    <>
      <button type="button" onClick={start} className={className} aria-label={ariaLabel}>
        {children}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="beauty-booking-quiz-title" tabIndex={-1} className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#160d13] text-white shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: accent + "22", color: accent }}>
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className={"text-xs font-bold uppercase tracking-[0.18em] " + accentText}>Agendamento inteligente</p>
                  <p className="text-sm text-gray-300">Leva menos de um minuto</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white" aria-label="Fechar mini questionário">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-8">
              {step < 4 && question ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className={"text-xs font-bold uppercase tracking-[0.2em] " + accentText}>{question.label}</p>
                    <h2 id="beauty-booking-quiz-title" className="text-2xl font-serif font-bold">{question.title}</h2>
                    <p className="text-sm leading-relaxed text-gray-400">{question.subtitle}</p>
                  </div>
                  <div className="grid gap-2.5">
                    {question.options.map((option) => (
                      <button key={option} type="button" onClick={() => choose(question.field, option)} className={"w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition " + optionClass}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === 4 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className={"text-xs font-bold uppercase tracking-[0.2em] " + accentText}>5 de 5</p>
                    <h2 id="beauty-booking-quiz-title" className="text-2xl font-serif font-bold">Quer acrescentar algum detalhe?</h2>
                    <p className="text-sm leading-relaxed text-gray-400">É opcional. Você pode contar se tem preferência de estilo, horário ou alguma dúvida.</p>
                  </div>
                  <textarea value={answers.note} onChange={(event) => setAnswers((current) => ({ ...current, note: event.target.value.slice(0, 280) }))} maxLength={280} rows={4} placeholder="Ex.: gosto de um efeito mais natural e consigo depois das 18h." className="w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-white/40" />
                  <button type="button" onClick={showMessage} className={"inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition " + primaryClass}>
                    Ver minha mensagem pronta <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className={"inline-flex h-11 w-11 items-center justify-center rounded-2xl " + optionClass + " " + accentText}><CheckCircle2 className="h-6 w-6" aria-hidden="true" /></span>
                    <h2 id="beauty-booking-quiz-title" className="text-2xl font-serif font-bold">Prontinho — sua mensagem está personalizada</h2>
                    <p className="text-sm leading-relaxed text-gray-400">A Renata receberá seus dados organizados e já poderá indicar a melhor vaga para você.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-gray-300">
                    <p className="font-bold text-white">{answers.service}</p>
                    <p className="mt-1">{answers.experience} · {answers.period} · {answers.timing}</p>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer" onClick={completeInWhatsApp} className={"inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold transition " + primaryClass}>
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Enviar pedido pelo WhatsApp
                  </a>
                  <button type="button" onClick={() => setStep(4)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-gray-400 transition hover:text-white">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Ajustar observação
                  </button>
                </div>
              )}
            </div>
            <div className="h-1 bg-white/10" aria-hidden="true"><div className="h-full transition-all duration-300" style={{ width: Math.min(step + 1, 5) / 5 * 100 + "%", backgroundColor: accent }} /></div>
          </div>
        </div>
      ) : null}
    </>
  );
}
