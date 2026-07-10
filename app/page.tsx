/**
 * app/page.tsx — Landing page (Phase 2 composition)
 *
 * Composes the full landing-page section stack from components/sections/.
 * Each Phase 2 task (T2.1 → T2.7) appends one section here.
 *
 * Current: Hero (T2.1+T2.2) + DeployLog (T2.3) + Projects (T2.4)
 * + SkillGraph (T2.5). T2.6 Blog · T2.7 Contact land next.
 */

import { Hero } from "@/components/sections/Hero";
import { DeployLog } from "@/components/sections/DeployLog";
import { Projects } from "@/components/sections/Projects";
import { SkillGraph, SkillGraphScript } from "@/components/sections/SkillGraph";

export default function Home() {
  return (
    <>
      <Hero />
      <DeployLog />
      <Projects />
      <SkillGraph />
      <SkillGraphScript />
      {/* T2.6 Blog · T2.7 Contact append here in subsequent tasks. */}
    </>
  );
}
