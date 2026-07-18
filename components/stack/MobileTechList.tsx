/**
 * components/stack/MobileTechList.tsx
 *
 * Grouped tech list for /stack. Was previously the mobile-only
 * fallback (with the desktop D3ForceGraph paired at lg+), but
 * Phase 16 dropped the D3 graph entirely and this list became
 * the canonical view at every breakpoint. Kept the file name
 * for now — renaming would touch the import in StackShell + this
 * JSDoc for cosmetic-only value.
 *
 * Each row is a button that fires `onSelect(techId)`. The parent
 * StackShell handles scroll-to-panel logic for narrow screens.
 *
 * Server Component. The interactive parent (StackShell) passes
 * `onSelect` through, so a click on a row sets the activeId in the
 * React tree and the right-side panel updates.
 */

import { type StackItem, type StackDomain } from "@/data/stack";
import { cn } from "@/lib/cn";

export interface MobileTechListProps {
  techs: ReadonlyArray<StackItem>;
  /** Project count per tech id, for the badge column. */
  projectCountByTech: Readonly<Record<string, number>>;
  onSelect: (id: string) => void;
  className?: string;
}

const DOMAIN_ORDER: StackDomain[] = [
  "backend",
  "infra",
  "data",
  "async",
  "auth",
  "payment",
  "video",
  "ai",
  "learning",
];

const DOMAIN_LABEL: Record<StackDomain, string> = {
  backend: "Backend",
  infra: "Infrastructure",
  data: "Data layer",
  async: "Async / Messaging",
  auth: "Auth",
  payment: "Payment",
  video: "Video",
  ai: "AI / ML",
  learning: "Learning",
};

export function MobileTechList({
  techs,
  projectCountByTech,
  onSelect,
  className,
}: MobileTechListProps) {
  /* Group techs by domain, preserving the canonical order. */
  const grouped = DOMAIN_ORDER.map((domain) => ({
    domain,
    items: techs.filter((t) => t.domain === domain),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      className={cn("bg-surface border-border rounded-[10px] border", className)}
    >
      {grouped.map(({ domain, items }) => (
        <section
          key={domain}
          className="border-border not-first:border-t first:border-t-0 border-t p-4 first:pt-4 last:pb-4"
        >
          <p className="text-t3 mb-2 font-mono text-[11px] tracking-[1px] uppercase">
            {DOMAIN_LABEL[domain]}
            <span className="text-t3 ml-2">
              {items.length}
            </span>
          </p>
          <ul className="space-y-1">
            {items.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(t.id);
                    /* Scroll the detail panel into view. The browser's
                       smooth-scroll behavior is set globally via globals.css
                       so the panel animates up. */
                    if (typeof window !== "undefined") {
                      const target = document.getElementById(
                        "tech-detail-panel",
                      );
                      target?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="hover:bg-card/40 border-border flex w-full items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-2.5 text-left transition-colors"
                >
                  <span className="text-t1 font-mono text-[13px]">
                    {t.name}
                  </span>
                  <span className="text-t3 font-mono text-[11px]">
                    {projectCountByTech[t.id] ?? 0} project
                    {(projectCountByTech[t.id] ?? 0) === 1 ? "" : "s"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}