import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, FileLock2, Trash2, RefreshCw } from "lucide-react";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

const TITLE = "Central LGPD — Exercer direitos sobre seus dados | 0WEB";
const DESCRIPTION =
  "Solicite acesso, correção, exclusão ou portabilidade dos seus dados pessoais tratados pela 0WEB. Atendimento em até 15 dias, conforme a Lei 13.709/2018.";
const URL = "https://0web.com.br/lgpd";

export const Route = createFileRoute("/lgpd")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESCRIPTION,
          url: URL,
        }),
      },
    ],
  }),
  component: LgpdPage,
});

const RIGHTS = [
  {
    icon: FileLock2,
    title: "Acesso aos dados",
    text: "Saiba quais dados pessoais seus estão sob tratamento da 0WEB e com qual finalidade.",
  },
  {
    icon: RefreshCw,
    title: "Correção e atualização",
    text: "Peça a correção de dados incompletos, inexatos ou desatualizados no nosso cadastro.",
  },
  {
    icon: Trash2,
    title: "Exclusão e anonimização",
    text: "Solicite a eliminação de dados tratados com base no seu consentimento.",
  },
  {
    icon: ShieldCheck,
    title: "Revogação de consentimento",
    text: "Retire a qualquer momento o consentimento dado para comunicações e marketing.",
  },
];

function ctaIntent(source: string) {
  return {
    purpose: "lgpd" as const,
    source,
    pagePath: "/lgpd",
    placement: "section" as const,
  };
}

function LgpdPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-5 lg:px-8 pt-20 pb-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Privacidade
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Central LGPD: exerça seus direitos sobre seus dados
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          A 0WEB trata dados pessoais para atendimento comercial, execução de contratos
          e melhoria dos nossos serviços digitais. Como titular, você pode solicitar
          acesso, correção, portabilidade, exclusão ou revogar consentimento a qualquer
          momento. Registre sua solicitação pelo formulário seguro abaixo — sem
          necessidade de e-mail ou telefone.
        </p>
        <div className="mt-8">
          <FunnelCTAButton
            intent={ctaIntent("lgpd_hero")}
            label="Abrir solicitação LGPD"
            location="lgpd_hero"
            context={{ Assunto: "Solicitação LGPD" }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold">Quais direitos você pode exercer</h2>
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {RIGHTS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
              <r.icon className="w-5 h-5 text-primary" />
              <h3 className="mt-3 font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold">Como funciona o atendimento</h2>
        <ol className="mt-6 space-y-4 text-muted-foreground">
          <li>
            <strong className="text-foreground">1. Registro.</strong> Você preenche o
            formulário informando o tipo de solicitação e seus dados de identificação.
          </li>
          <li>
            <strong className="text-foreground">2. Validação de identidade.</strong>{" "}
            Confirmamos que a solicitação parte do titular ou de representante legal.
          </li>
          <li>
            <strong className="text-foreground">3. Resposta em até 15 dias.</strong>{" "}
            Retornamos pelo canal informado com a conclusão ou justificativa legal.
          </li>
        </ol>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Pronto para registrar sua solicitação?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Leva menos de 2 minutos e gera um protocolo de acompanhamento.
          </p>
          <div className="mt-6 flex justify-center">
            <FunnelCTAButton
              intent={ctaIntent("lgpd_footer")}
              label="Registrar solicitação"
              location="lgpd_footer"
              context={{ Assunto: "Solicitação LGPD" }}
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Veja também nossa{" "}
            <Link to="/politica-privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
