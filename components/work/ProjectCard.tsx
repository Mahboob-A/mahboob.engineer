/**
 * components/work/ProjectCard.tsx
 *
 * Reusable project card used by every tier on /work. Three variants:
 *
 *   founder  — full-width stacked card with diagram on the right;
 *              golden-amber border + tinted background to signal
 *              "what I'm shipping right now". Status badge + name +
 *              tagline + 4 metrics + problem + stack chips + links.
 *   featured — 2-col grid card. Diagram thumbnail on top, body below.
 *              Same shape as the landing's Projects section, slightly
 *              more compact.
 *   showcase — 3-col compact card. Name + tagline + 3 stack chips +
 *              single GitHub link. No metrics, no problem paragraph.
 *
 * Cards are fully clickable — the whole `<article>` is wrapped in a
 * single `<Link>` to /work/[slug]. No nested anchors.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { type ProjectItem } from "@/data/projects";
import { chipColor } from "@/data/tokens";
import { cn } from "@/lib/cn";

export type ProjectCardVariant = "founder" | "featured" | "showcase";

export interface ProjectCardProps {
  project: ProjectItem;
  variant: ProjectCardVariant;
  /** Founder cards pass their mini architecture diagram here. */
  diagram?: ReactNode;
}

/** Headline status line for founder cards — derived from the project. */
function founderStatusLine(p: ProjectItem): string {
  const state =
    p.status === "live"
      ? "live in production"
      : p.status === "building"
        ? "currently building"
        : "shipped";
  return `${state} · ${p.tagline.split(" — ")[0] ?? p.tagline}`;
}

