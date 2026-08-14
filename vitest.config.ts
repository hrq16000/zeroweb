import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Ambiente de testes unitários.
 * `happy-dom` fornece window/document/sessionStorage nativamente, exigido por
 * testes como `lead-attribution-snapshot.test.ts`.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Node por padrão (testes leem arquivos/SQL); arquivos que precisam de DOM
    // declaram `@vitest-environment happy-dom` no topo.
    environment: "node",
    globals: false,
    include: [
      "src/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
});
