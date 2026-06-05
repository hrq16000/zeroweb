import { createFileRoute } from "@tanstack/react-router";
import { Plug, MessageCircle, Mail, KeyRound, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/integracoes")({
  component: Integracoes,
});

type Integration = {
  id: string;
  name: string;
  desc: string;
  status: "connected" | "available";
  icon: typeof Plug;
  action: string;
};

const integrations: Integration[] = [
  {
    id: "google",
    name: "Google (Login)",
    desc: "Autenticação dos usuários via Google.",
    status: "connected",
    icon: KeyRound,
    action: "Gerenciar",
  },
  {
    id: "uazapi",
    name: "WhatsApp (UAZAPI)",
    desc: "Envio de notificações e funil de WhatsApp.",
    status: "connected",
    icon: MessageCircle,
    action: "Configurar",
  },
  {
    id: "smtp",
    name: "E-mail transacional",
    desc: "Envio de e-mails de notificação e auth.",
    status: "available",
    icon: Mail,
    action: "Conectar",
  },
];

function Integracoes() {
  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Integrações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte serviços externos usados pelo sistema.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {integrations.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{i.name}</h2>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full ${
                        i.status === "connected"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i.status === "connected" ? "Conectado" : "Disponível"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{i.desc}</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-border hover:bg-muted inline-flex items-center justify-center gap-2"
              >
                {i.action} <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
