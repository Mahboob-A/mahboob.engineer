/**
 * game/scenes/overlays/VillainOverlay.tsx
 *
 * Encounter card shown when the player collides with a villain on
 * the map. T4.7 fleshes this out from the T4.0 stub:
 *
 *   - Resolve villainId → VILLAIN_BY_ID[villainId] (data/game/villains.ts).
 *   - Show the villain's name + subtitle + learning area.
 *   - Quote the encounter line (italic, muted).
 *   - HP bar: filled portion = hp / 100, color `acc`. Honest
 *     progress meter — not a health-loss bar.
 *   - "What I know" / "What I'm learning" bullet lists.
 *   - "Active training" chips.
 *   - Two action buttons:
 *       - "Retreat for now" → bridge.closeOverlay()
 *       - "View full stack →" → Next.js Link to /stack
 *         (the dedicated /stack page renders the full D3 force
 *         graph of every tech — T3.4).
 *
 * Color rule: all colors from data/tokens.ts. No hardcoded hex.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { VILLAIN_BY_ID } from "@/data/game/villains";
import type { VillainId } from "@/game/types";

export interface VillainOverlayProps {
  villainId: VillainId;
  onClose: () => void;
}

export function VillainOverlay({ villainId, onClose }: VillainOverlayProps) {
  const villain = VILLAIN_BY_ID[villainId];

  /* Slug-not-found safety — same pattern as ProjectOverlay. Close
     instead of rendering a broken card.

     Phase 35 bug fix: previously this branch called onClose()
     synchronously during render. Because OverlaySlot's onClose
     forwards to bridge.closeOverlay() and eventemitter3.emit is
     synchronous, that synchronously fired the CLOSE_OVERLAY
     listener on GameRoot → setOverlay(null) while VillainOverlay
     was still mid-render. React raises "Cannot update a component
     while rendering a different component" in that case. Move the
     close into a useEffect so the setState runs in a commit-phase
     effect, not during render. Same hardening applied to
     SpecialOverlay and ProjectOverlay in the same commit. */
  useEffect(() => {
    if (!villain && typeof window !== "undefined") {
      onClose();
    }
  }, [villain, onClose]);

  if (!villain) {
    return null;
  }

  return (
    <div
      className="bg-surface border-amber/40 mx-auto flex max-h-full min-h-0 w-full max-w-[680px] flex-col overflow-hidden rounded-[12px] border shadow-2xl"
      role="dialog"
      aria-label={`${villain.name} encounter`}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header className="border-border bg-surface flex shrink-0 items-start justify-between gap-4 border-b p-5">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-amber font-mono text-[11px] tracking-[1.5px] uppercase">
            Learning area encountered
          </p>
          <h2 className="font-display text-t1 text-[24px] leading-[1.1] font-bold tracking-[-0.5px]">
            {villain.name}
            <span className="text-t3 font-mono text-[16px] font-medium">
              {" — "}
              {villain.learningArea}
            </span>
          </h2>
          <p className="text-t3 font-mono text-[13px] italic">{villain.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-amber text-bg hover:bg-t1 shrink-0 rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          back to game
        </button>
      </header>

      <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {/* ─── Encounter line ─────────────────────────────────────────── */}
        <blockquote className="border-l-2 border-amber/60 text-t2 pl-4 text-[14px] leading-[1.6] italic">
          “{villain.encounterLine}”
        </blockquote>

        {/* ─── HP bar ────────────────────────────────────────────────── */}
        <section>
          <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
            Current strength
          </p>
          <div className="flex items-center gap-3">
            <div className="border-border bg-code-bg relative h-3 flex-1 overflow-hidden rounded-[3px] border">
              {/* Filled portion = hp / 100 of bar width. */}
              <div
                className="bg-acc absolute top-0 left-0 h-full transition-[width] duration-300"
                style={{ width: `${villain.hp}%` }}
              />
            </div>
            <span className="text-acc font-mono text-[13px] font-semibold tabular-nums">
              {villain.hp}/100
            </span>
          </div>
          <p className="text-t3 mt-2 font-mono text-[11px]">
            {villain.hp < 50 ? "still learning" : "growing confidence"}
          </p>
        </section>

        {/* ─── What I know + What I'm learning ──────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BulletSection label="What I know" items={villain.whatIKnow} />
          <BulletSection label="What I'm learning" items={villain.whatImLearning} />
        </div>

        {/* ─── Active training (chip row) ──────────────────────────── */}
        {villain.activeResources.length > 0 ? (
          <section>
            <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
              Active training
            </p>
            <div className="flex flex-wrap gap-1.5">
              {villain.activeResources.map((r) => (
                <Chip key={r} color="sage">
                  {r}
                </Chip>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {/* ─── Footer (Retreat + View full stack) ──────────────────── */}
      <footer className="border-border bg-surface flex shrink-0 items-center justify-between gap-3 border-t p-5">
        <Link
          href="/stack"
          className="text-acc hover:text-t1 font-mono text-[12px] underline-offset-4 hover:underline"
        >
          view full stack →
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="bg-amber text-bg hover:bg-t1 rounded-[6px] px-5 py-2 font-mono text-[12px] font-semibold transition-colors"
        >
          back to game
        </button>
      </footer>
    </div>
  );
}

/** Internal: bullet-list section with a small uppercase label. */
function BulletSection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <section>
      <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li
            key={i}
            className="text-t1 flex gap-2 text-[13.5px] leading-[1.55]"
          >
            <span aria-hidden className="text-amber shrink-0">→</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
