/**
 * components/ui/StatRow.tsx
 *
 * 4-up metric grid used on the hero ("3 production systems shipped",
 * "6+ services in microservice architectures", "35% AWS cost reduction
 * driven", "12+ deep-dive engineering posts").
 *
 * Layout: 4-column grid with border between cells, surface background.
 * The big number is mono, amber, large. The label below is small + muted.
 *
 * Usage:
 *   <StatRow
 *     stats={[
 *       { num: "3", label: "production-grade systems shipped" },
 *       { num: "6+", label: "services in microservice architectures" },
 *       { num: "35%", label: "AWS cost reduction driven" },
 *       { num: "12+", label: "deep-dive engineering posts" },
 *     ]}
 *   />
 */

import { cn } from "@/lib/cn";

export interface StatRowStat {
  num: string;
  label: string;
}

export interface StatRowProps {
  stats: StatRowStat[];
  className?: string;
}

export function StatRow({ stats, className }: StatRowProps) {
  return (
    <div
      className={cn(
        "bg-surface border-border grid grid-cols-2 overflow-hidden rounded-[10px] border md:grid-cols-4",
        className,
      )}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className={cn(
            "border-border px-[18px] py-5",
            // Last column never gets a right border
            i === stats.length - 1 ? "" : "md:border-r",
            // Bottom border on every cell except the last row (mobile = 2x2)
            i < stats.length - 2 ? "border-b md:border-b-0" : "",
          )}
        >
          <span className="text-amber font-mono text-2xl leading-none font-semibold">
            {s.num}
          </span>
          <p className="text-t3 mt-1 text-[12px] leading-[1.4]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
