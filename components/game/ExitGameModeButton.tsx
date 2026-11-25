/**
 * components/game/ExitGameModeButton.tsx
 *
 * The "exit game mode" control. Rendered in two places:
 *   1. The HUD overlay on top of the Phaser canvas (game/index.tsx) —
 *      always visible while playing, so the player can leave without
 *      hunting for the pause menu.
 *   2. The /game page header (app/game/page.tsx) — visible before
 *      the "Enter Game" gate opens.
 *
 * Why a form POST and not `router.push("/")`:
 *   Game mode is a COOKIE, not a route (`mahboob_mode=game`). A
 *   client-side navigation to "/" leaves that cookie set, so the
 *   Navbar keeps rendering the "game" pill and the flat pages keep
 *   the game chrome. The only thing that actually drops the mode is
 *   POST /api/mode with `mode=flat`, which sets the cookie and
 *   303-redirects to `next`. This mirrors the Navbar's mode pill
 *   (Navbar.tsx) and the PauseMenu's exit row (PauseMenu.tsx).
 *
 *   The form has no JS dependency — it works even if hydration is
 *   still in flight.
 */

"use client";

import { cn } from "@/lib/cn";

export interface ExitGameModeButtonProps {
  /** Where to land after the mode cookie is flipped. */
  flatHref?: string;
  /** Visual treatment. "hud" = compact pill over the canvas;
   *  "header" = bordered button in the page header;
   *  "menu" = full-width row inside the pause menu. */
  variant?: "hud" | "header" | "menu";
  className?: string;
}

export function ExitGameModeButton({
  flatHref = "/",
  variant = "header",
  className,
}: ExitGameModeButtonProps) {
  return (
    <form action="/api/mode" method="post" className="contents">
      <input type="hidden" name="mode" value="flat" />
      <input type="hidden" name="next" value={flatHref} />
      <button
        type="submit"
        role={variant === "menu" ? "menuitem" : undefined}
        className={cn(
          "font-mono transition-colors",
          variant === "hud" &&
            "bg-code-bg/85 border-border text-t1 hover:border-acc hover:text-acc inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1.5 text-[11px] tracking-[0.5px] backdrop-blur-sm",
          variant === "header" &&
            "border-border text-t2 hover:border-acc hover:text-acc inline-flex items-center gap-1.5 rounded-[6px] border px-3 py-2 text-[12px] tracking-[0.5px]",
          variant === "menu" &&
            "bg-code-bg border-border text-t1 hover:border-acc hover:text-acc flex w-full items-center justify-between gap-2 rounded-[6px] border px-4 py-2.5 text-[13px] font-medium",
          className,
        )}
      >
        <span className="text-left">
          <span aria-hidden="true">✕</span> Exit game mode
        </span>
      </button>
    </form>
  );
}
