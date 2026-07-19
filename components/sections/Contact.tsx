/**
 * components/sections/Contact.tsx
 *
 * The "05 / OPEN AN ISSUE" section on `/`. Per master §2 +
 * flat mockup — terminal-style contact form on the left, a
 * vertical quick-links list on the right.
 *
 * Server Component as of T3.5 — the form was lifted into the shared
 * `<ContactForm>` component (`components/contact/ContactForm.tsx`)
 * so the landing section and `/contact` page share one source of
 * truth for the form behaviour, labels, and chip buckets.
 *
 * Layout:
 *   [Section header — eyebrow + title + description]
 *   [2-col grid: lg:grid-cols-[1.7fr_1fr]]
 *     LEFT  → <ContactForm />   (the shared form)
 *     RIGHT → "find me elsewhere" card with 5 quick-links
 */

import { ContactForm } from "@/components/contact/ContactForm";
import { DIRECT_LINKS } from "@/data/contact";
import { FadeUp } from "@/components/motion";

export function Contact() {
  /* The landing version shows 5 quick-links (GitHub / LinkedIn / Medium /
     Taply / Email). /contact shows 6 (adds Resume via Google Drive).
     Slice the same registry here to keep this section compact. */
  const landingLinks = DIRECT_LINKS.filter(
    (l) => l.label !== "Resume",
  );

  return (
    <FadeUp
      as="section"
      className="border-border scroll-mt-20 border-t py-[90px]"
      id="contact"
    >
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-acc mb-2.5 font-mono text-[13px] tracking-[1px]">
            Say hello
          </p>
          <h2 className="font-display text-t1 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.5px]">
            Let&apos;s build something durable.
          </h2>
          <p className="text-t2 mt-3 max-w-[520px] text-[15px]">
            Hiring, consulting, a partnership, or just a hello. Pick a
            label and tell me what you&apos;re working on.
          </p>
        </div>

        {/* 2-col grid: form (left) + quick-links (right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* LEFT — terminal form (shared component) */}
          <ContactForm />

          {/* RIGHT — quick-links card */}
          <aside className="bg-surface border-border rounded-[10px] border p-6 md:p-7">
            <p className="text-t3 mb-4 font-mono text-[12px] tracking-[1px]">
              FIND ME ELSEWHERE
            </p>
            <ul className="flex flex-col gap-1">
              {landingLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
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
                </li>
              ))}
            </ul>
            <p className="text-t3 mt-5 font-mono text-[11px] leading-[1.55]">
              Based in Bangalore / Chennai. Open to remote-first roles
              globally.
            </p>
          </aside>
        </div>
      </div>
    </FadeUp>
  );
}