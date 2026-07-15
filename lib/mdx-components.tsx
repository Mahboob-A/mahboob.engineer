/**
 * lib/mdx-components.tsx
 *
 * Custom MDX component overrides for native posts. Wired into
 * `lib/mdx.ts`'s `compileMDX` via the `components` prop.
 *
 * Overrides:
 *   - `h1`, `h2`, `h3` — already get ids from rehype-slug, but
 *     we style them via the design tokens here.
 *   - `a` — accent-green underline, opens external links in new tab.
 *   - `code` (inline) — `bg-code-bg` + accent text color.
 *   - `pre` — wraps Shiki's `<pre>` block; we keep Shiki's classes
 *     and just add rounded corners + padding.
 *   - `blockquote` — accent-bordered left rail + italic text.
 *   - `table` — responsive wrapper with surface bg + borders.
 *   - `<Callout>` (custom block) — info / warn variants. Users
 *     write `<Callout type="info">…</Callout>` in MDX.
 *
 * Source: portfolio-master-doc.md §2.5.
 */

import type { ComponentProps, ReactNode } from "react";

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      {...props}
      className="font-display text-t1 mt-12 mb-4 text-[clamp(28px,4vw,36px)] font-bold tracking-[-0.5px] first:mt-0"
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      {...props}
      className="font-display text-t1 mt-10 mb-4 text-[clamp(22px,3vw,28px)] font-bold tracking-[-0.4px] first:mt-0"
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      {...props}
      className="font-display text-t1 mt-8 mb-3 text-[clamp(18px,2.5vw,22px)] font-semibold tracking-[-0.3px] first:mt-0"
    />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <h4
      {...props}
      className="font-display text-t1 mt-6 mb-2 text-[18px] font-semibold"
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p {...props} className="text-t1 mb-4 text-[16px] leading-[1.65]" />
  ),
  a: ({ href, children, ...rest }: ComponentProps<"a">) => {
    const isExternal = !!href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        className="text-acc underline decoration-acc/40 underline-offset-[3px] transition-colors hover:decoration-acc"
        {...rest}
      >
        {children}
      </a>
    );
  },
  // Inline code. Shiki handles block code via the rehype plugin.
  code: (props: ComponentProps<"code">) => (
    <code
      {...props}
      className="bg-code-bg text-acc rounded-[4px] px-1.5 py-0.5 font-mono text-[0.9em]"
    />
  ),
  // Block code: Shiki's <pre class="shiki"> already has theme
  // styles. We add rounded + horizontal-scroll fallback.
  pre: (props: ComponentProps<"pre">) => (
    <pre
      {...props}
      className="bg-code-bg border-border mb-5 overflow-x-auto rounded-[8px] border p-4 font-mono text-[13.5px] leading-[1.5]"
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="text-t2 border-acc/40 my-6 border-l-2 pl-4 italic"
    />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul {...props} className="text-t1 mb-4 list-disc space-y-2 pl-6" />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol {...props} className="text-t1 mb-4 list-decimal space-y-2 pl-6" />
  ),
  li: (props: ComponentProps<"li">) => (
    <li {...props} className="text-[15.5px] leading-[1.6]" />
  ),
  hr: (props: ComponentProps<"hr">) => (
    <hr {...props} className="border-border my-8 border-t" />
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="border-border my-5 overflow-x-auto rounded-[8px] border">
      <table {...props} className="w-full text-[14px]" />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th
      {...props}
      className="bg-elev text-t1 border-border border-b px-3 py-2 text-left font-semibold"
    />
  ),
  td: (props: ComponentProps<"td">) => (
    <td {...props} className="text-t1 border-border border-t px-3 py-2" />
  ),
  Callout: Callout,
};

/* ===========================================================================
   Custom block: Callout
   =========================================================================== */

interface CalloutProps {
  type?: "info" | "warn";
  children: ReactNode;
}

function Callout({ type = "info", children }: CalloutProps) {
  const isWarn = type === "warn";
  return (
    <aside
      className={
        isWarn
          ? "border-amber/40 bg-amber-dim text-t1 my-5 rounded-[8px] border p-4 text-[14.5px] leading-[1.55]"
          : "border-acc/40 bg-acc-dim text-t1 my-5 rounded-[8px] border p-4 text-[14.5px] leading-[1.55]"
      }
    >
      <p
        className={
          isWarn
            ? "text-amber mb-1 font-mono text-[11px] tracking-[1.5px] uppercase"
            : "text-acc mb-1 font-mono text-[11px] tracking-[1.5px] uppercase"
        }
      >
        {isWarn ? "⚠ Note" : "ℹ Info"}
      </p>
      <div>{children}</div>
    </aside>
  );
}