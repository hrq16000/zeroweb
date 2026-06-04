import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  Globe, Rocket, ShoppingBag, Search, Megaphone, Instagram,
  Bot, Workflow, Server, Cloud, MapPin,
} from "lucide-react";

type Item = {
  icon: typeof Globe;
  title: string;
  desc: string;
  to?: "/google-meu-negocio";
};

const items: Item[] = [
  { icon: MapPin, title: "Google Meu Negócio", desc: "Apareça no Maps e receba clientes todos os dias.", to: "/google-meu-negocio" },
  { icon: Globe, title: "Criação de Sites", desc: "Sites institucionais modernos, rápidos e otimizados." },
  { icon: Rocket, title: "Landing Pages", desc: "Páginas de alta conversão para campanhas." },
  { icon: ShoppingBag, title: "E-commerce", desc: "Lojas virtuais escaláveis e prontas para vender." },
  { icon: Search, title: "SEO Técnico", desc: "Posicionamento orgânico no Google de forma sustentável." },
  { icon: Megaphone, title: "Tráfego Pago", desc: "Google Ads e Meta Ads com foco em ROI." },
  { icon: Instagram, title: "Redes Sociais", desc: "Gestão estratégica e criativa de canais." },
  { icon: Bot, title: "IA para Atendimento", desc: "Chatbots e agentes que vendem 24/7." },
  { icon: Workflow, title: "Automações", desc: "Integrações que economizam horas de trabalho." },
  { icon: Server, title: "Sistemas & SaaS", desc: "Software sob medida para escalar sua operação." },
  { icon: Cloud, title: "Hospedagem Premium", desc: "Infra de alta performance com SLA real." },
];

export function Solutions() {
  return (
    <section id="solucoes" className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Soluções</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Como a <span className="text-gradient">0WEB</span> resolve isso
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Um ecossistema completo de tecnologia, design e marketing — sob o mesmo time.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: (i % 5) * 0.04 }}
              className="group relative rounded-2xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-elegant transition-all duration-300 overflow-hidden"
            >
              {it.to ? (
                <Link to={it.to} className="absolute inset-0 z-10" aria-label={it.title} />
              ) : null}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-2xl transition-opacity" />
              <span className="relative grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">
                <it.icon className="w-5 h-5" />
              </span>
              <h3 className="relative mt-4 font-semibold">{it.title}</h3>
              <p className="relative mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
