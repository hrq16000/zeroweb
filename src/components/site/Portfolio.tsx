import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import nexa from "@/assets/portfolio-nexa.jpg";
import lumen from "@/assets/portfolio-lumen.jpg";
import pulse from "@/assets/portfolio-pulse.jpg";
import orbita from "@/assets/portfolio-orbita.jpg";
import volt from "@/assets/portfolio-volt.jpg";
import mira from "@/assets/portfolio-mira.jpg";

const projects = [
  { title: "Nexa Health", cat: "Sistema", img: nexa, href: "/contato" },
  { title: "Lumen Store", cat: "E-commerce", img: lumen, href: "/contato" },
  { title: "Pulse Lab", cat: "Landing Page", img: pulse, href: "/contato" },
  { title: "Orbita Tech", cat: "Site Institucional", img: orbita, href: "/contato" },
  { title: "Volt Energia", cat: "Sistema", img: volt, href: "/contato" },
  { title: "Mira Studio", cat: "Landing Page", img: mira, href: "/contato" },
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
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: (i % 3) * 0.05 }}
            >
              <Link
                to={p.href}
                className="group relative block aspect-[4/5] rounded-3xl overflow-hidden border border-border bg-muted"
              >
                <img
                  src={p.img}
                  alt={`${p.title} — projeto de ${p.cat.toLowerCase()} desenvolvido pela 0WEB`}
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />

                <div className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full glass text-foreground translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6 text-background">
                  <div className="text-xs uppercase tracking-wider opacity-80">{p.cat}</div>
                  <div className="mt-1 text-2xl font-bold font-display">{p.title}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
