/**
 * app/stack/page.tsx
 *
 * The "03 / DEPENDENCY GRAPH" inner page. Per master §2.4:
 *
 *   [BackLink "← home"]
 *   [Section header]
 *   [Legend]
 *   [2-col grid (lg+): D3 force graph | tech detail panel]
 *   [Mobile: list view above detail panel]
 *
 * Server Component shell. The interactive piece (StackShell) is a
 * separate 'use client' island. Static at build time.
 */

import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { StackShell } from "@/components/stack/StackShell";
import { STACK, STACK_EDGES } from "@/data/stack";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Stack",
  "Every tech I've shipped with, plus what I'm currently leveling up. Hover or click a node to inspect.",
);

/* Project count per tech id — pre-computed once at module load. Used
   by MobileTechList for the per-row badge column. */
const PROJECT_COUNT_BY_TECH: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const t of STACK) {
    out[t.id] = t.projects.length;
  }
  return out;
})();

export default function StackPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        num: "03",
        section: "DEPENDENCY GRAPH",
        title: "How the stack connects",
        description:
          "Every tech I've shipped with, plus what I'm currently leveling up. Hover or click a node to inspect.",
      }}
    >
      <StackShell
        techs={STACK}
        edges={STACK_EDGES}
        projectCountByTech={PROJECT_COUNT_BY_TECH}
      />
    </InnerLayout>
  );
}