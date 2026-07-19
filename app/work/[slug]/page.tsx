/**
 * app/work/[slug]/page.tsx
 *
 * Per-project case-study page. Per master §2.3:
 *
 *   [BackLink — "← all work"]
 *   [Status badge + year]
 *   [Project name — display font, large]
 *   [Tagline — mono, muted]
 *
 *   [2-col hero: text left (problem + built) | diagram right]
 *   [Metrics row — 4 chips, mono amber]
 *
 *   [HR]
 *   [THE BUILD — notes prose, 4 paragraphs]
 *
 *   [Stack breakdown — categorized]
 *   [Links row — GitHub | Demo | YouTube | Write-up]
 *
 *   [HR]
 *   [RELATED WRITING — only if postsByProject(slug) returns non-empty]
 *   [RELATED STACK — chip grid linking to /stack#tech-id]
 *
 * Static at build time (generateStaticParams enumerates PROJECTS).
 * Server Component end-to-end — no 'use client'. Diagrams are pure
 * SVGs.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { pickDiagram } from "@/components/diagrams/pickDiagram";
import { projectMetadata } from "@/lib/metadata";
import { chipColor } from "@/data/tokens";
import { cn } from "@/lib/cn";
import {
  PROJECTS,
  getProjectBySlug,
  type ProjectItem,
  type ProjectStatus,
} from "@/data/projects";
import {
  postsByProject,
  type BlogPostItem,
} from "@/data/blog";
import {
  techsByProject,
  STACK_BY_ID,
  type StackItem,
  type StackDomain,
} from "@/data/stack";

/* ─────────────────────────────────────────────────────────────────────
   generateStaticParams — one path per project
   ───────────────────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

/* ─────────────────────────────────────────────────────────────────────
   generateMetadata — per-project OG + canonical
   ───────────────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return projectMetadata({
    name: project.name,
    tagline: project.tagline,
    slug: project.slug,
    status: project.status,
  });
}

/* ─────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────── */
export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const relatedPosts = postsByProject(slug);
  const relatedTechs = techsByProject(slug);

  return (
    <InnerLayout
      backHref="/work"
      backLabel="← all work"
      header={undefined}
      contentClassName="space-y-12"
    >
      <Hero project={project} />
      <MetricsRow project={project} />
      <BuildNotes project={project} />
      <StackBreakdown techs={relatedTechs} project={project} />
      <LinksRow project={project} />
      {relatedPosts.length > 0 ? (
        <RelatedWriting posts={relatedPosts} project={project} />
      ) : null}
      {relatedTechs.length > 0 ? (
        <RelatedStack techs={relatedTechs} project={project} />
      ) : null}
    </InnerLayout>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Section helpers — file-local since they're only used here. If /work
   grows to need them, lift into components/work/.
   ───────────────────────────────────────────────────────────────────── */

/* Hero: status badge + year + name + tagline, then 2-col problem+built
   on the left and the diagram on the right. */
function Hero({ project }: { project: ProjectItem }) {
  const Diagram = pickDiagram(project);
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <Badge variant={project.status as BadgeVariant}>
          {project.status === "live"
            ? "● live"
            : project.status === "building"
              ? "building"
              : "shipped"}
        </Badge>
        <span className="text-t3 font-mono text-[13px]">[{project.year}]</span>
      </div>
      <h1 className="font-display text-t1 text-[clamp(32px,5vw,52px)] leading-[1.05] font-bold tracking-[-1px]">
        {project.name}
      </h1>
      <p className="text-t2 mt-3 font-mono text-[15px]">{project.tagline}</p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — problem + built */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-t3 mb-2 font-mono text-[12px] tracking-[1.5px] uppercase">
              Problem
            </p>
            <p className="text-t1 text-[16px] leading-[1.65]">
              {project.problem}
            </p>
          </div>
          <div className="border-border border-t pt-5">
            <p className="text-t3 mb-2 font-mono text-[12px] tracking-[1.5px] uppercase">
              Built
            </p>
            <p className="text-t1 text-[16px] leading-[1.65]">
              {project.built}
            </p>
          </div>
        </div>

        {/* RIGHT — diagram */}
        <div className="bg-surface border-border flex items-center justify-center rounded-[10px] border p-4 md:p-6">
          {Diagram}
        </div>
      </div>
    </section>
  );
}

