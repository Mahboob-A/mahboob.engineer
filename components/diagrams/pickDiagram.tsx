/**
 * components/diagrams/pickDiagram.tsx
 *
 * Single source of truth for "which diagram does this project render?".
 *
 * Used by:
 *   - /work ([components/work/WorkShell.tsx](WorkShell.tsx)) — featured-tier cards
 *   - /log/[id] ([app/log/[id]/page.tsx](../../app/log/[id]/page.tsx)) — RelatedProjects grid
 *   - /work/[slug] ([app/work/[slug]/page.tsx](../../app/work/[slug]/page.tsx)) — case-study hero
 *
 * 7 projects have a dedicated architecture diagram. The remaining 5
 * (showcase tier: cutetube, pulumi-infra, imgtwist, load-balancer,
 * prostream) fall back to <DiagramPlaceholder> — same panel chrome
 * (bg-code-bg), with the project name + tagline + a "diagram coming
 * soon" sub-label.
 *
 * Phase 8 (T8.1) — extracted from three duplicated slug switches.
 */

import type { ProjectItem } from "@/data/projects";
import { AlgocodeDiagram } from "./AlgocodeDiagram";
import { MovioDiagram } from "./MovioDiagram";
import { DrishtiAIDiagram } from "./DrishtiAIDiagram";
import { DatalineageDoctorDiagram } from "./DatalineageDoctorDiagram";
import { AirpassDiagram } from "./AirpassDiagram";
import { TaplyDiagram } from "./TaplyDiagram";
import { UnthinkDiagram } from "./UnthinkDiagram";
import { CutetubeDiagram } from "./CutetubeDiagram";
import { PulumiAwsInfraDiagram } from "./PulumiAwsInfraDiagram";
import { ImgTwistDiagram } from "./ImgTwistDiagram";
import { LoadBalancerLabDiagram } from "./LoadBalancerLabDiagram";
import { ProstreamDiagram } from "./ProstreamDiagram";
import { DiagramPlaceholder } from "./DiagramPlaceholder";

/**
 * Pick the architecture diagram component for a given project.
 * Returns a JSX element (not a component) so callers can drop it
 * straight into JSX without invoking a function.
 *
 * Adding a new dedicated diagram:
 *   1. Create `components/diagrams/<Name>Diagram.tsx`.
 *   2. Import it at the top of this file.
 *   3. Add a `case "<slug>":` branch in the switch below.
 *   4. Update the JSDoc comment listing the dedicated diagrams.
 *   5. Done — every consumer picks it up automatically.
 */
export function pickDiagram(project: ProjectItem): React.JSX.Element {
  switch (project.slug) {
    case "taply":
      return <TaplyDiagram />;
    case "unthink":
      return <UnthinkDiagram />;
    case "algocode":
      return <AlgocodeDiagram />;
    case "movio":
      return <MovioDiagram />;
    case "drishti-ai":
      return <DrishtiAIDiagram />;
    case "datalineage-doctor":
      return <DatalineageDoctorDiagram />;
    case "airpass":
      return <AirpassDiagram />;
    case "cutetube":
      return <CutetubeDiagram />;
    case "pulumi-infra":
      return <PulumiAwsInfraDiagram />;
    case "imgtwist":
      return <ImgTwistDiagram />;
    case "load-balancer":
      return <LoadBalancerLabDiagram />;
    case "prostream":
      return <ProstreamDiagram />;
    default:
      /* Future projects without a dedicated diagram fall back to the
         placeholder panel. */
      return <DiagramPlaceholder project={project} />;
  }
}