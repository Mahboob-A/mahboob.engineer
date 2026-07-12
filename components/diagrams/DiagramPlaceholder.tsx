/**
 * components/diagrams/DiagramPlaceholder.tsx
 *
 * Honest placeholder shown in /work/[slug] for projects whose
 * case-study pages don't yet have a dedicated architecture diagram
 * (CuteTube, Pulumi Infra, ImgTwist, Load Balancer, ProStream).
 *
 * Renders a `bg-code-bg` panel with the project name, the project's
 * `tagline` as a one-line summary, and a muted "Detailed architecture
 * diagram coming soon" sub-label. Visually consistent with the
 * DiagramPanel primitive (T1.5) so it slots into the same hero slot
 * without breaking the layout.
 *
 * Forward-compatible: when a real diagram ships for one of these
 * projects, the placeholder is replaced with the new component —
 * no other page changes needed.
 */

import type { ProjectItem } from "@/data/projects";

export interface DiagramPlaceholderProps {
  project: ProjectItem;
}

export function DiagramPlaceholder({ project }: DiagramPlaceholderProps) {
  return (
    <div className="bg-code-bg border-border flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-[10px] border p-8 text-center">
      <span className="text-t3 font-mono text-[11px] tracking-[1.5px] uppercase">
        {project.name}
      </span>
      <p className="text-t2 max-w-[360px] text-[14px] leading-[1.55]">
        {project.tagline}
      </p>
      <p className="text-t3 font-mono text-[12px] italic">
        Detailed architecture diagram coming soon
      </p>
    </div>
  );
}