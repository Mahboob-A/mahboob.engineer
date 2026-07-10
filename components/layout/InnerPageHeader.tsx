/**
 * components/layout/InnerPageHeader.tsx
 *
 * Section header for every inner page. Per master §1.3 + §2 specs:
 *
 *   01 / DEPLOYMENT LOG                    ← eyebrow number + section name
 *   The full record                        ← title (display font, large)
 *   Every role, every result — not         ← one-line description (t2, muted)
 *   summarised.
 *
 * All three are optional — pages can omit fields they don't need.
 */

import { cn } from "@/lib/cn";

export interface InnerPageHeaderProps {
  /** Section number ("01", "02", …). Optional. */
  num?: string;
  /** Section name in caps eyebrow ("DEPLOYMENT LOG", "SYSTEMS", etc.). */
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
  num,
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
            {num ? `${num} / ${section}` : section}
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
