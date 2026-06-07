import { supabase } from '@/integrations/supabase/client';

const STALE_CACHE_PATTERNS = [
  /schema cache/i,
  /could not find the table/i,
  /could not find the function/i,
  /PGRST205/i,
  /PGRST202/i,
];

export function isStaleSchemaCacheError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    (err as { message?: string })?.message ??
    (typeof err === 'string' ? err : '');
  return STALE_CACHE_PATTERNS.some((re) => re.test(msg));
}

let reloadingPromise: Promise<void> | null = null;

async function triggerReload(): Promise<void> {
  if (reloadingPromise) return reloadingPromise;
  reloadingPromise = (async () => {
    try {
      // Best-effort: hit the public health endpoint that asks the server to reload the cache.
      await fetch('/api/public/health-db?reload=1', { method: 'GET', cache: 'no-store' });
      // small grace period for PostgREST to pick up the NOTIFY
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      // ignore — caller will surface the original error if retry still fails
    } finally {
      // allow future reloads after this attempt resolves
      setTimeout(() => {
        reloadingPromise = null;
      }, 1500);
    }
  })();
  return reloadingPromise;
}

/**
 * Wrap a Supabase call so that a single stale-schema-cache failure triggers
 * an automatic schema reload + one retry.
 */
export async function withSchemaCacheRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    const result = (await fn()) as T & { error?: unknown };
    if (result && isStaleSchemaCacheError((result as { error?: unknown }).error)) {
      await triggerReload();
      return await fn();
    }
    return result;
  } catch (err) {
    if (isStaleSchemaCacheError(err)) {
      await triggerReload();
      return await fn();
    }
    throw err;
  }
}

export { supabase };
