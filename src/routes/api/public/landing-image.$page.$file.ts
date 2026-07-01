import { createFileRoute } from "@tanstack/react-router";

/**
 * Proxy público e cacheável para imagens do bucket `service-images`.
 *
 * URL: /api/public/landing-image/<page>/<file>
 *
 * - `page` deve casar com o allow-list abaixo (evita path traversal e uso
 *   como CDN genérica do bucket privado).
 * - `file` deve ser `[a-z0-9-]+.(webp|jpg|jpeg|png|avif)`.
 * - Resposta segue com Cache-Control immutable de 1 ano + ETag e
 *   Content-Type correto, para atender ao runbook de CDN.
 */

const ALLOWED_PAGES = new Set([
  "home",
  "site-express",
  "site-pro",
  "site-24h",
  "trafego-pago",
  "consultoria",
  "google-meu-negocio",
  "seo",
  "social-media",
  "grafica",
  "landings",
  "og",
]);

const FILE_RE = /^[a-z0-9][a-z0-9._-]{0,120}\.(webp|jpg|jpeg|png|avif)$/i;

const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  avif: "image/avif",
};

export const Route = createFileRoute("/api/public/landing-image/$page/$file")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const page = String(params.page || "").toLowerCase();
        const file = String(params.file || "");

        if (!ALLOWED_PAGES.has(page) || !FILE_RE.test(file)) {
          return new Response("Not found", { status: 404 });
        }

        const ext = file.split(".").pop()!.toLowerCase();
        const contentType = MIME[ext] ?? "application/octet-stream";
        const objectPath = `landings/${page}/${file}`;

        try {
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );
          const { data, error } = await supabaseAdmin.storage
            .from("service-images")
            .download(objectPath);

          if (error || !data) {
            return new Response("Not found", { status: 404 });
          }

          const buf = await data.arrayBuffer();

          // ETag simples e determinístico (tamanho + path)
          const etag = `W/"${buf.byteLength.toString(36)}-${page}-${file}"`;
          const ifNoneMatch = request.headers.get("if-none-match");
          if (ifNoneMatch === etag) {
            return new Response(null, {
              status: 304,
              headers: {
                ETag: etag,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }

          return new Response(buf, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Length": String(buf.byteLength),
              "Cache-Control": "public, max-age=31536000, immutable",
              ETag: etag,
              "X-Content-Type-Options": "nosniff",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch {
          return new Response("Internal error", { status: 500 });
        }
      },
    },
  },
});
