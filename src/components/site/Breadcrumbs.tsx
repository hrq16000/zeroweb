import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { name: string; path: string };

/**
 * Breadcrumb nav. Renders semantic <nav><ol> markup that complements the
 * BreadcrumbList JSON-LD on the route.
 *
 * `compact` controls the top spacing:
 *  - `false` (default): full `pt-page` (96/112px) — for pages without a sticky bar above.
 *  - `true`: `pt-4` — when there is already a bar/header providing the top respiro.
 *  - `"auto"`: infer from current pathname. Routes under `/servicos` use compact
 *    (the loja virtual layout already renders the search/cart bar with `pt-page-tight`).
 */
export function Breadcrumbs({
  items,
  compact = false,
}: {
  items: Crumb[];
  compact?: boolean | "auto";
}) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const resolvedCompact =
    compact === "auto" ? pathname.startsWith("/servicos") : compact;

  if (!items?.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      data-breadcrumbs="1"
      className={`mx-auto max-w-7xl px-5 lg:px-8 ${resolvedCompact ? "pt-4" : "pt-page"} text-xs text-muted-foreground`}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
            <Home className="w-3 h-3" /> Início
          </Link>
        </li>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${it.path}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 opacity-60" />
              {isLast ? (
                <span className="text-foreground/80" aria-current="page">{it.name}</span>
              ) : (
                <a href={it.path} className="hover:text-foreground transition-colors">
                  {it.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
