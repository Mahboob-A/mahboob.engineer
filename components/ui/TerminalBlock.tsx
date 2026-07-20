/**
 * components/ui/TerminalBlock.tsx
 *
 * Reusable terminal-style shell. Used by the Contact section on `/`
 * (T2.7) and will be reused by `app/contact/page.tsx` (T3.7).
 *
 * Three mac-style "traffic light" dots up top, a centered mono label,
 * and a body with a `$` prompt on the left side of every line. Dark
 * `bg-code-bg` panel matches the terminal aesthetic from the flat mockup.
 *
 * All colors come from `data/tokens.ts` via Tailwind utility classes —
 * no hex inline (master §6 rule #1).
 *
 * Usage:
 *   <TerminalBlock label="connect — submit a ticket">
 *     <form>...</form>
 *   </TerminalBlock>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TerminalBlockProps {
  /** Centered mono label above the body — e.g. "connect — submit a ticket". */
  label?: string;
  /** Optional custom header center component (overrides label). */
  headerCenter?: ReactNode;
  /** Body content (forms, prose, status blocks). */
  children: ReactNode;
  /** Optional prompt glyph rendered before each line of children. Defaults to "$". */
  prompt?: string;
  /** Optional extra classes on the outer wrapper. */
  className?: string;
  /** If true, reduces body padding for full space utilization. */
  noPadding?: boolean;
}

export function TerminalBlock({
  label,
  headerCenter,
  children,
  prompt = "$",
  className,
  noPadding = false,
}: TerminalBlockProps) {
  return (
    <div
      className={cn(
        "bg-code-bg border-border flex min-h-0 flex-col overflow-hidden rounded-[10px] border",
        className,
      )}
    >
      {/* Title bar: 3 dots + label or custom headerCenter */}
      <div className="border-border bg-surface/40 flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="border-border h-[10px] w-[10px] rounded-full border bg-[var(--dot-red)]"
            style={{ "--dot-red": "#7a3024" } as React.CSSProperties}
          />
          <span
            aria-hidden
            className="border-border h-[10px] w-[10px] rounded-full border bg-[var(--dot-amber)]"
            style={{ "--dot-amber": "#7a5a1c" } as React.CSSProperties}
          />
          <span
            aria-hidden
            className="border-border h-[10px] w-[10px] rounded-full border bg-acc"
          />
        </div>
        <div className="flex-1 flex justify-center items-center text-center">
          {headerCenter ? (
            headerCenter
          ) : label ? (
            <span className="text-t3 font-mono text-[11px] tracking-[0.3px]">
              {label}
            </span>
          ) : null}
        </div>
        {/* Filler matching the 3 traffic light dots for symmetric centering */}
        <div className="w-[46px]" aria-hidden />
      </div>

      {/* Body — flex-1 so the dark area fills the rest of the terminal
          when the parent (e.g. Hero's right column) gives TerminalBlock a
          defined height. Phase 45: scroll containment so the chat only
          scrolls inside this dark section, never the page. */}
      <div className="text-t1 flex min-h-0 flex-1 flex-col font-mono text-[13.5px] leading-[1.6]">
        <div
          className={cn(
            "flex min-h-0 flex-1 gap-3",
            noPadding ? "p-3" : "px-5 py-4",
          )}
        >
          {prompt ? (
            <span aria-hidden className="text-acc select-none">
              {prompt}
            </span>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
