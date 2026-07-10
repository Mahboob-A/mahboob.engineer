/**
 * components/ui/Chip.tsx
 *
 * Small mono-font tag used for tech keywords, project tags, blog tags,
 * anywhere a project/tech list needs visual differentiation.
 *
 * Reads colors from `kwDark` in data/tokens.ts — never hardcoded.
 *
 * Usage:
 *   <Chip color="sage">Django</Chip>
 *   <Chip color={chipColor("RabbitMQ")}>RabbitMQ</Chip>
 *   <Chip color="mauve" className="ml-2">JWT</Chip>
 */

import type { ReactNode } from "react";
import { kwDark, type ChipColor } from "@/data/tokens";
import { cn } from "@/lib/cn";

export interface ChipProps {
  children: ReactNode;
  /** Color bucket — `chipColor(tag)` returns this. */
  color: ChipColor;
  /** Optional extra classes appended to the chip's outer span. */
  className?: string;
}

const COLOR_CLASS: Record<ChipColor, string> = {
  sage: "bg-[var(--chip-sage-bg)] text-[var(--chip-sage-text)]",
  slate: "bg-[var(--chip-slate-bg)] text-[var(--chip-slate-text)]",
  amber: "bg-[var(--chip-amber-bg)] text-[var(--chip-amber-text)]",
  mauve: "bg-[var(--chip-mauve-bg)] text-[var(--chip-mauve-text)]",
};

export function Chip({ children, color, className }: ChipProps) {
  return (
    <span
      // Inline vars on the element keep the kwDark→CSS bridge pure — Tailwind
      // doesn't need to know about chip colors. Pinned to the token values
      // from data/tokens.ts so the source of truth never drifts.
      style={
        {
          "--chip-sage-bg": kwDark[0].bg,
          "--chip-sage-text": kwDark[0].text,
          "--chip-slate-bg": kwDark[1].bg,
          "--chip-slate-text": kwDark[1].text,
          "--chip-amber-bg": kwDark[2].bg,
          "--chip-amber-text": kwDark[2].text,
          "--chip-mauve-bg": kwDark[3].bg,
          "--chip-mauve-text": kwDark[3].text,
        } as React.CSSProperties
      }
      className={cn(
        "inline-flex items-center font-mono text-[11px] font-medium tracking-[0.3px]",
        "rounded-[4px] px-[9px] py-[3px] leading-none",
        COLOR_CLASS[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
