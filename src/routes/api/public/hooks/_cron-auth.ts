/**
 * Shared auth for pg_cron / external scheduler endpoints under /api/public/hooks/.
 *
 * Requires a randomly-generated CRON_SECRET env var (never a VITE_ variable
 * and never the Supabase publishable/anon key, which are public).
 *
 * Callers must send the secret in the `x-cron-secret` header.
 */
export function requireCronSecret(request: Request): Response | null {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected.length < 24) {
    return new Response("Server misconfigured: CRON_SECRET not set", { status: 503 });
  }
  const provided = request.headers.get("x-cron-secret");
  if (!provided || provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
