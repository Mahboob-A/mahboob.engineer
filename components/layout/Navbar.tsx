/**
 * components/layout/Navbar.tsx
 *
 * Sticky top bar, present on every route. Server Component — reads the
 * mode cookie on each request. Active route highlighting is delegated to
 * ActiveNavLink so it stays correct across client-side navigation.
 *
 * Layout (master §1.3 + flat mockup lines 67–122):
 *   [logo + live dot]                  [log work stack writing contact]   [flat | game]
 *                                          (active link highlights)
 *
 * Nav links always navigate to their inner routes.
 *
 * Mode toggle: a tiny <form action="/api/mode" method="post"> so the
 * cookie flip works without JavaScript. The "active" toggle pill reflects
 * the current mode from the cookie.
 */

import Link from "next/link";
import { headers } from "next/headers";
import { getModeFromCookies } from "@/lib/mode";
import { cn } from "@/lib/cn";
import { ActiveNavLink } from "@/components/layout/ActiveNavLink";

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
  /* Phase 11 (T11.3): label renamed `experience` → `log` to match
     the route segment (`/log`). All other labels in this array
     match their href segments; this was the only inconsistency. */
  { label: "log", href: "/log", anchor: "log", eyebrow: "01" },
  { label: "work", href: "/work", anchor: "work", eyebrow: "02" },
  { label: "stack", href: "/stack", anchor: "stack", eyebrow: "03" },
  { label: "writing", href: "/writing", anchor: "blog", eyebrow: "04" },
  /* Post-Phase 6 bug fix: route renamed /contact → /lets-connect.
     Label updated to match the new framing; the landing-section
     `anchor` remains "contact" so the #contact scroll-on-landing
     still works for users who navigate to mahboob.engineer/#contact
     from an external link. */
  { label: "let's connect", href: "/lets-connect", anchor: "contact", eyebrow: "05" },
] as const;

export async function Navbar() {
  const mode = await getModeFromCookies();
  const h = await headers();
  /* Mode form fallback only. Active nav highlighting is client-side
     in ActiveNavLink so it updates on soft navigation without a hard
     reload. */
  const fullPath =
    h.get("x-pathname") ??
    h.get("x-invoke-path") ??
    h.get("next-url") ??
    h.get("referer") ??
    "/";
  const currentPath = new URL(fullPath, "http://x").pathname;

  return (
    <nav
      /* Phase 6 (T6.9 follow-up): solid `bg-bg` (was `bg-bg/85`).
         axe-core flagged `text-t3` on the translucent backdrop as
         failing WCAG AA contrast (blended backgrounds lower effective
         contrast). Solid color restores the guaranteed contrast
         ratio. `backdrop-blur-md` kept for the visual chrome. */
      className={cn("bg-bg border-border sticky top-0 z-50 border-b backdrop-blur-md")}
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
          {LINKS.map((l) => (
            <li key={l.href}>
              <ActiveNavLink
                href={l.href}
                label={l.label}
                eyebrow={l.eyebrow}
                variant="desktop"
              />
            </li>
          ))}
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

      {/* Mobile nav: scrollable chip row below the header. Solid
          bg-bg per T6.9 contrast fix. */}
      <ul className="border-border bg-bg flex items-center gap-5 overflow-x-auto border-t px-6 py-2 md:hidden">
        {LINKS.map((l) => (
          <li key={l.href}>
            <ActiveNavLink
              href={l.href}
              label={l.label}
              eyebrow={l.eyebrow}
              variant="mobile"
            />
          </li>
        ))}
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
  /* Phase 6 (T6.4): aria-label so screen readers announce the action
     ("Switch to flat portfolio mode") instead of just reading the
     visible text "flat" / "game". */
  const ariaLabel =
    value === "flat"
      ? "Switch to flat portfolio mode"
      : "Switch to game mode";
  return (
    <form action="/api/mode" method="post" className="contents">
      <input type="hidden" name="mode" value={value} />
      <input type="hidden" name="next" value={currentPath} />
      <button
        type="submit"
        aria-pressed={active}
        aria-current={active ? "true" : undefined}
        aria-label={ariaLabel}
        className={cn(
          "cursor-pointer rounded-full px-3.5 py-1.5 transition-all",
          /* Phase 6 (T6.9): inactive pill is on bg-surface. `text-t3`
             on bg-surface fails WCAG AA (3.6:1). Using `text-t2` for
             inactive restores the contrast (7.1:1). */
          active ? "text-acc bg-acc-dim font-semibold" : "text-t2 hover:text-t1",
        )}
      >
        {label}
      </button>
    </form>
  );
}
