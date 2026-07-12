/**
 * components/contact/ContactSidebar.tsx
 *
 * Right column on /contact. Three stacked cards:
 *   1. Availability card  — 3 status lines + response time footer
 *   2. Direct links card  — 6 social/resume rows with hover affordance
 *   3. FAQ card           — 3 always-expanded Q&A pairs
 *
 * Server Component. All data comes from `data/contact.ts`. No state.
 */

import { cn } from "@/lib/cn";
import {
  AVAILABILITY,
  RESPONSE_TIME,
  DIRECT_LINKS,
  FAQ,
  type AvailabilityKind,
  type DirectLinkItem,
  type FAQItem,
} from "@/data/contact";

/* Status-dot color → CSS var. Matches the visual language of the
   AvailabilityItem.kind enum (live / amber / mauve). */
const KIND_DOT: Record<AvailabilityKind, string> = {
  live: "bg-acc",
  amber: "bg-amber",
  mauve: "bg-mauve",
};

export function ContactSidebar() {
  return (
    <aside className="flex flex-col gap-5">
      <AvailabilityCard />
      <DirectLinksCard />
      <FAQCard />
    </aside>
  );
}

/* ─── Availability ─────────────────────────────────────────────────── */

function AvailabilityCard() {
  return (
    <section className="bg-surface border-border rounded-[10px] border p-5 md:p-6">
      <p className="text-t3 mb-4 font-mono text-[11px] tracking-[1.5px] uppercase">
        Availability
      </p>
      <ul className="space-y-3">
        {AVAILABILITY.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={cn(
                "mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full",
                KIND_DOT[item.kind],
              )}
            />
            <span className="text-t1 text-[14px] leading-[1.5]">
              {item.text}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-t3 mt-5 border-border border-t pt-3 font-mono text-[12px]">
        Current response time: <span className="text-t2">{RESPONSE_TIME}</span>
      </p>
    </section>
  );
}

/* ─── Direct links ─────────────────────────────────────────────────── */

function DirectLinksCard() {
  return (
    <section className="bg-surface border-border rounded-[10px] border p-5 md:p-6">
      <p className="text-t3 mb-4 font-mono text-[11px] tracking-[1.5px] uppercase">
        Find me elsewhere
      </p>
      <ul className="space-y-1">
        {DIRECT_LINKS.map((link) => (
          <li key={link.label}>
            <DirectLinkRow link={link} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DirectLinkRow({ link }: { link: DirectLinkItem }) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className="hover:border-acc/40 hover:bg-card/40 border-border group flex items-center justify-between gap-3 rounded-[6px] border border-transparent px-3 py-2.5 transition-colors"
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-t1 group-hover:text-acc font-mono text-[12.5px] font-semibold tracking-[0.5px] transition-colors">
          {link.label}
        </span>
        <span className="text-t3 truncate font-mono text-[11px]">
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

/* ─── FAQ ──────────────────────────────────────────────────────────── */

function FAQCard() {
  return (
    <section className="bg-surface border-border rounded-[10px] border p-5 md:p-6">
      <p className="text-t3 mb-4 font-mono text-[11px] tracking-[1.5px] uppercase">
        FAQ
      </p>
      <ul className="space-y-5">
        {FAQ.map((item, i) => (
          <li key={i}>
            <FAQRow item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FAQRow({ item }: { item: FAQItem }) {
  return (
    <div>
      <h3 className="text-t1 font-body text-[14px] font-semibold">
        <span className="text-acc mr-1.5 font-mono text-[12px]">Q:</span>
        {item.question}
      </h3>
      <p className="text-t2 mt-1.5 text-[13.5px] leading-[1.6]">
        <span className="text-t3 mr-1.5 font-mono text-[12px]">A:</span>
        {item.answer}
      </p>
    </div>
  );
}