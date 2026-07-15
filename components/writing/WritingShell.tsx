/**
 * components/writing/WritingShell.tsx
 *
 * `'use client'` state owner for the /writing list page.
 *
 * Responsibilities:
 *   - Owns the BlogFilterValue (category + sources + query).
 *   - Computes filtered posts on each state change via useMemo.
 *   - Picks the featured post (most recent native, or first medium).
 *   - Renders the featured card, filter, grid, and SeriesRail.
 *
 * The component is fed:
 *   - `allPosts`: the merged native + medium list, already sorted
 *     newest-first at the page level.
 *   - `series`: pre-computed Record<seriesName, posts[]> for the
 *     SeriesRail. We pass it through unchanged so the rail can
 *     render every series even when the main grid is filtered.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

"use client";

import { useMemo, useState } from "react";
import {
  BlogCard,
} from "@/components/writing/BlogCard";
import {
  BlogFilter,
  INITIAL_FILTER,
  postMatchesFilter,
  type BlogFilterCounts,
  type BlogFilterValue,
} from "@/components/writing/BlogFilter";
import { SeriesRail } from "@/components/writing/SeriesRail";
import type { BlogPostItem } from "@/data/blog";

export interface WritingShellProps {
  allPosts: BlogPostItem[];
  series: Record<string, BlogPostItem[]>;
}

export function WritingShell({ allPosts, series }: WritingShellProps) {
  const [filter, setFilter] = useState<BlogFilterValue>(INITIAL_FILTER);

  // Featured post: prefer the most recent native; fallback to the
  // first medium post. Unfiltered — the featured post is always shown.
  const featured = useMemo(() => {
    const native = allPosts.find((p) => p.source === "native");
    return native ?? allPosts[0] ?? null;
  }, [allPosts]);

  // Apply filter.
  const visible = useMemo(
    () => allPosts.filter((p) => postMatchesFilter(p, filter)),
    [allPosts, filter],
  );

  // Compute counts once per render — used by the filter chips.
  const counts = useMemo<BlogFilterCounts>(() => {
    const byCategory: BlogFilterCounts["byCategory"] = {
      all: allPosts.length,
      distributed: 0,
      linux: 0,
      docker: 0,
      video: 0,
      ai: 0,
      platform: 0,
      career: 0,
    };
    const bySource: BlogFilterCounts["bySource"] = {
      native: 0,
      medium: 0,
    };
    for (const p of allPosts) {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
      bySource[p.source] = (bySource[p.source] ?? 0) + 1;
    }
    return { byCategory, bySource };
  }, [allPosts]);

  // Filter the series rail too: only show series with ≥1 visible post.
  // (The rail renders separately so users can browse parts even when
  // the grid is filtered to a different topic.)
  const visibleSeries = useMemo(() => {
    const visibleSlugs = new Set(visible.map((p) => p.slug));
    const out: Record<string, BlogPostItem[]> = {};
    for (const [name, posts] of Object.entries(series)) {
      const filtered = posts.filter((p) => visibleSlugs.has(p.slug));
      if (filtered.length > 0) out[name] = filtered;
    }
    return out;
  }, [visible, series]);

  return (
    <>
      {/* Featured post (always rendered, never filtered out) */}
      {featured && (
        <div className="mb-10">
          <p className="text-acc mb-2 font-mono text-[12px] tracking-[1.5px] uppercase">
            Featured
          </p>
          <BlogCard post={featured} variant="featured" />
        </div>
      )}

      {/* Filter bar */}
      <BlogFilter value={filter} onChange={setFilter} counts={counts} />

      {/* Main grid */}
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* Series rail — only show when at least one series has hits */}
      {Object.keys(visibleSeries).length > 0 && (
        <SeriesRail series={visibleSeries} />
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface border-border mx-auto flex max-w-[640px] flex-col items-center gap-3 rounded-[10px] border p-10 text-center">
      <p className="text-t3 font-mono text-[11px] tracking-[1.5px] uppercase">
        No matches
      </p>
      <h3 className="font-display text-t1 text-[20px] font-semibold">
        Nothing here matches that filter.
      </h3>
      <p className="text-t2 text-[13.5px]">
        Try clearing the search box, switching the source toggle, or
        picking a different category.
      </p>
    </div>
  );
}