/**
 * components/ui/Badge.tsx
 *
 * Pill-shaped status indicator used on project cards, experience entries,
 * the navbar's live status dot, and anywhere a lifecycle state needs a tag.
 *
 * Variants:
 *   active   → green text, green border, green tint background
 *   live     → alias for "active" — used on hero badges / product cards
 *   completed → muted text/border, transparent background
 *   building → amber text, amber border, amber tint background
 *
 * Style: mono 10px, padding 3px 10px, border-radius 999px, border 1px,
 * font-weight 600. Colors are pulled from data/tokens via CSS vars.
 *
 * Usage:
 *   <Badge variant="active">● active</Badge>
 *   <Badge variant="building">building</Badge>
 *   <Badge variant="completed">completed</Badge>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "active" | "completed" | "live" | "building";

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  active: "text-acc border-acc/30 bg-acc/[0.07]",
  live: "text-acc border-acc/30 bg-acc/[0.07]",
  completed: "text-t3 border-border bg-transparent",
  building: "text-amber border-amber/30 bg-amber/[0.07]",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-[10px] py-[3px]",
        "font-mono text-[10px] leading-none font-semibold tracking-[0.5px] uppercase",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
