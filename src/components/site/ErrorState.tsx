import { Link } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { FunnelCTAButton } from "@/components/funnel/FunnelCTAButton";

export type ErrorStateKind = "403" | "404" | "500";

interface ErrorStateProps {
  kind: ErrorStateKind;
  title?: string;
  description?: string;
  onRetry?: () => void;
  diagnostics?: ReactNode;
}

const defaults: Record<ErrorStateKind, { title: string; description: string; Icon: typeof AlertTriangle }> = {
  "403": {
    title: "Acesso restrito",
    description:
      "Você não tem permissão para acessar esta página. Faça login com uma conta autorizada ou volte para o site.",
    Icon: ShieldAlert,
  },
  "404": {
    title: "Página não encontrada",
    description:
      "O endereço que você acessou não existe ou foi movido. Explore nossos serviços ou volte para a página inicial.",
    Icon: AlertTriangle,
  },
  "500": {
    title: "Algo deu errado por aqui",
    description:
      "Tivemos um problema inesperado ao carregar esta página. Tente novamente em alguns instantes ou inicie um atendimento.",
    Icon: AlertTriangle,
  },
};

export function ErrorState({ kind, title, description, onRetry, diagnostics }: ErrorStateProps) {
  const d = defaults[kind];
  const Icon = d.Icon;
  return (
    <main
      role="main"
      className="flex min-h-screen items-center justify-center bg-background px-4 py-16"
    >
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Erro {kind}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          {title ?? d.title}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {description ?? d.description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Tentar novamente
            </button>
          ) : null}
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Home className="h-4 w-4" aria-hidden /> Voltar ao início
          </Link>
          <Link
            to="/servicos"
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ver Serviços
          </Link>
          <FunnelCTAButton
            intent={{
              purpose: "commercial",
              source: `error_${kind}`,
              pagePath: typeof window === "undefined" ? "/" : window.location.pathname,
              placement: "error-state",
            }}
            label="Iniciar atendimento"
            location={`error_${kind}`}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          />
        </div>

        {diagnostics ? (
          <details className="mt-8 rounded-md border border-border bg-muted/30 p-4 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-foreground">
              Detalhes técnicos (dev)
            </summary>
            <div className="mt-3 space-y-2">{diagnostics}</div>
          </details>
        ) : null}
      </div>
    </main>
  );
}
