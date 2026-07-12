/**
 * app/page.tsx — Landing page (Phase 2 composition)
 *
 * Composes the full landing-page section stack from components/sections/.
 * Each Phase 2 task (T2.1 → T2.7) appends one section here.
 *
 * All 6 sections are now live. Phase 2 wraps up once T2.7 (Contact)
 * verifies end-to-end.
 */

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
      <Blog />
      <Contact />
    </>
  );
}
