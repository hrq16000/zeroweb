import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { name: string; path: string };

/**
 * Minimal, additive breadcrumb nav. Renders semantic <nav><ol> markup that
 * complements the BreadcrumbList JSON-LD on the route. Uses existing design
 * tokens — no new styling system.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-7xl px-5 lg:px-8 pt-24 lg:pt-28 text-xs text-muted-foreground"
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
