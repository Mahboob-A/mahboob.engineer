/**
 * components/game/SpecialOverlay.tsx
 *
 * In-game overlay rendered when the player walks into one of the 3
 * special buildings on the Backend City map:
 *   - Backend Diaries HQ → /writing (T4.12 stub, Phase 5 fills in)
 *   - Skills Academy      → /stack (T3.4 D3 force graph)
 *   - Contact Bureau      → /contact (T3.5 terminal form)
 *
 * Same visual chrome as CaseStudyOverlay (bg-surface border-acc/40
 * rounded-[12px] border p-6 shadow-2xl) but a different content
 * shape: just a header + a primary link + a secondary back button.
 *
 * Closing: clicking "← back to game" calls `onClose` (which
 * `bridge.closeOverlay()` unmounts the overlay). Clicking the
 * primary link navigates via Next.js <Link> — same pattern as
 * CaseStudyOverlay's "read full case study →" link. The route
 * change unmounts the /game page tree, which destroys the Phaser
 * canvas, the OverlaySlot, and the React state. No explicit close
 * call is needed.
 */

"use client";

import Link from "next/link";

export interface SpecialOverlayProps {
  /** The special-building slug (e.g. "backend-diaries"). */
  slug: string;
  /** Called when the user clicks the "back to game" button. */
  onClose: () => void;
}

/* Slug → flat-portfolio route mapping. Single source of truth for
   the special overlay. The 3 slugs come from public/assets/maps/
   backend-city.json (T4.2). The routes are real (T3.4 + T3.5 + T4.12
   stub for /writing). */
const SPECIAL_ROUTES: Record<string, { href: string; label: string }> = {
  "backend-diaries": {
    href: "/writing",
    label: "Backend diary",
  },
  "skills-academy": {
    href: "/stack",
    label: "Stack graph",
  },
  "contact-bureau": {
    /* Post-Phase 6 bug fix: route renamed /contact → /lets-connect. */
    href: "/lets-connect",
    label: "Let's connect",
  },
};

export function SpecialOverlay({ slug, onClose }: SpecialOverlayProps) {
  const route = SPECIAL_ROUTES[slug];

  if (!route) {
    /* Slug-not-found safety. Same pattern as ProjectOverlay + Villain
       Overlay. Close immediately rather than render a broken overlay. */
    if (typeof window !== "undefined") {
      onClose();
    }
    return null;
  }

  return (
    <div
      className="bg-surface border-acc/40 mx-auto flex max-h-[90vh] w-full max-w-[640px] flex-col gap-4 overflow-y-auto rounded-[12px] border p-6 shadow-2xl"
      role="dialog"
      aria-label={`${route.label} link`}
    >
      {/* Header — eyebrow + title + subtitle. Same chrome as
         CaseStudyOverlay's Hero section. The "Special" eyebrow uses
         text-amber (vs CaseStudyOverlay's text-acc for "Project") to
         signal that this isn't a project case study. */}
      <header className="border-border flex flex-col gap-1 border-b pb-4">
        <p className="text-amber font-mono text-[11px] tracking-[1.5px] uppercase">
          Special
        </p>
        <h2 className="font-display text-t1 text-[26px] leading-[1.1] font-bold tracking-[-0.5px]">
          {route.label}
        </h2>
        <p className="text-t2 text-[13px]">
          This is a special building — it links to a page on the flat
          portfolio rather than a project case study.
        </p>
      </header>

      {/* Body copy — explain what the user is going to see. */}
      <p className="text-t1 text-[14px] leading-[1.6]">
        Continue to the{" "}
        <span className="text-acc font-mono">{route.label}</span> page on
        the flat portfolio to explore it.
      </p>

      {/* Footer — secondary back button + primary link. Mirrors
         CaseStudyOverlay's footer shape (mt-auto flex justify-between
         border-t pt-4) but with the back button on the left and the
         primary link on the right. */}
      <div className="border-border mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onClose}
          className="text-t3 hover:text-t1 font-mono text-[12px] underline-offset-4 transition-colors hover:underline"
        >
          ← back to game
        </button>
        <Link
          href={route.href}
          className="bg-acc text-bg hover:bg-t1 inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          go to {route.label.toLowerCase()} →
        </Link>
      </div>
    </div>
  );
}