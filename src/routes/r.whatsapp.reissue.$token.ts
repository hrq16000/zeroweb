/**
 * Reemissão de link de redirecionamento expirado.
 *
 * O visitante clica em "Reenviar minha solicitação" na página de link
 * expirado; validamos o token antigo, localizamos o lead já persistido,
 * emitimos um novo token e redirecionamos para /r/whatsapp/:novoToken —
 * que reconstrói a mensagem server-side. O número nunca sai do servidor.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/whatsapp/reissue/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = String(params.token ?? "").trim();
        if (!/^[a-f0-9]{16,64}$/.test(token)) {
          return new Response("Invalid token", { status: 400 });
        }

        const { reissueWhatsAppRedirectToken, hashIp } = await import(
          "@/lib/whatsapp-redirect.server"
        );

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("cf-connecting-ip") ??
          null;

        const result = await reissueWhatsAppRedirectToken(token, hashIp(ip));

        if (!result.ok) {
          const msg =
            result.reason === "rate_limited"
              ? "Você já reenviou esta solicitação algumas vezes. Nossa equipe já recebeu seus dados e vai retornar."
              : "Não foi possível localizar sua solicitação. Volte ao site e refaça o envio.";
          const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Solicitação · 0WEB</title></head>
<body style="font-family:system-ui,sans-serif;background:#0b0f19;color:#e5e7eb;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px">
<div style="max-width:420px;text-align:center;border:1px solid #1f2937;padding:32px;border-radius:16px;background:#0f172a">
<h1 style="font-size:20px;margin:0 0 12px">Solicitação registrada</h1>
<p style="color:#9ca3af;font-size:14px;line-height:1.55;margin:0 0 24px">${msg}</p>
<a href="/" style="display:inline-block;padding:10px 20px;border-radius:9999px;background:#3b82f6;color:#fff;text-decoration:none;font-weight:600;font-size:14px">Voltar ao site</a>
</div></body></html>`;
          return new Response(html, {
            status: result.reason === "rate_limited" ? 429 : 410,
            headers: {
              "content-type": "text/html; charset=utf-8",
              "cache-control": "no-store",
            },
          });
        }

        return new Response(null, {
          status: 302,
          headers: {
            location: result.redirectPath,
            "cache-control": "no-store, no-cache, must-revalidate",
            "referrer-policy": "no-referrer",
          },
        });
      },
    },
  },
});
