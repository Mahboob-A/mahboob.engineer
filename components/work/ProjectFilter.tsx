/**
 * components/work/ProjectFilter.tsx
 *
 * Horizontal chip row at the top of /work. 7 chips with a count next to
 * each label. Owned by the parent (`WorkShell` — keeps `useState` and
 * the predicate logic out of this presentational component).
 *
 * 'use client' is required because the parent passes onChange callback
 * and the parent is itself client-only for state. This component is
 * purely presentational — it doesn't own any state.
 */

"use client";

import { cn } from "@/lib/cn";

export type FilterId =
  | "all"
  | "founder"
  | "distributed"
  | "video"
  | "ai"
  | "infra"
  | "backend";

export interface ProjectFilterProps {
  /** Active filter id — owned by the parent. */
  value: FilterId;
  /** Fired when the user picks a new filter. */
  onChange: (id: FilterId) => void;
  /** Concrete project count per filter — surfaced as a small badge. */
  counts: Record<FilterId, number>;
  /** Filter id → display label. Order = render order. */
  filters: Array<{ id: FilterId; label: string }>;
}

export function ProjectFilter({
  value,
  onChange,
  counts,
  filters,
}: ProjectFilterProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter projects by domain"
      className="border-border bg-surface flex flex-wrap items-center gap-2 rounded-[10px] border p-3.5"
    >
      {filters.map((f) => {
        const isActive = f.id === value;
        const count = counts[f.id] ?? 0;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(f.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5",
              "font-mono text-[12px] font-medium tracking-[0.3px]",
              "transition-colors",
              isActive
                ? "border-acc bg-acc text-bg"
                : "border-border text-t3 hover:border-t2 hover:text-t1",
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-px font-mono text-[10.5px] leading-none",
                isActive
                  ? "bg-bg/30 text-bg"
                  : "bg-card/70 text-t3",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}