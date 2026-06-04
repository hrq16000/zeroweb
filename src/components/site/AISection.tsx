import { motion } from "motion/react";
import { Bot, MessageSquare, Calendar, UserCheck, Headphones, BrainCircuit } from "lucide-react";

const features = [
  { icon: Bot, title: "Chatbots Inteligentes", desc: "Respostas instantâneas com tom de voz da sua marca." },
  { icon: MessageSquare, title: "IA para WhatsApp", desc: "Vendas e suporte direto no canal preferido do cliente." },
  { icon: Calendar, title: "Agendamento Automático", desc: "Agenda integrada que confirma e lembra sozinha." },
  { icon: UserCheck, title: "Qualificação de Leads", desc: "Triagem inteligente que entrega apenas os quentes." },
  { icon: Headphones, title: "Suporte Automatizado", desc: "Atende, resolve e escala quando precisa de humano." },
  { icon: BrainCircuit, title: "Agentes Customizados", desc: "Construídos para o seu fluxo, sua base, seu produto." },
];

export function AISection() {
  return (
    <section id="ia" className="py-24 bg-foreground text-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-mesh" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Inteligência Artificial</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Sua empresa trabalhando <span className="text-accent">24 horas por dia.</span>
          </h2>
          <p className="mt-5 text-background/70 text-lg leading-relaxed">
            Implantamos agentes de IA, chatbots e automações que atendem, qualificam, agendam e
            vendem — enquanto sua equipe foca no que realmente importa.
          </p>

          <div className="mt-8 glass-dark rounded-2xl p-5">
            <div className="flex items-center gap-2 text-xs text-background/60 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Agente 0WEB · online
            </div>
            <div className="space-y-2 text-sm">
              <div className="rounded-xl bg-background/10 px-3 py-2 max-w-[80%]">
                Olá! Sou o assistente da 0WEB. Em qual solução posso te ajudar hoje?
              </div>
              <div className="rounded-xl bg-gradient-primary text-primary-foreground px-3 py-2 max-w-[80%] ml-auto">
                Quero um chatbot para meu WhatsApp.
              </div>
              <div className="rounded-xl bg-background/10 px-3 py-2 max-w-[85%]">
                Perfeito. Posso agendar um diagnóstico gratuito agora — qual horário funciona melhor?
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-dark rounded-2xl p-5 hover:bg-background/10 transition"
            >
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent/20 text-accent">
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-background/70">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
