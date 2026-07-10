/**
 * components/layout/InnerLayout.tsx
 *
 * Shared shell for every non-landing page (/log, /work, /stack, /writing,
 * /contact, /game, /work/[slug], /writing/[slug]).
 *
 * Layout (master §1.3 + flat mockup):
 *
 *   ┌───────────────────────────────────────────┐
 *   │ ← home                                    │  ← BackLink
 *   │                                           │
 *   │  01 / DEPLOYMENT LOG                      │  ← InnerPageHeader
 *   │  The full record                          │
 *   │  Every role, every result — not…          │
 *   │                                           │
 *   │  ┌─ content (children) ─────────────────┐ │
 *   │  │                                      │ │
 *   │  │   each inner page renders here       │ │
 *   │  │                                      │ │
 *   │  └──────────────────────────────────────┘ │
 *   └───────────────────────────────────────────┘
 *
 * Two scope decisions live here:
 *   - Maximum width is 1180px (matches the landing-page shell).
 *   - Top padding 48px so the BackLink has breathing room.
 *
 * Usage in an inner page:
 *   export default function Page() {
 *     return (
 *       <InnerLayout
 *         backHref="/"
 *         backLabel="← home"
 *         header={{
 *           num: "01",
 *           section: "DEPLOYMENT LOG",
 *           title: "The full record",
 *           description: "Every role, every result — not summarised.",
 *         }}
 *       >
 *         {/* page-specific content *\/}
 *       </InnerLayout>
 *     );
 *   }
 */

import type { ReactNode } from "react";
import { BackLink } from "./BackLink";
import { InnerPageHeader } from "./InnerPageHeader";
import { cn } from "@/lib/cn";

export interface InnerLayoutProps {
  children: ReactNode;
  /** BackLink href. Default `/`. */
  backHref?: string;
  /** BackLink label. Default `"← home"`. */
  backLabel?: string;
  /** InnerPageHeader props. Omit if the page has its own header. */
  header?: {
    num?: string;
    section?: string;
    title?: string;
    description?: string;
    rightSlot?: ReactNode;
    className?: string;
  };
  /** Override the outer container width. Default `max-w-[1180px]`. */
  className?: string;
  /** Content max-width override. Default `max-w-[1180px]`. */
  contentClassName?: string;
}

export function InnerLayout({
  children,
  backHref = "/",
  backLabel = "← home",
  header,
  className,
  contentClassName,
}: InnerLayoutProps) {
  return (
    <div className={cn("bg-bg min-h-full", className)}>
      <div className={cn("mx-auto max-w-[1180px] px-6 pt-12 pb-20 md:px-8")}>
        <BackLink href={backHref} label={backLabel} className="mb-8" />

        {header && header.section && header.title ? (
          <InnerPageHeader
            num={header.num}
            section={header.section}
            title={header.title}
            description={header.description}
            rightSlot={header.rightSlot}
            className={header.className}
          />
        ) : null}

        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
