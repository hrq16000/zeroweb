import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, FolderKanban, FileText, LifeBuoy, BarChart3, User, LogOut, Shield, Home, Globe, Layers, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, listMyNotifications } from "@/lib/clientarea.functions";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchNotif = useServerFn(listMyNotifications);
  const [me, setMe] = useState<{ profile: any; roles: string[] } | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void fetchProfile().then((r) => setMe(r as never));
    void fetchNotif().then((r) =>
      setUnread((r.rows as { read_at: string | null }[]).filter((n) => !n.read_at).length)
    );
  }, [fetchProfile, fetchNotif, location.pathname]);

  const isAdmin = me?.roles.includes("admin") || me?.roles.includes("collaborator");

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = [
    { to: "/app", icon: Home, label: "Início", end: true },
    { to: "/app/projects", icon: FolderKanban, label: "Projetos" },
    { to: "/app/documents", icon: FileText, label: "Documentos" },
    { to: "/app/support", icon: LifeBuoy, label: "Suporte" },
    { to: "/app/reports", icon: BarChart3, label: "Relatórios" },
    { to: "/app/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-border bg-card/50 hidden lg:flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <Link to="/" className="text-lg font-bold font-display">
            0WEB
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Área do Cliente</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = n.end ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-border text-[10px] uppercase text-muted-foreground px-3">
                Administração
              </div>
              <Link
                to="/app/admin"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  location.pathname.startsWith("/app/admin")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Painel admin
              </Link>
              <Link
                to="/app/master"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  location.pathname.startsWith("/app/master")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Globe className="w-4 h-4" />
                Dashboard Master
              </Link>
              <Link
                to="/app/portals"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  location.pathname.startsWith("/app/portals")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Layers className="w-4 h-4" />
                Portais
              </Link>
              <Link
                to="/app/campaigns"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  location.pathname.startsWith("/app/campaigns")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Target className="w-4 h-4" />
                Campanhas
              </Link>
            </>
          )}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2">
            <div className="text-sm font-medium truncate">{me?.profile?.full_name || me?.profile?.email}</div>
            <div className="text-xs text-muted-foreground truncate">{me?.profile?.company || "Cliente"}</div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-5 lg:px-8">
          <div className="text-sm text-muted-foreground">
            Bem-vindo, <strong className="text-foreground">{me?.profile?.full_name || "—"}</strong>
          </div>
          <Link to="/app/notifications" className="relative p-2 rounded-lg hover:bg-muted">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">
                {unread}
              </span>
            )}
          </Link>
        </header>
        <main className="flex-1 p-5 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
