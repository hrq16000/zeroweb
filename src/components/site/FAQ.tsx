import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "Quanto tempo leva para criar meu site?", a: "Sites institucionais ficam prontos entre 10 e 25 dias, dependendo do escopo. Landing pages podem sair em até 7 dias." },
  { q: "O site é responsivo para celular?", a: "Sim. Todos os nossos projetos seguem abordagem Mobile First e são testados em múltiplos dispositivos." },
  { q: "Vocês fazem SEO?", a: "Sim. Aplicamos SEO técnico desde a estrutura do código, schemas, Core Web Vitals e estratégia de conteúdo." },
  { q: "Posso editar o site depois?", a: "Sim. Entregamos painéis amigáveis e treinamento — ou mantemos a gestão para você." },
  { q: "A hospedagem está inclusa?", a: "Nos planos Start e Pro a hospedagem premium está inclusa. No Enterprise, dimensionamos sob demanda." },
  { q: "Como funciona a IA para WhatsApp?", a: "Implantamos um agente treinado no seu negócio, integrado ao WhatsApp Business API, com qualificação e agendamento." },
  { q: "Vocês criam e-commerce?", a: "Sim. Desenvolvemos lojas com Shopify, WooCommerce ou stack headless sob medida." },
  { q: "Vocês cuidam de tráfego pago?", a: "Sim. Operamos Google Ads, Meta Ads e LinkedIn Ads com foco em ROI mensurável." },
  { q: "Existe fidelidade nos contratos?", a: "Não existe fidelidade abusiva. Trabalhamos por entregáveis claros e ciclos curtos." },
  { q: "Vocês desenvolvem sistemas e SaaS?", a: "Sim. Construímos sistemas web e SaaS sob medida com Next.js, React e TypeScript." },
  { q: "Como funciona o suporte?", a: "Suporte humanizado por WhatsApp, e-mail e chamados, com SLAs por plano." },
  { q: "Vocês atendem fora do estado?", a: "Sim. Atendemos todo o Brasil de forma 100% remota, com reuniões online." },
  { q: "É possível migrar meu site atual?", a: "Sim. Fazemos migração com plano de redirects 301 para preservar seu SEO." },
  { q: "Vocês emitem nota fiscal?", a: "Sim. Emitimos NF-e para todos os contratos." },
  { q: "Como começo um projeto?", a: "Solicite um diagnóstico gratuito. Em até 24h apresentamos um plano sob medida." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Perguntas <span className="text-gradient">frequentes.</span>
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left p-5 hover:bg-muted/50 transition"
                >
                  <span className="font-semibold">{f.q}</span>
                  <Plus
                    className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "rotate-45 text-primary" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const faqData = faqs;
