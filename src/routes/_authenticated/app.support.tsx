import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyTickets, createTicket } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/support")({
  component: SupportPage,
});

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  respondido: "Respondido",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

function SupportPage() {
  const fl = useServerFn(listMyTickets);
  const fc = useServerFn(createTicket);
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", priority: "normal" as const });
  const [busy, setBusy] = useState(false);

  const load = () => fl().then((r) => setRows(r.rows as any[]));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fc({ data: form });
      setForm({ subject: "", body: "", priority: "normal" });
      setOpen(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Suporte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Suas solicitações.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          + Nova solicitação
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {rows.map((t) => (
          <li key={t.id}>
            <Link
              to="/app/support/$id"
              params={{ id: t.id }}
              className="block rounded-xl border border-border bg-card p-4 hover:border-primary"
            >
              <div className="flex justify-between gap-3">
                <div className="font-medium">{t.subject}</div>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">
                  {STATUS_LABEL[t.status] || t.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Aberto em {new Date(t.created_at).toLocaleString("pt-BR")}
              </div>
            </Link>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Sem solicitações ainda.
          </li>
        )}
      </ul>

      {open && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-5" onClick={() => setOpen(false)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-2xl border border-border p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold font-display">Nova solicitação</h2>
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Assunto"
              className="mt-4 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Descreva sua solicitação"
              className="mt-3 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
              >
                {busy ? "..." : "Abrir solicitação"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
