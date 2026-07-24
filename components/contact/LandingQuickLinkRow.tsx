"use client";

import { track } from "@vercel/analytics";
import type { DirectLinkItem } from "@/data/contact";

export function LandingQuickLinkRow({ link }: { link: DirectLinkItem }) {
  const handleClick = () => {
    try {
      track("social_link_click", { label: link.label, href: link.href });
    } catch {
      // Ignore analytics failures
    }
  };

  return (
    <a
      href={link.href}
      onClick={handleClick}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="hover:border-acc/40 hover:bg-card/40 border-border group flex items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-2.5 transition-colors"
    >
      <span className="flex flex-col">
        <span className="text-t1 group-hover:text-acc font-mono text-[12px] font-semibold tracking-[0.5px] transition-colors">
          {link.label}
        </span>
        <span className="text-t3 font-mono text-[11px]">
          {link.handle}
        </span>
      </span>
      <span
        aria-hidden
        className="text-t3 group-hover:text-acc text-[14px] transition-colors"
      >
        {link.external ? "↗" : "→"}
      </span>
    </a>
  );
}
