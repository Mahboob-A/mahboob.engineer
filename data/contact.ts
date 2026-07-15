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
 *   - FAQ — 3 always-expanded Q&A pairs (master §2.6 verbatim)
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
    href: "https://gettaply.me",
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
   3. FAQ — always-expanded Q&A pairs (master §2.6 verbatim)
   ───────────────────────────────────────────────────────────────────── */

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: FAQItem[] = [
  {
    question: "Are you open to relocating?",
    answer:
      "Open to remote-first roles globally. In-office in Bangalore / Chennai possible.",
  },
  {
    question: "What stage of companies do you prefer?",
    answer:
      "Startups to mid-size. Series A–C is the sweet spot — large enough to have real systems problems, small enough to own architecture decisions.",
  },
  {
    question: "Do you take freelance / consulting work?",
    answer:
      "Case by case. Backend architecture, system design reviews, Django / FastAPI consulting.",
  },
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