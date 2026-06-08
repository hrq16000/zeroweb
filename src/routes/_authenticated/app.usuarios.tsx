import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  adminListUsers,
  adminGetUserDetail,
  adminUpdateUserProfile,
  adminSetUserRole,
  adminLinkVisitorToUser,
  adminAssignOrderToUser,
  adminListOrphanVisitors,
  adminListOrphanOrders,
} from "@/lib/users-admin.functions";
import { Search, X, Save, Link2, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/usuarios")({
  component: UsersAdmin,
});

const BRL = (v: number) =>
  `R$ ${Number(v ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type UserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  company: string | null;
  user_ref: string | null;
  created_at: string;
  roles: string[];
  orders_count: number;
  orders_total: number;
  orders_paid: number;
};

function UsersAdmin() {
  const listFn = useServerFn(adminListUsers);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | "admin" | "collaborator" | "customer">("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listFn({ data: { q, role, page, pageSize: 25 } });
      setRows(r.users as UserRow[]);
      setTotal(r.total);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listFn, q, role, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-display">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro completo: perfil, papéis, pedidos, visitas, funis e identidades vinculadas.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {total.toLocaleString("pt-BR")} usuário{total === 1 ? "" : "s"}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Buscar por nome, email, telefone, empresa, USR-…"
            className="pl-9"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as typeof role);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">Todos</option>
          <option value="admin">Admin</option>
          <option value="collaborator">Colaborador</option>
          <option value="customer">Cliente (sem papel)</option>
        </select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Usuário</th>
                <th className="text-left px-3 py-2 hidden md:table-cell">Contato</th>
                <th className="text-left px-3 py-2 hidden lg:table-cell">Papéis</th>
                <th className="text-right px-3 py-2">Pedidos</th>
                <th className="text-right px-3 py-2 hidden md:table-cell">Pago</th>
                <th className="text-right px-3 py-2 hidden lg:table-cell">Cadastro</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" /> Carregando…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <div className="font-medium">{u.full_name || u.display_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.user_ref || u.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <div className="text-xs">{u.email || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.phone || "—"}</div>
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">cliente</span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map((r) => (
                          <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{u.orders_count}</td>
                  <td className="px-3 py-2 text-right tabular-nums hidden md:table-cell">{BRL(u.orders_paid)}</td>
                  <td className="px-3 py-2 text-right text-xs text-muted-foreground hidden lg:table-cell">
                    {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setActiveUser(u.id)}
                      className="text-xs px-3 py-1 rounded-md border border-border hover:border-primary hover:text-primary"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50"
        >
          ← Anterior
        </button>
        <div className="text-muted-foreground">
          Página {page} de {pages}
        </div>
        <button
          disabled={page >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          className="px-3 py-1.5 rounded-md border border-border disabled:opacity-50"
        >
          Próxima →
        </button>
      </div>

      {activeUser && (
        <UserDetailDrawer
          userId={activeUser}
          onClose={() => setActiveUser(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Detail = any;

function UserDetailDrawer({
  userId,
  onClose,
  onChanged,
}: {
  userId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const detailFn = useServerFn(adminGetUserDetail);
  const updateFn = useServerFn(adminUpdateUserProfile);
  const setRoleFn = useServerFn(adminSetUserRole);
  const linkVisitorFn = useServerFn(adminLinkVisitorToUser);
  const assignOrderFn = useServerFn(adminAssignOrderToUser);
  const orphanVisitorsFn = useServerFn(adminListOrphanVisitors);
  const orphanOrdersFn = useServerFn(adminListOrphanOrders);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [tab, setTab] = useState("perfil");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    display_name: "",
    company: "",
    phone: "",
    email: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orphanVisits, setOrphanVisits] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orphanOrders, setOrphanOrders] = useState<any[]>([]);
  const [orphanQ, setOrphanQ] = useState("");

  const reload = useCallback(async () => {
    const r = await detailFn({ data: { userId } });
    setDetail(r);
    setForm({
      full_name: r.profile?.full_name ?? "",
      display_name: r.profile?.display_name ?? "",
      company: r.profile?.company ?? "",
      phone: r.profile?.phone ?? "",
      email: r.profile?.email ?? "",
    });
  }, [detailFn, userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadOrphans = useCallback(async () => {
    const [v, o] = await Promise.all([
      orphanVisitorsFn({ data: { q: orphanQ, limit: 20 } }),
      orphanOrdersFn({ data: { q: orphanQ, limit: 20 } }),
    ]);
    setOrphanVisits(v.visits);
    setOrphanOrders(o.orders);
  }, [orphanVisitorsFn, orphanOrdersFn, orphanQ]);

  useEffect(() => {
    if (tab === "vincular") void loadOrphans();
  }, [tab, loadOrphans]);

  const save = async () => {
    setSaving(true);
    try {
      await updateFn({ data: { userId, ...form } });
      toast.success("Perfil atualizado");
      await reload();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = async (r: "admin" | "collaborator" | "admin_integrations", has: boolean) => {
    try {
      await setRoleFn({ data: { userId, role: r, grant: !has } });
      toast.success(has ? `Papel ${r} removido` : `Papel ${r} concedido`);
      await reload();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const linkVisitor = async (vid: string) => {
    try {
      const r = await linkVisitorFn({ data: { visitorId: vid, userId } });
      toast.success(`Vinculadas ${r.stitched} visitas`);
      await reload();
      await loadOrphans();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const assignOrder = async (orderId: string) => {
    try {
      await assignOrderFn({ data: { orderId, userId } });
      toast.success("Pedido vinculado");
      await reload();
      await loadOrphans();
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const roles: string[] = detail?.roles ?? [];
  const ordersTotal = useMemo(
    () =>
      ((detail?.orders ?? []) as { total: number }[]).reduce((s, o) => s + Number(o.total ?? 0), 0),
    [detail?.orders],
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute right-0 top-0 bottom-0 w-full sm:w-[640px] bg-card border-l border-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Usuário</div>
            <div className="font-bold truncate">
              {detail?.profile?.full_name || detail?.profile?.display_name || detail?.profile?.email || userId.slice(0, 8)}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!detail && (
          <div className="p-10 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Carregando…
          </div>
        )}

        {detail && (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <Stat label="Pedidos" value={String(detail.orders.length)} />
              <Stat label="Total" value={BRL(ordersTotal)} />
              <Stat label="Visitas" value={String(detail.visits.length)} />
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos ({detail.orders.length})</TabsTrigger>
                <TabsTrigger value="leads">Funis/Leads ({detail.leads.length})</TabsTrigger>
                <TabsTrigger value="visitas">Visitas ({detail.visits.length})</TabsTrigger>
                <TabsTrigger value="identidades">Identidades ({detail.identities.length})</TabsTrigger>
                <TabsTrigger value="vincular">Vincular</TabsTrigger>
              </TabsList>

              <TabsContent value="perfil" className="space-y-4 pt-4">
                <Field label="Nome completo" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                <Field label="Nome de exibição" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} />
                <Field label="Empresa" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar perfil
                </button>

                <div className="pt-5 mt-5 border-t border-border">
                  <div className="text-sm font-semibold mb-2">Papéis</div>
                  <div className="flex flex-wrap gap-2">
                    {(["admin", "collaborator", "admin_integrations"] as const).map((r) => {
                      const has = roles.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() => toggleRole(r, has)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border ${
                            has
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {has ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 text-xs text-muted-foreground">
                  Criado em {new Date(detail.profile?.created_at ?? Date.now()).toLocaleString("pt-BR")}
                  {detail.profile?.user_ref && <> · ref {detail.profile.user_ref}</>}
                </div>
              </TabsContent>

              <TabsContent value="pedidos" className="pt-4 space-y-2">
                {detail.orders.length === 0 && <Empty>Sem pedidos.</Empty>}
                {detail.orders.map((o: { id: string; total: number; status: string; payment_method: string | null; created_at: string; items: unknown[] }) => (
                  <div key={o.id} className="border border-border rounded-lg p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <div className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}</div>
                      <div className="text-xs">{new Date(o.created_at).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted">{o.status}</span>
                      <strong>{BRL(o.total)}</strong>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {o.payment_method || "—"} · {Array.isArray(o.items) ? o.items.length : 0} item(ns)
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="leads" className="pt-4 space-y-2">
                {detail.leads.length === 0 && <Empty>Sem leads/funis.</Empty>}
                {detail.leads.map((l: { id: string; name: string | null; source: string | null; offer_slug: string | null; score: number; pipeline_stage: string | null; created_at: string }) => (
                  <div key={l.id} className="border border-border rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <strong>{l.name || "—"}</strong>
                      <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {l.source} · {l.offer_slug || "—"} · score {l.score} · {l.pipeline_stage || "—"}
                    </div>
                  </div>
                ))}
                {detail.funnelSessions.map((s: { id: string; funnel_slug: string; current_step: number; status: string; updated_at: string }) => (
                  <div key={s.id} className="border border-border rounded-lg p-3 text-sm bg-muted/30">
                    <div className="flex justify-between">
                      <strong>{s.funnel_slug}</strong>
                      <span className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      etapa {s.current_step} · {s.status}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="visitas" className="pt-4 space-y-2">
                {detail.visits.length === 0 && <Empty>Sem visitas vinculadas.</Empty>}
                {detail.visits.map((v: { id: string; visitor_id: string; day: string; utm_campaign: string | null; city: string | null; country: string | null }) => (
                  <div key={v.id} className="border border-border rounded-lg p-3 text-xs flex justify-between gap-2">
                    <div>
                      <div className="font-mono">{v.visitor_id}</div>
                      <div className="text-muted-foreground">
                        {v.utm_campaign || "direct"} · {v.city || "—"} {v.country ? `(${v.country})` : ""}
                      </div>
                    </div>
                    <div className="text-muted-foreground">{v.day}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="identidades" className="pt-4 space-y-2">
                {detail.identities.length === 0 && <Empty>Sem identidades CRM vinculadas.</Empty>}
                {detail.identities.map((row: { identity_id: string; customer_identities: { id: string; primary_email: string | null; primary_phone: string | null; full_name: string | null } | null }) => {
                  const ci = row.customer_identities;
                  return (
                    <div key={row.identity_id} className="border border-border rounded-lg p-3 text-sm">
                      <strong>{ci?.full_name || "—"}</strong>
                      <div className="text-xs text-muted-foreground mt-1">
                        {ci?.primary_email || "sem email"} · {ci?.primary_phone || "sem telefone"}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="vincular" className="pt-4 space-y-4">
                <Input
                  placeholder="Buscar visitante/pedido por email, telefone, visitor_id, utm…"
                  value={orphanQ}
                  onChange={(e) => setOrphanQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadOrphans()}
                />
                <button
                  onClick={loadOrphans}
                  className="text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary"
                >
                  Buscar órfãos
                </button>

                <div>
                  <div className="text-sm font-semibold mb-2">Pedidos sem dono ou com outro dono</div>
                  {orphanOrders.length === 0 && <Empty>Nada encontrado.</Empty>}
                  <div className="space-y-2">
                    {orphanOrders.map((o) => (
                      <div key={o.id} className="border border-border rounded-lg p-3 text-sm flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">{o.customer_email || o.customer_phone || "sem contato"}</div>
                          <div>{BRL(o.total)} · {o.status}</div>
                        </div>
                        <button
                          onClick={() => assignOrder(o.id)}
                          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Vincular
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Visitas órfãs</div>
                  {orphanVisits.length === 0 && <Empty>Nada encontrado.</Empty>}
                  <div className="space-y-2">
                    {orphanVisits.map((v) => (
                      <div key={v.id} className="border border-border rounded-lg p-3 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="font-mono">{v.visitor_id}</div>
                          <div className="text-muted-foreground">
                            {v.utm_campaign || "direct"} · {v.city || "—"} · {new Date(v.created_at).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                        <button
                          onClick={() => linkVisitor(v.visitor_id)}
                          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Vincular
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3 bg-muted/30">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
    </label>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground text-center py-6">{children}</div>;
}
