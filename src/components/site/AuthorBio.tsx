// Sprint 12 — Bloco E-E-A-T (autoridade e experiência)
import { ShieldCheck, Award, Users } from "lucide-react";

export function AuthorBio({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-2xl border border-border bg-card p-6 ${className}`}
      itemScope
      itemType="https://schema.org/Organization"
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">Sobre a fonte</p>
      <h2 className="mt-2 text-xl font-bold" itemProp="name">
        0WEB — Agência de Marketing Digital
      </h2>
      <p className="mt-2 text-sm text-muted-foreground" itemProp="description">
        Mais de uma década criando sites, SEO, tráfego pago e automações com IA para empresas que
        querem crescer com previsibilidade. Casos reais, dados rastreáveis, sem promessa vazia.
      </p>
      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Especialistas certificados</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span>Cases mensuráveis</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span>Time multidisciplinar</span>
        </div>
      </div>
      <link itemProp="url" href="https://0web.com.br" />
    </aside>
  );
}
