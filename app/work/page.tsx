/**
 * app/work/page.tsx
 *
 * The "02 / SYSTEMS" inner page. Per master §2.2: filterable project
 * grid, three tier sections, click any card → /work/[slug].
 *
 * Server Component. Filter state is owned by <WorkShell />, the only
 * 'use client' island on this page.
 *
 * Static at build time — all data is read from PROJECTS directly.
 *
 * Filter predicate logic MUST live in the client component
 * (functions can't be passed across the RSC boundary).
 */

import type { Metadata } from "next";
import { InnerLayout } from "@/components/layout/InnerLayout";
import { WorkShell } from "@/components/work/WorkShell";
import type { FilterId } from "@/components/work/ProjectFilter";
import { PROJECTS } from "@/data/projects";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata(
  "Work",
  "Founder projects, featured builds, and a long-tail of experiments. Filter by domain.",
);

/* Display order — only ids + labels cross the RSC boundary. The actual
   predicate lives in WorkShell.tsx. */
const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "founder", label: "Founder" },
  { id: "distributed", label: "Distributed" },
  { id: "video", label: "Video" },
  { id: "ai", label: "AI / ML" },
  { id: "infra", label: "Infra / Platform" },
  { id: "backend", label: "Backend" },
];

export default function WorkPage() {
  return (
    <InnerLayout
      backHref="/"
      backLabel="← home"
      header={{
        section: "Everything I've built end-to-end",
        title: "Everything I've built end-to-end",
        description:
          "Founder projects, featured builds, and a long-tail of experiments. Filter by domain.",
      }}
    >
      <WorkShell projects={PROJECTS} filters={FILTERS} />
    </InnerLayout>
  );
}