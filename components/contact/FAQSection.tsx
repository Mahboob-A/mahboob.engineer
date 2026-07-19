/**
 * components/contact/FAQSection.tsx
 *
 * Phase 26 — full-width FAQ card that lives in the LEFT column on
 * /lets-connect, BELOW the contact TerminalBlock. Replaces the
 * old `FAQCard` that used to be the 3rd child of the right
 * sidebar.
 *
 * 9 always-expanded Q&A pairs from `data/contact.ts`, grouped
 * by topic (location, company fit, engagement, logistics, work
 * style, ramp). Renders in source order — the data layer
 * controls the read order.
 *
 * Server Component. All copy lives in `data/contact.ts`.
 */

import type { FAQItem } from "@/data/contact";

export interface FAQSectionProps {
  items: readonly FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  return (
    <section className="bg-surface border-border mt-6 rounded-[10px] border p-5 md:p-6">
      <h2 className="text-t3 mb-5 font-mono text-[11px] tracking-[1.5px] uppercase">
        FAQ
      </h2>
      <ul className="space-y-5">
        {items.map((item, i) => (
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
      <h3 className="text-t1 font-body text-[14.5px] font-semibold leading-[1.45]">
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
