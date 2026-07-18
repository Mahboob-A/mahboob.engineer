/**
 * components/stack/TechDetailPanel.tsx
 *
 * Right-side panel on /stack. Pure presentational — receives the
 * selected tech + derived data from the parent StackShell and renders
 * a context card. No state, no client interactivity (the panel is a
 * Server Component, but it's mounted inside a parent that is a Client
 * Component, so Next.js will still serialize the props correctly).
 *
 * Layout (when tech is non-null):
 *   - Tech name (display font, large)
 *   - Domain badge
 *   - "used in N projects" → list of links to /work/[slug]
 *   - "mentioned in N posts" → list of blog post links
 *   - "shares projects with" → chip list of neighbors (clickable)
 *   - depth (for learning domain only)
 *
 * When tech is null: default state with suggested nodes.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { type StackItem, type StackDomain } from "@/data/stack";
import { type ProjectItem } from "@/data/projects";
import type { BlogPostItem } from "@/data/blog";

export interface TechDetailPanelProps {
  tech: StackItem | null;
  /** All projects from PROJECTS, filtered to those that reference `tech.id`. */
  projects: ReadonlyArray<ProjectItem>;
  /**
   * Phase 22: project slugs from `tech.projects` that did not
   * resolve to a real project in `data/projects.ts` (e.g. the
   * `"nexbell"` slug is a reference string for the NexBell
   * tenure, with no /work/<nexbell> case study). Surfaced as an
   * informational note ("Used at NexBell Inc. (Nov 2024 – Jun
   * 2026)") instead of getting dropped silently.
   */
  unresolvedRefs: ReadonlyArray<{
    slug: string;
    company: string | null;
    period: string | null;
    status: "active" | "completed" | null;
  }>;
  /** Blog posts that mention this tech. */
  posts: ReadonlyArray<BlogPostItem>;
  /** Other techs that share at least one project with `tech`. */
  neighbors: ReadonlyArray<{ tech: StackItem; sharedCount: number }>;
  /** Callback to update the parent's activeId. Always required. */
  onSelect: (id: string) => void;
  /** Suggested techs shown in the empty state. */
  suggested?: ReadonlyArray<{ tech: StackItem; connectionCount: number }>;
}

const DOMAIN_LABEL: Record<StackDomain, string> = {
  backend: "Backend",
  infra: "Infrastructure",
  async: "Async / Messaging",
  data: "Data layer",
  ai: "AI / ML",
  video: "Video",
  auth: "Auth",
  payment: "Payment",
  learning: "Learning",
};

const DOMAIN_CHIP: Record<StackDomain, "sage" | "slate" | "amber" | "mauve"> = {
  backend: "sage",
  infra: "slate",
  async: "amber",
  data: "slate",
  ai: "mauve",
  video: "amber",
  auth: "mauve",
  payment: "amber",
  learning: "mauve",
};

export function TechDetailPanel({
  tech,
  projects,
  unresolvedRefs,
  posts,
  neighbors,
  onSelect,
  suggested,
}: TechDetailPanelProps) {
  /* Sort neighbors by sharedCount desc, then by name. */
  const sortedNeighbors = [...neighbors].sort(
    (a, b) => b.sharedCount - a.sharedCount || a.tech.name.localeCompare(b.tech.name),
  );

  return (
    <aside
      id="tech-detail-panel"
      className="bg-surface border-border flex h-full flex-col gap-5 rounded-[10px] border p-5 md:p-6"
    >
      {tech ? (
        <DetailForTech
          tech={tech}
          projects={projects}
          unresolvedRefs={unresolvedRefs}
          posts={posts}
          neighbors={sortedNeighbors}
          onSelect={onSelect}
        />
      ) : (
        <DetailEmpty suggested={suggested ?? []} onSelect={onSelect} />
      )}
    </aside>
  );
}

/* ─── Tech-detail body ─────────────────────────────────────────────── */

