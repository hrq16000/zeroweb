// Server functions for the client area (área do cliente).
// All functions are protected by requireSupabaseAuth and re-validate
// role/ownership server-side. RLS is the backstop.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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

async function isAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "collaborator"]);
  return (data ?? []).some((r) => (r.role as string) === "admin" || (r.role as string) === "collaborator");
}

// ── Profile ───────────────────────────────────────────────────
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      profile,
      roles: (roles ?? []).map((r) => r.role as string),
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
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Projects ──────────────────────────────────────────────────
export const listMyProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });

export const getProjectDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const [{ data: project, error: e1 }, { data: docs, error: e2 }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("project_documents").select("*").eq("project_id", data.id).order("created_at", { ascending: false }),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    if (!project) throw new Error("Projeto não encontrado");
    return { project, documents: docs ?? [] };
  });

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
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
    const { supabase, userId } = context;
    const { data: doc, error } = await supabase
      .from("project_documents")
      .select("file_path,url,projects(client_id)")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !doc) throw new Error("Documento não encontrado");
    if (doc.url) return { url: doc.url as string };
    if (!doc.file_path) throw new Error("Documento sem arquivo");
    const admin = await isAdmin(userId);
    const proj = doc.projects as { client_id: string } | null;
    if (!admin && proj?.client_id !== userId) throw new Error("Sem acesso");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sig, error: sigErr } = await supabaseAdmin.storage
      .from("client-docs")
      .createSignedUrl(doc.file_path as string, 60 * 5);
    if (sigErr || !sig) throw new Error(sigErr?.message ?? "Falha ao gerar link");
    return { url: sig.signedUrl };
  });

// ── Support tickets ───────────────────────────────────────────
export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
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
    const { supabase, userId } = context;
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        client_id: userId,
        subject: data.subject,
        body: data.body,
        project_id: data.project_id ?? null,
        priority: data.priority,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      author_id: userId,
      author_role: "client",
      body: data.body,
    });
    return { id: ticket.id };
  });

export const getTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const [{ data: ticket, error: e1 }, { data: msgs, error: e2 }] = await Promise.all([
      supabase.from("support_tickets").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("ticket_messages").select("*").eq("ticket_id", data.id).order("created_at"),
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
    const { supabase, userId } = context;
    const admin = await isAdmin(userId);
    const role = admin ? "admin" : "client";
    const { error: e1 } = await supabase.from("ticket_messages").insert({
      ticket_id: data.ticket_id,
      author_id: userId,
      author_role: role,
      body: data.body,
    });
    if (e1) throw new Error(e1.message);
    const patch: { updated_at: string; status?: string } = { updated_at: new Date().toISOString() };
    if (data.new_status) patch.status = data.new_status;
    else if (admin) patch.status = "respondido";
    const { error: e2 } = await supabase.from("support_tickets").update(patch).eq("id", data.ticket_id);
    if (e2) throw new Error(e2.message);
    // Notify the other party
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: t } = await supabaseAdmin
      .from("support_tickets")
      .select("client_id,subject")
      .eq("id", data.ticket_id)
      .maybeSingle();
    if (t) {
      const notifyUser = admin ? (t.client_id as string) : null;
      if (notifyUser) {
        await supabaseAdmin.from("notifications").insert({
          user_id: notifyUser,
          kind: "ticket_reply",
          title: "Nova resposta no suporte",
          body: t.subject as string,
          link: "/app/support/" + data.ticket_id,
        });
      }
    }
    return { ok: true };
  });

// ── Notifications ─────────────────────────────────────────────
export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
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
    const { supabase } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ── Reports (consumes existing analytics) ─────────────────────
export const getMyReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: projects }, { data: events }, { data: leads }] = await Promise.all([
      supabase.from("projects").select("id,name,status").limit(50),
      supabaseAdmin
        .from("analytics_events")
        .select("event_name,created_at")
        .gte("created_at", since)
        .limit(20000),
      supabaseAdmin
        .from("lead_submissions")
        .select("id,created_at,status")
        .gte("created_at", since)
        .limit(2000),
    ]);
    const visits = (events ?? []).filter((e) => e.event_name === "page_view").length;
    const ctaClicks = (events ?? []).filter((e) => e.event_name === "cta_click").length;
    const waClicks = (events ?? []).filter((e) => e.event_name === "whatsapp_click").length;
    const leadsCount = (leads ?? []).length;
    const conversoes = (leads ?? []).filter((l) => l.status === "fechado").length;
    return {
      visits,
      cta_clicks: ctaClicks,
      wa_clicks: waClicks,
      leads: leadsCount,
      conversoes,
      projects: projects ?? [],
    };
  });

// ── Admin functions ───────────────────────────────────────────
export const adminListClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }, { data: projects }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      supabaseAdmin.from("user_roles").select("user_id,role"),
      supabaseAdmin.from("projects").select("id,client_id,name,status"),
    ]);
    const rolesMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = rolesMap.get(r.user_id as string) ?? [];
      arr.push(r.role as string);
      rolesMap.set(r.user_id as string, arr);
    }
    const projMap = new Map<string, { id: string; name: string; status: string }[]>();
    for (const p of projects ?? []) {
      const arr = projMap.get(p.client_id as string) ?? [];
      arr.push({ id: p.id as string, name: p.name as string, status: p.status as string });
      projMap.set(p.client_id as string, arr);
    }
    return {
      rows: (profiles ?? []).map((p) => ({
        ...p,
        roles: rolesMap.get(p.id as string) ?? [],
        projects: projMap.get(p.id as string) ?? [],
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
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
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
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "project.create",
      entity: "project",
      entity_id: row.id,
      meta: { name: data.name },
    });
    await supabaseAdmin.from("notifications").insert({
      user_id: data.client_id,
      kind: "project_created",
      title: "Novo projeto adicionado",
      body: data.name,
      link: "/app/projects/" + row.id,
    });
    return { id: row.id };
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
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("projects").update(patch as never).eq("id", id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "project.update",
      entity: "project",
      entity_id: id,
      meta: patch as never,
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
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("project_documents").insert({
      project_id: data.project_id,
      title: data.title,
      kind: data.kind,
      url: data.url ?? null,
      created_by: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListAllTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
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
        role: z.enum(["admin", "collaborator", "client"]),
        action: z.enum(["add", "remove"]),
      })
      .parse(i)
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    if (!(await isAdmin(userId))) throw new Error("Acesso negado");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.action === "add") {
      await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: data.role });
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    }
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: userId,
      action: "role." + data.action,
      entity: "user",
      entity_id: data.user_id,
      meta: { role: data.role },
    });
    return { ok: true };
  });
