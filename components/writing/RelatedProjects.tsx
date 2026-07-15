/**
 * components/writing/RelatedProjects.tsx
 *
 * Bottom-of-post block listing the projects referenced by the post
 * (via `post.projects[]`). Each project renders as a chip linking
 * to /work/[slug], with the project name + tier indicator.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import Link from "next/link";
import { PROJECTS_BY_SLUG, type ProjectItem } from "@/data/projects";

export interface RelatedProjectsProps {
  projectSlugs: string[];
}

export function RelatedProjects({ projectSlugs }: RelatedProjectsProps) {
  if (projectSlugs.length === 0) return null;

  const items: ProjectItem[] = projectSlugs
    .map((slug) => PROJECTS_BY_SLUG[slug])
    .filter((p): p is ProjectItem => !!p);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-t1 mb-4 text-[20px] font-bold tracking-[-0.3px]">
        Related projects
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            className="bg-surface border-border hover:border-acc/40 flex flex-col rounded-[10px] border p-4 transition-colors"
          >
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="font-display text-t1 text-[16px] font-semibold">
                {p.name}
              </span>
              <span className="text-t3 font-mono text-[11px] uppercase">
                {p.tier}
              </span>
            </div>
            <p className="text-t2 text-[13px] leading-[1.5]">{p.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
