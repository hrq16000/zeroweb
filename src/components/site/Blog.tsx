import { ArrowUpRight } from "lucide-react";

const posts = [
  { cat: "SEO", title: "Como rankear no Google em 2026 sem truques.", read: "8 min" },
  { cat: "IA", title: "Agentes de IA no WhatsApp: do hype ao ROI.", read: "6 min" },
  { cat: "Marketing", title: "Tráfego pago x orgânico: onde investir primeiro.", read: "5 min" },
  { cat: "Sites", title: "Core Web Vitals: o que mudou e como passar.", read: "7 min" },
  { cat: "Automação", title: "Automatize a captação de leads com n8n + IA.", read: "9 min" },
  { cat: "Negócios", title: "Transformação digital para PMEs em 2026.", read: "6 min" },
];

export function Blog() {
  return (
    <section id="blog" className="py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Blog</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Conteúdo que <span className="text-gradient">faz crescer.</span>
            </h2>
          </div>
          <a href="#" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Ver todos os artigos <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((p) => (
            <a
              key={p.title}
              href="#"
              className="group rounded-3xl bg-background border border-border overflow-hidden hover:shadow-elegant transition"
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-primary" />
                <div className="absolute inset-0 bg-mesh opacity-60 mix-blend-overlay" />
                <div className="absolute top-4 left-4 rounded-full glass text-xs font-medium px-3 py-1">
                  {p.cat}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition">
                  {p.title}
                </h3>
                <div className="mt-3 text-xs text-muted-foreground">{p.read} de leitura</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
