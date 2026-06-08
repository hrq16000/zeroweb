import type { QueryClient } from "@tanstack/react-query";

export type AuthErrorInfo = {
  isAuthError: boolean;
  status?: number;
  message: string;
};

export type HandleAuthErrorOptions = {
  origin: string;
  error: unknown;
  pathname: string;
  signOut: () => Promise<unknown>;
  toastError: (message: string) => void;
  navigateToAuth: () => void;
  queryClient?: Pick<QueryClient, "cancelQueries" | "clear">;
  logger?: (message: string, details: Record<string, unknown>) => void;
};

export function getAuthErrorInfo(err: unknown): AuthErrorInfo {
  if (!err) return { isAuthError: false, message: "" };
  const e = err as { message?: string; status?: number; statusCode?: number; response?: { status?: number } };
  const status = e.status ?? e.statusCode ?? e.response?.status;
  const message = String(e.message ?? err);
  return {
    isAuthError:
      /unauthorized|no authorization header|invalid jwt|jwt expired|forbidden/i.test(message) ||
      status === 401 ||
      status === 403,
    status,
    message,
  };
}

export function isProtectedPath(pathname: string): boolean {
  return /^\/(app|painel)(\/|$)/.test(pathname);
}

export async function handleServerFnAuthError({
  origin,
  error,
  pathname,
  signOut,
  toastError,
  navigateToAuth,
  queryClient,
  logger = console.warn,
}: HandleAuthErrorOptions): Promise<"handled" | "ignored" | "not-auth-error"> {
  const info = getAuthErrorInfo(error);
  if (!info.isAuthError) return "not-auth-error";

  logger("[AuthErrorGuard] 401/403 capturado", {
    origin,
    pathname,
    status: info.status ?? null,
    message: info.message.slice(0, 200),
    timestamp: new Date().toISOString(),
  });

  if (!isProtectedPath(pathname)) return "ignored";

  try {
    await queryClient?.cancelQueries();
  } catch {
    /* noop */
  }
  try {
    queryClient?.clear();
  } catch {
    /* noop */
  }
  try {
    await signOut();
  } catch {
    /* noop */
  }
  toastError("Sua sessão expirou. Faça login novamente.");
  navigateToAuth();
  return "handled";
}