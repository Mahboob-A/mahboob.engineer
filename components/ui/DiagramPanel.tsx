/**
 * components/ui/DiagramPanel.tsx
 *
 * Frame for every SVG architecture diagram on the site. Used by the hero
 * (Algocode request trace), the projects section (mini diagrams), and
 * /stack (force graph).
 *
 * Layout: surface background, border, 8px radius, 22px padding.
 * Header: title (mono 12px, t1, bold) + sub (mono 11px, t3).
 * Optional live indicator: green dot + "request in flight" / "live" text.
 * children: the SVG, wrapped in a horizontally-scrollable div so wide
 * diagrams don't blow out mobile.
 *
 * Usage:
 *   <DiagramPanel
 *     title="algocode — distributed online judge"
 *     sub="live request trace · 3 services · rabbitmq · docker rce"
 *     liveLabel="request in flight"
 *   >
 *     <AlgocodeDiagram />
 *   </DiagramPanel>
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DiagramPanelProps {
  title: string;
  sub: string;
  liveLabel?: string;
  children: ReactNode;
  className?: string;
}

export function DiagramPanel({
  title,
  sub,
  liveLabel,
  children,
  className,
}: DiagramPanelProps) {
  return (
    <section
      className={cn("bg-surface border-border rounded-[8px] border p-[22px]", className)}
    >
      <header className="mb-[18px] flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-t1 font-mono text-[13px] leading-tight font-semibold">
            {title}
          </div>
          <div className="text-t3 mt-[3px] font-mono text-[11px]">{sub}</div>
        </div>
        {liveLabel ? (
          <div className="text-acc flex items-center gap-1.5 font-mono text-[11px] font-medium">
            <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full shadow-[0_0_0_3px_rgba(92,201,160,0.15)]" />
            {liveLabel}
          </div>
        ) : null}
      </header>

      {/* Horizontally scrollable so wide diagrams don't blow out mobile */}
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
