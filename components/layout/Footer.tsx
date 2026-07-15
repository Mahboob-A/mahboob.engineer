/**
 * components/layout/Footer.tsx
 *
 * Minimal footer present on every route. Two-line layout: tagline left,
 * build metadata right. Per master §1.3 + flat mockup line 1059–1064.
 */

import { siteConstants } from "@/lib/metadata";

export function Footer() {
  return (
    <footer className="border-border text-t3 mt-auto border-t py-8 font-mono text-[12px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 md:px-8">
        <span>
          {siteConstants.name} — built with Passion, love, and too much coffee.
        </span>
        <span className="text-t3">v2.0 · last deployed 2026-07</span>
      </div>
    </footer>
  );
}
