import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Recuperação desativada · 0WEB" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPage,
  ssr: false,
});

function ResetPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-bold font-display">Recuperação indisponível</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          O acesso à plataforma é exclusivo via conta Google. Não há senha para
          recuperar.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block py-3 px-5 rounded-xl bg-primary text-primary-foreground font-medium"
        >
          Entrar com Google
        </Link>
      </div>
    </div>
  );
}
