import { Instagram, Linkedin, Youtube, Mail, MessageCircle } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { whatsappUrl } from "@/lib/site-config";

const cols = [
  {
    title: "Soluções",
    links: ["Criação de Sites", "Landing Pages", "E-commerce", "SEO", "Tráfego Pago", "Redes Sociais"],
  },
  {
    title: "Tecnologia",
    links: ["IA & Chatbots", "Automações", "Sistemas Web", "SaaS sob medida", "Hospedagem", "Integrações"],
  },
  {
    title: "Empresa",
    links: ["Sobre", "Cases", "Blog", "Carreiras", "Contato", "Suporte"],
  },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 font-display font-bold text-2xl">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">0</span>
              <span>0<span className="text-gradient">WEB</span></span>
            </div>
            <p className="mt-4 text-background/70 max-w-sm leading-relaxed">
              Tecnologia que gera crescimento. Sites, sistemas, IA e marketing digital
              para empresas que querem liderar.
            </p>

            <div className="mt-6 space-y-2 text-sm text-background/80">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_click", { location: "footer" })}
                className="flex items-center gap-2 hover:text-accent"
              >
                <MessageCircle className="w-4 h-4 text-accent" />
                <span>WhatsApp · (41) 9 9745-2053</span>
              </a>
              <a href="mailto:contato@0web.com.br" className="flex items-center gap-2 hover:text-accent">
                <Mail className="w-4 h-4 text-accent" />
                <span>contato@0web.com.br</span>
              </a>
            </div>

            <div className="mt-6 flex gap-3">
              {[Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="grid place-items-center w-10 h-10 rounded-full glass-dark hover:bg-background/10 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2 sm:col-span-1">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">{c.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-background/80 hover:text-accent transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-background/10 flex flex-wrap items-center justify-between gap-4 text-xs text-background/60">
          <p>© {new Date().getFullYear()} 0WEB · Tecnologia que gera crescimento.</p>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="hover:text-accent">Política de Privacidade</a>
            <a href="#" className="hover:text-accent">Termos de Uso</a>
            <a href="/sitemap.xml" className="hover:text-accent">Mapa do Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
