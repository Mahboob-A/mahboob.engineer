/**
 * data/experience.ts
 *
 * Work history + education. Used by:
 *   - landing page (Deployment Log section)
 *   - /log (full timeline + key achievements)
 *   - /log/[id] (per-experience deep-dive route — T7.x)
 *   - game mode (district metadata — none yet, but reserved)
 *
 * Source: portfolio-master-doc.md §0.5 — base entries.
 * Phase 7 (T7.1, T7.4) added optional `notes` and `relatedProjects` fields
 * per entry to power the /log/[id] deep-dive route — same shape as
 * PROJECTS[].notes. Backward-compatible: omitting both is fine.
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
  /**
   * Optional 4-paragraph prose for the /log/[id] deep-dive page.
   * Split on `\n\n` at render time. Falls back to bullets-joined if
   * missing. Same shape as PROJECTS[].notes.
   */
  notes?: string;
  /**
   * Optional list of PROJECTS slug strings — the projects shipped at
   * this company. Drives the "Related Projects" grid on /log/[id].
   */
  relatedProjects?: string[];
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
    relatedProjects: ["taply", "unthink"],
    notes: `Taply started with a deceptively simple question — "why does everyone still hand out paper business cards?" Eight-eight percent of paper cards are thrown away within a week; the people you actually want to remember you never look at the card again. We wanted to make the card live: scan a QR or tap an NFC tag and the recipient lands on your real-time profile — your current role, your latest work, a one-tap way to save you to their phone.

I co-founded the company and built the entire backend in Django 5.1 and DRF. The profile system is the heart of the product — eleven section types (about, links, social, gallery, testimonials, products, services, contact, schedule, files, video), four layout variants, drag-and-drop ordering, live theme customization, and version history with rollback. Every profile is cached in Redis so a tap resolves in under 100ms regardless of traffic; every save is appended to a versioned history that the user can rewind to.

The NFC and QR sharing layer was the first thing we shipped. We picked the cheapest NFC chips that still supported NDEF rewrites so a user can rewrite the same physical card after a role change without buying a new one. vCard save is a single tap — we ship the vCard payload from a dedicated endpoint with the right MIME type so iOS and Android both handle it without downloads.

The real-time analytics engine tracks views, NFC taps, QR scans, and vCard saves — plus a leads inbox that captures visitor contact requests. The console was built for sales teams: per-rep branding, bulk CSV onboarding, per-rep analytics. The team console is what closed Taply's first paying enterprise customer — a 250-rep sales org whose procurement team needed role-based controls and reporting.

Stripe (Checkout, Portal, Webhooks) handles billing across Free, Pro, Business, and Enterprise tiers. Subscription state lives in our Postgres; webhook idempotency is critical because Stripe retries on any 5xx.

What's next: Tier-1 enterprise features (SSO via SAML), a deeper analytics surface (UTM-aware links, A/B-tested profile versions), and a public Taply API so other SaaS products can plug into Taply profiles as a primary identity. The product surface is small, but every layer underneath is doing real work.`,
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
    relatedProjects: ["datalineage-doctor", "algocode"],
    notes: `NexBell was the first role where I owned a real production system under live traffic — a multi-vendor marketplace platform serving 50+ independent stores, all running on a shared Django + MySQL backend. The system had grown organically for years: features stacked on features, indexes inherited from migrations that no one remembered writing, and a session-based login that was showing its age.

My first job was to take ownership of the auth layer. The legacy session cookies were vulnerable to fixation and the role checks lived in scattered decorators across the codebase. I rebuilt login on OAuth2 + JWT, attached a clean RBAC layer, and gated every protected endpoint behind a single decorator. The migration path was the hard part — existing sessions had to keep working while we rolled out the new flow, and we ran the two in parallel for a month before sunset. PR review for a 9-person team was the meta-work: I introduced mandatory CI gates (lint, typecheck, tests) that tightened delivery consistency across releases and made "did CI pass?" the first thing every PR read.

The second big push was a query rewrite. The original ORM code had lazy-loading everywhere — N+1 queries were common, and the indexes were inherited from migrations that no one remembered writing. I redesigned composite indexes on the high-traffic tables (vendor-product mapping, order-history rollups) and rewrote the 12 hot-path queries to do eager-fetch + bulk reads. Query execution time dropped 17% across the deployment, measured at the median; tail latency dropped more, because the worst offenders were the ones that benefited most from composite indexes.

Cloud spend was the third lever. A previous engineer had provisioned the staging environment as a pair of always-on m5.larges that nobody touched. I migrated the always-on fleets to reserved instances (1-year, no-upfront), collapsed the idle staging environment into spot capacity, and rebuilt CI/CD on CodePipeline + Docker so deploys went from "submit a PR and someone has to ssh into the bastion" to a 12-minute automated pipeline. Lead time fell from hours to minutes; cloud spend fell 35%.

What I'd do differently today: the multi-vendor shape suggests a per-tenant database split (one MySQL per store) rather than a shared schema. The query rewrite bought us 2-3 years; eventually you'd want to split.`,
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
    relatedProjects: ["imgtwist"],
    notes: `Innovative IT was my first full-time engineering role after the MCA coursework — a small consulting shop where everyone wore multiple hats. My focus was the Django + DRF backend that powered three client-facing products: two web apps and a mobile app, all hitting the same REST surface.

The first big project was a customer-portal API for a logistics client. I owned the schema design end-to-end — relational modeling, DRF serializer shapes, authentication strategy — and shipped the v1 with full token-based auth, pagination, filtering, and a handful of specialized endpoints for shipment tracking. The mobile client was the harder constraint: low-latency endpoints with strict freshness needs, so I structured the read path to use materialized views for the most-queried rollups and the write path to publish change events to a lightweight WebSocket layer.

Performance work was a recurring theme throughout the year. I'd inherited a couple of hot endpoints that the previous engineer had left running at 800ms+ median latency; the fix was always the same shape — find the lazy-loading patterns, replace them with select_related/prefetch_related, add the missing composite indexes. One endpoint dropped from 1.2s to 80ms after a single migration. The discipline stuck: every endpoint I wrote from then on started with "what's the slowest query path on this request, and is the index supporting it?"

What I learned at Innovative IT: the value of writing tests before the second PR (catching regressions on a shared backend), the discipline of keeping serializers thin (one shape, one place to change), and the realization that performance is mostly about choosing the right indexes up front rather than tuning late. The DrishtiAI eye-screening pipeline (built the following year) and the Algocode online judge both trace patterns I'd honed here — clean schema design, eager-loaded queries, indexed rollups — even though neither uses Django.`,
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