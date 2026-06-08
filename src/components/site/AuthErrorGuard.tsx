import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let signingOut = false;

    const isAuthError = (err: unknown): boolean => {
      if (!err) return false;
      const e = err as { message?: string; status?: number; statusCode?: number };
      const msg = String(e.message ?? err);
      const status = e.status ?? e.statusCode;
      return (
        /unauthorized|no authorization header|invalid jwt|jwt expired|forbidden/i.test(msg) ||
        status === 401 ||
        status === 403
      );
    };

    const handleAuthError = async (origin: string, err: unknown) => {
      if (signingOut) return;
      const isProtected = /^\/(app|painel)/.test(pathname);
      // Log estruturado (sem expor token/sessão).
      console.warn("[AuthErrorGuard] 401/403 capturado", {
        origin,
        pathname,
        message: String((err as { message?: string })?.message ?? err).slice(0, 200),
        timestamp: new Date().toISOString(),
      });
      if (!isProtected) return; // página pública: ignora
      signingOut = true;
      try {
        await supabase.auth.signOut();
      } catch {
        /* noop */
      }
      toast.error("Sua sessão expirou. Faça login novamente.");
      navigate({
        to: "/auth",
        search: { redirect: pathname },
        replace: true,
      });
    };

    const onRejection = (ev: PromiseRejectionEvent) => {
      if (isAuthError(ev.reason)) {
        ev.preventDefault();
        void handleAuthError("unhandledrejection", ev.reason);
      }
    };
    const onError = (ev: ErrorEvent) => {
      if (isAuthError(ev.error ?? ev.message)) {
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
  }, [navigate, pathname]);

  return null;
}
