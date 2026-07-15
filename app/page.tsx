/**
 * app/page.tsx — Landing page (Phase 2 composition)
 *
 * Composes the full landing-page section stack from components/sections/.
 * Each Phase 2 task (T2.1 → T2.7) appends one section here.
 *
 * Phase 6 (T7): <Blog /> uses useSearchParams (collapse-after-6
 * with ?all=1 URL state) and Next.js 16 requires any component
 * using useSearchParams to be wrapped in a Suspense boundary at
 * the page level. The boundary lets the page prerender the static
 * sections while the Blog streams in.
 */

import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { DeployLog } from "@/components/sections/DeployLog";
import { Projects } from "@/components/sections/Projects";
import { SkillGraph, SkillGraphScript } from "@/components/sections/SkillGraph";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <DeployLog />
      <Projects />
      <SkillGraph />
      <SkillGraphScript />
      <Suspense>
        <Blog />
      </Suspense>
      <Contact />
    </>
  );
}
