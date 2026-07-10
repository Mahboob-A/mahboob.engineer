/**
 * components/layout/BackLink.tsx
 *
 * The "← home" or "← all work" arrow link in the top-left of every inner
 * page. Per master §1.3 + §2 (Inner Page Layout).
 *
 * Default goes to `/` (home). Inner sections like /work/[slug] can pass
 * a different `href` and `label` (e.g. `href="/work" label="← all work"`).
 *
 * Rendered at the top of every inner page, above the section header.
 */

import Link from "next/link";
import { cn } from "@/lib/cn";

export interface BackLinkProps {
  /** Where the link goes. Default `/`. */
  href?: string;
  /** Visible label, e.g. "← home" / "← all work" / "← writing". */
  label?: string;
  /** Extra classes appended to the <Link>. */
  className?: string;
}

export function BackLink({ href = "/", label = "← home", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-t3 hover:text-t1 inline-flex items-center gap-1 font-mono text-[12px]",
        "transition-colors",
        className,
      )}
      aria-label={`Back — ${label.replace("← ", "").trim()}`}
    >
      <span aria-hidden>←</span>
      <span>{label.replace("← ", "").trim()}</span>
    </Link>
  );
}
