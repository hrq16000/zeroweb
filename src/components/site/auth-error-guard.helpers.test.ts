import { describe, expect, test } from "bun:test";
import { getAuthErrorInfo, handleServerFnAuthError, isProtectedPath } from "./auth-error-guard.helpers";

describe("AuthErrorGuard helpers", () => {
  test("detecta Unauthorized/Forbidden por mensagem e status", () => {
    expect(getAuthErrorInfo(new Error("Unauthorized: No authorization header provided")).isAuthError).toBe(true);
    expect(getAuthErrorInfo({ status: 403, message: "Forbidden" }).isAuthError).toBe(true);
    expect(getAuthErrorInfo(new Error("erro comum")).isAuthError).toBe(false);
  });

  test("reconhece apenas áreas protegidas", () => {
    expect(isProtectedPath("/app")).toBe(true);
    expect(isProtectedPath("/app/servicos")).toBe(true);
    expect(isProtectedPath("/painel")).toBe(true);
    expect(isProtectedPath("/servicos")).toBe(false);
  });

  test("ao receber 401 em serverFn protegida limpa sessão, mostra toast e redireciona", async () => {
    const calls: string[] = [];
    const result = await handleServerFnAuthError({
      origin: "unhandledrejection",
      error: { status: 401, message: "Unauthorized: Invalid token" },
      pathname: "/app/servicos",
      queryClient: {
        cancelQueries: async () => calls.push("cancelQueries"),
        clear: () => calls.push("clear"),
      },
      signOut: async () => calls.push("signOut"),
      toastError: (message) => calls.push(`toast:${message}`),
      navigateToAuth: () => calls.push("navigate:/auth"),
      logger: () => calls.push("log"),
    });

    expect(result).toBe("handled");
    expect(calls).toEqual([
      "log",
      "cancelQueries",
      "clear",
      "signOut",
      "toast:Sua sessão expirou. Faça login novamente.",
      "navigate:/auth",
    ]);
  });

  test("em página pública registra log mas não limpa sessão nem redireciona", async () => {
    const calls: string[] = [];
    const result = await handleServerFnAuthError({
      origin: "error",
      error: { status: 403, message: "Forbidden" },
      pathname: "/servicos",
      signOut: async () => calls.push("signOut"),
      toastError: (message) => calls.push(`toast:${message}`),
      navigateToAuth: () => calls.push("navigate:/auth"),
      logger: () => calls.push("log"),
    });

    expect(result).toBe("ignored");
    expect(calls).toEqual(["log"]);
  });
});