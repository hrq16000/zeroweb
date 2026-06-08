import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAuthErrorInfo, handleServerFnAuthError } from "@/components/site/auth-error-guard.helpers";

/**
 * Captura erros globais de Unauthorized vindos de chamadas serverFn
 * (Promise rejections não tratadas). Faz logout limpo e redireciona
 * para /auth preservando o caminho atual em ?redirect=.
 *
 * Critérios:
 * - error.message contém "Unauthorized" (mensagem padrão do
 *   `requireSupabaseAuth`) OU status 401/403 anexado.
 * - Só age se o pathname atual estiver sob /app ou /painel, evitando
 *   redirecionamentos indesejados em páginas públicas (onde a falha
 *   pode ser apenas um serverFn opcional que falhou).
 */
export function AuthErrorGuard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let signingOut = false;

    const handleAuthError = async (origin: string, err: unknown) => {
      if (signingOut) return;
      signingOut = true;
      const result = await handleServerFnAuthError({
        origin,
        error: err,
        pathname,
        queryClient,
        signOut: () => supabase.auth.signOut(),
        toastError: toast.error,
        navigateToAuth: () => navigate({ to: "/auth", replace: true }),
      });
      if (result !== "handled") signingOut = false;
    };

    const onRejection = (ev: PromiseRejectionEvent) => {
      if (getAuthErrorInfo(ev.reason).isAuthError) {
        ev.preventDefault();
        void handleAuthError("unhandledrejection", ev.reason);
      }
    };
    const onError = (ev: ErrorEvent) => {
      if (getAuthErrorInfo(ev.error ?? ev.message).isAuthError) {
        ev.preventDefault();
        void handleAuthError("error", ev.error ?? ev.message);
      }
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, [navigate, pathname, queryClient]);

  return null;
}
