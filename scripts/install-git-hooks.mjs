#!/usr/bin/env node
// Installs .husky/* hooks by pointing git config core.hooksPath to .husky.
// Safe to run repeatedly; skips silently when not inside a git repo.
import { execSync } from "node:child_process";
import { chmodSync, existsSync } from "node:fs";
import path from "node:path";

try {
  execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
} catch {
  process.exit(0);
}

try {
  execSync("git config core.hooksPath .husky", { stdio: "ignore" });
  const hook = path.resolve(process.cwd(), ".husky/pre-commit");
  if (existsSync(hook)) chmodSync(hook, 0o755);
  console.log("[hooks] git core.hooksPath -> .husky (pre-commit ativo)");
} catch (e) {
  console.warn("[hooks] não foi possível configurar hooks:", e.message);
}
