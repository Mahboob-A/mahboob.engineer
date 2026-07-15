/**
 * components/writing/RelatedStack.tsx
 *
 * Bottom-of-post block listing the tech / stack ids a post
 * references (via `post.stack[]`). Each renders as a chip linking
 * to /stack#[tech-id] for the deep-graph view.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import Link from "next/link";

export interface RelatedStackProps {
  stackIds: string[];
}

export function RelatedStack({ stackIds }: RelatedStackProps) {
  if (stackIds.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="font-display text-t1 mb-4 text-[20px] font-bold tracking-[-0.3px]">
        Mentioned in the post
      </h2>
      <div className="flex flex-wrap gap-2">
        {stackIds.map((id) => {
          const slug = id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <Link
              key={id}
              href={`/stack#${slug}`}
              className="bg-code-bg border-border hover:border-acc/40 text-t1 hover:text-acc rounded-[6px] border px-3 py-1.5 font-mono text-[12px] transition-colors"
            >
              {id}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
