import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  { title: "Nexa Health", cat: "Sistema", color: "from-[oklch(0.58_0.24_262)] to-[oklch(0.78_0.14_220)]" },
  { title: "Lumen Store", cat: "E-commerce", color: "from-[oklch(0.83_0.17_170)] to-[oklch(0.58_0.24_262)]" },
  { title: "Pulse Lab", cat: "Landing Page", color: "from-[oklch(0.78_0.14_220)] to-[oklch(0.83_0.17_170)]" },
  { title: "Orbita Tech", cat: "Site Institucional", color: "from-[oklch(0.58_0.24_262)] to-[oklch(0.83_0.17_170)]" },
  { title: "Volt Energia", cat: "Sistema", color: "from-[oklch(0.20_0.04_260)] to-[oklch(0.58_0.24_262)]" },
  { title: "Mira Studio", cat: "Landing Page", color: "from-[oklch(0.83_0.17_170)] to-[oklch(0.78_0.14_220)]" },
];

export function Portfolio() {
  return (
    <section id="cases" className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Portfólio</p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Projetos que <span className="text-gradient">geram resultado</span>
            </h2>
          </div>
          <div className="flex gap-2 text-sm">
            {["Sites", "Landing Pages", "Sistemas", "E-commerce"].map((c) => (
              <span key={c} className="rounded-full bg-muted px-3 py-1.5 text-foreground/70">{c}</span>
            ))}
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <motion.a
              key={p.title}
              href="#"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.05 }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-border"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${p.color}`} />
              <div className="absolute inset-0 bg-mesh opacity-50 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />

              <div className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full glass text-foreground translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 text-background">
                <div className="text-xs uppercase tracking-wider opacity-80">{p.cat}</div>
                <div className="mt-1 text-2xl font-bold font-display">{p.title}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
