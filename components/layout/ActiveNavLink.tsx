"use client";

/**
 * components/layout/ActiveNavLink.tsx
 *
 * Client-side active route detection for the sticky navbar.
 * The navbar itself can stay server-rendered for cookie-backed mode state,
 * while link highlighting follows client navigation without a hard reload.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Mode } from "@/lib/mode";

interface ActiveNavLinkProps {
  href: string;
  label: string;
  eyebrow?: string;
  mode: Mode;
  variant: "desktop" | "mobile";
}

function normalizePath(path: string): string {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

function isActivePath(pathname: string, href: string): boolean {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target || current.startsWith(`${target}/`);
}

export function ActiveNavLink({
  href,
  label,
  eyebrow,
  mode,
  variant,
}: ActiveNavLinkProps) {
  const pathname = usePathname() ?? "/";
  const isActive = isActivePath(pathname, href);
  const className = cn(
    "inline-flex shrink-0 items-center font-medium transition-colors",
    "focus-visible:outline-acc focus-visible:outline-2 focus-visible:outline-offset-2",
    variant === "desktop"
      ? "h-9 rounded-[4px] text-[14px]"
      : "h-10 rounded-[4px] text-[13px]",
    isActive
      ? "text-amber font-semibold"
      : "text-t3 hover:text-t1",
  );

  if (mode === "game") {
    return (
      <form action="/api/mode" method="post" className="contents">
        <input type="hidden" name="mode" value="flat" />
        <input type="hidden" name="next" value={href} />
        <button
          type="submit"
          aria-current={isActive ? "page" : undefined}
          className={cn(className, "cursor-pointer")}
          data-eyebrow={eyebrow}
        >
          <span>{label}</span>
        </button>
      </form>
    );
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={className}
      data-eyebrow={eyebrow}
    >
      <span>{label}</span>
    </Link>
  );
}
