import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell, FolderKanban, FileText, LifeBuoy, BarChart3, User, LogOut, Shield, Home, Globe,
  Layers, Target, BookOpen, Eye, KeyRound, Network, LayoutTemplate, Fingerprint, Plug,
  Search, Briefcase, Menu, Activity, ShoppingCart, CreditCard, Users, ImageOff, Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, listMyNotifications } from "@/lib/clientarea.functions";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

type NavItem = { to: string; icon: React.ComponentType<{ className?: string }>; label: string; end?: boolean };

const CLIENT_NAV: NavItem[] = [
  { to: "/app", icon: Home, label: "Início", end: true },
  { to: "/app/projects", icon: FolderKanban, label: "Projetos" },
  { to: "/app/documents", icon: FileText, label: "Documentos" },
  { to: "/app/support", icon: LifeBuoy, label: "Suporte" },
  { to: "/app/reports", icon: BarChart3, label: "Relatórios" },
  { to: "/app/integracoes", icon: Plug, label: "Conectar" },
  { to: "/app/profile", icon: User, label: "Perfil" },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/app/admin", icon: Shield, label: "Painel admin" },
  { to: "/app/paginas", icon: LayoutTemplate, label: "Páginas & Produtos" },
  { to: "/app/usuarios", icon: Users, label: "Usuários" },
  { to: "/app/leads", icon: Inbox, label: "Leads unificados" },

  { to: "/app/servicos", icon: Briefcase, label: "Serviços" },
  { to: "/app/servicos-imagens", icon: ImageOff, label: "Imagens órfãs" },
  { to: "/app/pedidos", icon: ShoppingCart, label: "Pedidos" },
  { to: "/app/pagamentos", icon: CreditCard, label: "Pagamentos" },
  { to: "/app/master", icon: Globe, label: "Dashboard Master" },
  { to: "/app/portals", icon: Layers, label: "Portais" },
  { to: "/app/campaigns", icon: Target, label: "Campanhas" },
  { to: "/app/editorial", icon: BookOpen, label: "Editorial" },
  { to: "/app/visitantes", icon: Eye, label: "Visitantes" },
  { to: "/app/cro", icon: Activity, label: "CRO · Eventos" },
  { to: "/app/licenses", icon: KeyRound, label: "Licenças" },
  { to: "/app/ecosystem", icon: Network, label: "Ecossistema" },
  { to: "/app/templates", icon: LayoutTemplate, label: "Templates" },
  { to: "/app/auditoria/identidade", icon: Fingerprint, label: "Auditoria Identidade" },
  { to: "/app/indexacao", icon: Search, label: "Indexação SEO" },
  { to: "/app/seo-404s", icon: Search, label: "404s e Redirects" },
  { to: "/app/funis", icon: LayoutTemplate, label: "Funis dinâmicos" },
];

function NavLinks({
  items, pathname, onNavigate,
}: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {items.map((n) => {
        const Icon = n.icon;
        const active = n.end ? pathname === n.to : pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {n.label}
          </Link>
        );
      })}
    </>
  );
}

function NavTree({
  isAdmin, pathname, onNavigate,
}: { isAdmin: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1 text-sm overflow-y-auto">
      <NavLinks items={CLIENT_NAV} pathname={pathname} onNavigate={onNavigate} />
      {isAdmin && (
        <>
          <div className="pt-4 mt-4 border-t border-border text-[10px] uppercase tracking-wider text-muted-foreground px-3 pb-1">
            Administração
          </div>
          <NavLinks items={ADMIN_NAV} pathname={pathname} onNavigate={onNavigate} />
        </>
      )}
    </nav>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchProfile = useServerFn(getMyProfile);
  const fetchNotif = useServerFn(listMyNotifications);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [me, setMe] = useState<{ profile: any; roles: string[] } | null>(null);
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      try {
        const r = await fetchProfile();
        if (!cancelled) setMe(r as never);
      } catch { /* ignore unauth/transient */ }
      try {
        const r = await fetchNotif();
        if (!cancelled) {
          setUnread((r.rows as { read_at: string | null }[]).filter((n) => !n.read_at).length);
        }
      } catch { /* ignore unauth/transient */ }
    })();
    return () => { cancelled = true; };
  }, [fetchProfile, fetchNotif, location.pathname]);

  // fecha o drawer ao navegar
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isAdmin = !!(me?.roles.includes("admin") || me?.roles.includes("collaborator"));

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const userBlock = (
    <div className="p-3 border-t border-border">
      <div className="px-3 py-2">
        <div className="text-sm font-medium truncate">
          {me?.profile?.full_name || me?.profile?.display_name || me?.profile?.email || "—"}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {me?.profile?.company || (isAdmin ? "Administrador" : "Cliente")}
        </div>
      </div>
      <button
        onClick={signOut}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <LogOut className="w-4 h-4" /> Sair
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      {/* Sidebar desktop */}
      <aside className="w-64 shrink-0 border-r border-border bg-card/50 hidden lg:flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <Link to="/" className="text-lg font-bold font-display">0WEB</Link>
          <p className="text-xs text-muted-foreground mt-1">Área do Cliente</p>
        </div>
        <NavTree isAdmin={isAdmin} pathname={location.pathname} />
        {userBlock}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center gap-2 px-4 lg:px-8">
          {/* Trigger mobile/tablet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu de navegação"
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 flex flex-col">
              <VisuallyHidden>
                <SheetTitle>Navegação</SheetTitle>
              </VisuallyHidden>
              <div className="px-5 py-5 border-b border-border">
                <Link to="/" className="text-lg font-bold font-display" onClick={() => setMobileOpen(false)}>
                  0WEB
                </Link>
                <p className="text-xs text-muted-foreground mt-1">Área do Cliente</p>
              </div>
              <NavTree
                isAdmin={isAdmin}
                pathname={location.pathname}
                onNavigate={() => setMobileOpen(false)}
              />
              {userBlock}
            </SheetContent>
          </Sheet>

          <div className="text-sm text-muted-foreground truncate">
            Bem-vindo,{" "}
            <strong className="text-foreground">
              {me?.profile?.full_name || me?.profile?.display_name || me?.profile?.email || "—"}
            </strong>
          </div>
          <Link to="/app/notifications" className="ml-auto relative p-2 rounded-lg hover:bg-muted" aria-label="Notificações">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">
                {unread}
              </span>
            )}
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
