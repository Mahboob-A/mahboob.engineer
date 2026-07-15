/**
 * components/game/PauseMenu.tsx
 *
 * The "ESC" pause menu shown on top of the Phaser game when paused.
 * Same visual family as `ModeSelector` (T4.10) and `CaseStudyOverlay`
 * (T4.6) — `bg-bg/85 backdrop-blur-sm` full-bleed overlay + `bg-surface
 * border-acc/40` centered card.
 *
 * T4.11 actions:
 *   - Resume → closes the menu, resumes Phaser (parent calls
 *     `scene.resume("WorldScene")`).
 *   - View flat portfolio → `router.push(flatHref)`. No cookie change.
 *   - Toggle sound → calls `WorldScene.toggleMute()` and flips the
 *     local `isMuted` state. Button shows a right-aligned "on"/"off"
 *     indicator.
 *   - Exit game mode → form POST to `/api/mode` with `mode=flat` +
 *     `next=flatHref`. The existing API route sets the cookie +
 *     303-redirects. The form pattern is copied from the Navbar's
 *     mode pill (`Navbar.tsx:154–172`). No JS — works without hydration.
 *
 * Closing: the parent (game/index.tsx) calls `setPaused(false)`
 * on Esc or the "Resume" button.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export interface PauseMenuProps {
  onResume: () => void;
  onToggleMute: () => void;
  /** Mirrored from WorldScene.isMuted. Drives the right-side "on/off"
   *  indicator on the Toggle sound button. */
  isMuted: boolean;
  /** Where the "View flat portfolio" button navigates to.
   *  Default "/". The Exit button's form also hard-codes this so
   *  both actions land on the same place. */
  flatHref?: string;
}

export function PauseMenu({
  onResume,
  onToggleMute,
  isMuted,
  flatHref = "/",
}: PauseMenuProps) {
  const router = useRouter();
  /* Phase 6 (T6.4): auto-focus the Resume button on mount so Enter /
     Space resumes immediately. Same pattern as ModeSelector. */
  const resumeButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    resumeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="bg-bg/85 fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-label="Pause menu"
    >
      <div className="bg-surface border-acc/40 mx-auto flex max-w-[440px] flex-col gap-4 rounded-[12px] border p-8 shadow-2xl">
        {/* Header */}
        <header className="border-border flex flex-col gap-1 border-b pb-4">
          <p className="text-acc font-mono text-[11px] tracking-[1.5px] uppercase">
            Paused
          </p>
          <h2 className="font-display text-t1 text-[22px] leading-[1.1] font-bold tracking-[-0.5px]">
            Backend City
          </h2>
        </header>

        {/* 4 button rows. role="menu" + role="menuitem" on each
            button for screen-reader semantics. Phase 6 (T6.4). */}
        <div role="menu" aria-label="Pause actions" className="flex flex-col gap-2">
          <PauseButton
            ref={resumeButtonRef}
            onClick={onResume}
            variant="primary"
            role="menuitem"
          >
            ▶ Resume
          </PauseButton>

          <PauseButton
            onClick={() => router.push(flatHref)}
            variant="secondary"
            role="menuitem"
          >
            View flat portfolio →
          </PauseButton>

          <PauseButton
            onClick={onToggleMute}
            variant="secondary"
            rightLabel={isMuted ? "off" : "on"}
            role="menuitem"
          >
            Toggle sound
          </PauseButton>

          {/* "Exit game mode" — uses the existing /api/mode route via
             form submission. The form is `display: contents` so the
             button keeps its normal flex layout. */}
          <form action="/api/mode" method="post" className="contents">
            <input type="hidden" name="mode" value="flat" />
            <input type="hidden" name="next" value={flatHref} />
            <PauseButton
              type="submit"
              variant="secondary"
              role="menuitem"
            >
              ✕ Exit game mode
            </PauseButton>
          </form>
        </div>

        {/* Footer hint — Escape-to-close copy. */}
        <p className="text-t3 font-mono text-[11px] tracking-[0.5px]">
          (press Esc to resume)
        </p>
      </div>
    </div>
  );
}

/* Internal: a button styled for the pause menu's vertical list.
   Supports `type="button"` (default) and `type="submit"` (when nested
   inside a form). `rightLabel` renders a small right-aligned mono
   indicator — used for the "Sound: ON/OFF" tag. `ref` is forwarded
   so the parent can auto-focus the Resume button on mount
   (Phase 6 T6.4). */
const PauseButton = ({
  children,
  onClick,
  variant = "secondary",
  rightLabel,
  type = "button",
  role,
  ref,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  rightLabel?: string;
  type?: "button" | "submit";
  role?: "menuitem";
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      role={role}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-[6px] border px-4 py-2.5",
        "font-mono text-[13px] font-medium transition-colors",
        variant === "primary"
          ? "bg-acc text-bg hover:bg-t1 border-border"
          : "bg-code-bg border-border text-t1 hover:border-acc hover:text-acc",
      )}
    >
      <span className="text-left">{children}</span>
      {rightLabel ? (
        <span className="text-t3 font-mono text-[11px] uppercase tracking-[0.5px]">
          {rightLabel}
        </span>
      ) : null}
    </button>
  );
};