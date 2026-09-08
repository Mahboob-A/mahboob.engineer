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
import { useMemo } from "react";
import { PROJECTS_BY_SLUG, type ProjectItem } from "@/data/projects";

export interface RelatedProjectsProps {
  projectSlugs: string[];
}

function projectTierBadge(p: ProjectItem): string {
  if (p.slug === "unthink") return "independent saas";
  if (p.slug === "taply") return "collaborative saas";
  return p.tier;
}

export function RelatedProjects({ projectSlugs: slugs }: RelatedProjectsProps) {
  const items = useMemo(() => {
    return slugs
      .map((slug) => PROJECTS_BY_SLUG[slug])
      .filter((p): p is ProjectItem => p != null);
  }, [slugs]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-t3 mb-4 font-mono text-[11.5px] tracking-[1.5px] uppercase">
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
                {projectTierBadge(p)}
              </span>
            </div>
            <p className="text-t2 text-[13px] leading-[1.5]">{p.tagline}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
