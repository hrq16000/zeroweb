/**
 * Tokenized WhatsApp redirect endpoint.
 *
 * The client never sees the operational WhatsApp number. Flow:
 *   1) Funnel submit persists a lead + creates a redirect token (server-side).
 *   2) Client navigates to /r/whatsapp/:token.
 *   3) This handler validates the token, marks it used, and 302s to wa.me
 *      with the fully-rendered message built server-side.
 *
 * The token is single-use and expires quickly (15 minutes by default).
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/whatsapp/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = String(params.token ?? "").trim();
        if (!/^[a-f0-9]{16,64}$/.test(token)) {
          return new Response("Invalid token", { status: 400 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabaseAdmin as any)
          .from("whatsapp_redirect_tokens")
          .select("id, token, destination_digits, message, expires_at, used_at")
          .eq("token", token)
          .maybeSingle();

        if (error || !data) {
          return htmlErrorPage(
            "Link expirado ou inválido",
            "Volte ao site e envie novamente sua solicitação.",
          );
        }

        const now = Date.now();
        const expired =
          data.expires_at && new Date(data.expires_at).getTime() < now;
        // Single-use: allow re-use within a 60s window (mobile double-tap safety).
        const alreadyUsed =
          data.used_at &&
          Date.now() - new Date(data.used_at).getTime() > 60_000;

        if (expired || alreadyUsed) {
          return htmlErrorPage(
            "Link expirado",
            "Este link de redirecionamento já foi usado ou expirou. Volte ao site e refaça a solicitação.",
          );
        }

        if (!data.used_at) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin as any)
            .from("whatsapp_redirect_tokens")
            .update({ used_at: new Date().toISOString() })
            .eq("id", data.id);
        }

        const digits = String(data.destination_digits ?? "").replace(/\D/g, "");
        if (!digits) {
          return htmlErrorPage(
            "Canal indisponível",
            "Não foi possível abrir o WhatsApp agora. Nossa equipe entrará em contato pelos dados enviados.",
          );
        }

        const url = `https://wa.me/${digits}?text=${encodeURIComponent(
          String(data.message ?? ""),
        )}`;

        return new Response(null, {
          status: 302,
          headers: {
            location: url,
            "cache-control": "no-store, no-cache, must-revalidate",
            "referrer-policy": "no-referrer",
          },
        });
      },
    },
  },
});

function htmlErrorPage(title: string, body: string): Response {
  const html = `<!doctype html>
<html lang="pt-BR"><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>${escapeHtml(title)} · 0WEB</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0f19;color:#e5e7eb;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;}
    .card{max-width:420px;text-align:center;border:1px solid #1f2937;padding:32px;border-radius:16px;background:#0f172a}
    h1{font-size:20px;margin:0 0 12px}
    p{color:#9ca3af;margin:0 0 24px;font-size:14px;line-height:1.55}
    a{display:inline-block;padding:10px 20px;border-radius:9999px;background:#3b82f6;color:#fff;text-decoration:none;font-weight:600;font-size:14px}
  </style>
</head><body><div class="card">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(body)}</p>
  <a href="/contato">Voltar ao site</a>
</div></body></html>`;
  return new Response(html, {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
