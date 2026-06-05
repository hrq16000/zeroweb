import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

type GateState = "checking" | "unauth" | "forbidden" | "ok";

export function PainelGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (cancelled) return;
      if (userErr || !userData?.user) {
        setState("unauth");
        return;
      }
      // Server-side authorization: super_admin OR admin role.
      const { data: isSuper } = await supabase.rpc("is_super_admin", { _uid: userData.user.id });
      if (isSuper) {
        if (!cancelled) setState("ok");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (cancelled) return;
      setState(isAdmin ? "ok" : "forbidden");
    };
    void check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => void check());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "ok") return <>{children}</>;

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-elegant text-center">
        <div className="mx-auto grid place-items-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="mt-4 text-xl font-bold font-display">Painel restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {state === "checking" && "Verificando suas credenciais…"}
          {state === "unauth" && "Entre com sua conta de administrador para acessar o painel."}
          {state === "forbidden" &&
            "Sua conta não tem permissão de administrador. Solicite acesso ao responsável."}
        </p>
        {state === "unauth" && (
          <button
            type="button"
            onClick={() =>
              lovable.auth.signInWithOAuth("google", {
                redirect_uri:
                  typeof window !== "undefined" ? window.location.href : undefined,
              })
            }
            className="mt-5 w-full rounded-full bg-gradient-primary text-primary-foreground font-semibold px-5 py-3"
          >
            Entrar com Google
          </button>
        )}
        {state === "forbidden" && (
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              setState("unauth");
            }}
            className="mt-5 w-full rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold"
          >
            Sair e usar outra conta
          </button>
        )}
        <p className="mt-4 text-[10px] text-muted-foreground">
          Acesso autorizado por papel no servidor (super_admin / admin).
        </p>
      </div>
    </div>
  );
}
