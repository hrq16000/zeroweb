import { createFileRoute, redirect } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CarFront,
  CheckCircle2,
  Gift,
  Megaphone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { absUrl, ORIGIN } from "@/lib/seo";

const WHATSAPP_DIGITS = "554198755277";
const whatsappMessage =
  "Olá, Denis! Vi a página da D.Y.Z Promo no site da 0WEB e gostei muito do trabalho de divulgação. Quero solicitar uma proposta para uma ação promocional.\n\nMeu negócio é: \nCidade/bairros da ação: \nTipo de divulgação: \nPeríodo desejado: ";

const services = [
  { icon: CarFront, title: "Semáforo", text: "Abordagem organizada em cruzamentos estratégicos para gerar alcance e lembrança de marca." },
  { icon: Users, title: "Mão a mão", text: "Distribuição direcionada em ruas, comércios, condomínios e pontos de grande circulação." },
  { icon: Store, title: "Cancela", text: "Ações em entradas e saídas de shopping centers, mercados e estacionamentos." },
  { icon: Megaphone, title: "Bandeiras e faixa", text: "Presença visual de alto impacto para inaugurações, ofertas e campanhas locais." },
  { icon: Gift, title: "Entrega de brindes", text: "Sampling e distribuição de brindes que transformam uma abordagem em experiência." },
];

const clients = [
  "Dom Meneguetto", "Interage", "Nutri Linda", "Brotherss", "Pistache", "MP Elétricos",
  "Claro", "Ortobom", "Personale", "Era Uma Vez", "Apolar", "Abaré Pizzaria",
  "Curitibana", "Dinamac", "Não + Pelo", "Frango Americano", "5àSec", "Famigla Merlini",
  "Paraná Banco", "Pé Sapeca", "Celeiro", "Kumon", "Eskimo", "Natura",
  "Casas Bahia", "Ligga Internet", "Ateky Internet", "O Boticário",
];

const areas = [
  "Santa Felicidade", "Ecoville", "Champagnat", "Água Verde", "Centro",
  "Xaxim", "Novo Mundo", "Capão Raso", "Uberaba", "Pinhais",
  "São José dos Pinhais", "Piraquara", "Bairro Alto", "Jardim das Américas",
];

function whatsappUrl() {
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(whatsappMessage)}`;
}

export const Route = createFileRoute("/dyzpromo")({
  beforeLoad: () => {
    throw redirect({ to: "/portfolio/dyzpromo", statusCode: 301, replace: true });
  },
  head: () => {
    const title = "D.Y.Z Promo · Divulgação e panfletagem em Curitiba";
    const description =
      "Divulgação promocional em Curitiba e região: panfletagem, semáforo, mão a mão, cancela, bandeiras, faixas e entrega de brindes.";
    const url = absUrl("/dyzpromo");
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "divulgação Curitiba, panfletagem Curitiba, marketing promocional, ação promocional, entrega de brindes, DYZ Promo" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "D.Y.Z Promo" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${url}#business`,
            name: "D.Y.Z Promo",
            description,
            url,
            telephone: "+55 41 9875-5277",
            taxID: "68.500.745/0001-53",
            areaServed: { "@type": "City", name: "Curitiba" },
            parentOrganization: { "@type": "Organization", name: "0WEB", url: ORIGIN },
            serviceType: "Marketing promocional e divulgação",
          }),
        },
      ],
    };
  },
  component: DyzPromoPage,
});

export function DyzPromoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.28),transparent_35%),radial-gradient(circle_at_90%_10%,hsl(var(--accent)/0.16),transparent_30%)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Megaphone className="h-4 w-4" aria-hidden="true" /> Marketing promocional
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Sua marca na rua, na memória e no próximo cliente.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                A D.Y.Z Promo leva campanhas para onde as pessoas estão: com equipes preparadas, distribuição direcionada e presença que faz sua oferta ser percebida.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 font-bold text-slate-950 shadow-[0_0_35px_hsl(var(--accent)/0.35)] transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  Solicitar proposta <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#servicos" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  Conhecer ações
                </a>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-3">
                {["Equipe em campo", "Ações sob medida", "Curitiba e região"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" aria-hidden="true" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Ações que movimentam</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Divulgação do jeito que sua campanha precisa</h2>
              <p className="mt-4 text-muted-foreground">Do impacto rápido no semáforo à experiência de entregar um brinde: combinamos canais, locais e equipe para cada objetivo.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {services.map(({ icon: Icon, title, text }, index) => (
                <motion.article key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-elegant">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                  <h3 className="mt-5 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/40 px-5 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Operação com cuidado</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Cada ação começa com um bom planejamento</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">A equipe entende o objetivo, escolhe os pontos e executa a campanha com orientação clara para representar bem a sua marca.</p>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 font-semibold text-primary hover:underline">Montar minha ação <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: MapPin, title: "Pontos estratégicos", text: "Bairros e locais alinhados ao público que você quer alcançar." },
                { icon: ShieldCheck, title: "Equipe orientada", text: "Abordagem respeitosa, apresentação padronizada e foco na campanha." },
                { icon: BarChart3, title: "Acompanhamento", text: "Organização para acompanhar a execução e aprender com cada ação." },
                { icon: MessageCircle, title: "Contato direto", text: "Você fala com o Denis pelo WhatsApp, sem burocracia." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-background p-5">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Marcas atendidas</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Experiência em vários segmentos</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Restaurantes, varejo, imóveis, estética, tecnologia, serviços e muito mais.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {clients.map((client) => <span key={client} className="rounded-full border border-border bg-card px-3.5 py-2 text-sm text-foreground/80">{client}</span>)}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-5 py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Cobertura local</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Curitiba e região com presença de verdade</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">Planeje a ação por bairro, cidade ou rota. A D.Y.Z Promo já circula por dezenas de pontos da Grande Curitiba.</p>
              <div className="mt-7 flex flex-wrap gap-2">{areas.map((area) => <span key={area} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{area}</span>)}</div>
            </div>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
              Falar com o Denis <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Vamos colocar sua campanha em movimento?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Envie as informações básicas e receba uma conversa objetiva sobre locais, equipe e formato da ação.</p>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow-primary transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Solicitar orçamento no WhatsApp <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <p className="mt-5 text-xs text-muted-foreground">D.Y.Z Promo · CNPJ 68.500.745/0001-53 · Curitiba/PR</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
