/**
 * app/page.tsx — Landing page (Phase 2 composition)
 *
 * Composes the full landing-page section stack from components/sections/.
 * Each Phase 2 task (T2.1 → T2.7) appends one section here.
 *
 * Current: Hero (T2.1+T2.2) + DeployLog (T2.3). T2.4 → T2.7 land next.
 */

import { Hero } from "@/components/sections/Hero";
import { DeployLog } from "@/components/sections/DeployLog";

export default function Home() {
  return (
    <>
      <Hero />
      <DeployLog />
      {/* T2.4 Projects · T2.5 SkillGraph · T2.6 Blog · T2.7 Contact
          append here in subsequent tasks. */}
    </>
  );
}
