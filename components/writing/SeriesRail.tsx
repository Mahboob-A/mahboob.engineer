/**
 * components/writing/SeriesRail.tsx
 *
 * Horizontal-scroll display of posts grouped by series. Each series
 * shows up to 4 cards in a flex-row with overflow-x-auto; on
 * narrow viewports the user scrolls horizontally to see more parts.
 *
 * If a series has only one post (e.g. part 1 with no parts 2-4
 * yet), we render it as a single card with a "future parts coming"
 * caption.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import { BlogCard } from "@/components/writing/BlogCard";
import type { BlogPostItem } from "@/data/blog";

export interface SeriesRailProps {
  /** Map of series name → ordered posts in that series. */
  series: Record<string, BlogPostItem[]>;
}

export function SeriesRail({ series }: SeriesRailProps) {
  const seriesNames = Object.keys(series);
  if (seriesNames.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-6">
        <p className="text-acc mb-2 font-mono text-[13px] tracking-[1px]">
          SERIES
        </p>
        <h2 className="font-display text-t1 text-[clamp(22px,3vw,32px)] font-bold tracking-[-0.5px]">
          Multi-part deep dives
        </h2>
        <p className="text-t2 mt-2 max-w-[520px] text-[14px]">
          Long-running series I return to. Each part stands alone but
          reads better in order.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {seriesNames.map((name) => (
          <SeriesBlock key={name} name={name} posts={series[name]} />
        ))}
      </div>
    </section>
  );
}

function SeriesBlock({ name, posts }: { name: string; posts: BlogPostItem[] }) {
  // Sort by `part` ascending so the rail reads in order.
  const ordered = [...posts].sort(
    (a, b) => (a.part ?? 0) - (b.part ?? 0),
  );

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-t1 text-[20px] font-semibold tracking-[-0.3px]">
          {name}
        </h3>
        <span className="text-t3 font-mono text-[11px] tracking-[1px] uppercase">
          {ordered.length === 1
            ? "1 part so far — more coming"
            : `${ordered.length} parts`}
        </span>
      </div>
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3">
        {ordered.map((p) => (
          <div
            key={p.slug}
            className="w-[280px] flex-shrink-0 snap-start sm:w-[320px]"
          >
            <BlogCard post={p} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  );
}
