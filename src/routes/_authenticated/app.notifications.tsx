import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyNotifications, markNotificationsRead } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const f = useServerFn(listMyNotifications);
  const m = useServerFn(markNotificationsRead);
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const r = await f();
    setRows(r.rows as any[]);
    const unread = (r.rows as any[]).filter((n) => !n.read_at).map((n) => n.id);
    if (unread.length) await m({ data: { ids: unread } });
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold font-display">Notificações</h1>
      <ul className="mt-6 space-y-2">
        {rows.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 ${n.read_at ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}
          >
            <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("pt-BR")}</div>
            <div className="font-medium mt-1">{n.title}</div>
            {n.body && <div className="text-sm text-muted-foreground mt-1">{n.body}</div>}
            {n.link && (
              <a href={n.link} className="text-xs text-primary hover:underline mt-2 inline-block">
                Abrir →
              </a>
            )}
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Sem notificações.
          </li>
        )}
      </ul>
    </div>
  );
}
