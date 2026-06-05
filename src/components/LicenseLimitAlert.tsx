import { AlertTriangle, ArrowUpRight, LifeBuoy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LicenseLimitInfo } from "@/lib/license-error";

/**
 * UI padrão para erros de license_limit_exceeded.
 * Use em conjunto com parseLicenseLimitError(err).
 */
export function LicenseLimitAlert({ info, onDismiss }: { info: LicenseLimitInfo; onDismiss?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 space-y-3"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            Limite de {info.label} atingido
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sua licença permite até <strong>{info.limit}</strong> {info.label} e você já tem{" "}
            <strong>{info.current}</strong>. Para criar mais, faça upgrade do plano ou fale com o suporte.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-8">
        <Link
          to="/app/licenses"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          <ArrowUpRight className="w-3.5 h-3.5" /> Ver licenças / upgrade
        </Link>
        <Link
          to="/app/support"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted"
        >
          <LifeBuoy className="w-3.5 h-3.5" /> Falar com suporte
        </Link>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
}
