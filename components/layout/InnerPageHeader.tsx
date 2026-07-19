/**
 * components/layout/InnerPageHeader.tsx
 *
 * Section header for every inner page. Phase 25 dropped the
 * eyebrow line from the landing sections and switched the
 * inner-page eyebrow to lowercase prose labels.
 *
 *   the run so far                           ← eyebrow (lowercase mono)
 *   Where I've shipped, what I built,        ← title (display font)
 *   and how it went.
 *   Work and education. In detail.           ← description (t2, muted)
 *
 * `num` is kept on the prop interface for backward compatibility
 * with existing call sites but is no longer rendered.
 */

import { cn } from "@/lib/cn";

export interface InnerPageHeaderProps {
  /** Section number (kept for backward compatibility — not rendered). */
  num?: string;
  /** Eyebrow label in mono caps ("Where I've shipped", etc.). */
  section: string;
  /** Big display-font title ("The full record", "Everything I've built end-to-end"). */
  title: string;
  /** One-line description shown below the title. Optional. */
  description?: string;
  /** Optional extra <div> rendered to the right of the title row
   *  (e.g. a filter chip row on /work). */
  rightSlot?: React.ReactNode;
  className?: string;
}

export function InnerPageHeader({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  num: _num,
  section,
  title,
  description,
  rightSlot,
  className,
}: InnerPageHeaderProps) {
  return (
    <header className={cn("mb-12", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="text-acc font-mono text-[13px] tracking-[1px]">
            {section}
          </p>
          <h1 className="font-display text-t1 mt-2.5 text-[clamp(28px,4vw,40px)] leading-[1.1] font-bold tracking-[-0.5px]">
            {title}
          </h1>
          {description ? (
            <p className="text-t2 mt-3 max-w-[520px] text-[15px]">{description}</p>
          ) : null}
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
