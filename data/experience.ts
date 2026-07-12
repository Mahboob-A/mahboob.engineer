/**
 * data/experience.ts
 *
 * Work history + education. Used by:
 *   - landing page (Deployment Log section)
 *   - /log (full timeline + key achievements)
 *   - game mode (district metadata — none yet, but reserved)
 *
 * Source: portfolio-master-doc.md §0.5 — copied verbatim.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types
   =========================================================================== */

/** Whether the role is currently active or completed. */
export type ExperienceStatus = "active" | "completed";

/** A single work-experience entry. */
export interface ExperienceItem {
  /** Stable id used for keys + future deep-link anchors. */
  id: string;
  /** Company name as it should appear. */
  company: string;
  /** Optional company URL. */
  url: string | null;
  /** Job title. */
  role: string;
  /** Human-readable period, e.g. "May 2026 – Present". */
  period: string;
  /** Active or completed. */
  status: ExperienceStatus;
  /** 4–6 achievement bullets — the meat of the entry. */
  bullets: string[];
  /** Tech tag list — rendered as <Chip> components on the page. */
  tags: string[];
}

/** A single education / training entry. */
export interface EducationItem {
  institution: string;
  degree: string;
  /** Human-readable period. */
  period: string;
  /** "Bangalore, India" / "Remote" / etc. */
  location: string;
  /** For training programs: list of topics covered. Optional. */
  covered?: string[];
}

/* ===========================================================================
   EXPERIENCE registry
   Source: master §0.5 — copied verbatim.
   =========================================================================== */

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "taply",
    company: "Taply",
    url: "https://gettaply.me",
    role: "Co-Founder & Backend Engineer",
    period: "May 2026 – Present",
    status: "active",
    bullets: [
      "Co-founded Taply and architected the backend profile system — 11 section types, 4 layout variants, live theme customization, drag-and-drop ordering, version history with rollback — on Django 5.1 and DRF.",
      "Shipped the NFC and QR sharing layer: tap or scan opens a user's live profile in under 100ms via Redis-cached profile loads, with one-tap vCard save.",
      "Built the real-time analytics engine tracking profile views, NFC taps, QR scans, and vCard saves — plus a leads inbox that captures visitor contact requests.",
      "Delivered the team management console — role-based branding controls, bulk CSV onboarding, per-rep analytics — the feature set that closed Taply's first paying enterprise customer.",
      "Integrated Stripe (Checkout + Portal + Webhooks) for billing across Free, Pro, Business, and Enterprise tiers.",
    ],
    tags: [
      "Django 5.1",
      "DRF",
      "Next.js 15",
      "Redis",
      "PostgreSQL",
      "Stripe",
      "JWT/OAuth2/2FA",
      "NFC/QR",
    ],
  },
  {
    id: "nexbell",
    company: "NexBell Inc.",
    url: null,
    role: "Software Engineer",
    period: "Nov 2024 – Jun 2026",
    status: "completed",
    bullets: [
      "Led sprint planning and PR review for a 9-person engineering team; introduced mandatory CI gates that tightened delivery consistency across releases.",
      "Rebuilt the login system on OAuth2, JWT, and RBAC — closing authentication vulnerabilities in the legacy session-based flow.",
      "Redesigned composite indexes and rewrote ORM queries across a multi-vendor MySQL system, cutting query execution time by 17% across 50+ store deployments.",
      "Migrated idle AWS resources to reserved-instance and auto-scaling capacity; rebuilt CI/CD with CodePipeline + Docker — cut cloud spend by 35% and reduced deployment lead time from hours to minutes.",
    ],
    tags: [
      "Django",
      "MySQL",
      "AWS/CodePipeline",
      "OAuth2/JWT",
      "CI/CD",
      "Team Leadership",
    ],
  },
  {
    id: "innovative-it",
    company: "Innovative IT",
    url: null,
    role: "Software Developer",
    period: "Sept 2023 – Oct 2024",
    status: "completed",
    bullets: [
      "Built and owned production REST APIs with DRF — relational schema design, serialization logic, secure low-latency delivery across web and mobile clients.",
      "Diagnosed and resolved backend performance bottlenecks through query and index optimization, reducing API response times across client applications.",
    ],
    tags: ["Django", "DRF", "PostgreSQL", "REST APIs"],
  },
];