export function ProjectCard({ project, variant, diagram }: ProjectCardProps) {
  const href = `/work/${project.slug}`;
  const headlineStatus = founderStatusLine(project);

  // ─── founder variant ──────────────────────────────────────────────────
  if (variant === "founder") {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-acc"
        aria-label={`${project.name} — case study`}
      >
        <article
          className={cn(
            "bg-tier-founder border-amber/40 hover:border-amber/70",
            "grid grid-cols-1 gap-6 rounded-[12px] border p-6 transition-colors md:p-8 lg:grid-cols-[1.4fr_1fr]",
          )}
        >
          {/* LEFT — text content */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={project.status as BadgeVariant}>
                {project.status === "live"
                  ? "● live"
                  : project.status === "building"
                    ? "building"
                    : "shipped"}
              </Badge>
              <span className="text-amber font-mono text-[12px] tracking-[1px] uppercase">
                founder
              </span>
            </div>

            <div>
              <h3 className="font-display text-t1 text-[28px] leading-[1.1] font-bold tracking-[-0.5px]">
                {project.name}
              </h3>
              <p className="text-t2 mt-2 font-mono text-[14px]">
                {headlineStatus}
              </p>
            </div>

            <p className="text-t2 text-[14.5px] leading-[1.55]">
              {project.problem}
            </p>

            {/* Metric row */}
            <ul className="border-border my-1 grid grid-cols-2 gap-3 rounded-[8px] border bg-bg/40 p-3.5 md:grid-cols-4">
              {project.metrics.slice(0, 4).map((m) => (
                <li
                  key={m}
                  className="border-border flex flex-col gap-0.5 border-l pl-3 first:border-l-0 first:pl-0"
                >
                  <span className="text-amber font-mono text-[11.5px] font-semibold tracking-[0.5px]">
                    {m.split(" ")[0]}
                  </span>
                  <span className="text-t3 text-[11px] leading-[1.3]">
                    {m.split(" ").slice(1).join(" ")}
                  </span>
                </li>
              ))}
            </ul>

            {/* Stack chips */}
            <div>
              <p className="text-t3 mb-2 font-mono text-[10.5px] tracking-[1px] uppercase">
                stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.slice(0, 7).map((tech) => (
                  <Chip key={tech} color={chipColor(tech)}>
                    {tech}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Links row */}
            <ProjectLinks project={project} variant="founder" />
          </div>

          {/* RIGHT — diagram thumbnail */}
          {diagram ? (
            <div className="bg-code-bg border-border flex items-center justify-center rounded-[10px] border p-5">
              {diagram}
            </div>
          ) : null}
        </article>
      </Link>
    );
  }

  // ─── featured variant ─────────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-acc"
        aria-label={`${project.name} — case study`}
      >
        <article className="bg-surface border-border hover:border-acc/40 flex h-full flex-col overflow-hidden rounded-[10px] border transition-colors">
          {diagram ? (
            <div className="bg-code-bg border-border flex h-[160px] items-center justify-center border-b p-4">
              {diagram}
            </div>
          ) : (
            <div className="bg-code-bg border-border flex h-[160px] items-center justify-center border-b text-t3 font-mono text-[11px]">
              diagram
            </div>
          )}
          <div className="flex flex-col gap-2.5 p-5">
            <div className="flex items-center gap-2">
              <Badge variant={project.status as BadgeVariant}>
                {project.status === "live"
                  ? "● live"
                  : project.status === "building"
                    ? "building"
                    : "shipped"}
              </Badge>
              {project.stars ? (
                <span className="text-amber font-mono text-[10.5px]">
                  ★ {project.stars}
                </span>
              ) : null}
            </div>
            <h3 className="font-display text-t1 text-[20px] font-bold tracking-[-0.3px]">
              {project.name}
            </h3>
            <p className="text-t2 line-clamp-2 text-[13px] leading-[1.45]">
              {project.tagline}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.stack.slice(0, 4).map((tech) => (
                <Chip key={tech} color={chipColor(tech)}>
                  {tech}
                </Chip>
              ))}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // ─── showcase variant ─────────────────────────────────────────────────
  return (
    <Link
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-acc"
      aria-label={`${project.name} — case study`}
    >
      <article className="bg-surface border-border hover:border-acc/40 flex h-full flex-col rounded-[10px] border p-5 transition-colors">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-t1 text-[18px] font-semibold tracking-[-0.2px]">
            {project.name}
          </h3>
          <Badge variant={project.status as BadgeVariant}>
            {project.status === "live"
              ? "● live"
              : project.status === "building"
                ? "building"
                : "shipped"}
          </Badge>
        </div>
        <p className="text-t2 mt-2 line-clamp-2 text-[12.5px] leading-[1.45]">
          {project.tagline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.stack.slice(0, 3).map((tech) => (
            <Chip key={tech} color={chipColor(tech)}>
              {tech}
            </Chip>
          ))}
        </div>
        <div className="text-acc mt-3 inline-flex items-center gap-1 font-mono text-[11px]">
          view on github ↗
        </div>
      </article>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Internal: ProjectLinks — shared between founder + future variants
   ──────────────────────────────────────────────────────────────────────── */

function ProjectLinks({
  project,
  variant,
}: {
  project: ProjectItem;
  variant: ProjectCardVariant;
}) {
  const links: Array<{ href: string; label: string; external: boolean }> = [];
  if (project.url) {
    links.push({ href: project.url, label: "live", external: true });
  }
  if (project.demo) {
    links.push({ href: project.demo, label: "demo", external: true });
  }
  if (project.github) {
    links.push({ href: project.github, label: "source", external: true });
  }
  if (project.youtube) {
    links.push({ href: project.youtube, label: "video", external: true });
  }
  if (links.length === 0) return null;

  return (
    <div className="border-border flex flex-wrap gap-2 border-t pt-3">
      {links.map((l) => (
        <span
          key={l.label}
          className={cn(
            "text-t2 hover:text-acc font-mono text-[12px] transition-colors",
            variant === "founder" ? "inline-flex items-center gap-1" : "",
          )}
        >
          ↗ {l.label}
        </span>
      ))}
    </div>
  );
}