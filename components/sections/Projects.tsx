/**
 * components/sections/Projects.tsx
 *
 * The "02 / SYSTEMS" section on `/`. Per master §2 + flat mockup
 * lines 695–836: 3 featured project cards in an alternating
 * left/right layout.
 *
 * We pick the **3 featured-tier** projects (master §1.3 says the
 * landing shows 4; we use 3 here to match the mockup exactly):
 *   1. Algocode   (microservices · system design · 22★ github)
 *   2. Movio      (video infrastructure · adaptive streaming)
 *   3. DrishtiAI  (real-time pipelines · ai infrastructure)
 *
 * Card layout (flat mockup lines 704–745):
 *
 *   ┌──────────┬──────────────────────────────────────┐
 *   │  [SVG    │  [microservices · system design]      │ ← status eyebrow
 *   │   visual]│                                      │
 *   │  340px   │  Algocode — Online Judge for C++      │ ← title
 *   │          │  Problem: ...                         │ ← problem
 *   │          │  Approach: ...                        │ ← approach
 *   │          │  [chip] [chip] [chip]                 │ ← metrics
 *   │          │  [stack tag] [stack tag] ...          │ ← stack chips
 *   │          │  ↗ source  ↗ write-up  ↗ demo         │ ← links
 *   └──────────┴──────────────────────────────────────┘
 *
 * Even cards flip the columns (body left, visual right). All
 * colors from data/tokens.ts via Chip color helper.
 */

import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { PROJECTS, type ProjectItem } from "@/data/projects";
import { chipColor } from "@/data/tokens";
import { AlgocodeMiniDiagram } from "@/components/diagrams/AlgocodeMiniDiagram";
import { MovioMiniDiagram } from "@/components/diagrams/MovioMiniDiagram";
import { DrishtiMiniDiagram } from "@/components/diagrams/DrishtiMiniDiagram";

/* The 3 projects shown on the landing page. Indexed by PROJECTS slug
 * so changes to the registry ordering don't break the section. */
const LANDING_SLUGS = ["algocode", "movio", "drishti-ai"] as const;

/* Map slug → mini diagram component. */
const DIAGRAMS: Record<(typeof LANDING_SLUGS)[number], React.ReactNode> = {
  algocode: <AlgocodeMiniDiagram />,
  movio: <MovioMiniDiagram />,
  "drishti-ai": <DrishtiMiniDiagram />,
};

export function Projects() {
  const projects = LANDING_SLUGS.map((slug) => PROJECTS.find((p) => p.slug === slug)!);

  return (
    <section id="work" className="border-border scroll-mt-20 border-t py-[90px]">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            02 / SYSTEMS
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Things I&apos;ve built end-to-end
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Research → design → implementation → production deployment. Each one has a
            write-up and a working demo.
          </p>
        </div>

        {/* Cards — alternating layout via flex direction */}
        <div className="space-y-6">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              diagram={DIAGRAMS[project.slug as (typeof LANDING_SLUGS)[number]]}
              visualOnLeft={i % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: ProjectItem;
  diagram: React.ReactNode;
  visualOnLeft: boolean;
}

function ProjectCard({ project, diagram, visualOnLeft }: ProjectCardProps) {
  return (
    <article className="bg-surface border-border overflow-hidden rounded-[10px] border">
      <div
        className={`grid grid-cols-1 md:grid-cols-[340px_1fr] ${
          visualOnLeft ? "" : "md:grid-cols-[1fr_340px]"
        }`}
      >
        {/* Visual (SVG diagram) */}
        <div
          className={`bg-code-bg flex items-center justify-center p-7 ${
            visualOnLeft
              ? "md:border-border md:border-r"
              : "md:border-border md:order-2 md:border-l"
          } border-border border-b md:border-b-0`}
        >
          {diagram}
        </div>

        {/* Body */}
        <div className={`p-7 md:p-8 ${visualOnLeft ? "" : "md:order-1"}`}>
          <p className="text-amber mb-2.5 font-mono text-[11px] tracking-[1px] uppercase">
            {stackStatusLine(project)}
          </p>
          <h3 className="font-display text-t1 mb-2.5 text-[24px] font-bold">
            {project.name} — {project.tagline.split(" — ")[0]}
          </h3>

          <p className="text-t1 mb-2 text-[14.5px]">
            <span className="text-t3 mb-1 block font-mono text-[11px] tracking-[1px] uppercase">
              Problem
            </span>
            {project.problem}
          </p>
          <p className="text-t1 mb-[18px] text-[14.5px]">
            <span className="text-t3 mb-1 block font-mono text-[11px] tracking-[1px] uppercase">
              Approach
            </span>
            {project.built}
          </p>

          {/* Metrics — chip-style with accent color */}
          <div className="mb-[18px] flex flex-wrap gap-2.5">
            {project.metrics.map((m) => (
              <span key={m} className="text-acc font-mono text-[12px] font-medium">
                {m}
              </span>
            ))}
          </div>

          {/* Stack chips */}
          <div className="mb-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <Chip key={tech} color={chipColor(tech)}>
                {tech}
              </Chip>
            ))}
          </div>

          {/* Links */}
          <div className="text-t3 flex gap-[18px] font-mono text-[13px]">
            {project.github ? (
              <Link
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-acc flex items-center gap-1.5 transition-colors"
              >
                <span aria-hidden>↗</span> source
              </Link>
            ) : null}
            {project.youtube ? (
              <Link
                href={project.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-acc flex items-center gap-1.5 transition-colors"
              >
                <span aria-hidden>↗</span> demo video
              </Link>
            ) : null}
            {project.url ? (
              <Link
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-acc flex items-center gap-1.5 transition-colors"
              >
                <span aria-hidden>↗</span> live
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Compact "status line" for the top of the card — e.g.
 * "microservices · system design · 22★ github" for Algocode.
 * Falls back to the project domain list if no specific tags.
 */
function stackStatusLine(project: ProjectItem): string {
  if (project.slug === "algocode") return "microservices · system design · 22★ github";
  if (project.slug === "movio") return "video infrastructure · adaptive streaming";
  if (project.slug === "drishti-ai") return "real-time pipelines · ai infrastructure";
  return project.domain.slice(0, 2).join(" · ");
}
