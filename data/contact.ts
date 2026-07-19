/**
 * data/contact.ts
 *
 * Single source of truth for everything on the /contact page +
 * the contact-style components (form labels + chip bucket mapping
 * shared with the landing Contact section).
 *
 * Contents:
 *   - AVAILABILITY + RESPONSE_TIME — sidebar "open for work" status
 *   - DIRECT_LINKS — 6 social + resume rows
 *   - FAQ — 9 always-expanded Q&A pairs (Phase 26 expansion)
 *   - QUICK_CONTEXT_FITS + QUICK_CONTEXT_DOESNT — sidebar
 *     "is this email for me?" two-list card (Phase 26)
 *   - HOW_THE_FORM_GETS_USED — single sidebar card
 *     (Phase 28). Phase 27's WHAT_I_READ_FIRST and
 *     RESPONSE_TIME_LINES were dropped after the page
 *     still misaligned with the FAQ on lg+; the kept card
 *     got tighter padding + smaller bullet text instead.
 *   - CONTACT_LABELS + bucketFor() — the form's 5 label chips + color
 *
 * Source: portfolio-master-doc.md §0.2 + §2.6.
 *
 * Rules respected:
 *   - All content lives here, not in JSX (master §6 rule #2).
 *   - The Email link uses mailto:, the Resume link points to a Google
 *     Drive URL the user maintains in one place — no local /resume.pdf
 *     to drift out of date.
 */

import type { ChipColor } from "@/data/tokens";

/* ─────────────────────────────────────────────────────────────────────
   1. Availability
   ───────────────────────────────────────────────────────────────────── */

export type AvailabilityKind = "live" | "amber" | "mauve";

export interface AvailabilityItem {
  /** Status dot color — drives the small dot to the left of each line. */
  kind: AvailabilityKind;
  /** Headline status line. */
  text: string;
}

export const AVAILABILITY: AvailabilityItem[] = [
  { kind: "live", text: "Available for backend roles (remote)" },
  { kind: "live", text: "Open to backend / platform positions" },
  { kind: "mauve", text: "Taply partnership enquiries welcome" },
];

export const RESPONSE_TIME = "within 24h";

/* ─────────────────────────────────────────────────────────────────────
   2. Direct links
   ───────────────────────────────────────────────────────────────────── */

export interface DirectLinkItem {
  /** Display label. */
  label: string;
  /** Visible handle/identifier (sub-line under the label). */
  handle: string;
  /** href — can be a mailto:, an external URL, or a Google Drive URL. */
  href: string;
  /** True for any href other than mailto:. Drives target=_blank. */
  external: boolean;
}

export const DIRECT_LINKS: DirectLinkItem[] = [
  {
    label: "GitHub",
    handle: "@Mahboob-A",
    href: "https://github.com/Mahboob-A",
    external: true,
  },
  {
    label: "LinkedIn",
    handle: "in/i-mahboob-alam",
    href: "https://linkedin.com/in/i-mahboob-alam",
    external: true,
  },
  {
    label: "Medium",
    handle: "@imehboob",
    href: "https://imehboob.medium.com",
    external: true,
  },
  {
    label: "Taply",
    handle: "gettaply.me",
    href: "https://gettaply.me/p/mehboob",
    external: true,
  },
  {
    label: "Email",
    handle: "connect.mahboobalam@gmail.com",
    href: "mailto:connect.mahboobalam@gmail.com",
    external: false,
  },
  {
    label: "Resume",
    handle: "Google Drive · latest version",
    href: "https://drive.google.com/file/d/1fJzh3qcz3NHvCBGop9Yp4fJE4WecD8Q8/view",
    external: true,
  },
];

/* ─────────────────────────────────────────────────────────────────────
   3. FAQ — always-expanded Q&A pairs
   ───────────────────────────────────────────────────────────────────── */

export interface FAQItem {
  question: string;
  answer: string;
}

/* Phase 26: 9 pairs, grouped by topic (location → company fit →
   engagement → logistics → work style → ramp). The first 3 are
   the master §2.6 originals; the next 6 are the Phase 26
   expansion. */
