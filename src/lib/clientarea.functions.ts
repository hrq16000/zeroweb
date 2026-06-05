// Server functions for the client area. Uses untyped supabase clients
// because the auto-generated Database types do not include the new tables
// (profiles, projects, etc.) until the typegen step regenerates the file.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

const PROJECT_STATUSES = [
  "recebido",
  "planejamento",
  "producao",
  "revisao",
  "publicacao",
  "concluido",
] as const;
export const PROJECT_STATUSES_LIST = PROJECT_STATUSES;

const TICKET_STATUSES = ["aberto", "em_andamento", "respondido", "resolvido", "fechado"] as const;
export const TICKET_STATUSES_LIST = TICKET_STATUSES;

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

async function isAdmin(userId: string) {
  const sb = await getAdmin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "collaborator");
}

// ── Profile ───────────────────────────────────────────────────
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
      sb.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      profile,
      roles: (roles ?? []).map((r: { role: string }) => r.role),
      userId,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        full_name: z.string().min(1).max(200).optional(),
        company: z.string().max(200).optional(),
        phone: z.string().max(40).optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { error } = await sb
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Projects ──────────────────────────────────────────────────
export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data, error } = await sb.from("projects").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const getProjectDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const [{ data: project, error: e1 }, { data: docs, error: e2 }] = await Promise.all([
      sb.from("projects").select("*").eq("id", data.id).maybeSingle(),
      sb
        .from("project_documents")
        .select("*")
        .eq("project_id", data.id)
        .order("created_at", { ascending: false }),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    if (!project) throw new Error("Projeto não encontrado");
    return { project, documents: docs ?? [] };
  });

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data, error } = await sb
      .from("project_documents")
      .select("id,title,kind,url,file_path,mime_type,created_at,project_id, projects(name)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const getDocumentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data: doc, error } = await sb
      .from("project_documents")
      .select("file_path,url,projects(client_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !doc) throw new Error("Documento não encontrado");
    if (doc.url) return { url: doc.url as string };
    if (!doc.file_path) throw new Error("Documento sem arquivo");
    const admin = await isAdmin(context.userId);
    if (!admin && doc.projects?.client_id !== context.userId) throw new Error("Sem acesso");
    const sbAdmin = await getAdmin();
    const { data: sig, error: sigErr } = await sbAdmin.storage
      .from("client-docs")
      .createSignedUrl(doc.file_path as string, 60 * 5);
    if (sigErr || !sig) throw new Error(sigErr?.message ?? "Falha ao gerar link");
    return { url: sig.signedUrl };
  });

// ── Tickets ───────────────────────────────────────────────────
export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data, error } = await sb
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        subject: z.string().min(3).max(200),
        body: z.string().min(3).max(5000),
        project_id: z.string().uuid().nullable().optional(),
        priority: z.enum(["low", "normal", "high"]).default("normal"),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data: ticket, error } = await sb
      .from("support_tickets")
      .insert({
        client_id: context.userId,
        subject: data.subject,
        body: data.body,
        project_id: data.project_id ?? null,
        priority: data.priority,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await sb.from("ticket_messages").insert({
      ticket_id: ticket.id,
      author_id: context.userId,
      author_role: "client",
      body: data.body,
    });
    return { id: ticket.id as string };
  });

export const getTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const [{ data: ticket, error: e1 }, { data: msgs, error: e2 }] = await Promise.all([
      sb.from("support_tickets").select("*").eq("id", data.id).maybeSingle(),
      sb.from("ticket_messages").select("*").eq("ticket_id", data.id).order("created_at"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    if (!ticket) throw new Error("Ticket não encontrado");
    return { ticket, messages: msgs ?? [] };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        ticket_id: z.string().uuid(),
        body: z.string().min(1).max(5000),
        new_status: z.enum(TICKET_STATUSES).optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    const admin = await isAdmin(context.userId);
    await sb.from("ticket_messages").insert({
      ticket_id: data.ticket_id,
      author_id: context.userId,
      author_role: admin ? "admin" : "client",
      body: data.body,
    });
    const patch: { updated_at: string; status?: string } = { updated_at: new Date().toISOString() };
    if (data.new_status) patch.status = data.new_status;
    else if (admin) patch.status = "respondido";
    await sb.from("support_tickets").update(patch).eq("id", data.ticket_id);
    const sbAdmin = await getAdmin();
    const { data: t } = await sbAdmin
      .from("support_tickets")
      .select("client_id,subject")
      .eq("id", data.ticket_id)
      .maybeSingle();
    if (t && admin) {
      await sbAdmin.from("notifications").insert({
        user_id: t.client_id,
        kind: "ticket_reply",
        title: "Nova resposta no suporte",
        body: t.subject,
        link: "/app/support/" + data.ticket_id,
      });
    }
    return { ok: true };
  });

// ── Notifications ─────────────────────────────────────────────
export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const { data, error } = await sb
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ ids: z.array(z.string().uuid()).max(200) }).parse(i))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as AnyClient;
    await sb.from("notifications").update({ read_at: new Date().toISOString() }).in("id", data.ids);
    return { ok: true };
  });

