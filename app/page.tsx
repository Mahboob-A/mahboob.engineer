/**
 * app/page.tsx — Landing page (Phase 2 composition)
 *
 * Composes the full landing-page section stack from components/sections/.
 * Phases 2.1 → 2.8 each add a section; this file gets a new line per task.
 *
 * Sections (top → bottom):
 *   Hero (T2.1) · DeployLog (T2.3) · Projects (T2.4) · SkillGraph (T2.5)
 *   · Blog (T2.6) · Contact (T2.7)
 *
 * The current state is: Hero is shipped, the rest still need their
 * section components. Each anchor id matches the Navbar links so smooth
 * scrolling works.
 */

import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      {/* T2.3 → T2.7 sections append here in subsequent tasks. */}
    </>
  );
}
