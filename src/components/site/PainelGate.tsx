import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";

const LS_KEY = "0web_painel_auth_v1";
const PASSWORD = "hrq16000@gmail.com";

export function PainelGate({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  const [input, setInput] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOk(localStorage.getItem(LS_KEY) === "1");
  }, []);

  if (ok) return <>{children}</>;

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() === PASSWORD) {
            localStorage.setItem(LS_KEY, "1");
            setOk(true);
          } else {
            setErr(true);
          }
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-elegant"
      >
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="mt-4 text-xl font-bold font-display">Painel restrito</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso somente para administradores 0WEB.
        </p>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setErr(false);
          }}
          placeholder="Senha de acesso"
          className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
        />
        {err && <p className="mt-2 text-xs text-red-600">Senha incorreta.</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3"
        >
          Entrar
        </button>
        <p className="mt-4 text-[10px] text-muted-foreground text-center">
          Proteção client-side. Para auth real, habilite Lovable Cloud.
        </p>
      </form>
    </div>
  );
}