// ── Reports ───────────────────────────────────────────────────
export const getMyReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as AnyClient;
    const sbAdmin = await getAdmin();
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [{ data: projects }, { data: events }, { data: leads }] = await Promise.all([
      sb.from("projects").select("id,name,status").limit(50),
      sbAdmin.from("analytics_events").select("event_name,created_at").gte("created_at", since).limit(20000),
      sbAdmin.from("lead_submissions").select("id,created_at,status").gte("created_at", since).limit(2000),
    ]);
    const visits = (events ?? []).filter((e: { event_name: string }) => e.event_name === "page_view").length;
    const cta = (events ?? []).filter((e: { event_name: string }) => e.event_name === "cta_click").length;
    const wa = (events ?? []).filter((e: { event_name: string }) => e.event_name === "whatsapp_click").length;
    return {
      visits,
      cta_clicks: cta,
      wa_clicks: wa,
      leads: (leads ?? []).length,
      conversoes: (leads ?? []).filter((l: { status: string }) => l.status === "fechado").length,
      projects: projects ?? [],
    };
  });

// ── Admin ─────────────────────────────────────────────────────
export const adminListClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const [{ data: profiles }, { data: roles }, { data: projects }] = await Promise.all([
      sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      sb.from("user_roles").select("user_id,role"),
      sb.from("projects").select("id,client_id,name,status"),
    ]);
    const rolesMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }
    const projMap = new Map<string, { id: string; name: string; status: string }[]>();
    for (const p of projects ?? []) {
      const arr = projMap.get(p.client_id) ?? [];
      arr.push({ id: p.id, name: p.name, status: p.status });
      projMap.set(p.client_id, arr);
    }
    return {
      rows: (profiles ?? []).map((p: { id: string }) => ({
        ...p,
        roles: rolesMap.get(p.id) ?? [],
        projects: projMap.get(p.id) ?? [],
      })),
    };
  });

export const adminCreateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        client_id: z.string().uuid(),
        name: z.string().min(2).max(200),
        description: z.string().max(2000).optional(),
        status: z.enum(PROJECT_STATUSES).default("recebido"),
        owner: z.string().max(120).optional(),
        start_date: z.string().optional(),
        due_date: z.string().optional(),
        deliverables: z.string().max(2000).optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data: row, error } = await sb
      .from("projects")
      .insert({
        client_id: data.client_id,
        name: data.name,
        description: data.description ?? null,
        status: data.status,
        owner: data.owner ?? null,
        start_date: data.start_date || null,
        due_date: data.due_date || null,
        deliverables: data.deliverables ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await sb.from("audit_logs").insert({
      actor_id: context.userId,
      action: "project.create",
      entity: "project",
      entity_id: row.id,
      meta: { name: data.name },
    });
    await sb.from("notifications").insert({
      user_id: data.client_id,
      kind: "project_created",
      title: "Novo projeto adicionado",
      body: data.name,
      link: "/app/projects/" + row.id,
    });
    return { id: row.id as string };
  });

export const adminUpdateProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(2).max(200).optional(),
        description: z.string().max(2000).nullable().optional(),
        status: z.enum(PROJECT_STATUSES).optional(),
        owner: z.string().max(120).nullable().optional(),
        start_date: z.string().nullable().optional(),
        due_date: z.string().nullable().optional(),
        deliverables: z.string().max(2000).nullable().optional(),
        notes: z.string().max(5000).nullable().optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { id, ...patch } = data;
    const { error } = await sb.from("projects").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await sb.from("audit_logs").insert({
      actor_id: context.userId,
      action: "project.update",
      entity: "project",
      entity_id: id,
      meta: patch,
    });
    return { ok: true };
  });

export const adminAddDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        project_id: z.string().uuid(),
        title: z.string().min(1).max(200),
        kind: z.enum(["proposta", "contrato", "briefing", "relatorio", "arquivo"]).default("arquivo"),
        url: z.string().url().optional(),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { error } = await sb.from("project_documents").insert({
      project_id: data.project_id,
      title: data.title,
      kind: data.kind,
      url: data.url ?? null,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListAllTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    const { data } = await sb
      .from("support_tickets")
      .select("*, profiles(full_name, company, email)")
      .order("created_at", { ascending: false })
      .limit(500);
    return { rows: data ?? [] };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        user_id: z.string().uuid(),
        role: z.enum(["admin", "collaborator", "client", "admin_integrations"]),
        action: z.enum(["add", "remove"]),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    if (!(await isAdmin(context.userId))) throw new Error("Acesso negado");
    const sb = await getAdmin();
    if (data.action === "add") {
      await sb.from("user_roles").insert({ user_id: data.user_id, role: data.role });
    } else {
      await sb.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    }
    await sb.from("audit_logs").insert({
      actor_id: context.userId,
      action: "role." + data.action,
      entity: "user",
      entity_id: data.user_id,
      meta: { role: data.role },
    });
    return { ok: true };
  });
