import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { FunnelModalWrapper } from "./FunnelModalWrapper";
import { trackEvent } from "@/lib/analytics";

/**
 * Botão flutuante (canto inferior ESQUERDO — para não colidir com o
 * WhatsAppFloat à direita) que abre o funil comum. Use nas páginas
 * institucionais (sobre, faq, planos, cases, etc.).
 */
export function FloatingFunnelCTA({
  funnelSlug = "funnel-common",
  label = "Fale com um especialista",
  location = "floating_common",
}: {
  funnelSlug?: string;
  label?: string;
  location?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          trackEvent("cta_click", { label: "floating_funnel", location, funnel: funnelSlug });
          setOpen(true);
        }}
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full
                   bg-secondary text-secondary-foreground border border-border
                   px-4 py-3 text-sm font-semibold shadow-lg hover:shadow-xl
                   hover:bg-secondary/90 active:scale-95 transition-all
                   max-[420px]:px-3 max-[420px]:py-2.5"
        aria-label={label}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Fale conosco</span>
      </button>
      <FunnelModalWrapper
        open={open}
        onClose={() => setOpen(false)}
        funnelSlug={funnelSlug}
      />
    </>
  );
}
