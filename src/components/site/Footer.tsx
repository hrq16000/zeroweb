import { Instagram, Linkedin, Youtube, Mail, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useWaFunnel } from "@/components/site/WaFunnelModal";
import { listServicesNav, type NavService } from "@/lib/services-nav.functions";

type FooterLink = { label: string; to?: string; slug?: string };
type FooterCol = { title: string; links: FooterLink[] };

// Fallback estático quando o DB ainda não respondeu.
const fallbackCols: FooterCol[] = [
  {
    title: "Serviços",
    links: [
      { label: "Site Express em 24h", slug: "site-express" },
      { label: "Criação de Sites", slug: "criacao-de-sites" },
      { label: "Landing Pages", slug: "landing-pages" },
      { label: "Loja Virtual", slug: "loja-virtual" },
      { label: "Google Meu Negócio", slug: "google-meu-negocio" },
      { label: "SEO", slug: "seo" },
    ],
  },
  {
    title: "Tecnologia",
    links: [
      { label: "Chatbot no WhatsApp", slug: "chatbot-whatsapp" },
      { label: "Automação com IA", slug: "automacao-com-ia" },
      { label: "Sistemas Web", slug: "sistemas-web" },
      { label: "Desenvolvimento SaaS", slug: "desenvolvimento-saas" },
      { label: "Redes Sociais", slug: "gestao-redes-sociais" },
      { label: "Marketing Digital", slug: "marketing-digital" },
    ],
  },
  {
    title: "Especialidades",
    links: [
      { label: "Presença Digital", slug: "presenca-digital" },
      { label: "Tráfego Pago", slug: "trafego-pago" },
      { label: "Tráfego Local", slug: "trafego-pago-local" },
      { label: "Consultoria", slug: "consultoria" },
      { label: "Parceiros", slug: "parceiros" },
      { label: "Marketplace", slug: "marketplace" },
    ],
  },
];

const empresaCol: FooterCol = {
  title: "Empresa",
  links: [
    { label: "Todos os Serviços", to: "/servicos" },
    { label: "Soluções", to: "/solucoes" },
    { label: "Cases", to: "/cases" },
    { label: "Planos", to: "/planos" },
    { label: "Sobre", to: "/sobre" },
    { label: "Blog", to: "/blog" },
    { label: "Contato", to: "/contato" },
  ],
};

function buildDbCols(services: NavService[]): FooterCol[] {
  if (services.length === 0) return fallbackCols;
  // Agrupa por categoria, preserva ordem original (display_order do DB).
  const byCat = new Map<string, NavService[]>();
  for (const s of services) {
    const arr = byCat.get(s.category) ?? [];
    arr.push(s);
    byCat.set(s.category, arr);
  }
  return Array.from(byCat.entries())
    .slice(0, 3)
    .map(([title, list]) => ({
      title,
      links: list.slice(0, 6).map((s) => ({ label: s.name, slug: s.slug })),
    }));
}



export function Footer() {
  const { open } = useWaFunnel();
  const { data: nav } = useQuery({
    queryKey: ["services-nav"],
    queryFn: () => listServicesNav(),
    staleTime: 5 * 60 * 1000,
  });
  const dbCols = buildDbCols(nav?.footer ?? []);
  const cols: FooterCol[] = [...dbCols, empresaCol];

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
                    {l.slug ? (
                      <Link
                        to="/servicos/$slug"
                        params={{ slug: l.slug }}
                        className="text-background/80 hover:text-accent transition"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <Link
                        to={l.to!}
                        className="text-background/80 hover:text-accent transition"
                      >
                        {l.label}
                      </Link>
                    )}
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
            <a href="/mapa-do-site" className="hover:text-accent">Mapa do Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
