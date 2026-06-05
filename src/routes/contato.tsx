import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { MessageCircle, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { trackConversion } from "@/lib/analytics";
import { persistLead } from "@/lib/persistence";
import { whatsappUrl } from "@/lib/site-config";

const TITLE = "Contato 0WEB · Fale com a gente · WhatsApp, e-mail e formulário";
const DESC = "Fale com a 0WEB pelo WhatsApp (41) 9 9745-2053, por e-mail ou pelo formulário. Diagnóstico gratuito em até 24h.";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://0web.com.br/contato" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/contato" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ContactPage",
              "@id": "https://0web.com.br/contato#contactpage",
              url: "https://0web.com.br/contato",
              name: TITLE,
              description: DESC,
              inLanguage: "pt-BR",
              mainEntity: {
                "@type": "Organization",
                name: "0WEB",
                telephone: "+55-41-99745-2053",
                email: "contato@0web.com.br",
                url: "https://0web.com.br/",
                contactPoint: [{
                  "@type": "ContactPoint",
                  telephone: "+55-41-99745-2053",
                  contactType: "sales",
                  areaServed: "BR",
                  availableLanguage: ["pt-BR"],
                }],
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: "https://0web.com.br/" },
                { "@type": "ListItem", position: 2, name: "Contato", item: "https://0web.com.br/contato" },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-24">
        <section className="mx-auto max-w-6xl px-5 lg:px-8">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-wider text-primary font-semibold">
            Contato
          </motion.p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold font-display">Vamos colocar sua empresa para crescer?</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Escolha o canal que preferir. Respondemos em até 1 hora útil.
          </p>

          <div className="mt-12 grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[
                {
                  i: <MessageCircle className="w-5 h-5 text-emerald-500" />,
                  t: "WhatsApp",
                  v: "(41) 9 9745-2053",
                  href: whatsappUrl(undefined, "contato_page"),
                  external: true,
                  cta: "Abrir conversa",
                },
                {
                  i: <Mail className="w-5 h-5 text-primary" />,
                  t: "E-mail",
                  v: "contato@0web.com.br",
                  href: "mailto:contato@0web.com.br",
                  cta: "Enviar e-mail",
                },
                {
                  i: <MapPin className="w-5 h-5 text-accent" />,
                  t: "Onde estamos",
                  v: "Curitiba/PR · Atendimento em todo o Brasil",
                  href: null,
                  cta: null,
                },
                {
                  i: <Clock className="w-5 h-5 text-violet-500" />,
                  t: "Horário",
                  v: "Seg–Sex · 09h às 19h",
                  href: null,
                  cta: null,
                },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4">
                  <div className="grid place-items-center w-10 h-10 rounded-xl bg-muted">{c.i}</div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{c.t}</p>
                    <p className="font-semibold">{c.v}</p>
                  </div>
                  {c.href && (
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noopener noreferrer" : undefined}
                      onClick={() => c.external && trackConversion("whatsapp_click", { location: "contato_page" })}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {c.cta} <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                trackConversion("form_submit", { form_name: "contato", page: "/contato" });
                void persistLead({
                  name: String(data.get("name") || ""),
                  email: String(data.get("email") || ""),
                  phone: String(data.get("phone") || ""),
                  source: "contato_form",
                  payload: {
                    company: String(data.get("company") || ""),
                    message: String(data.get("message") || ""),
                  },
                });
                window.open(
                  whatsappUrl(
                    `Olá! Sou ${data.get("name")} (${data.get("company") || "—"}). Mensagem: ${data.get("message")}`,
                    "contato_form",
                  ),
                  "_blank",
                );
                setSent(true);
              }}
              className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-3"
            >
              <h2 className="text-xl font-bold font-display">Envie sua mensagem</h2>
              <label htmlFor="contato-name" className="sr-only">Seu nome</label>
              <input id="contato-name" name="name" required placeholder="Seu nome" aria-label="Seu nome" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <label htmlFor="contato-company" className="sr-only">Empresa (opcional)</label>
              <input id="contato-company" name="company" placeholder="Empresa (opcional)" aria-label="Empresa" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <label htmlFor="contato-email" className="sr-only">E-mail</label>
              <input id="contato-email" name="email" type="email" required placeholder="E-mail" aria-label="E-mail" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <label htmlFor="contato-phone" className="sr-only">WhatsApp</label>
              <input id="contato-phone" name="phone" placeholder="WhatsApp" aria-label="WhatsApp" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <label htmlFor="contato-message" className="sr-only">Mensagem</label>
              <textarea id="contato-message" name="message" required rows={4} placeholder="Conte rapidamente seu projeto" aria-label="Mensagem" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3 shadow-glow-primary">
                Enviar mensagem <ArrowRight className="w-4 h-4" />
              </button>
              {sent && <p className="text-xs text-emerald-600 text-center">✓ Recebemos! Vamos responder em até 1 hora útil.</p>}
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
