/**
 * Preload para `bun test`: registra um DOM (happy-dom) globalmente para que
 * testes que dependem de sessionStorage/localStorage/window rodem isolados.
 * Vitest usa a diretiva `// @vitest-environment happy-dom` por arquivo.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof globalThis.window === "undefined") {
  GlobalRegistrator.register({ url: "https://0web.com.br/" });
}