/* ===========================================================================
   EDUCATION registry
   Source: master §0.5 — copied verbatim.
   =========================================================================== */

export const EDUCATION: EducationItem[] = [
  {
    institution: "SRM Institute of Science and Technology",
    degree: "Master of Computer Application (MCA)",
    period: "Jan 2025 – Dec 2026",
    location: "India",
  },
  {
    institution: "Poridhi",
    degree: "Backend Engineering & Cloud Computing Specialization",
    period: "Mar 2024 – Aug 2025",
    location: "Remote",
    covered: [
      "Docker internals",
      "Kubernetes",
      "Linux networking",
      "eBPF",
      "Kafka internals",
      "Observability stack (Prometheus, Grafana, Jaeger, OpenTelemetry)",
    ],
  },
];

/* ===========================================================================
   Lookup helpers
   =========================================================================== */

/** Active experience entries — used on the landing page "what I'm doing now". */
export const ACTIVE_EXPERIENCE: ExperienceItem[] = EXPERIENCE.filter(
  (e) => e.status === "active",
);

/** Completed experience entries — used on /log below the active ones. */
export const COMPLETED_EXPERIENCE: ExperienceItem[] = EXPERIENCE.filter(
  (e) => e.status === "completed",
);

/** Map experience id → entry (used to look up Taply from PROJECTS.slug). */
export const EXPERIENCE_BY_ID: Readonly<Record<string, ExperienceItem>> =
  Object.freeze(
    EXPERIENCE.reduce<Record<string, ExperienceItem>>((acc, e) => {
      acc[e.id] = e;
      return acc;
    }, {}),
  );

/* ===========================================================================
   KEY_ACHIEVEMENTS — cross-role metrics for /log
   Master §2.1 "KEY ACHIEVEMENTS ACROSS ALL ROLES" — 3 metric cards. Each
   entry maps back to a bullet somewhere in EXPERIENCE (so the data is
   derived, not invented). Content here is editable in one place.
   =========================================================================== */
export interface AchievementItem {
  /** Big amber mono number — e.g. "35%", "17%", "1". */
  num: string;
  /** Headline label below the number. */
  label: string;
  /** Optional supporting line for context (e.g. "across 50+ stores"). */
  context?: string;
}

export const KEY_ACHIEVEMENTS: AchievementItem[] = [
  {
    num: "35%",
    label: "AWS cloud-cost reduction",
    context: "at NexBell — idle → reserved + autoscaling",
  },
  {
    num: "17%",
    label: "query execution time cut",
    context: "across 50+ multi-vendor MySQL store deployments",
  },
  {
    num: "1",
    label: "enterprise customer closed",
    context: "Taply's first paying enterprise account",
  },
];

/* ===========================================================================
   NOW_STATUSES — "What I'm doing now" section on /log
   Master §2.1 — 2-col row. One entry per active/building project.
   Sources:
     - Taply: status pulled from EXPERIENCE[0]; liveUrl is the personal
       Taply profile demo.
     - UnThink: status pulled from PROJECTS.unthink.tagline + .built;
       liveUrl is null until v1 ships (target Aug 2026 per master).
   =========================================================================== */
export type NowStatusKind = "active" | "building";

export interface NowStatusItem {
  /** Display name (e.g. "Taply"). */
  name: string;
  /** Project slug — for /work/[slug] link + future PROJECTS lookups. */
  slug: string;
  /** Exactly 2 sentences per master spec. */
  status: string;
  /** Live product URL; null when the project hasn't shipped yet. */
  liveUrl: string | null;
  /** Drives the badge variant on the card. */
  statusKind: NowStatusKind;
}

export const NOW_STATUSES: NowStatusItem[] = [
  {
    name: "Taply",
    slug: "taply",
    status:
      "Co-founder + backend engineer. Shipping the profile system, NFC/QR sharing layer, real-time analytics, and team management console on Django 5.1 + DRF — daily.",
    liveUrl: "https://gettaply.me/p/mehboob",
    statusKind: "active",
  },
  {
    name: "UnThink",
    slug: "unthink",
    status:
      "Building a fragment-first knowledge base for engineers. AI classifies every save, browser extension as the primary capture interface. Targeting an August 2026 release.",
    liveUrl: null,
    statusKind: "building",
  },
];