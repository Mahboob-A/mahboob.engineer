/**
 * components/writing/SeriesNav.tsx
 *
 * Bottom-of-post prev/next navigation when the post belongs to a
 * series. Looks up the series via `postsInSeries(post.series)`
 * and finds the prev / next post by `part` number.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import Link from "next/link";
import { postsInSeries, type BlogPostItem } from "@/data/blog";

export interface SeriesNavProps {
  post: BlogPostItem;
}

export function SeriesNav({ post }: SeriesNavProps) {
  if (!post.series) return null;
  const series = postsInSeries(post.series);
  const myPart = post.part ?? 0;
  const prev = series.find((p) => (p.part ?? 0) === myPart - 1);
  const next = series.find((p) => (p.part ?? 0) === myPart + 1);

  if (!prev && !next) return null;

  return (
    <section className="border-border mt-10 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.url}
          className="bg-surface border-border hover:border-acc/40 flex flex-col rounded-[8px] border p-4 transition-colors"
        >
          <span className="text-t3 mb-1 font-mono text-[10px] tracking-[1.5px] uppercase">
            ← Previous in {post.series}
          </span>
          <span className="text-t1 text-[14px] font-semibold">{prev.title}</span>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Link
          href={next.url}
          className="bg-surface border-border hover:border-acc/40 flex flex-col items-end rounded-[8px] border p-4 text-right transition-colors sm:items-end"
        >
          <span className="text-t3 mb-1 font-mono text-[10px] tracking-[1.5px] uppercase">
            Next in {post.series} →
          </span>
          <span className="text-t1 text-[14px] font-semibold">{next.title}</span>
        </Link>
      ) : (
        <div aria-hidden />
      )}
    </section>
  );
}
