import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, updateMyProfile } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const f = useServerFn(getMyProfile);
  const u = useServerFn(updateMyProfile);
  const [me, setMe] = useState<any | null>(null);
  const [form, setForm] = useState({ full_name: "", company: "", phone: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void f().then((r) => {
      setMe(r);
      setForm({
        full_name: r.profile?.full_name ?? "",
        company: r.profile?.company ?? "",
        phone: r.profile?.phone ?? "",
      });
    });
  }, [f]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await u({ data: form });
      setMsg("Salvo.");
    } finally {
      setBusy(false);
    }
  };

  if (!me) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold font-display">Perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">Seus dados de cadastro.</p>

      <form onSubmit={submit} className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
        <Field label="Nome">
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </Field>
        <Field label="Empresa">
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </Field>
        <Field label="Telefone">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <Read label="Email" value={me.profile?.email} />
          <Read label="Plano" value={me.profile?.plan} />
          <Read label="Status" value={me.profile?.status} />
          <Read
            label="Cadastro"
            value={me.profile?.created_at ? new Date(me.profile.created_at).toLocaleDateString("pt-BR") : "—"}
          />
          <Read label="Papéis" value={me.roles.join(", ") || "client"} />
        </div>
        {msg && <p className="text-xs text-emerald-500">{msg}</p>}
        <button disabled={busy} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          {busy ? "..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Read({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
      <div className="text-sm">{value || "—"}</div>
    </div>
  );
}
