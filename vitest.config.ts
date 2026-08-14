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
    environment: "happy-dom",
    globals: false,
    include: [
      "src/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
  },
});
