import { subscribeScroll } from "@/lib/scroll-bus";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gift, X, ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { useWaFunnel } from "@/components/site/WaFunnelModal";

const STORAGE_KEY = "0web_exit_seen_v1";

export function ExitIntent() {
  const [open, setOpen] = useState(false);
  const { open: openFunnel } = useWaFunnel();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let armed = false;
    const arm = setTimeout(() => (armed = true), 8000);

    const onLeave = (e: MouseEvent) => {
      if (!armed) return;
      if (e.clientY <= 0 && !open) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOpen(true);
        trackEvent("exit_intent_show");
      }
    };

    // Mobile fallback: long inactivity + scroll up burst
    let lastY = window.scrollY;
    let scrollUp = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY - 80) scrollUp++;
      lastY = y;
      if (scrollUp >= 3 && armed && !open) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOpen(true);
        trackEvent("exit_intent_show", { source: "mobile_scroll" });
      }
    };

    document.addEventListener("mouseout", onLeave);
    const unsub = subscribeScroll(onScroll);
    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseout", onLeave);
      unsub();
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    trackEvent("exit_intent_dismiss");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-foreground/70 backdrop-blur-sm p-4"
          onClick={close}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-background shadow-elegant border border-border"
          >
            <button
              onClick={close}
              aria-label="Fechar"
              className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative bg-foreground text-background p-8 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/40 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-accent/30 blur-3xl" />

              <div className="relative flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Oferta exclusiva
              </div>
              <h3 className="relative mt-3 text-2xl sm:text-3xl font-display font-bold leading-tight">
                Antes de sair... <span className="text-accent">leve um diagnóstico grátis</span> da sua presença digital.
              </h3>
              <p className="relative mt-3 text-background/80 text-sm">
                Em 24h recebemos seu site, redes e SEO e enviamos um plano com prioridades, custo e ROI estimado.
                Sem compromisso.
              </p>
            </div>

            <form
              className="p-6 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                trackConversion("form_submit", {
                  form_name: "exit_intent",
                  has_company: Boolean(data.get("company")),
                });
                openFunnel("exit_intent_form");
                setOpen(false);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  name="name"
                  required
                  placeholder="Seu nome"
                  className="rounded-xl bg-muted px-4 py-3 text-sm border border-transparent focus:outline-none focus:border-primary"
                />
                <input
                  name="company"
                  placeholder="Empresa (opcional)"
                  className="rounded-xl bg-muted px-4 py-3 text-sm border border-transparent focus:outline-none focus:border-primary"
                />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="Seu melhor e-mail"
                className="rounded-xl bg-muted px-4 py-3 text-sm border border-transparent focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground font-semibold px-6 py-3.5 shadow-glow-primary hover:opacity-95 transition"
              >
                <Gift className="w-4 h-4" />
                Quero meu diagnóstico grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  trackConversion("contact_cta_click", { location: "exit_intent" });
                  openFunnel("exit_intent");
                  setOpen(false);
                }}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Prefiro iniciar o diagnóstico
              </button>

              <p className="text-[11px] text-muted-foreground text-center">
                Seus dados são protegidos pela LGPD. Sem spam.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
