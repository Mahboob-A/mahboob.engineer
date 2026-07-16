/**
 * components/work/WorkShell.tsx
 *
 * Client-side interactive shell for /work. Owns the active-filter
 * useState, computes per-tier visible project lists, renders the
 * filter bar + 3 tier sections.
 *
 * 'use client' is required (master §6 rule 7 — interactivity stays out
 * of server components). Filter state is component-local; if a future
 * requirement wants URL-state (?filter=ai), plug in next/navigation
 * here. No localStorage — rule #3.
 *
 * Diagram rendering: founder + featured tiers pass `pickDiagram(p)`
 * to `<ProjectCard>` so each card carries the right architecture SVG.
 * Showcase tier doesn't have a diagram slot — cards stay compact.
 * Phase 8 (T8.2) — the previous FOUNDER_DIAGRAMS map was replaced by
 * the shared helper.
 */

"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/work/ProjectCard";
import {
  ProjectFilter,
  type FilterId,
} from "@/components/work/ProjectFilter";
import { pickDiagram } from "@/components/diagrams/pickDiagram";
import { type ProjectItem, type ProjectTier } from "@/data/projects";

const TIER_META: Array<{
  tier: ProjectTier;
  label: string;
  description: string;
}> = [
  {
    tier: "founder",
    label: "FOUNDER PROJECTS",
    description: "what I'm shipping right now",
  },
  {
    tier: "featured",
    label: "FEATURED BUILDS",
    description: "the headline systems",
  },
  {
    tier: "showcase",
    label: "SHOWCASE",
    description: "everyday backend work",
  },
];

/* Filter predicates — live here (the client component) because
   functions can't cross the RSC boundary. Order matches FILTERS in
   app/work/page.tsx. */
const FILTER_MATCHERS: Record<FilterId, (p: ProjectItem) => boolean> = {
  all: () => true,
  founder: (p) => p.tier === "founder" || p.domain.includes("saas"),
  distributed: (p) => p.domain.includes("distributed"),
  video: (p) => p.domain.includes("video"),
  ai: (p) => p.domain.includes("ai") || p.domain.includes("observability"),
  infra: (p) => p.domain.includes("infra") || p.domain.includes("platform"),
  backend: (p) => p.domain.includes("backend"),
};

export interface WorkShellProps {
  projects: ProjectItem[];
  filters: Array<{ id: FilterId; label: string }>;
}

export function WorkShell({ projects, filters }: WorkShellProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  /* Counts per filter — recomputed only when projects change. */
  const counts = useMemo<Record<FilterId, number>>(() => {
    const out = {} as Record<FilterId, number>;
    for (const f of filters) {
      const matcher = FILTER_MATCHERS[f.id];
      out[f.id] = projects.filter(matcher).length;
    }
    return out;
  }, [projects, filters]);

  /* Per-tier visible projects after filtering. */
  const tiered = useMemo(() => {
    const matcher = FILTER_MATCHERS[activeFilter];
    const matched = projects.filter(matcher);
    return TIER_META.map((t) => ({
      ...t,
      entries: matched.filter((p) => p.tier === t.tier),
    }));
  }, [projects, activeFilter]);

  return (
    <>
      {/* Filter bar */}
      <ProjectFilter
        value={activeFilter}
        onChange={setActiveFilter}
        counts={counts}
        filters={filters.map((f) => ({ id: f.id, label: f.label }))}
      />

      {/* Tier sections */}
      <div className="mt-12 space-y-12">
        {tiered.map(({ tier, label, description, entries }) => {
          if (entries.length === 0) return null;

          const isFounder = tier === "founder";
          return (
            <section key={tier}>
              <header className="mb-5 flex items-baseline gap-3">
                <span
                  className={
                    isFounder
                      ? "bg-amber h-[6px] w-[6px] rounded-full"
                      : "bg-acc h-[6px] w-[6px] rounded-full"
                  }
                />
                <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
                  {label}
                </h2>
                <span className="text-t3 font-mono text-[11px]">
                  {entries.length} {entries.length === 1 ? "project" : "projects"}
                </span>
                <span className="text-t3 ml-auto font-mono text-[11px] italic">
                  {description}
                </span>
              </header>

              {isFounder ? (
                // Founder: stacked full-width cards
                <div className="space-y-5">
                  {entries.map((p) => (
                    <ProjectCard
                      key={p.slug}
                      project={p}
                      variant="founder"
                      diagram={pickDiagram(p)}
                    />
                  ))}
                </div>
              ) : tier === "featured" ? (
                // Featured: 2-col grid
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {entries.map((p) => (
                    <ProjectCard
                      key={p.slug}
                      project={p}
                      variant="featured"
                      diagram={pickDiagram(p)}
                    />
                  ))}
                </div>
              ) : (
                // Showcase: 3-col grid
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {entries.map((p) => (
                    <ProjectCard
                      key={p.slug}
                      project={p}
                      variant="showcase"
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}