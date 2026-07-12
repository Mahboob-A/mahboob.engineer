/**
 * game/scenes/overlays/VillainOverlay.tsx
 *
 * React overlay rendered when the player collides with a villain on
 * the map. T4.7 will flesh this out with:
 *   - Resolve villain id → villain metadata (name, learning area,
 *     current training resources, "HP" progress bar)
 *   - Honest reflection on what the user knows vs. what they're
 *     learning
 *   - Close button → bridge.closeOverlay()
 *
 * Until then, this file declares the placeholder component.
 */

"use client";

import type { VillainId } from "@/game/types";

export interface VillainOverlayProps {
  villainId: VillainId;
  onClose: () => void;
}

const VILLAIN_LABELS: Record<VillainId, string> = {
  "gopher-king": "The Gopher King",
  "terraform-titan": "Terraform Titan",
  "ebpf-phantom": "eBPF Phantom",
};

export function VillainOverlay({ villainId, onClose }: VillainOverlayProps) {
  return (
    <div className="bg-surface border-amber/40 mx-auto flex max-w-[640px] flex-col gap-3 rounded-[12px] border p-8">
      <p className="text-amber font-mono text-[11px] tracking-[1.5px] uppercase">
        Villain encountered
      </p>
      <h2 className="font-display text-t1 text-[28px] font-bold tracking-[-0.5px]">
        {VILLAIN_LABELS[villainId]}
      </h2>
      <p className="text-t2 text-[14px]">
        T4.7 will flesh this out with the learning-area encounter card.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="bg-amber text-bg mt-2 self-start rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold"
      >
        retreat →
      </button>
    </div>
  );
}