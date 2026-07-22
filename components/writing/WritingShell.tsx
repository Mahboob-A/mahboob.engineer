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
 *   - Phase 24 (T24.5): 9-card collapse on every category.
 *     URL-seeded `?all=1` so refresh + deep links keep state.
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

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
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

const COLLAPSE_AT = 9;

export interface WritingShellProps {
  allPosts: BlogPostItem[];
  series: Record<string, BlogPostItem[]>;
}

export function WritingShell({ allPosts, series }: WritingShellProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<BlogFilterValue>(INITIAL_FILTER);

  // Phase 24 (T24.5): URL is the single source of truth for the
  // collapse state via ?all=1. useSyncExternalStore keeps the
  // component in sync with browser back/forward and any external
  // URL mutation. Server snapshot returns false for SSR parity.
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("popstate", cb);
    return () => window.removeEventListener("popstate", cb);
  }, []);
  const getSnapshot = () =>
    typeof window === "undefined"
      ? false
      : new URLSearchParams(window.location.search).get("all") === "1";
  const expanded = useSyncExternalStore(subscribe, getSnapshot, () => false);

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

  // Collapse: apply on every category, not just `All`. The user
  // explicitly asked for this — every category view shows the
  // first 9 cards with a "Show all N" toggle.
  const shownPosts = expanded
    ? visible
    : visible.slice(0, COLLAPSE_AT);
  const remaining = visible.length - shownPosts.length;

  const toggleCollapse = () => {
    const next = !expanded;
    router.replace(next ? "/writing?all=1" : "/writing", { scroll: false });
  };

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

      {/* Main grid — phase 6 (T6.9): wrapped in <section> + <h2>
         so the BlogCard <h3> titles have a valid heading hierarchy.
         axe-core flagged h1 (from InnerPageHeader) → h3 skip.
         Phase 24 (T24.5): id="writing-list" so the toggle's
         aria-controls can point at it. */}
      {visible.length === 0 ? (
        <section>
          <h2 className="sr-only">No matching posts</h2>
          <EmptyState />
        </section>
      ) : (
        <section>
          <h2 className="sr-only">All posts</h2>
          <div
            id="writing-list"
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {shownPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Collapse toggle. Hidden when visible fits in COLLAPSE_AT
             cards (no-op for narrow categories like Linux with 5 posts). */}
          {remaining > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={toggleCollapse}
                aria-expanded={expanded}
                aria-controls="writing-list"
                className="border-border text-t1 hover:border-acc hover:text-acc inline-flex items-center gap-2 rounded-md border px-5 py-2.5 font-mono text-[12px] font-medium transition-colors"
              >
                {expanded ? "Show fewer" : `Show all ${visible.length}`}
                <span aria-hidden>{expanded ? "↑" : "↓"}</span>
              </button>
            </div>
          )}
        </section>
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