export const FAQ: FAQItem[] = [
  {
    question: "Are you open to relocating?",
    answer:
      "Open to remote-first roles globally. On-site in India.",
  },
  {
    question: "What stage of companies do you prefer?",
    answer:
      "Startups to mid-size. Series A through C is the sweet spot, although founding role works too. Large enough to have real systems problems, small enough to own architecture decisions.",
  },
  {
    question: "Do you take freelance / consulting work?",
    answer:
      "Case by case. Backend architecture, system design reviews, Django / FastAPI consulting.",
  },
  {
    question: "What's your timezone?",
    answer:
      "IST (UTC+5:30). Open to async-first workflows with US / EU teams. Overlap hours are 1–6pm IST for the Americas.",
  },
  {
    question: "What's your notice period?",
    answer:
      "Two weeks for the right role. Faster for a Taply partnership conversation. NexBell was a 2-week handover.",
  },
  {
    question: "Do you need visa sponsorship?",
    answer:
      "Indian passport, no sponsorship needed for remote-first roles. For in-office roles in the US / EU, the company has to sponsor. Happy to discuss specifics.",
  },
  {
    question: "Are you okay with async-first work?",
    answer:
      "That's the only way I've worked for 3+ years. I document decisions in writing, prefer long-form PRs, and respond within a working day.",
  },
  {
    question: "How long does it take you to ramp up?",
    answer:
      "Two weeks to first meaningful PR on a new codebase I've seen docs for. Three to four weeks for a green-field project. I'd rather over-estimate than promise.",
  },
  {
    question: "Is there a tech stack you'd prefer?",
    answer:
      "Python / Django / FastAPI is where I'm strongest. Happy to work in Go or Node on the right team. Not a good fit for Java-only or mobile-only roles.",
  },
];

/* ─────────────────────────────────────────────────────────────────────
   3b. Quick context — fits / doesn't fit (Phase 26 sidebar slot)
   ───────────────────────────────────────────────────────────────────── */

export interface QuickContextItem {
  text: string;
}

export const QUICK_CONTEXT_FITS: QuickContextItem[] = [
  { text: "You're hiring for a backend or platform role (remote or Bangalore)." },
  { text: "You want a Taply partnership or white-label conversation." },
  { text: "You want a system design review on a Django / FastAPI stack." },
];

export const QUICK_CONTEXT_DOESNT: QuickContextItem[] = [
  { text: "Frontend-only or design roles." },
  { text: "Crypto / NFT outreach." },
  { text: "Generic agency sales." },
  { text: "Cold 'we're hiring 100 engineers' recruiter blasts." },
];

/* ─────────────────────────────────────────────────────────────────────
   3c. How the form gets used (Phase 27, kept in Phase 28).
       The third (and final) sidebar card. Privacy + data
       handling disclosure. Phase 27's WHAT_I_READ_FIRST
       and RESPONSE_TIME_LINES were dropped after review —
       they made the page longer without fixing the FAQ
       alignment. This card stays with tighter spacing.
   ───────────────────────────────────────────────────────────────────── */

export interface FormDataLine {
  text: string;
}

export const HOW_THE_FORM_GETS_USED: FormDataLine[] = [
  { text: "Relays to my Gmail via Resend." },
  { text: "I read every email myself." },
  { text: "Your address goes nowhere else." },
  { text: "Form data is not stored on the site beyond the submit request." },
];

/* ─────────────────────────────────────────────────────────────────────
   4. Contact form labels + bucketFor()
   ───────────────────────────────────────────────────────────────────── */

/** A label id + visible text. The id is what gets POSTed. */
export interface ContactLabel {
  key: string;
  text: string;
}

export const CONTACT_LABELS: ContactLabel[] = [
  { key: "hiring", text: "hiring" },
  { key: "taply-collab", text: "taply-collab" },
  { key: "consulting", text: "consulting" },
  { key: "open-source", text: "open-source" },
  { key: "just-saying-hi", text: "just-saying-hi" },
];

/** Map a label key → its visual bucket (sage / slate / amber / mauve).
 *  Drives the active styling on the chip + the chip's resting color. */
export function bucketFor(key: string): ChipColor {
  switch (key) {
    case "hiring":
      return "sage";
    case "taply-collab":
      return "mauve";
    case "consulting":
      return "slate";
    case "open-source":
      return "sage";
    case "just-saying-hi":
      return "amber";
    default:
      return "sage";
  }
}