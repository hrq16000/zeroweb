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
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app`, data: { full_name: name } },
        });
        if (error) throw error;
        setMsg("Conta criada. Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg("Email de recuperação enviado.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (r.error) setErr(r.error.message);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 grid place-items-center px-5 py-20">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant"
        >
          <h1 className="text-2xl font-bold font-display">
            {mode === "signin" ? "Entrar" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Área do Cliente 0WEB</p>

          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="mt-5 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@empresa.com"
            className="mt-3 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm"
          />
          {mode !== "reset" && (
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 8 caracteres)"
              className="mt-3 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm"
            />
          )}

          {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
          {msg && <p className="mt-3 text-sm text-emerald-500">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {busy ? "..." : mode === "signin" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
          </button>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-4 w-full py-3 rounded-xl border border-border bg-background font-medium text-sm hover:bg-muted"
          >
            Continuar com Google
          </button>

          <div className="mt-6 flex justify-between text-xs text-muted-foreground">
            {mode !== "signin" && (
              <button type="button" onClick={() => setMode("signin")} className="hover:text-foreground">
                Entrar
              </button>
            )}
            {mode !== "signup" && (
              <button type="button" onClick={() => setMode("signup")} className="hover:text-foreground">
                Criar conta
              </button>
            )}
            {mode !== "reset" && (
              <button type="button" onClick={() => setMode("reset")} className="hover:text-foreground">
                Esqueci a senha
              </button>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
