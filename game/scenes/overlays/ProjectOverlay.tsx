/**
 * game/scenes/overlays/ProjectOverlay.tsx
 *
 * In-game overlay rendered when the player enters a project building.
 *
 * T4.6 wiring: this component is now a thin slug-resolver. The
 * bridge's `OPEN_OVERLAY` event payload carries `{slug, overlayType}`;
 * we look up the project from `PROJECTS_BY_SLUG` and delegate the
 * actual rendering to `<CaseStudyOverlay>` (the compact case-study
 * layout that mirrors the canonical /work/[slug] page).
 *
 * If the slug doesn't match any known project, we render null —
 * the parent <OverlaySlot> in game/index.tsx will leave the wrapper
 * open with empty content (T4.7 will harden this if it bites in
 * practice; today every slug comes from the T4.2 map which uses
 * real project slugs).
 *
 * onClose wires to `bridge.closeOverlay()` so Phaser unducks the
 * BGM and resumes input on the next frame.
 */

"use client";

import { useEffect } from "react";
import { CaseStudyOverlay } from "@/components/overlay/CaseStudyOverlay";
import { PROJECTS_BY_SLUG } from "@/data/projects";
import { bridge } from "@/game/EventBridge";

export interface ProjectOverlayProps {
  /** The project slug — comes from the bridge's `OPEN_OVERLAY` event
   *  payload, originally set as the `slug` property on the
   *  Buildings[] object layer entry in backend-city.json. */
  slug: string;
  /** Optional parent-supplied close handler. If provided, called
   *  before `bridge.closeOverlay()` so the parent can do its own
   *  state cleanup. */
  onClose?: () => void;
}

export function ProjectOverlay({ slug, onClose }: ProjectOverlayProps) {
  const project = PROJECTS_BY_SLUG[slug];

  /* Stale slug or future-data mismatch — close immediately rather
     than render a broken overlay with a "?" name.

     Phase 35 bug fix: previously this branch called
     bridge.closeOverlay() synchronously during render. Because
     eventemitter3.emit is synchronous, that synchronously fired
     the CLOSE_OVERLAY listener on GameRoot → setOverlay(null)
     while ProjectOverlay was still mid-render. React raises
     "Cannot update a component while rendering a different
     component" in that case. Move the close into a useEffect so
     the setState runs in a commit-phase effect, not during render.
     Same hardening applied to SpecialOverlay and VillainOverlay
     in the same commit. */
  useEffect(() => {
    if (!project && typeof window !== "undefined") {
      bridge.closeOverlay();
    }
  }, [project]);

  if (!project) {
    return null;
  }

  return (
    <CaseStudyOverlay
      project={project}
      onClose={() => {
        if (onClose) onClose();
        bridge.closeOverlay();
      }}
    />
  );
}