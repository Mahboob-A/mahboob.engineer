/**
 * components/layout/Navbar.tsx
 *
 * Sticky top bar, present on every route. Server Component — reads the
 * mode cookie and the current path on each request.
 *
 * Layout (master §1.3 + flat mockup lines 67–122):
 *   [logo + live dot]                  [log work stack writing contact]   [flat | game]
 *                                          (active link highlights)
 *
 * On `/` (landing), nav links are anchor-scrolled to the matching section.
 * On every other route, they navigate to the route itself.
 *
 * Mode toggle: a tiny <form action="/api/mode" method="post"> so the
 * cookie flip works without JavaScript. The "active" toggle pill reflects
 * the current mode from the cookie.
 */

import Link from "next/link";
import { headers } from "next/headers";
import { getModeFromCookies } from "@/lib/mode";
import { cn } from "@/lib/cn";

interface NavLink {
  label: string;
  /** Path route — what the link goes to on non-landing pages. */
  href: string;
  /** Anchor id — what the link targets on the landing page. */
  anchor: string;
  /** When on `/`, this section is also the page's section header eyebrow number. */
  eyebrow: string;
}

const LINKS: readonly NavLink[] = [
  { label: "experience", href: "/log", anchor: "log", eyebrow: "01" },
  { label: "work", href: "/work", anchor: "work", eyebrow: "02" },
  { label: "stack", href: "/stack", anchor: "stack", eyebrow: "03" },
  { label: "writing", href: "/writing", anchor: "blog", eyebrow: "04" },
  { label: "contact", href: "/contact", anchor: "contact", eyebrow: "05" },
] as const;

export async function Navbar() {
  const mode = await getModeFromCookies();
  const h = await headers();
  // x-pathname is set by the middleware (we'll add it in a follow-up task
  // if needed). For now, we infer the current path from the URL header
  // used by Next.js internally.
  const fullPath = h.get("x-invoke-path") ?? h.get("next-url") ?? h.get("referer") ?? "/";
  const currentPath = new URL(fullPath, "http://x").pathname;
  const isLanding = currentPath === "/";

  return (
    <nav
      className={cn("bg-bg/85 border-border sticky top-0 z-50 border-b backdrop-blur-md")}
    >
      <div className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between px-6 md:px-8">
        {/* ─── Logo ──────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="text-t1 flex items-center gap-2 font-mono text-[15px] font-semibold tracking-[0.5px]"
          aria-label="mahboob.engineer — home"
        >
          <span
            className="bg-acc inline-block h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(92,201,160,0.15)]"
            style={{ animation: "pulse-dot 2.4s ease-in-out infinite" }}
            aria-hidden
          />
          mahboob
          <span className="text-t3">.engineer</span>
        </Link>

        {/* ─── Nav links ────────────────────────────────────────────── */}
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            const target = isLanding ? `#${l.anchor}` : l.href;
            const isActive = !isLanding && currentPath.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={target}
                  className={cn(
                    "text-[14px] transition-colors",
                    isActive
                      ? "text-t1 font-semibold"
                      : "text-t3 hover:text-t1 font-medium",
                  )}
                  data-eyebrow={l.eyebrow}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ─── Mode toggle ──────────────────────────────────────────── */}
        <div
          className="border-border bg-surface flex items-center gap-0.5 rounded-full border p-[3px] font-mono text-[12px]"
          role="group"
          aria-label="View mode"
        >
          <ModeTogglePill
            active={mode === "flat"}
            value="flat"
            currentPath={currentPath}
            label="flat"
          />
          <ModeTogglePill
            active={mode === "game"}
            value="game"
            currentPath={currentPath}
            label="game"
          />
        </div>
      </div>

      {/* Mobile nav: scrollable chip row below the header. */}
      <ul className="border-border bg-bg/85 flex items-center gap-5 overflow-x-auto border-t px-6 py-2 md:hidden">
        {LINKS.map((l) => {
          const target = isLanding ? `#${l.anchor}` : l.href;
          const isActive = !isLanding && currentPath.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={target}
                className={cn(
                  "text-[13px] transition-colors",
                  isActive
                    ? "text-t1 font-semibold"
                    : "text-t3 hover:text-t1 font-medium",
                )}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface ModeTogglePillProps {
  active: boolean;
  value: "flat" | "game";
  currentPath: string;
  label: string;
}

/**
 * One pill in the mode toggle. A real <button> inside a <form> so the
 * submit hits /api/mode and flips the cookie. No client JS required.
 */
function ModeTogglePill({ active, value, currentPath, label }: ModeTogglePillProps) {
  return (
    <form action="/api/mode" method="post" className="contents">
      <input type="hidden" name="mode" value={value} />
      <input type="hidden" name="next" value={currentPath} />
      <button
        type="submit"
        aria-pressed={active}
        aria-current={active ? "true" : undefined}
        className={cn(
          "cursor-pointer rounded-full px-3.5 py-1.5 transition-all",
          active ? "text-acc bg-acc-dim font-semibold" : "text-t3 hover:text-t1",
        )}
      >
        {label}
      </button>
    </form>
  );
}
