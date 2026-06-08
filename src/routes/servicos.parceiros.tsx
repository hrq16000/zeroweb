// Sprint 13 — Landing pública de recrutamento de parceiros
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { RelatedLinksGrid } from "@/components/site/RelatedLinksGrid";
import { applyAsPartner } from "@/lib/partners.functions";
import { CheckCircle2 } from "lucide-react";

const TITLE = "Seja um parceiro 0WEB — afiliados, representantes e agências";
const DESC =
  "Indique, venda ou represente a 0WEB no Brasil inteiro. Cadastro gratuito, comissões recorrentes e materiais prontos.";

export const Route = createFileRoute("/servicos/parceiros")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: "https://0web.com.br/servicos/parceiros" },
    ],
    links: [{ rel: "canonical", href: "https://0web.com.br/servicos/parceiros" }],
  }),
  component: ParceirosPage,
});

const KINDS = [
  { v: "afiliado", l: "Afiliado", d: "Indique e ganhe por cada cliente convertido." },
  { v: "representante", l: "Representante", d: "Atue como comercial regional com território definido." },
  { v: "parceiro_comercial", l: "Parceiro Comercial", d: "Empresas que querem revender ou cross-sell." },
  { v: "agencia", l: "Agência Parceira", d: "White-label e co-execução." },
  { v: "franqueado", l: "Franqueado (futuro)", d: "Lista de espera para franquias regionais." },
];

function ParceirosPage() {
  const apply = useServerFn(applyAsPartner);
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        company: String(fd.get("company") ?? ""),
        city: String(fd.get("city") ?? ""),
        state: String(fd.get("state") ?? ""),
        kind: String(fd.get("kind") ?? "afiliado") as
          | "afiliado"
          | "representante"
          | "parceiro_comercial"
          | "agencia"
          | "franqueado",
        areas: String(fd.get("areas") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        specialties: String(fd.get("specialties") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        bio: String(fd.get("bio") ?? ""),
        website_url: String(fd.get("website_url") ?? ""), // honeypot
      };
      await apply({ data: payload });
      setSent(true);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Falha ao enviar");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-40 pb-32 mx-auto max-w-2xl px-5 text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
          <h1 className="mt-6 text-4xl font-bold">Cadastro recebido</h1>
          <p className="mt-4 text-muted-foreground">
            Vamos revisar e responder em até 2 dias úteis. Ao aprovar, você recebe acesso ao painel,
            links rastreáveis e materiais comerciais.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 rounded-full bg-foreground text-background px-6 py-3 font-semibold"
          >
            Voltar ao início
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 lg:pt-40 pb-24">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Programa de parceiros</p>
          <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Cresça com a 0WEB.<br />Brasil inteiro.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
            Indique, venda ou represente. Comissão por cada cliente, painel próprio, materiais comerciais e
            território configurável.
          </p>

          <section className="mt-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {KINDS.map((k) => (
              <div key={k.v} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold">{k.l}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{k.d}</p>
              </div>
            ))}
          </section>

          <form onSubmit={onSubmit} className="mt-16 grid sm:grid-cols-2 gap-4 max-w-3xl">
            <h2 className="sm:col-span-2 text-2xl font-bold">Quero ser parceiro</h2>
            {/* Honeypot — invisível para usuários, capturado por bots */}
            <input
              type="text"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <Input name="name" label="Nome completo *" required />
            <Input name="email" label="E-mail *" type="email" required />
            <Input name="phone" label="Telefone / WhatsApp" />
            <Input name="company" label="Empresa" />
            <Input name="city" label="Cidade" />
            <Input name="state" label="UF" maxLength={2} />
            <Select
              name="kind"
              label="Como quer atuar"
              options={KINDS.map((k) => ({ value: k.v, label: k.l }))}
            />
            <Input name="areas" label="Áreas de atuação (separe por vírgula)" placeholder="SEO, GMN, Sites" />
            <Input
              name="specialties"
              label="Especialidades (vírgula)"
              placeholder="E-commerce, Médico, Imobiliário"
            />
            <textarea
              name="bio"
              placeholder="Breve apresentação"
              maxLength={800}
              className="sm:col-span-2 rounded-xl border border-border bg-background p-3 text-sm min-h-[100px]"
            />
            {err && <p className="sm:col-span-2 text-sm text-destructive">{err}</p>}
            <button
              disabled={loading}
              className="sm:col-span-2 rounded-full bg-foreground text-background px-6 py-3 font-semibold disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar candidatura"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: { value: string; label: string }[] }) {
  return (
    <label className="text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select {...props} className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
