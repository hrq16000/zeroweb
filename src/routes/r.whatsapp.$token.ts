/**
 * Tokenized WhatsApp redirect endpoint.
 *
 * Flow (server-only, atomic):
 *   validate token → rate-limit → resolve → resolve operational contact →
 *   build message from persisted data → consume atomically → mark session
 *   whatsapp_redirected → 302 to wa.me.
 *
 * The client never sees the number, and never controls the message body.
 * Legacy tokens (created before this refactor) that still carry
 * destination_digits + message are honored via a compat branch until expiry.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/whatsapp/$token")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const token = String(params.token ?? "").trim();
        if (!/^[a-f0-9]{16,64}$/.test(token)) {
          return new Response("Invalid token", { status: 400 });
        }

        const {
          resolveWhatsAppRedirectToken,
          resolveOperationalWhatsAppContact,
          buildWhatsAppLeadMessage,
          consumeWhatsAppRedirectToken,
          markVisitorFunnelRedirectedBySessionId,
          assembleWaMeUrl,
          hashIp,
          makeProtocol,
          CONSUME_TOKEN_RATE_WINDOW_S,
          CONSUME_TOKEN_RATE_MAX,
        } = await import("@/lib/whatsapp-redirect.server");

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Rate limit by token + ip_hash — allows the reuse window but blocks abuse.
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request.headers.get("cf-connecting-ip") ??
          null;
        const ipHash = hashIp(ip) ?? "no-ip";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rlOk } = await (supabaseAdmin as any).rpc(
          "check_and_record_rate_limit",
          {
            p_scope: `wa_redirect:${token.slice(0, 16)}`,
            p_ip_hash: ipHash,
            p_window_seconds: CONSUME_TOKEN_RATE_WINDOW_S,
            p_max_hits: CONSUME_TOKEN_RATE_MAX,
          },
        );
        if (rlOk === false) {
          return htmlErrorPage(
            "Muitas tentativas",
            "Aguarde alguns instantes antes de tentar novamente.",
          );
        }

        // Resolve token metadata (read-only, no side effect yet).
        const resolved = await resolveWhatsAppRedirectToken(token);
        if (!resolved.ok) {
          return htmlErrorPage(
            "Link expirado ou inválido",
            "Volte ao site e envie novamente sua solicitação.",
          );
        }

        // Pre-check expiration for cleaner UX; RPC will re-validate atomically.
        if (new Date(resolved.row.expires_at).getTime() < Date.now()) {
          const { getProtocolForToken } = await import("@/lib/whatsapp-redirect.server");
          return htmlErrorPage(
            "Link expirado",
            "Este link de atendimento expirou por segurança. Sua solicitação continua registrada — reenvie em um clique.",
            410,
            { reissueToken: token, protocol: await getProtocolForToken(token) },
          );
        }

        // Resolve operational contact BEFORE consumption — if it isn't
        // configured, don't burn the token.
        const contact = resolveOperationalWhatsAppContact();
        if (!contact && !resolved.row.isLegacy) {
          return htmlErrorPage(
            "Canal indisponível",
            "Sua solicitação foi registrada. Nossa equipe entrará em contato pelos dados enviados.",
            503,
          );
        }

        // Build the message from persisted data (or reuse legacy stored
        // message for pre-refactor rows). Do this BEFORE consuming so we
        // don't burn the token on a build failure.
        let finalMessage: string;
        let finalDigits: string;

        if (resolved.row.isLegacy && resolved.row.destination_digits && resolved.row.message) {
          // Legacy compat path — no new writes go here.
          finalDigits = String(resolved.row.destination_digits).replace(/\D/g, "");
          finalMessage = String(resolved.row.message);
          if (!finalDigits) {
            return htmlErrorPage(
              "Canal indisponível",
              "Sua solicitação foi registrada. Nossa equipe entrará em contato pelos dados enviados.",
              503,
            );
          }
        } else {
          // Modern path: build from lead + session + form + questions.
          if (!contact || !resolved.row.lead_id) {
            return htmlErrorPage(
              "Canal indisponível",
              "Sua solicitação foi registrada. Nossa equipe entrará em contato pelos dados enviados.",
              503,
            );
          }
          finalDigits = contact.digits;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: lead } = await (supabaseAdmin as any)
            .from("dynamic_form_leads")
            .select("id, form_id, answers_json, metadata_json")
            .eq("id", resolved.row.lead_id)
            .maybeSingle();
          if (!lead) {
            return htmlErrorPage(
              "Link inválido",
              "Não foi possível localizar sua solicitação. Refaça o envio.",
            );
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: form } = await (supabaseAdmin as any)
            .from("dynamic_forms")
            .select("id, name")
            .eq("id", lead.form_id)
            .maybeSingle();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: qs } = await (supabaseAdmin as any)
            .from("dynamic_form_questions")
            .select("key, label, options_json")
            .eq("form_id", lead.form_id)
            .order("order_index", { ascending: true });

          const questions = (qs ?? []).map(
            (q: { key: string; label: string; options_json: unknown }) => ({
              key: q.key,
              label: q.label,
              options: Array.isArray(q.options_json)
                ? (q.options_json as { value: string; label: string }[])
                : [],
            }),
          );

          // Try to pull session context (page, city, product, cart) if any.
          let session: {
            page_url: string | null;
            city_slug: string | null;
            product_slug: string | null;
            service_slug: string | null;
            utm_campaign: string | null;
            protocol: string | null;
            cart_snapshot_final: unknown;
            origin_snapshot: unknown;
          } | null = null;
          if (resolved.row.funnel_session_id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: s } = await (supabaseAdmin as any)
              .from("visitor_funnel_sessions")
              .select(
                "page_url, city_slug, product_slug, service_slug, utm_campaign, protocol, cart_snapshot_final, origin_snapshot",
              )
              .eq("id", resolved.row.funnel_session_id)
              .maybeSingle();
            session = s ?? null;
          }

          const meta = (lead.metadata_json ?? {}) as Record<string, unknown>;
          const pageUrl =
            (session?.page_url as string | null) ??
            ((meta.page_url as string) ?? null);

          const cartLines = Array.isArray(session?.cart_snapshot_final)
            ? (session!.cart_snapshot_final as Array<Record<string, unknown>>)
                .slice(0, 10)
                .map((it) => {
                  const name = typeof it.name === "string" ? it.name : String(it.slug ?? "item");
                  const qty = typeof it.qty === "number" ? it.qty : 1;
                  return `• ${qty}× ${name}`;
                })
                .join("\n")
            : null;

          finalMessage = buildWhatsAppLeadMessage({
            protocol: session?.protocol ?? makeProtocol(),
            funnelName: form?.name ?? null,
            answers: (lead.answers_json ?? {}) as Record<string, unknown>,
            questions,
            citySlug: session?.city_slug ?? null,
            neighborhoodSlug:
              (session?.origin_snapshot as { neighborhood_slug?: string } | null)
                ?.neighborhood_slug ?? null,
            pageUrl,
            pageTitle: null,
            utmCampaign: session?.utm_campaign ?? null,
            cartSummary: cartLines,
          });
        }

        // Atomic consume.
        const consumed = await consumeWhatsAppRedirectToken(token);
        if (consumed.status === "not_found") {
          return htmlErrorPage(
            "Link inválido",
            "Volte ao site e envie novamente sua solicitação.",
          );
        }
        if (consumed.status === "expired" || consumed.status === "used_out_of_window") {
          const { getProtocolForToken } = await import("@/lib/whatsapp-redirect.server");
          return htmlErrorPage(
            "Link expirado",
            "Este link já foi utilizado ou expirou. Sua solicitação continua registrada — reenvie em um clique.",
            410,
            { reissueToken: token, protocol: await getProtocolForToken(token) },
          );
        }

        // Mark session redirected — idempotent, best-effort. Do NOT fail the
        // redirect if this errors (we already consumed the token; user
        // deserves the redirect).
        if (consumed.funnelSessionId) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: s } = await (supabaseAdmin as any)
              .from("visitor_funnel_sessions")
              .select("session_id")
              .eq("id", consumed.funnelSessionId)
              .maybeSingle();
            if (s?.session_id) {
              await markVisitorFunnelRedirectedBySessionId(s.session_id);
            }
          } catch (e) {
            console.error("[r/whatsapp] failed to mark session redirected", e);
          }
        }

        const url = assembleWaMeUrl(finalDigits, finalMessage);
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

function htmlErrorPage(
  title: string,
  body: string,
  status = 410,
  opts?: { reissueToken?: string | null; protocol?: string | null },
): Response {
  const reissue = opts?.reissueToken
    ? `<a class="primary" href="/r/whatsapp/reissue/${escapeHtml(opts.reissueToken)}">Reenviar minha solicitação</a>`
    : "";
  const protocol = opts?.protocol
    ? `<p class="proto">Protocolo <strong>${escapeHtml(opts.protocol)}</strong><br/>Guarde este código: sua solicitação já está registrada conosco.</p>`
    : "";
  const html = `<!doctype html>
<html lang="pt-BR"><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex,nofollow"/>
  <title>${escapeHtml(title)} · 0WEB</title>
  <style>
    :root{color-scheme:dark}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:radial-gradient(1200px 600px at 50% -10%,#12203c 0%,#0b0f19 60%);color:#e5e7eb;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px;}
    .card{max-width:440px;width:100%;text-align:center;border:1px solid #1f2937;padding:36px 28px;border-radius:20px;background:rgba(15,23,42,.92);box-shadow:0 24px 60px rgba(0,0,0,.45)}
    .brand{font-weight:800;letter-spacing:.14em;font-size:13px;color:#60a5fa;margin:0 0 18px}
    h1{font-size:21px;margin:0 0 12px;line-height:1.3}
    p{color:#9ca3af;margin:0 0 22px;font-size:14px;line-height:1.6}
    .proto{font-size:13px;color:#cbd5e1;background:#111c33;border:1px dashed #334155;border-radius:12px;padding:12px;margin:0 0 22px}
    .proto strong{color:#fff;letter-spacing:.06em}
    .actions{display:flex;flex-direction:column;gap:10px}
    a{display:block;padding:12px 20px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px}
    a.primary{background:#22c55e;color:#052e16}
    a.ghost{background:transparent;color:#93c5fd;border:1px solid #1e3a8a}
  </style>
</head><body><div class="card">
  <p class="brand">0WEB</p>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(body)}</p>
  ${protocol}
  <div class="actions">
    ${reissue}
    <a class="ghost" href="/">Voltar ao site</a>
  </div>
</div></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
    },
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
