/**
 * components/stack/StackShell.tsx
 *
 * Client-side interactive shell for /stack. Owns the activeId
 * useState, derives the per-tech detail data (projects, posts,
 * neighbors) eagerly so the TechDetailPanel can be a Server
 * Component-equivalent pure presentational piece.
 *
 * Layout (Phase 16: replaced the D3 force graph with the grouped
 * list on every breakpoint — the user prefers this view):
 *   - On lg+ (desktop): 2-col grid — grouped tech list left,
 *     detail panel right.
 *   - On <lg (mobile): single-col — list above detail panel.
 *     Clicking a list row scrolls the detail panel into view.
 *
 * Deep-link support: reads window.location.hash on mount and seeds
 * activeId if a matching tech id is present. Honors T3.3's
 * /stack#tech-id chip links.
 */

"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { TechDetailPanel } from "@/components/stack/TechDetailPanel";
import { MobileTechList } from "@/components/stack/MobileTechList";
import {
  STACK_BY_ID,
  type StackItem,
  type StackEdge,
} from "@/data/stack";
import { PROJECTS_BY_SLUG } from "@/data/projects";
import { BLOG_POSTS_BY_SLUG, postsByStack } from "@/data/blog";
import { EXPERIENCE_BY_ID } from "@/data/experience";

export interface StackShellProps {
  techs: ReadonlyArray<StackItem>;
  edges: ReadonlyArray<StackEdge>;
  /** Pre-computed map of techId → project count (for mobile list badge). */
  projectCountByTech: Readonly<Record<string, number>>;
}

/* Subscribe to window.location.hash changes — used to honor T3.3's
   /stack#tech-id chip links. Empty subscribe fn + getServerSnapshot
   returning '' means SSR sees an empty hash. */
function subscribeHash(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function getHashSnapshot(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#/, "");
}
function getServerHashSnapshot(): string {
  return "";
}

export function StackShell({
  techs,
  edges,
  projectCountByTech,
}: StackShellProps) {
  const hash = useSyncExternalStore(subscribeHash, getHashSnapshot, getServerHashSnapshot);
  const seedId = useMemo(
    () => (hash && STACK_BY_ID[hash] ? hash : null),
    [hash],
  );
  const [activeId, setActiveId] = useState<string | null>(seedId);

  /* Tech-detail data derivation. */
  const detail = useMemo(() => {
    if (!activeId) return null;
    const tech = STACK_BY_ID[activeId];
    if (!tech) return null;

    /* Phase 22: split the tech.projects slugs into two arrays.
       Resolved ones turn into the project cards on the right.
       Unresolved slugs (e.g. "nexbell" — no /work/<nexbell> case
       study exists, but the slug is a reference string tying the
       tech to the NexBell tenure) surface as an informational
       note in the detail panel rather than getting filtered
       out silently and leaving a "0 projects" caption. */

    const resolvedProjects: typeof PROJECTS_BY_SLUG[string][] = [];
    const unresolvedRefs: Array<{
      slug: string;
      /** Experience entry id that matches the slug, if any. */
      company: string | null;
      period: string | null;
      status: "active" | "completed" | null;
    }> = [];
    for (const slug of tech.projects) {
      const project = PROJECTS_BY_SLUG[slug];
      if (project) {
        resolvedProjects.push(project);
      } else {
        const exp = EXPERIENCE_BY_ID[slug];
        unresolvedRefs.push({
          slug,
          company: exp?.company ?? null,
          period: exp?.period ?? null,
          status: exp?.status ?? null,
        });
      }
    }

    const projects = resolvedProjects;

    const posts = postsByStack(tech.id);
    const postsFiltered = posts.filter((p) => BLOG_POSTS_BY_SLUG[p.slug]);

    /* Neighbors: techs that share at least one project with the
       current tech. Rank by sharedCount desc. */
    const projectTechCounts = new Map<string, number>();
    for (const p of projects) {
      for (const t of techs) {
        if (t.id === tech.id) continue;
        if (t.projects.includes(p.slug)) {
          projectTechCounts.set(t.id, (projectTechCounts.get(t.id) ?? 0) + 1);
        }
      }
    }
    const neighbors = [...projectTechCounts.entries()]
      .map(([id, sharedCount]) => ({ tech: STACK_BY_ID[id], sharedCount }))
      .filter(
        (n): n is { tech: StackItem; sharedCount: number } => n.tech != null,
      );

    return { tech, projects, posts: postsFiltered, neighbors, unresolvedRefs };
  }, [activeId, techs]);

  /* Suggested nodes for the empty state — top-5 most-connected. */
  const suggested = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of edges) {
      counts.set(String(e.source), (counts.get(String(e.source)) ?? 0) + 1);
      counts.set(String(e.target), (counts.get(String(e.target)) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, connectionCount]) => ({ tech: STACK_BY_ID[id], connectionCount }))
      .filter(
        (s): s is { tech: StackItem; connectionCount: number } => s.tech != null,
      );
  }, [edges]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      {/* LEFT — grouped tech list (Phase 16: replaces the D3 graph
         on every breakpoint). The user prefers this layout: techs
         grouped by domain, project count badge per row, click to
         inspect. MobileTechList was previously the <lg fallback;
         it's now the canonical view. The container keeps the same
         fixed height + overflow-y-auto so the list scrolls inside
         the 2-col grid without pushing the detail panel down. */}
      <div className="space-y-4">
        <Legend />

        <div className="bg-surface border-border relative h-[600px] overflow-hidden rounded-[10px] border lg:h-[680px]">
          <div className="h-full w-full overflow-y-auto">
            <MobileTechList
              techs={techs}
              projectCountByTech={projectCountByTech}
              onSelect={setActiveId}
            />
          </div>
        </div>
      </div>

      {/* RIGHT — detail panel */}
      <TechDetailPanel
        tech={detail?.tech ?? null}
        projects={detail?.projects ?? []}
        unresolvedRefs={detail?.unresolvedRefs ?? []}
        posts={detail?.posts ?? []}
        neighbors={detail?.neighbors ?? []}
        onSelect={setActiveId}
        suggested={suggested}
      />
    </div>
  );
}

/* ─── Legend — color legend for the graph domains ──────────────────── */

function Legend() {
  const items: Array<{ color: string; label: string }> = [
    { color: "var(--acc)", label: "backend" },
    { color: "var(--amber)", label: "infra / async / payment / video" },
    { color: "var(--t2)", label: "data layer" },
    { color: "var(--mauve)", label: "ai / auth" },
    { color: "var(--t3)", label: "learning" },
  ];

  return (
    <div className="text-t3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px]">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}