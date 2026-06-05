import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Área do Cliente · 0WEB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
  ssr: false,
});

function AuthPage() {
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
        navigate({ to: "/app", replace: true });
      }
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/app", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const google = async () => {
    setBusy(true);
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/app",
    });
    if (r.error) setErr(r.error.message);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 grid place-items-center px-5 py-20">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant text-center">
          <h1 className="text-2xl font-bold font-display">Entrar na 0WEB</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O acesso é exclusivo via conta Google corporativa.
          </p>

          {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-6 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M17.6 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path fill="currentColor" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="currentColor" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
              <path fill="currentColor" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            {busy ? "Conectando..." : "Continuar com Google"}
          </button>

          <p className="mt-6 text-xs text-muted-foreground">
            Cadastro por email/senha está desativado. Para acesso novo, fale com o time
            comercial.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
