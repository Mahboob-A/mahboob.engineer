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
  posts,
  neighbors,
  onSelect,
}: {
  tech: StackItem;
  projects: ReadonlyArray<ProjectItem>;
  posts: ReadonlyArray<BlogPostItem>;
  neighbors: ReadonlyArray<{ tech: StackItem; sharedCount: number }>;
  onSelect: (id: string) => void;
}) {
  const isLearning = tech.domain === "learning";
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

      {/* Used in projects */}
      {projects.length > 0 ? (
        <Section
          label="Used in"
          count={projects.length}
          countLabel={projects.length === 1 ? "project" : "projects"}
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
      ) : (
        <Section label="Used in" count={0} countLabel="projects">
          <p className="text-t3 font-mono text-[12px]">
            Not yet wired into any project.
          </p>
        </Section>
      )}

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
          Hover or click a node to see the projects, posts, and stack neighbors.
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
        The graph weights edges by shared projects — heavier lines mean
        tighter co-usage. Drag any node to rearrange the layout.
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
  count: number;
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