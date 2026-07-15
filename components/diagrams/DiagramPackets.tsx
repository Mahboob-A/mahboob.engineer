/**
 * components/diagrams/DiagramPackets.tsx
 *
 * SMIL-animated packet helper. Renders `count` small circles riding
 * `<mpath>` references on named edges via staggered `<animateMotion>`.
 * Pure SVG, no JS — the browser handles animation natively.
 *
 * Use as the last child inside an `<svg>` whose sibling `<path>`
 * elements carry `id="..."` matching the `edges` you pass.
 *
 * Per-group `color` reads from `data/tokens.ts`:
 *   - `"amber"` → request flow (orange)
 *   - `"acc"`   → response flow (mint)
 *   - `"t1"`    → muted / default
 *
 * `prefers-reduced-motion` is gated via CSS in diagrams.css.
 *
 * Phase 6 (T7) — extracted from the hand-rolled markup in the Hero's
 * Algocode diagram so all 3 projects' diagrams can share the same
 * "packet flow" feel.
 */

import { colors } from "@/data/tokens";

export type PacketColor = "amber" | "acc" | "t1";

export interface PacketGroup {
  /** IDs of `<path>` siblings inside the same `<svg>`. */
  edges: readonly string[];
  /** Token name for the packet fill color. */
  color: PacketColor;
  /** Number of packets to render in this group. */
  count: number;
}

export interface AnimatedPacketsProps {
  /** Per-group packet config. */
  groups: readonly PacketGroup[];
  /** Loop duration in seconds. Defaults to 3.2s. */
  dur?: number;
}

const COLOR_TO_VAR: Record<PacketColor, string> = {
  amber: "var(--amber)",
  acc: "var(--acc)",
  t1: "var(--t1)",
};

export function AnimatedPackets({ groups, dur = 3.2 }: AnimatedPacketsProps) {
  /* Stagger packets evenly across the loop duration so they don't all
     bunch up at one point. We cycle each group's edges round-robin,
     distributing `count` packets across them. */
  const out: React.ReactNode[] = [];

  groups.forEach((group, gIdx) => {
    const color = COLOR_TO_VAR[group.color];
    if (group.edges.length === 0 || group.count === 0) return;
    /* Total stagger budget = dur * 0.9 (90% of loop) so the last
       packet starts before the first one finishes. */
    const stagger = (dur * 0.9) / group.count;

    for (let i = 0; i < group.count; i++) {
      const edge = group.edges[i % group.edges.length];
      const begin = (gIdx * 0.1 + i * stagger).toFixed(2);
      out.push(
        <circle
          key={`${gIdx}-${i}-${edge}`}
          r={4}
          fill={color}
          stroke="var(--bg)"
          strokeWidth={1}
        >
          <animateMotion
            dur={`${dur}s`}
            repeatCount="indefinite"
            begin={`${begin}s`}
          >
            <mpath href={`#${edge}`} />
          </animateMotion>
        </circle>,
      );
    }
  });

  return <g aria-hidden>{out}</g>;
}

/* Re-export so consumers can swap the helper's color tokens for
   a future palette tweak without importing tokens themselves. */
export const PACKET_COLOR_TOKENS = colors;