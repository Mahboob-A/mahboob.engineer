/**
 * game/scenes/overlays/ProjectOverlay.tsx
 *
 * React overlay rendered on top of the Phaser canvas when the player
 * enters a project building. T4.6 will flesh this out with:
 *   - Resolve slug → PROJECTS_BY_SLUG[slug]
 *   - Reuse the same case-study layout from /work/[slug]:
 *     2-col hero (problem + diagram), metrics, build notes,
 *     stack, links
 *   - Close button → bridge.closeOverlay()
 *
 * Until then, this file declares the placeholder component so the
 * overlay slot in game/index.tsx can mount without errors.
 */

"use client";

import type { ProjectItem } from "@/data/projects";

export interface ProjectOverlayProps {
  project: ProjectItem;
  onClose: () => void;
}

export function ProjectOverlay({ project, onClose }: ProjectOverlayProps) {
  return (
    <div className="bg-surface border-acc/40 mx-auto flex max-w-[640px] flex-col gap-3 rounded-[12px] border p-8">
      <p className="text-acc font-mono text-[11px] tracking-[1.5px] uppercase">
        Project
      </p>
      <h2 className="font-display text-t1 text-[28px] font-bold tracking-[-0.5px]">
        {project.name}
      </h2>
      <p className="text-t2 text-[14px]">{project.tagline}</p>
      <p className="text-t3 font-mono text-[12px]">
        T4.6 will flesh this out with the full case-study layout.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="bg-acc text-bg mt-2 self-start rounded-[6px] px-4 py-2 font-mono text-[12px] font-semibold"
      >
        close →
      </button>
    </div>
  );
}