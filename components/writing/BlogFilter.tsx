/**
 * components/writing/BlogFilter.tsx
 *
 * Filter UI for /writing:
 *   - Search bar (plaintext substring against title + tags)
 *   - 8 category chips (All + 7 BlogCategory values)
 *   - 2 source toggles (Native / Medium)
 *
 * Stateless — receives `value`, `onChange`, `counts` from parent.
 * Parent lives in app/writing's WritingShell.tsx client component
 * (filter state crosses the RSC boundary via serializable state).
 *
 * Source: portfolio-master-doc.md §2.5.
 */

"use client";

import { CATEGORIES, type BlogCategory, type BlogSource } from "@/data/blog";

export type FilterCategory = BlogCategory | "all";

export interface BlogFilterValue {
  category: FilterCategory;
  sources: BlogSource[];
  query: string;
}

export const INITIAL_FILTER: BlogFilterValue = {
  category: "all",
  sources: ["native", "medium"],
  query: "",
};

export interface BlogFilterCounts {
  /** Total per category: category id → count. Includes "all" mapped
   *  to total post count. */
  byCategory: Record<FilterCategory, number>;
  /** Total per source: source id → count. */
  bySource: Record<BlogSource, number>;
}

export interface BlogFilterProps {
  value: BlogFilterValue;
  onChange: (next: BlogFilterValue) => void;
  counts: BlogFilterCounts;
}

/** True if `tag` matches the user's lowercase substring query. */
function matchesQuery(query: string, fields: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return haystack.includes(q);
}

/** Pure helper: returns true if a post passes the current filter. */
export function postMatchesFilter(
  post: { source: BlogSource; category: BlogCategory; title: string; tags: string[]; excerpt?: string },
  filter: BlogFilterValue,
): boolean {
  if (!filter.sources.includes(post.source)) return false;
  if (filter.category !== "all" && post.category !== filter.category) return false;
  if (!matchesQuery(filter.query, [post.title, post.excerpt ?? "", ...post.tags])) {
    return false;
  }
  return true;
}

export function BlogFilter({ value, onChange, counts }: BlogFilterProps) {
  return (
    <div className="mb-10 flex flex-col gap-5">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="writing-search"
          className="text-t3 font-mono text-[12px] tracking-[1px] uppercase"
        >
          Search
        </label>
        <input
          id="writing-search"
          type="text"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="search posts…"
          className="bg-code-bg border-border text-t1 placeholder:text-t3 focus:border-acc flex-1 rounded-[6px] border px-3 py-2 font-mono text-[13px] outline-none transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-t3 mr-1 font-mono text-[12px] tracking-[1px] uppercase">
          Category
        </span>
        <CategoryChip
          label="All"
          active={value.category === "all"}
          onClick={() => onChange({ ...value, category: "all" })}
          count={counts.byCategory.all}
        />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.label}
            active={value.category === c.id}
            onClick={() => onChange({ ...value, category: c.id })}
            count={counts.byCategory[c.id] ?? 0}
          />
        ))}
      </div>

      {/* Source toggles */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-t3 font-mono text-[12px] tracking-[1px] uppercase">
          Source
        </span>
        {(["native", "medium"] as const).map((source) => {
          const active = value.sources.includes(source);
          return (
            <button
              key={source}
              type="button"
              aria-pressed={active}
              onClick={() => {
                const next = active
                  ? value.sources.filter((s) => s !== source)
                  : [...value.sources, source];
                onChange({ ...value, sources: next });
              }}
              className={
                active
                  ? "border-acc bg-acc-dim text-acc rounded-full border px-4 py-1.5 font-mono text-[12px] font-semibold transition-colors"
                  : "border-border text-t3 hover:text-t1 rounded-full border px-4 py-1.5 font-mono text-[12px] transition-colors"
              }
            >
              {source === "native" ? "Native" : "Medium"} ·{" "}
              {counts.bySource[source]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CategoryChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}

function CategoryChip({ label, active, onClick, count }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "bg-acc text-bg rounded-full px-3.5 py-1.5 font-mono text-[12px] font-semibold transition-colors"
          : "border-border text-t3 hover:text-t1 rounded-full border px-3.5 py-1.5 font-mono text-[12px] transition-colors"
      }
    >
      {label} <span className="opacity-60">· {count}</span>
    </button>
  );
}
