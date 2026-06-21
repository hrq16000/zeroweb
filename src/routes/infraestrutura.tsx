import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gauge,
  ShieldCheck,
  Globe2,
  Image as ImageIcon,
  Code2,
  Activity,
  Lock,
  Database,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { TrustStrip } from "@/components/site/TrustStrip";
import { buildHead } from "@/components/site/IntentLanding";
import { absUrl } from "@/lib/seo";

const URL = absUrl("/infraestrutura");
const TITLE = "Infraestrutura 0WEB · Por que nossos sites rankeiam e carregam em milissegundos";
const DESC =
  "Stack técnica completa: Cloudflare Edge CDN, WebP/AVIF, schema.org, Lighthouse 95+, SSL grátis, anti-DDoS e 100% de uptime. Veja por que um site 0WEB ranqueia no Google e converte mais.";

export const Route = createFileRoute("/infraestrutura")({
  head: () => buildHead({ title: TITLE, description: DESC, url: URL }),
  component: InfraestruturaPage,
});

type Pillar = {
  icon: typeof Gauge;
  title: string;
  desc: string;
  details: string[];
};

const PILLARS: Pillar[] = [
  {
    icon: Gauge,
    title: "Performance Lighthouse 95+",
    desc: "Core Web Vitals reais — não só no laboratório.",
    details: [
      "LCP < 1.5s em conexão 4G real",
      "CLS zero · sem layout shift",
      "TBT mínimo · JS otimizado e code-split por rota",
      "Auditoria contínua via Lighthouse CI",
    ],
  },
  {
    icon: Globe2,
    title: "Cloudflare Edge CDN global",
    desc: "300+ pontos de presença servindo seu site do nó mais próximo do visitante.",
    details: [
      "Servidor edge em São Paulo, Rio, Curitiba e BH",
      "HTTP/3 e Brotli ativos",
      "Cache inteligente com purge automático no deploy",
      "Failover global · zero downtime em manutenção",
    ],
  },
  {
    icon: ImageIcon,
    title: "Imagens WebP e AVIF",
    desc: "Imagens 70% mais leves entregues no formato ideal por dispositivo.",
    details: [
      "Conversão automática para WebP/AVIF",
      "Lazy loading nativo com srcset responsivo",
      "Tamanhos otimizados por viewport",
      "Sem dependência de plugins externos",
    ],
  },
  {
    icon: Code2,
    title: "Schema.org em todas as páginas",
    desc: "Dados estruturados que ativam rich snippets no Google.",
    details: [
      "Organization, LocalBusiness, Service, FAQPage, BreadcrumbList",
      "Article e Product nos templates aplicáveis",
      "Validação contínua via Search Console",
      "Sitemap.xml e robots.txt sempre atualizados",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Segurança nível empresarial",
    desc: "Proteção que normalmente custa milhares — incluída em todos os planos.",
    details: [
      "SSL/TLS 1.3 auto-renovado",
      "Proteção anti-DDoS Cloudflare",
      "WAF (Web Application Firewall) ativo",
      "Headers de segurança: HSTS, CSP, X-Frame-Options",
    ],
  },
  {
    icon: Activity,
    title: "100% de uptime garantido",
    desc: "SLA real, não promessa de marketing.",
    details: [
      "Monitoramento 24/7 com alertas automáticos",
      "Deploys atômicos · rollback em segundos",
      "Sem janela de manutenção programada",
      "Status público em tempo real",
    ],
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Auditoria técnica do projeto",
    desc: "Mapeamos palavras-chave, concorrência, intenção de busca e definimos a arquitetura de páginas antes de uma única linha de código.",
  },
  {
    step: "02",
    title: "Desenvolvimento hand-coded",
    desc: "Stack TanStack Start + React 19 + Tailwind. Sem WordPress, sem template, sem plugin lento. Cada componente é escrito sob medida.",
  },
  {
    step: "03",
    title: "SEO técnico + on-page",
    desc: "Schema.org, meta tags, canonicals, sitemap, internal linking estratégico e Core Web Vitals 95+ desde o primeiro deploy.",
  },
  {
    step: "04",
    title: "Deploy em edge global",
    desc: "Cloudflare Workers servindo o site do nó mais próximo do visitante. SSL, anti-DDoS e CDN configurados automaticamente.",
  },
  {
    step: "05",
    title: "Acompanhamento de rankings",
    desc: "Você recebe relatório mensal de posicionamento no Google e ajustamos a estratégia conforme os termos evoluem.",
  },
];

function InfraestruturaPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Stack técnica
            </p>
            <h1 className="mt-4 text-4xl lg:text-6xl font-bold font-display tracking-tight">
              Por que um site 0WEB <span className="text-primary">carrega em milissegundos</span> e ranqueia no Google
            </h1>
            <p className="mt-5 text-lg lg:text-xl text-muted-foreground">
              Cada projeto roda sobre uma stack pensada para Core Web Vitals 95+, SEO técnico
              real e infraestrutura de nível empresarial — sem custo extra para você.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/servicos"
                className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 transition shadow-elegant"
              >
                Ver Serviços
              </Link>
              <Link
                to="/solicitar-diagnostico"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:border-primary/40 transition"
              >
                Solicitar diagnóstico técnico
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <TrustStrip variant="compact" />

      {/* PILARES TÉCNICOS */}
      <section className="py-16 lg:py-24" aria-labelledby="pillars-title">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Pilares técnicos
            </p>
            <h2 id="pillars-title" className="mt-2 text-3xl lg:text-4xl font-bold font-display">
              6 fundamentos que fazem a diferença
            </h2>
            <p className="mt-3 text-muted-foreground">
              Performance, segurança, SEO técnico e infraestrutura global. Tudo configurado
              automaticamente — você só precisa focar no conteúdo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {PILLARS.map(({ icon: Icon, title, desc, details }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-elegant transition"
              >
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                <ul className="mt-4 space-y-2">
                  {details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="py-16 lg:py-24 bg-muted/30 border-y border-border" aria-labelledby="process-title">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Processo
            </p>
            <h2 id="process-title" className="mt-2 text-3xl lg:text-4xl font-bold font-display">
              Como entregamos performance + SEO em todo projeto
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PROCESS.map(({ step, title, desc }) => (
              <li
                key={step}
                className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition"
              >
                <span className="text-xs font-bold text-primary">{step}</span>
                <h3 className="mt-2 font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PROVA / NÚMEROS */}
      <section className="py-16 lg:py-24" aria-labelledby="proof-title">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Prova técnica
            </p>
            <h2 id="proof-title" className="mt-2 text-3xl lg:text-4xl font-bold font-display">
              Métricas reais que entregamos
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: Gauge, value: "95+", label: "Lighthouse score · Performance, SEO, Best Practices, Accessibility" },
              { icon: Activity, value: "< 1.5s", label: "Largest Contentful Paint em 4G real" },
              { icon: Lock, value: "A+", label: "SSL Labs · TLS 1.3, HSTS, perfect forward secrecy" },
              { icon: Database, value: "300+", label: "Pontos de presença Cloudflare Edge global" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/40 transition"
              >
                <Icon className="w-6 h-6 text-primary mx-auto mb-3" aria-hidden="true" />
                <div className="text-3xl lg:text-4xl font-bold font-display text-foreground">{value}</div>
                <p className="mt-2 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background border-t border-border">
        <div className="mx-auto max-w-4xl px-5 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold font-display">
            Quer um site que ranqueia e carrega rápido?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Toda essa infraestrutura está inclusa em qualquer plano da 0WEB — do Site Express ao Site Pro.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              to="/servicos/site-pro"
              className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 transition shadow-elegant"
            >
              Conhecer o Site Pro
            </Link>
            <Link
              to="/servicos"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 font-semibold hover:border-primary/40 transition"
            >
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
