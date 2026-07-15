/**
 * components/game/ModeSelector.tsx
 *
 * The "Enter Game" gate shown on /game before the Phaser game boots.
 *
 * T4.10 introduces a self-contained Client Component that holds a
 * single `accepted` boolean. While `accepted` is false, the selector
 * card renders and the `children` prop is **not** in the React tree
 * — so the dynamic-imported Phaser game (the `children`) doesn't
 * mount even after its lazy chunk loads. After the user clicks
 * "Enter Game", the card unmounts and the children mount, starting
 * the Phaser game.
 *
 * The selector is a centered card on a full-bleed dark background
 * (`bg-bg/85 fixed inset-0 z-50`). The click on "Enter Game" is
 * the user gesture that unblocks the browser's audio context
 * (master §6: "Browser audio needs a user gesture"), so audio
 * starts cleanly when the Phaser game boots.
 *
 * Used by `app/game/page.tsx`:
 *   <GameGate>
 *     <GameRoot />   ← dynamic-imported, not mounted until gate opens
 *   </GameGate>
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function GameGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  /* T4.10 polish: `?entered=1` URL flag suppresses the selector.
     Strict equality (the literal string "1") — other values like
     "true" or "yes" are ignored. Future polish: accept more. */
  const hasEnteredFlag = searchParams.get("entered") === "1";
  const [accepted, setAccepted] = useState(hasEnteredFlag);

  return (
    <>
      {!accepted && (
        <SelectorCard
          onEnter={() => {
            setAccepted(true);
            /* Persist "I've entered before" via URL. `router.replace`
               (not `push`) so the selector doesn't show in the
               browser's back-button history. The next visit to
               /game — refresh, new tab, or link click — sees the
               flag and skips the selector. */
            router.replace("/game?entered=1");
          }}
          onBack={() => router.back()}
        />
      )}
      {accepted && children}
    </>
  );
}

/* Internal — full-screen overlay + centered card. */
function SelectorCard({
  onEnter,
  onBack,
}: {
  onEnter: () => void;
  onBack: () => void;
}) {
  /* Phase 6 (T6.4): auto-focus the primary "Enter Game" button on
     mount so Enter / Space activates it without a Tab keystroke.
     Same pattern as PauseMenu's auto-focus. */
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    enterButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="bg-bg/85 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      role="dialog"
      aria-label="Game mode selector"
    >
      <div className="bg-surface border-acc/40 mx-auto flex max-w-[520px] flex-col gap-5 rounded-[12px] border p-8 shadow-2xl">
        {/* Eyebrow */}
        <p className="text-acc font-mono text-[11px] tracking-[1.5px] uppercase">
          Game mode
        </p>

        {/* Title */}
        <h2 className="font-display text-t1 text-[28px] leading-[1.1] font-bold tracking-[-0.5px]">
          Backend City
        </h2>

        {/* Description */}
        <p className="text-t2 text-[14px] leading-[1.55]">
          A top-down pixel-art city where every building is a project
          and every villain is a learning area. Walk, explore, press
          E to inspect, and avoid the three bosses until you&apos;re
          ready.
        </p>

        {/* CTA row */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            ref={enterButtonRef}
            type="button"
            onClick={onEnter}
            className="bg-acc text-bg hover:bg-t1 inline-flex items-center gap-2 rounded-[6px] border border-border px-5 py-2.5 font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors"
          >
            Enter Game →
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-t3 hover:text-t1 font-mono text-[12px] underline-offset-4 transition-colors hover:underline"
          >
            ← back to flat portfolio
          </button>
        </div>

        {/* Audio-context hint — pure copy. The click on "Enter Game" is
           the user gesture that unblocks the audio context. */}
        <p className="text-t3 font-mono text-[11px] tracking-[0.5px]">
          (Audio starts on click — browser autoplay policy.)
        </p>
      </div>
    </div>
  );
}