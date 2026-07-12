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
  label: string;
  /** Body content (forms, prose, status blocks). */
  children: ReactNode;
  /** Optional prompt glyph rendered before each line of children. Defaults to "$". */
  prompt?: string;
  /** Optional extra classes on the outer wrapper. */
  className?: string;
}

export function TerminalBlock({
  label,
  children,
  prompt = "$",
  className,
}: TerminalBlockProps) {
  return (
    <div
      className={cn(
        "bg-code-bg border-border overflow-hidden rounded-[10px] border",
        className,
      )}
    >
      {/* Title bar: 3 dots + label */}
      <div className="border-border bg-surface/40 flex items-center gap-2 border-b px-4 py-3">
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
        <span className="text-t3 mx-auto font-mono text-[11px] tracking-[0.3px]">
          {label}
        </span>
        {/* Filler for symmetric dot row — keeps the label truly centered. */}
        <span className="w-[58px]" aria-hidden />
      </div>

      {/* Body — padded, prompt glyph on the left of each child block */}
      <div className="text-t1 font-mono text-[13.5px] leading-[1.6]">
        <div className="flex gap-3 px-5 py-4">
          <span aria-hidden className="text-acc select-none">
            {prompt}
          </span>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