function DetailForTech({
  tech,
  projects,
  unresolvedRefs,
  posts,
  neighbors,
  onSelect,
}: {
  tech: StackItem;
  projects: ReadonlyArray<ProjectItem>;
  unresolvedRefs: ReadonlyArray<{
    slug: string;
    company: string | null;
    period: string | null;
    status: "active" | "completed" | null;
  }>;
  posts: ReadonlyArray<BlogPostItem>;
  neighbors: ReadonlyArray<{ tech: StackItem; sharedCount: number }>;
  onSelect: (id: string) => void;
}) {
  const isLearning = tech.domain === "learning";
  /* Phase 22: total references = resolved projects + unresolved
     reference notes. The section caption adjusts to read
     "N references" when there are unresolved ones (mixing
     projects + references in one count is confusing), otherwise
     falls back to the original "N project(s)" wording. */
  const totalRefs = projects.length + unresolvedRefs.length;
  const caption = (() => {
    if (totalRefs === 0) return { count: 0, label: "projects", tone: "empty" as const };
    if (unresolvedRefs.length === 0) {
      return {
        count: projects.length,
        label: projects.length === 1 ? "project" : "projects",
        tone: "projects" as const,
      };
    }
    if (projects.length === 0) {
      return {
        count: unresolvedRefs.length,
        label: unresolvedRefs.length === 1 ? "reference" : "references",
        tone: "references" as const,
      };
    }
    /* Mixed: render both counts in the caption. */
    return {
      count: totalRefs,
      label: totalRefs === 1 ? "reference" : "references",
      tone: "mixed" as const,
      projectCount: projects.length,
      referenceCount: unresolvedRefs.length,
    };
  })();
  return (
    <>
      <header>
        <div className="mb-2 flex items-center gap-2">
          <Chip color={DOMAIN_CHIP[tech.domain]}>{DOMAIN_LABEL[tech.domain]}</Chip>
          {isLearning && tech.depth != null ? (
            <span className="text-amber font-mono text-[11px]">
              {tech.depth}% leveling up
            </span>
          ) : null}
        </div>
        <h2 className="font-display text-t1 text-[28px] leading-[1.1] font-bold tracking-[-0.5px]">
          {tech.name}
        </h2>
      </header>

      {/* Used in projects + unresolved reference notes */}
      {projects.length > 0 ? (
        <Section
          label="Used in"
          count={
            caption.tone === "mixed"
              ? caption.projectCount
              : caption.count
          }
          countLabel={
            caption.tone === "mixed"
              ? `project${caption.projectCount === 1 ? "" : "s"} + ${caption.referenceCount} ${caption.referenceCount === 1 ? "reference" : "references"}`
              : caption.label
          }
        >
          <ul className="space-y-1.5">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="text-t1 hover:text-acc font-body text-[14px] font-semibold transition-colors"
                >
                  {p.name}
                </Link>
                <span className="text-t3 ml-2 font-mono text-[11px]">
                  {p.tier}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : unresolvedRefs.length > 0 ? (
        <Section
          label="Used in"
          count={unresolvedRefs.length}
          countLabel={unresolvedRefs.length === 1 ? "reference" : "references"}
        >
          <ul className="space-y-1.5">
            {unresolvedRefs.map((ref) => (
              <li
                key={ref.slug}
                data-ref-slug={ref.slug}
                className="text-t2 text-[14px]"
              >
                <span className="font-semibold">{ref.company ?? ref.slug}</span>
                {ref.period ? (
                  <span className="text-t3 font-mono text-[11px]">
                    {" · "}
                    {ref.period}
                  </span>
                ) : null}
                {ref.status === "active" ? (
                  <span className="text-amber font-mono text-[10.5px] uppercase tracking-wide">
                    {" · active"}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section label="Used in" count={0} countLabel="projects">
          <p className="text-t3 font-mono text-[12px]">
            Not yet wired into any project.
          </p>
        </Section>
      )}

      {/* Reference-only note: when the tech has unresolved refs but
         no resolved projects. Renders after the project list so
         the panel reads "Used in 1 project: Taply. Referenced at
         NexBell Inc. (Nov 2024 – Jun 2026)." */}
      {projects.length > 0 && unresolvedRefs.length > 0 ? (
        <section>
          <p className="text-t3 mb-2 flex items-baseline gap-2 font-mono text-[11px] tracking-[1px] uppercase">
            <span>Referenced at</span>
            <span className="text-t3">
              {unresolvedRefs.length === 1 ? "1 company" : `${unresolvedRefs.length} companies`}
            </span>
          </p>
          <ul className="space-y-1.5">
            {unresolvedRefs.map((ref) => (
              <li
                key={ref.slug}
                data-ref-slug={ref.slug}
                className="text-t2 text-[14px]"
              >
                <span className="font-semibold">{ref.company ?? ref.slug}</span>
                {ref.period ? (
                  <span className="text-t3 font-mono text-[11px]">
                    {" · "}
                    {ref.period}
                  </span>
                ) : null}
                {ref.status === "active" ? (
                  <span className="text-amber font-mono text-[10.5px] uppercase tracking-wide">
                    {" · active"}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Posts */}
      {posts.length > 0 ? (
        <Section
          label="Mentioned in"
          count={posts.length}
          countLabel={posts.length === 1 ? "post" : "posts"}
        >
          <ul className="space-y-1.5">
            {posts.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-t1 hover:text-acc font-body text-[14px] transition-colors"
                >
                  {p.title}
                </a>
                <span className="text-t3 ml-2 font-mono text-[11px]">
                  {p.source} · {p.readMin}m
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Neighbors */}
      {neighbors.length > 0 ? (
        <Section label="Shares projects with" count={neighbors.length}>
          <div className="flex flex-wrap gap-1.5">
            {neighbors.map(({ tech: n, sharedCount }) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelect(n.id)}
                aria-label={`Inspect ${n.name} (used together in ${sharedCount} projects)`}
                className="hover:border-acc/50 border-border bg-card/30 inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 transition-colors"
              >
                <span className="text-t2 font-mono text-[11.5px]">{n.name}</span>
                <span className="text-t3 font-mono text-[10px]">{sharedCount}</span>
              </button>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────── */

function DetailEmpty({
  suggested,
  onSelect,
}: {
  suggested: ReadonlyArray<{ tech: StackItem; connectionCount: number }>;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div>
        <p className="text-acc mb-2 font-mono text-[11px] tracking-[1.5px] uppercase">
          Inspect a tech
        </p>
        <h2 className="text-t1 font-display text-[22px] leading-[1.2] font-bold tracking-[-0.3px]">
          Click a node to see the projects, posts, and stack neighbors.
        </h2>
      </div>

      {suggested.length > 0 ? (
        <div>
          <p className="text-t3 mb-3 font-mono text-[11px] tracking-[1px] uppercase">
            Most connected
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggested.map(({ tech, connectionCount }) => (
              <button
                key={tech.id}
                type="button"
                onClick={() => onSelect(tech.id)}
                aria-label={`Inspect ${tech.name}`}
                className="hover:border-acc/50 border-border bg-card/30 inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1.5 transition-colors"
              >
                <span className="text-t1 font-mono text-[12px]">{tech.name}</span>
                <span className="text-t3 font-mono text-[10.5px]">
                  {connectionCount}×
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-t3 mt-auto font-mono text-[11px] leading-[1.55]">
        Every tech stack I have worked with, and the projects and posts that reference them, are listed here. Click a node to inspect it.
      </p>
    </>
  );
}

/* ─── Section helper ───────────────────────────────────────────────── */

function Section({
  label,
  count,
  countLabel,
  children,
}: {
  label: string;
  /** Display number for the caption (e.g. "Used in 2 project(s)"). */
  count: number;
  /** Optional trailing label, e.g. "projects", "reference",
      "references", or a comma-separated combo. */
  countLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p
        className={cn(
          "text-t3 mb-2 flex items-baseline gap-2 font-mono text-[11px] tracking-[1px] uppercase",
        )}
      >
        <span>{label}</span>
        {countLabel ? (
          <span className="text-t3">
            {count} {countLabel}
          </span>
        ) : (
          <span className="text-t3">{count}</span>
        )}
      </p>
      {children}
    </section>
  );
}