import { Instagram, Linkedin, Youtube, Mail, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Soluções",
    links: [
      { label: "Criação de Sites", to: "/criacao-sites" },
      { label: "Landing Pages", to: "/landing-pages" },
      { label: "Google Meu Negócio", to: "/google-meu-negocio" },
      { label: "SEO", to: "/seo" },
      { label: "Tráfego Pago", to: "/trafego-pago" },
      { label: "Redes Sociais", to: "/redes-sociais" },
    ],
  },
  {
    title: "Tecnologia",
    links: [
      { label: "IA & Chatbots", to: "/ia" },
      { label: "Automações", to: "/automacao" },
      { label: "Sistemas Web", to: "/desenvolvimento" },
      { label: "Cases", to: "/cases" },
      { label: "Planos", to: "/planos" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", to: "/sobre" },
      { label: "Blog", to: "/blog" },
      { label: "Contato", to: "/contato" },
      { label: "Política de Privacidade", to: "/politica-privacidade" },
      { label: "Termos de Uso", to: "/termos" },
      { label: "Painel", to: "/painel" },
    ],
  },
];

export function Footer() {
  const { open } = useWaFunnel();
  return (
    <footer className="bg-foreground text-background pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-2xl">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary">0</span>
              <span>0<span className="text-gradient">WEB</span></span>
            </Link>
            <p className="mt-4 text-background/70 max-w-sm leading-relaxed">
              Tecnologia que gera crescimento. Sites, sistemas, IA e marketing digital
              para empresas que querem liderar.
            </p>

            <div className="mt-6 space-y-2 text-sm text-background/80">
              <button
                onClick={() => open("footer")}
                className="flex items-center gap-2 hover:text-accent text-left"
              >
                <MessageCircle className="w-4 h-4 text-accent" />
                <span>WhatsApp · (41) 9 9745-2053</span>
              </button>
              <a href="mailto:contato@0web.com.br" className="flex items-center gap-2 hover:text-accent">
                <Mail className="w-4 h-4 text-accent" />
                <span>contato@0web.com.br</span>
              </a>
            </div>

            <div className="mt-6 flex gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com/" },
                { Icon: Linkedin, href: "https://linkedin.com/" },
                { Icon: Youtube, href: "https://youtube.com/" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Rede social"
                  className="grid place-items-center w-10 h-10 rounded-full glass-dark hover:bg-background/10 transition"
                >
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
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-background/80 hover:text-accent transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-background/10 flex flex-wrap items-center justify-between gap-4 text-xs text-background/60">
          <p>
            © {new Date().getFullYear()} 0WEB · Tecnologia que gera crescimento.
            <span className="block mt-1 text-background/50">
              CNPJ 41.723.708/0001-58 · Atuando com Marketing Digital desde 2006.
            </span>
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/politica-privacidade" className="hover:text-accent">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-accent">Termos de Uso</Link>
            <a href="/sitemap.xml" className="hover:text-accent">Mapa do Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
