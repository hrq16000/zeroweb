import { Instagram, Linkedin, Youtube, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";
import { BrandLogo } from "@/components/site/BrandLogo";

// Footer 4 colunas (estrutura fixa pós-reorganização IA):
// 1. Marca + contatos + redes sociais
// 2. Serviços (6 principais slugs do catálogo)
// 3. Empresa
// 4. Suporte

const servicosCol = [
  { label: "Criação de Sites", slug: "criacao-de-sites" },
  { label: "SEO", slug: "seo" },
  { label: "Tráfego Pago", slug: "trafego-pago" },
  { label: "Presença Digital", slug: "presenca-digital" },
  { label: "Automação com IA", slug: "automacao-com-ia" },
  { label: "Gestão de Redes Sociais", slug: "gestao-redes-sociais" },
];

const empresaCol: { label: string; to: string }[] = [
  { label: "Sobre", to: "/sobre" },
  { label: "Cases", to: "/cases" },
  { label: "Parceiros", to: "/servicos/parceiros" },
  { label: "Blog", to: "/blog" },
  { label: "Planos", to: "/planos" },
  { label: "Bairros — Curitiba/RMC", to: "/bairros-cwb" },
  { label: "Bairros — Belo Horizonte", to: "/bairros-bh" },
];

const suporteCol: { label: string; to?: string; href?: string }[] = [
  { label: "FAQ", to: "/faq" },
  { label: "Contato", to: "/contato" },
  { label: "Mapa do Site", href: "/mapa-do-site" },
  { label: "Política de Privacidade", to: "/politica-privacidade" },
  { label: "Termos de Uso", to: "/termos" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Col 1 — Marca */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2" aria-label="0WEB — Início">
              <BrandLogo size={36} className="brightness-0 invert" />
            </Link>
            <p className="mt-4 text-background/70 max-w-sm leading-relaxed">
              Tecnologia que gera crescimento. Sites, IA e marketing digital para empresas que querem liderar.
            </p>

            <div className="mt-6 text-sm text-background/80">
              <FunnelCTAButton
                intent={{
                  purpose: "commercial",
                  source: "footer",
                  pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
                  placement: "footer",
                }}
                label="Iniciar diagnóstico"
                location="footer"
                className="inline-flex items-center gap-2 rounded-full bg-background/10 border border-background/15 px-5 py-3 font-semibold hover:bg-background/15 transition"
              />
            </div>

            <div className="mt-6 flex gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com/", label: "Instagram" },
                { Icon: Linkedin, href: "https://linkedin.com/", label: "LinkedIn" },
                { Icon: Youtube, href: "https://youtube.com/", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid place-items-center w-10 h-10 rounded-full glass-dark hover:bg-background/10 transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Serviços */}
          <div className="lg:col-span-3 sm:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">Serviços</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {servicosCol.map((l) => (
                <li key={l.slug}>
                  <Link
                    to="/servicos/$slug"
                    params={{ slug: l.slug }}
                    className="text-background/80 hover:text-accent transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/servicos" className="text-background/60 hover:text-accent transition text-xs uppercase tracking-wider">
                  Ver todos →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Empresa */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">Empresa</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {empresaCol.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-background/80 hover:text-accent transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Suporte */}
          <div className="lg:col-span-3 sm:col-span-1">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/60">Suporte</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {suporteCol.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-background/80 hover:text-accent transition">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href!} className="text-background/80 hover:text-accent transition">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-background/10 flex flex-wrap items-center justify-between gap-4 text-xs text-background/60">
          <p>
            © 2026 0WEB · CNPJ 41.723.708/0001-58 · Marketing Digital desde 2006.
          </p>
          <p className="text-background/50">Desenvolvido por 0web</p>
        </div>
      </div>
    </footer>
  );
}
