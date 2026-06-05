import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Nova senha · 0WEB" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ResetPage,
  ssr: false,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    // Supabase reads the recovery token from the URL hash automatically on load.
  }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else navigate({ to: "/app", replace: true });
  };
  return (
    <div className="min-h-screen grid place-items-center bg-background px-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="text-2xl font-bold font-display">Definir nova senha</h1>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nova senha"
          className="mt-5 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm"
        />
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <button
          disabled={busy}
          className="mt-5 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {busy ? "..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
