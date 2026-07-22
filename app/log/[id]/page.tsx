/**
 * app/log/[id]/page.tsx
 *
 * Per-experience deep-dive page. Per Phase 7 plan:
 *
 *   [BackLink — "← all experience"]
 *   [Status badge + period]
 *   [Company name — display font, large]
 *   [Role — mono, muted]
 *
 *   [Build notes — 4 paragraphs of "extensive discussion"]
 *
 *   [Tag chips (from entry.tags) — link to /stack#<id> when resolved]
 *
 *   [Related Projects — 2-col grid of <ProjectCard variant="featured" />
 *    for each entry in entry.relatedProjects (if non-empty)]
 *
 *   [Related Writing — list of blog posts that reference the projects
 *    or tags in this entry (if non-empty)]
 *
 *   [Cross-link into /work/<slug> for the primary product case study]
 *
 * Static at build time (generateStaticParams enumerates EXPERIENCE ids).
 * Server Component end-to-end — no 'use client'.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ProjectCard } from "@/components/work/ProjectCard";
import { pickDiagram } from "@/components/diagrams/pickDiagram";
import {
  StoryPath,
  buildStoryStages,
} from "@/components/log/StoryPath";
import "@/components/log/StoryPath.css";
import { pageMetadata } from "@/lib/metadata";
import { chipColor } from "@/data/tokens";
import {
  EXPERIENCE,
  EXPERIENCE_BY_ID,
  type ExperienceItem,
} from "@/data/experience";
import {
  PROJECTS_BY_SLUG,
  type ProjectItem,
} from "@/data/projects";
import {
  BLOG_POSTS,
  type BlogPostItem,
} from "@/data/blog";
import { resolveStackSlug } from "@/data/stack-slug-map";

/* ──────────────────────────────────────────────────────────────────────
   generateStaticParams — one path per experience id
   ────────────────────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return EXPERIENCE.map((e) => ({ id: e.id }));
}

/* ──────────────────────────────────────────────────────────────────────
   generateMetadata — per-experience OG + canonical
   ────────────────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = EXPERIENCE_BY_ID[id];
  if (!entry) return {};
  const blurb = entry.notes
    ? entry.notes.split(/\n\n+/)[0]?.slice(0, 200) ?? entry.role
    : `${entry.role} at ${entry.company} (${entry.period})`;
  return pageMetadata(entry.company, blurb);
}

/* ──────────────────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────────────────── */
export default async function ExperienceDeepDive({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = EXPERIENCE_BY_ID[id];
  if (!entry) notFound();

  const relatedProjects = (entry.relatedProjects ?? [])
    .map((slug) => PROJECTS_BY_SLUG[slug])
    .filter((p): p is ProjectItem => p !== undefined);

  const relatedPosts = findPostsForExperience(entry);

  return (
    <InnerLayout
      backHref="/log"
      backLabel="← all experience"
      contentClassName="space-y-12"
    >
      <Hero entry={entry} />
      <BuildNotes entry={entry} />
      <TagChips entry={entry} />
      {relatedProjects.length > 0 ? (
        <RelatedProjects entry={entry} projects={relatedProjects} />
      ) : null}
      {relatedPosts.length > 0 ? (
        <RelatedWriting entry={entry} posts={relatedPosts} />
      ) : null}
      {relatedProjects.length > 0 ? (
        <CaseStudyCrossLink projects={relatedProjects} />
      ) : null}
    </InnerLayout>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Blog-post matcher — walk every post, collect those whose projects
   overlap with entry.relatedProjects OR whose tags overlap with
   entry.tags. Used by T3.3's RelatedWriting pattern for projects;
   here we generalize across both projects and tags.
   ────────────────────────────────────────────────────────────────────── */
function findPostsForExperience(entry: ExperienceItem): BlogPostItem[] {
  const projectSlugs = new Set(entry.relatedProjects ?? []);
  const tagSet = new Set(
    entry.tags.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "")),
  );
  const matches: BlogPostItem[] = [];
  for (const post of BLOG_POSTS) {
    const projectOverlap =
      post.projects && post.projects.some((s) => projectSlugs.has(s));
    const stackOverlap = post.stack?.some((s) => {
      const norm = s.toLowerCase().replace(/[^a-z0-9]/g, "");
      return tagSet.has(norm);
    });
    if (projectOverlap || stackOverlap) {
      matches.push(post);
    }
  }
  return matches;
}

/* ──────────────────────────────────────────────────────────────────────
   Section helpers (file-local, mirrors app/work/[slug]/page.tsx)
   ────────────────────────────────────────────────────────────────────── */

function Hero({ entry }: { entry: ExperienceItem }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <Badge variant={entry.status as BadgeVariant}>
          {entry.status === "active" ? "● active" : entry.status}
        </Badge>
        <span className="text-t3 font-mono text-[13px]">[{entry.period}]</span>
      </div>
      <h1 className="font-display text-t1 text-[clamp(32px,5vw,52px)] leading-[1.05] font-bold tracking-[-1px]">
        {entry.company}
      </h1>
      {/* Role line — Phase 18: optionally append a small italic
         suffix (see `roleSuffix` on the entry). Mirrors the
         timeline-card render in app/log/page.tsx but uses text-t3
         for the suffix so the hierarchy reads as "main role in t2
         mid-tone, suffix quieter in t3". */}
      <p className="text-t2 mt-3 font-mono text-[15px]">
        {entry.role}
        {entry.roleSuffix ? (
          <>
            {" · "}
            <span className="text-t3 italic text-[12.5px]">{entry.roleSuffix}</span>
          </>
        ) : null}
      </p>

      {entry.url ? (
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="text-acc mt-4 inline-flex items-center gap-1.5 font-mono text-[12.5px] transition-opacity hover:opacity-80"
        >
          Visit {entry.company} → <span aria-hidden>↗</span>
        </a>
      ) : null}

      {/* Bullets — full list, mirrors DeployLog */}
      <ul className="text-t1 mt-8 flex flex-col gap-2.5 text-[15.5px] leading-[1.6]">
        {entry.bullets.map((bullet, i) => (
          <li key={i} className="relative pl-6">
            <span
              aria-hidden
              className="text-acc absolute top-0 left-0 font-mono font-semibold"
            >
              &gt;
            </span>
            {bullet}
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuildNotes({ entry }: { entry: ExperienceItem }) {
  /* The snake-path narrative renders the same `entry.notes` paragraphs
     the previous BuildNotes did, but along a curved SVG path with an
     animated amber packet (Phase 8 T8.5–T8.6). The split helper lives
     in `components/log/StoryPath.tsx`. */
  const fallbackParagraph =
    entry.bullets[0] ?? "More details coming soon.";
  const stages = buildStoryStages(entry.notes, entry.bullets, fallbackParagraph);
  return <StoryPath stages={stages} />;
}

function TagChips({ entry }: { entry: ExperienceItem }) {
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Keywords
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          {entry.tags.length} techs · links go to /stack
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => {
          const slug = resolveStackSlug(tag);
          const chip = <Chip color={chipColor(tag)}>{tag}</Chip>;
          if (!slug) {
            return <span key={tag}>{chip}</span>;
          }
          return (
            <Link
              key={tag}
              href={`/stack#${slug}`}
              className="inline-flex p-1"
              aria-label={`More about ${tag} on /stack`}
            >
              {chip}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RelatedProjects({
  entry,
  projects,
}: {
  entry: ExperienceItem;
  projects: ProjectItem[];
}) {
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Related projects
        </h2>
        {/* Phase 18: copy reframe. The previous "shipped AT {company}"
         implied these projects were delivered under that employer.
         In practice they're personal projects built during /
         alongside the role, so the wording now reads "shipped
         alongside work at {company}". Singular + plural both
         grammatical ("1 project shipped alongside work at X" /
         "2 projects shipped alongside work at X"). */}
        <span className="text-t3 font-mono text-[11px] italic">
          {projects.length}{" "}
          {projects.length === 1 ? "project" : "projects"} shipped alongside
          work at {entry.company}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard
            key={p.slug}
            project={p}
            variant="featured"
            diagram={pickDiagram(p)}
          />
        ))}
      </div>
    </section>
  );
}

function RelatedWriting({
  entry,
  posts,
}: {
  entry: ExperienceItem;
  posts: BlogPostItem[];
}) {
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Related writing
        </h2>
        <span className="text-t3 font-mono text-[11px] italic">
          {posts.length} {posts.length === 1 ? "post" : "posts"} reference{" "}
          {entry.company}
        </span>
      </div>
      <ul className="border-border divide-border divide-y rounded-[10px] border bg-surface">
        {posts.map((p) => (
          <li key={p.slug} className="px-5 py-3.5">
            <a
              href={p.url}
              target={p.source === "medium" ? "_blank" : undefined}
              rel={p.source === "medium" ? "noreferrer" : undefined}
              className="text-t1 hover:text-acc font-body text-[15px] font-semibold transition-colors"
            >
              {p.title}
            </a>
            <p className="text-t3 mt-1 font-mono text-[11.5px]">
              {p.source} · {p.readMin} min read · {p.tags.slice(0, 4).join(" · ")}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CaseStudyCrossLink({
  projects,
}: {
  projects: ProjectItem[];
}) {
  if (projects.length === 0) return null;
  const others = projects.slice(1);
  return (
    <section>
      <div className="border-border mb-5 flex items-baseline gap-3 border-t pt-6">
        <span className="bg-acc inline-block h-[6px] w-[6px] rounded-full" />
        <h2 className="text-t3 font-mono text-[12px] tracking-[1.5px] uppercase">
          Product case {projects.length === 1 ? "study" : "studies"}
        </h2>
      </div>
      <p className="text-t2 text-[15px] leading-[1.65]">
        For the architecture deep-dive: three-layer build, isolation
        strategy, deployment topology. Read the case study
        {others.length > 0 ? "s" : ""}:{" "}
        {projects.map((p, i) => (
          <span key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              className="text-acc hover:opacity-80 underline"
            >
              {p.name}
            </Link>
            {i < projects.length - 2 ? ", " : i === projects.length - 2 ? ", and " : ""}
          </span>
        ))}{" "}
        on /work.
      </p>
    </section>
  );
}
