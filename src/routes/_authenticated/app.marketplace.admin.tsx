import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminListPending, adminModerate, adminDistributeRequest } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/app/marketplace/admin")({
  component: AdminModeration,
});

function AdminModeration() {
  const list = useServerFn(adminListPending);
  const mod = useServerFn(adminModerate);
  const dist = useServerFn(adminDistributeRequest);
  const [data, setData] = useState<any>({ providers: [], companies: [], reviews: [], requests: [] });
  const [tab, setTab] = useState<"providers" | "companies" | "reviews" | "requests">("providers");
  const [error, setError] = useState("");

  const load = () => { void list().then(setData).catch((e) => setError(e.message)); };
  useEffect(load, [list]);

  const act = async (target_type: string, target_id: string, action: string) => {
    try { await mod({ data: { target_type: target_type as never, target_id, action: action as never } }); load(); }
    catch (e: any) { setError(e.message); }
  };

  const distribute = async (request_id: string) => {
    const target_id = prompt("ID do prestador/empresa:");
    const target_type = (prompt("Tipo (provider/company):") || "provider") as "provider" | "company";
    if (!target_id) return;
    try { await dist({ data: { request_id, target_type, target_id } }); load(); }
    catch (e: any) { setError(e.message); }
  };

  if (error.includes("Forbidden")) return <p className="text-muted-foreground">Acesso restrito a administradores.</p>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-2">Moderação Marketplace</h1>
      {error && <p className="text-sm text-destructive mb-3">{error}</p>}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["providers","companies","reviews","requests"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm border-b-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "providers" && (
        <div className="space-y-2">
          {data.providers.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="text-sm"><strong>{p.display_name}</strong> · {p.city}/{p.state} · <em>{p.status}</em>{p.verified && " ✓"}</div>
              <div className="flex gap-1">
                <button onClick={() => act("provider", p.id, "approve")} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Aprovar</button>
                <button onClick={() => act("provider", p.id, "verify")} className="text-xs px-2 py-1 rounded bg-muted">Verificar</button>
                <button onClick={() => act("provider", p.id, "suspend")} className="text-xs px-2 py-1 rounded bg-muted">Suspender</button>
                <button onClick={() => act("provider", p.id, "block")} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">Bloquear</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "companies" && (
        <div className="space-y-2">
          {data.companies.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="text-sm"><strong>{c.trade_name}</strong> · {c.city}/{c.state} · <em>{c.status}</em>{c.verified && " ✓"}</div>
              <div className="flex gap-1">
                <button onClick={() => act("company", c.id, "approve")} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Aprovar</button>
                <button onClick={() => act("company", c.id, "verify")} className="text-xs px-2 py-1 rounded bg-muted">Verificar</button>
                <button onClick={() => act("company", c.id, "suspend")} className="text-xs px-2 py-1 rounded bg-muted">Suspender</button>
                <button onClick={() => act("company", c.id, "block")} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">Bloquear</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reviews" && (
        <div className="space-y-2">
          {data.reviews.map((r: any) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="text-sm flex justify-between">
                <span><strong>{r.author_name}</strong> · ★ {r.rating} · <em>{r.status}</em></span>
                <div className="flex gap-1">
                  <button onClick={() => act("review", r.id, "approve")} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Aprovar</button>
                  <button onClick={() => act("review", r.id, "reject")} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">Rejeitar</button>
                </div>
              </div>
              {r.comment && <p className="text-xs text-muted-foreground mt-2">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-2">
          {data.requests.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="text-sm"><strong>{r.title}</strong> · {r.city}/{r.state} · <em>{r.status}</em></div>
              <div className="flex gap-1">
                <button onClick={() => distribute(r.id)} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">Distribuir</button>
                <button onClick={() => act("request", r.id, "reopen")} className="text-xs px-2 py-1 rounded bg-muted">Reabrir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