/* Metrics: 4-up grid like StatRow (mono amber numbers, t3 labels). */
function MetricsRow({ project }: { project: ProjectItem }) {
  const metrics = project.metrics.slice(0, 4);
  if (metrics.length === 0) return null;

  function split(s: string): { num: string; label: string } {
    const parts = s.split(" ");
    return {
      num: parts[0] ?? s,
      label: parts.slice(1).join(" ") || "",
    };
  }

  return (
    <section>
      <div className="bg-surface border-border grid grid-cols-2 overflow-hidden rounded-[10px] border md:grid-cols-4">
        {metrics.map((m, i) => {
          const { num, label } = split(m);
          return (
            <div
              key={i}
              className={cn(
                "border-border px-5 py-5",
                i === metrics.length - 1 ? "" : "md:border-r",
                i < metrics.length - 2 ? "border-b md:border-b-0" : "",
              )}
            >
              <p className="text-amber font-mono text-[24px] leading-none font-semibold">
                {num}
              </p>
              <p className="text-t3 mt-2 text-[12px] leading-[1.4]">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Build notes: split notes string on \n\n, render each as <p>. If notes
   is missing, fall back to problem + built as a graceful default. */
function BuildNotes({ project }: { project: ProjectItem }) {
  const notes = project.notes;
  const paragraphs =
    notes && notes.trim().length > 0
      ? notes.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
      : [project.problem, project.built]; // fallback

  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          The build
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          idea → framing → build → deploy → what&apos;s next
        </span>
      </div>
      <div className="text-t1 max-w-[760px] space-y-4 text-[16.5px] leading-[1.7]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* Stack breakdown: bucket techs from techsByProject into 4 display
   groups and render each as a labelled list. */
const DISPLAY_BUCKETS: Array<{
  key: "backend" | "infra" | "data" | "ai";
  label: string;
  domains: StackDomain[];
}> = [
  { key: "backend", label: "Backend", domains: ["backend", "async", "auth", "payment"] },
  { key: "infra", label: "Infrastructure", domains: ["infra", "video"] },
  { key: "data", label: "Data layer", domains: ["data"] },
  { key: "ai", label: "AI / special", domains: ["ai", "learning"] },
];

function StackBreakdown({
  techs,
  project,
}: {
  techs: StackItem[];
  project: ProjectItem;
}) {
  if (techs.length === 0) return null;

  // Group techs by display bucket.
  const buckets = DISPLAY_BUCKETS.map((b) => ({
    ...b,
    items: techs.filter((t) => b.domains.includes(t.domain)),
  })).filter((b) => b.items.length > 0);

  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Stack
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          {techs.length} techs · grouped by layer
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {buckets.map((b) => (
          <div
            key={b.key}
            className="bg-surface border-border rounded-[10px] border p-5"
          >
            <p className="text-t3 mb-3 font-mono text-[11px] tracking-[1px] uppercase">
              {b.label}
            </p>
            <ul className="space-y-1.5">
              {b.items.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className="text-t2 text-[14px]">{t.name}</span>
                  {t.depth != null ? (
                    <span className="text-t3 font-mono text-[10.5px]">
                      ({t.depth}% learning)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* Project's own .stack[] that didn't make it into STACK — e.g.
            "Stripe", "Agora", "SSLCommerz", etc. Render in a catch-all. */}
        <CatchAllStack project={project} knownIds={techs.map((t) => t.id)} />
      </div>
    </section>
  );
}

function CatchAllStack({
  project,
  knownIds,
}: {
  project: ProjectItem;
  knownIds: string[];
}) {
  const extras = project.stack.filter(
    (s) => !knownIds.some((id) => STACK_BY_ID[id]?.name === s),
  );
  if (extras.length === 0) return null;
  return (
    <div className="bg-surface border-border rounded-[10px] border p-5">
      <p className="text-t3 mb-3 font-mono text-[11px] tracking-[1px] uppercase">
        Also used
      </p>
      <div className="flex flex-wrap gap-1.5">
        {extras.map((t) => (
          <Chip key={t} color={chipColor(t)}>
            {t}
          </Chip>
        ))}
      </div>
    </div>
  );
}

/* Links row: GitHub · Demo · YouTube · Write-up (Medium). */
function LinksRow({ project }: { project: ProjectItem }) {
  const links: Array<{ href: string; label: string }> = [];
  if (project.github) {
    const githubLabel = project.github_client ? "backend repo" : "source";
    links.push({ href: project.github, label: `↗ ${githubLabel}` });
    if (project.github_client) {
      links.push({ href: project.github_client, label: "↗ client repo" });
    }
  }
  if (project.url) links.push({ href: project.url, label: "↗ live" });
  if (project.demo) links.push({ href: project.demo, label: "↗ demo" });
  if (project.youtube) {
    links.push({ href: project.youtube, label: "↗ video" });
  }
  if (project.youtube_extra) {
    project.youtube_extra.forEach((u, i) => {
      links.push({ href: u, label: `↗ video ${i + 2}` });
    });
  }
  if (links.length === 0) return null;

  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Links
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href}
            target="_blank"
            rel="noreferrer"
            className="border-border hover:border-acc/60 hover:text-acc inline-flex items-center gap-1.5 rounded-[6px] border px-3.5 py-2 font-mono text-[12.5px] transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}

/* Related writing: a small inline list of related Medium / native posts. */
function RelatedWriting({
  posts,
  project,
}: {
  posts: BlogPostItem[];
  project: ProjectItem;
}) {
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Related writing
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          {posts.length} {posts.length === 1 ? "post" : "posts"} reference {project.name}
        </span>
      </div>
      <ul className="border-border divide-border divide-y rounded-[10px] border bg-surface">
        {posts.map((p) => (
          <li key={p.slug} className="px-5 py-3.5">
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="text-t1 hover:text-acc font-body text-[15px] font-semibold transition-colors"
            >
              {p.title}
            </a>
            <p className="text-t3 mt-1 font-mono text-[11.5px]">
              {p.source} · {p.readMin} min read ·{" "}
              {p.tags.slice(0, 4).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Related stack: chip grid linking to /stack#tech-id. /stack doesn't
   exist yet (T3.4) so chips link to a future target — acceptable
   per project direction. */
function RelatedStack({
  techs,
  project,
}: {
  techs: StackItem[];
  project: ProjectItem;
}) {
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Related stack
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          techs used in {project.name}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {techs.map((t) => (
          <Link
            key={t.id}
            href={`/stack#${t.id}`}
            /* Phase 6 (T6.9): extra padding so the touch target meets
               WCAG 2.5.5 (24x24). The Chip is small; the wrapping
               <a> needs the larger hit area. */
            className="inline-flex p-1"
            aria-label={`More about ${t.name} on /stack`}
          >
            <Chip color={chipColor(t.name)}>{t.name}</Chip>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* Diagram selector: removed in Phase 8 (T8.4). Use the shared
   `pickDiagram` from `@/components/diagrams/pickDiagram` (imported at
   the top). The Hero function on line 134 calls it directly. */

/* Unused — silences lint warnings about `ProjectStatus` not being used
   after the data refactor. */
export type _ProjectStatus = ProjectStatus;