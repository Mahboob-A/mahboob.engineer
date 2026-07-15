/**
 * components/writing/PostTOC.tsx
 *
 * Sticky table of contents sidebar for /writing/[slug]. Visible at
 * ≥md; hidden on mobile (the user scrolls the article top-to-bottom
 * instead).
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import type { TocEntry } from "@/lib/mdx";

export interface PostTOCProps {
  toc: TocEntry[];
}

export function PostTOC({ toc }: PostTOCProps) {
  if (toc.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-[88px] hidden max-h-[calc(100vh-120px)] overflow-y-auto pr-2 md:block"
    >
      <p className="text-t3 mb-3 font-mono text-[10px] tracking-[1.5px] uppercase">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-border">
        {toc.map((entry, i) => (
          <li
            key={`${entry.slug}-${i}`}
            className={entry.depth === 3 ? "pl-5" : "pl-3"}
          >
            <a
              href={`#${entry.slug}`}
              className="text-t2 hover:text-acc block truncate text-[12.5px] leading-[1.4] transition-colors"
              title={entry.text}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
