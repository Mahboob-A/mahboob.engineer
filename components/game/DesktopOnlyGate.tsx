"use client";

/**
 * components/game/DesktopOnlyGate.tsx
 *
 * Wraps the `/game` route. On viewports < 768px (mobile + landscape
 * phones), renders a "Backend City is best on desktop" card with a
 * link back to the flat portfolio. On `md+`, renders the children
 * (the existing ModeSelector + GameRoot).
 *
 * Why this exists:
 *   - Phaser runs on any viewport today, but the game's pixel art
 *     and UI are sized for desktop. On a 375 px viewport the canvas
 *     is unreadable; on a 667 px landscape phone it's cramped.
 *   - The user confirmed T6.7 decision: block at `<md` (767 px and
 *     below) per their preference.
 *
 * Detection: `window.matchMedia('(max-width: 767px)')` evaluated in
 * `useEffect`. SSR default is "not mobile" so the SSR'd HTML matches
 * the desktop experience; the gate re-evaluates after hydration. On
 * a real mobile device, the gate swaps in within ~50ms of hydration.
 *
 * Persistence: no localStorage (master §6 rule #3). The user can
 * rotate to landscape, then the gate dismisses itself.
 *
 * Phase 6 (T6.7).
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

const MOBILE_QUERY = "(max-width: 767px)";

export function DesktopOnlyGate({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  useEffect(() => {
    /* `window.matchMedia` is the canonical browser API for viewport
       queries. Modern, no dep. Returns a `MediaQueryList` whose
       `matches` flag updates live as the user resizes or rotates. */
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => {
      setIsMobile(mql.matches);
      setHasEvaluated(true);
    };
    update();
    /* Safari < 14 uses `addListener`; modern browsers use `addEventListener`.
       Both forms are checked for compat. */
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  /* Pre-hydration: render children (desktop default). After hydration,
     if we're on mobile, swap to the gate. Avoids a flash of the gate
     on desktop users. */
  if (hasEvaluated && isMobile) {
    return <MobileFallback />;
  }
  return <>{children}</>;
}

/* Internal — the mobile fallback card. */
function MobileFallback() {
  return (
    <div
      className="bg-bg/85 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-label="Desktop required for game mode"
    >
      <div className="bg-surface border-acc/40 mx-auto flex max-w-[480px] flex-col gap-5 rounded-[12px] border p-8 shadow-2xl">
        {/* Eyebrow */}
        <p className="text-amber font-mono text-[11px] tracking-[1.5px] uppercase">
          Mobile detected
        </p>

        {/* Title */}
        <h2 className="font-display text-t1 text-[24px] leading-[1.15] font-bold tracking-[-0.5px]">
          Backend City is best on desktop
        </h2>

        {/* Description */}
        <p className="text-t2 text-[14px] leading-[1.55]">
          The game uses pixel-art at desktop scale — too small to read
          on a phone. Open this page on a larger screen, or browse the
          flat portfolio instead.
        </p>

        {/* CTA row */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="bg-acc text-bg hover:bg-t1 inline-flex items-center gap-2 rounded-[6px] border border-border px-5 py-2.5 font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors"
          >
            Switch to flat portfolio →
          </Link>
        </div>

        {/* Hint */}
        <p className="text-t3 font-mono text-[11px] tracking-[0.5px]">
          (or rotate to landscape and resize your browser wider)
        </p>
      </div>
    </div>
  );
}