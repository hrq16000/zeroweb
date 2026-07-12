import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FunnelRunner } from "./FunnelRunner";
import {
  getPublicFunnel,
  type FunnelDefinition,
} from "@/lib/dynamic-funnel.functions";
import { trackEvent } from "@/lib/analytics";

type Props = {
  open: boolean;
  onClose: () => void;
  funnelSlug: string;
  serviceSlug?: string;
};

/**
 * Wrapper que envelopa o FunnelRunner existente em um Dialog (shadcn/Radix).
 * Toda a lógica de etapas/leads/condições continua no FunnelRunner +
 * dynamic_forms — este componente só cuida da apresentação modal.
 */
export function FunnelModalWrapper({ open, onClose, funnelSlug, serviceSlug }: Props) {
  const fetchFunnel = useServerFn(getPublicFunnel);
  const [funnel, setFunnel] = useState<FunnelDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompleted(false);
    setError(null);
    if (funnel?.slug === funnelSlug) return;
    setLoading(true);
    fetchFunnel({ data: { slug: funnelSlug } })
      .then((f) => {
        if (!f) setError("Funil indisponível no momento.");
        else setFunnel(f);
      })
      .catch(() => setError("Não foi possível carregar o funil."))
      .finally(() => setLoading(false));
  }, [open, funnelSlug, fetchFunnel, funnel?.slug]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            // Permite fechar com ESC apenas se concluído ou em estado de erro.
            if (!completed && !error) e.preventDefault();
          }}
          className="fixed z-50 bg-background text-foreground shadow-2xl
                     data-[state=open]:animate-in data-[state=closed]:animate-out
                     data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                     inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                     sm:w-[min(560px,calc(100vw-2rem))] sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-border
                     overflow-hidden flex flex-col"
        >
          <DialogPrimitive.Title className="sr-only">
            Falar com a 0WEB
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Responda algumas perguntas rápidas para receber uma proposta personalizada.
          </DialogPrimitive.Description>

          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="absolute right-3 top-3 z-50 grid place-items-center w-9 h-9 rounded-full bg-background/80 backdrop-blur border border-border hover:bg-muted transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="min-h-[320px] grid place-items-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            {error && (
              <div className="min-h-[320px] grid place-items-center p-8 text-center">
                <div>
                  <p className="text-sm text-destructive">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
            {!loading && !error && funnel && !completed && (
              <FunnelRunner
                funnel={funnel}
                embedded
                onComplete={() => setCompleted(true)}
              />
            )}
            {completed && (
              <div className="p-8 sm:p-10 text-center space-y-5">
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Tudo certo!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recebemos sua resposta. Nossa equipe entrará em contato pelo WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {serviceSlug && (
                    <Link
                      to="/servicos/$slug"
                      params={{ slug: serviceSlug }}
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold px-5 py-2.5 hover:opacity-90 transition"
                    >
                      Ver serviço
                    </Link>
                  )}
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
