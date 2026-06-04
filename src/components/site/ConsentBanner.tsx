import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, X, Settings2, Check } from "lucide-react";
import { getConsent, setConsent, type ConsentState } from "@/lib/analytics";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<ConsentState>(getConsent());

  useEffect(() => {
    const c = getConsent();
    setPrefs(c);
    if (!c.decided) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const acceptAll = () => {
    setConsent({
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      functionality_storage: "granted",
    });
    setVisible(false);
  };

  const rejectAll = () => {
    setConsent({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
    });
    setVisible(false);
  };

  const savePrefs = () => {
    setConsent(prefs);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="fixed bottom-4 inset-x-4 lg:left-auto lg:right-6 lg:bottom-6 z-[60] max-w-xl"
        >
          <div className="relative glass rounded-2xl shadow-elegant border border-border p-5">
            <button
              aria-label="Fechar"
              onClick={rejectAll}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-primary text-primary-foreground shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-foreground">Sua privacidade importa</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Usamos cookies para medir desempenho e melhorar sua experiência. Você decide o que ativar
                  (LGPD · GA4 Consent Mode).
                </p>

                {showPrefs && (
                  <div className="mt-4 space-y-2">
                    {[
                      { k: "analytics_storage" as const, label: "Analytics (GA4)" },
                      { k: "ad_storage" as const, label: "Anúncios" },
                      { k: "ad_user_data" as const, label: "Dados de anúncios" },
                      { k: "ad_personalization" as const, label: "Personalização" },
                    ].map((row) => (
                      <label
                        key={row.k}
                        className="flex items-center justify-between text-sm rounded-lg bg-muted/60 px-3 py-2"
                      >
                        <span>{row.label}</span>
                        <input
                          type="checkbox"
                          checked={prefs[row.k] === "granted"}
                          onChange={(e) =>
                            setPrefs((p) => ({
                              ...p,
                              [row.k]: e.target.checked ? "granted" : "denied",
                            }))
                          }
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {!showPrefs ? (
                    <>
                      <button
                        onClick={acceptAll}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2 shadow-glow-primary"
                      >
                        <Check className="w-3.5 h-3.5" /> Aceitar todos
                      </button>
                      <button
                        onClick={rejectAll}
                        className="text-sm font-medium px-3 py-2 rounded-full text-foreground/80 hover:bg-muted"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => setShowPrefs(true)}
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> Preferências
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={savePrefs}
                        className="rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2"
                      >
                        Salvar preferências
                      </button>
                      <button
                        onClick={() => setShowPrefs(false)}
                        className="text-sm px-3 py-2 rounded-full text-foreground/70 hover:bg-muted"
                      >
                        Voltar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
