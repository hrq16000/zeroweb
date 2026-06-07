import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

/**
 * Detecta renomes/remoções de arquivos em src/routes/ e força full-reload
 * quando routeTree.gen.ts ficar dessincronizado por > debounceMs.
 *
 * Evita blank screen em dev quando o usuário renomeia uma rota e o HMR
 * tenta carregar um módulo que não existe mais.
 */
export function routeWatcherPlugin(options?: { debounceMs?: number }): Plugin {
  const debounceMs = options?.debounceMs ?? 2000;
  let server: ViteDevServer | null = null;
  let timer: NodeJS.Timeout | null = null;
  const routesDir = path.resolve(process.cwd(), "src/routes");
  const treeFile = path.resolve(process.cwd(), "src/routeTree.gen.ts");

  function scheduleCheck(reason: string) {
    if (!server) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        if (!existsSync(treeFile)) return;
        const tree = readFileSync(treeFile, "utf8");
        const re = /from\s+['"]\.\/routes\/([^'"]+)['"]/g;
        const missing: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(tree)) !== null) {
          const rel = m[1];
          const candidates = [
            `${rel}.tsx`,
            `${rel}.ts`,
            path.join(rel, "index.tsx"),
            path.join(rel, "index.ts"),
          ];
          if (!candidates.some((c) => existsSync(path.join(routesDir, c)))) {
            missing.push(rel);
          }
        }
        if (missing.length > 0) {
          server!.config.logger.warn(
            `[route-watcher] divergência detectada após ${reason}. Forçando full-reload. Ausentes: ${missing.join(
              ", ",
            )}`,
          );
          server!.ws.send({ type: "full-reload", path: "*" });
        }
      } catch (e) {
        server!.config.logger.warn(`[route-watcher] erro no check: ${(e as Error).message}`);
      }
    }, debounceMs);
  }

  return {
    name: "lovable-route-watcher",
    apply: "serve",
    configureServer(s) {
      server = s;
      s.watcher.on("unlink", (file) => {
        if (file.startsWith(routesDir)) scheduleCheck(`unlink ${path.basename(file)}`);
      });
      s.watcher.on("add", (file) => {
        if (file.startsWith(routesDir)) scheduleCheck(`add ${path.basename(file)}`);
      });
      s.watcher.on("change", (file) => {
        if (file === treeFile) scheduleCheck("routeTree.gen.ts change");
      });
    },
  };
}
