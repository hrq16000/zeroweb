import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTicket, replyTicket, TICKET_STATUSES_LIST } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/support/$id")({
  component: TicketPage,
});

const STATUS_LABEL: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  respondido: "Respondido",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

function TicketPage() {
  const { id } = Route.useParams();
  const ft = useServerFn(getTicket);
  const fr = useServerFn(replyTicket);
  const [data, setData] = useState<{ ticket: any; messages: any[] } | null>(null);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const load = () => ft({ data: { id } }).then((r) => setData(r as never));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await fr({
        data: {
          ticket_id: id,
          body,
          new_status: (status || undefined) as never,
        },
      });
      setBody("");
      setStatus("");
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  const t = data.ticket;
  return (
    <div className="max-w-3xl">
      <Link to="/app/support" className="text-xs text-muted-foreground hover:text-foreground">
        ← Suporte
      </Link>
      <div className="mt-2 flex justify-between gap-3">
        <h1 className="text-2xl font-bold font-display">{t.subject}</h1>
        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary capitalize">
          {STATUS_LABEL[t.status] || t.status}
        </span>
      </div>

      <ul className="mt-6 space-y-3">
        {data.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-xl border border-border p-4 ${m.author_role === "client" ? "bg-card" : "bg-primary/5"}`}
          >
            <div className="text-[11px] uppercase text-muted-foreground">
              {m.author_role === "client" ? "Você" : "Equipe 0WEB"} ·{" "}
              {new Date(m.created_at).toLocaleString("pt-BR")}
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 rounded-xl border border-border bg-card p-4">
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Responder…"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
        <div className="mt-3 flex justify-between items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2 py-2 rounded-lg border border-border bg-background text-xs"
          >
            <option value="">Manter status</option>
            {TICKET_STATUSES_LIST.map((s) => (
              <option key={s} value={s}>
                Marcar como {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
          >
            {busy ? "..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
