import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Award, Users, Rocket, Heart, Target, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";

const TITLE = "Sobre a 0WEB · Tecnologia que gera crescimento desde 2006";
const DESC =
  "Conheça a 0WEB: agência de tecnologia e marketing digital com mais de 18 anos de mercado, especializada em sites, sistemas, IA e crescimento previsível.";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://0web.com.br/sobre" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/sobre" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              "@id": "https://0web.com.br/sobre#aboutpage",
              url: "https://0web.com.br/sobre",
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
              mainEntity: {
                "@type": "Organization",
                name: "0WEB",
                foundingDate: "2006",
                taxID: "41.723.708/0001-58",
                url: "https://0web.com.br/",
                logo: "https://0web.com.br/favicon.ico",
                telephone: "+55-41-99745-2053",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Sobre", item: "https://0web.com.br/sobre" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-5xl px-5 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-wider text-primary font-semibold"
          >
            Sobre nós
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-[1.05]"
          >
            Tecnologia que gera <span className="text-gradient">crescimento</span> desde 2006.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground max-w-3xl"
          >
            A 0WEB nasceu para resolver um problema simples: empresas perdem dinheiro todos os dias
            por causa de presença digital fraca. Em mais de 18 anos no mercado, ajudamos centenas de
            negócios — de prestadores locais a operações nacionais — a transformar cliques em clientes
            usando uma combinação de design, performance, automação e inteligência artificial.
          </motion.p>

          <div className="mt-14 grid sm:grid-cols-3 gap-4">
            {[
              { k: "18+", v: "anos atuando com Marketing Digital" },
              { k: "300+", v: "projetos entregues no Brasil" },
              { k: "1M+", v: "leads gerados para nossos clientes" },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <p className="text-4xl font-bold font-display text-gradient">{s.k}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.v}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-24 mx-auto max-w-5xl px-5 lg:px-8">
          <h2 className="text-3xl font-bold font-display">Nossos valores</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { i: <Target className="w-5 h-5" />, t: "Resultado primeiro", d: "Métricas claras de ROI, não vaidade." },
              { i: <Sparkles className="w-5 h-5" />, t: "Design com propósito", d: "Bonito porque converte, não apenas porque é bonito." },
              { i: <Rocket className="w-5 h-5" />, t: "Velocidade", d: "Entregas em sprints curtos, sem promessas vazias." },
              { i: <Heart className="w-5 h-5" />, t: "Parceria longa", d: "Crescemos junto. Não somos fornecedor, somos time." },
              { i: <Award className="w-5 h-5" />, t: "Padrão internacional", d: "Tecnologia, UX e SEO no nível das melhores do mundo." },
              { i: <Users className="w-5 h-5" />, t: "Transparência", d: "Painel aberto, números reais, decisões orientadas a dados." },
            ].map((v) => (
              <div key={v.t} className="rounded-2xl border border-border bg-card p-6 hover:shadow-elegant transition">
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary">{v.i}</div>
                <h3 className="mt-4 font-semibold">{v.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 mx-auto max-w-5xl px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-10 lg:p-14">
            <div className="absolute inset-0 bg-mesh opacity-40" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold font-display">Vamos conversar?</h2>
              <p className="mt-3 text-background/70 max-w-xl">
                Conte seu desafio e devolvemos um diagnóstico em até 24 horas, sem compromisso.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contato"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary"
                >
                  Falar com a 0WEB
                </Link>
                <Link
                  to="/"
                  hash="cases"
                  className="inline-flex items-center gap-2 rounded-full glass-dark text-background font-semibold px-6 py-3 hover:bg-background/10"
                >
                  Ver cases de clientes
                </Link>
              </div>
              <p className="mt-6 text-xs text-background/50">
                0WEB · CNPJ 41.723.708/0001-58 · Atuando com Marketing Digital desde 2006.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
