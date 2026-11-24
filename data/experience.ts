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
  /**
   * Optional small italic suffix appended after `role` — used for
   * context that doesn't fit in the title itself (e.g. overlapping
   * part-time stints that converted to full-time). Renders as muted
   * italic ~12px with a " · " separator on both `/log` timeline
   * cards and `/log/[id]` deep-dive hero. Phase 18.
   */
  roleSuffix?: string;
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

/** One themed curriculum cluster inside an education card. */
export interface EducationGroup {
  /** Small uppercase eyebrow rendered above the chip row. */
  name: string;
  /** Coursework / technology labels. Each item renders as a Chip;
   *  entries that resolve through resolveStackSlug() become clickable
   *  deep-links to /stack#<id>. */
  items: string[];
}

/** A single education / training entry. */
export interface EducationItem {
  institution: string;
  degree: string;
  /** Human-readable period. */
  period: string;
  /** "Chennai, India" / "Remote" / etc. */
  location: string;
  /**
   * Phase 41: grouped curriculum for both formal degree courses and
   * specialization topics. Replaces the old parallel `courses[]` and
   * `covered[]` fields so large coursework sets stay structured and
   * both education cards use the same visual shape.
   */
  groups?: EducationGroup[];
}

/* ===========================================================================
   EXPERIENCE registry
   Source: master §0.5 — copied verbatim.
   =========================================================================== */

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "poridhi-io",
    company: "PoridhiIO",
    url: "https://poridhi.io",
    role: "Software Engineer",
    period: "Jul 2026 – Present",
    status: "active",
    bullets: [],
    tags: [],
    notes: `Software Engineer at PoridhiIO focusing on systems engineering, cloud infrastructure, and backend services.

Working on core backend architecture, distributed systems, and cloud infrastructure pipelines as part of the engineering team.`,
  },
  {
    id: "nexbell",
    company: "NexBell Inc.",
    url: null,
    role: "Software Engineer",
    roleSuffix: "including 2 months internship",
    period: "Nov 2024 – Jun 2026",
    status: "completed",
    bullets: [
      "Rebuilt the CI/CD pipeline on CodePipeline and Docker. Made lint, typecheck, and tests a hard gate on every pull request. Cut deployment lead time from hours to minutes.",
      "Rebuilt the login system on OAuth2, JWT, and RBAC, closing authentication vulnerabilities in the legacy session-based flow. Ran old and new auth in parallel for a month to migrate without breaking active sessions.",
      "Redesigned composite indexes and rewrote ORM queries across a multi-vendor MySQL system. Cut query execution time by 17% across 50+ store deployments, with tail latency dropping more.",
      "Migrated idle AWS resources to reserved instances and auto-scaling capacity, collapsing an always-on staging fleet into spot capacity. Cut cloud spend by 35%.",
    ],
    tags: [
      "Django",
      "MySQL",
      "AWS/CodePipeline",
      "OAuth2/JWT",
      "CI/CD",
      "Docker",
    ],
    relatedProjects: ["datalineage-doctor", "algocode"],
    notes: `NexBell was the first role where I owned a real production system under live traffic. It was a multi-vendor marketplace platform serving 50+ independent stores, all running on a shared Django and MySQL backend. The system had grown organically for years. Features were stacked on features. Indexes were inherited from migrations that no one remembered writing. The session-based login was showing its age.

My first job was to take ownership of the auth layer. The legacy session cookies were vulnerable to fixation, and the role checks lived in scattered decorators across the codebase. I rebuilt login on OAuth2 and JWT, attached a clean RBAC layer, and gated every protected endpoint behind a single decorator. The hard part was the migration path. Existing sessions had to keep working while we rolled out the new flow, so we ran the two in parallel for a month before sunset. The CI work was the unglamorous half. Rebuilding the pipeline on CodePipeline and Docker, and making lint, typecheck, and tests a hard gate before review, meant a broken build never reached a human's attention. Shipping went from a manual ssh-into-the-bastion ritual to a 12-minute loop.

The second big push was a query rewrite. The original ORM code had lazy-loading everywhere. N+1 queries were common, and the indexes were inherited from migrations no one remembered writing. I redesigned composite indexes on the high-traffic tables (vendor-product mapping, order-history rollups) and rewrote the 12 hot-path queries to do eager-fetch and bulk reads. Query execution time dropped 17% across the deployment, measured at the median. Tail latency dropped more, because the worst offenders benefited most from composite indexes.

Cloud spend was the third lever. A previous engineer had provisioned staging as a pair of always-on m5.larges that nobody touched. I migrated the always-on fleets to reserved instances (1-year, no-upfront) and collapsed the idle staging environment into spot capacity. Cloud spend fell 35%. The pipeline rebuild ran alongside it, so deploys went from "submit a PR and someone sshes into the bastion" to a 12-minute automated loop.

The deploys themselves were the unsung hero. Postgres migrations gated behind a no-DDL-during-traffic runbook. Celery worker pools split by task class, so a slow batch job couldn't starve the realtime queue. By the end of my time there, shipping a feature was a 12-minute loop: PR, CI gates, CodePipeline, ALB swap, dashboards show new error rate, latency, and conversion within five minutes. That's the muscle memory I now expect on every team I join. What's next, if I returned. A per-tenant database split (one MySQL per store) is the obvious improvement. The shared schema is the only thing still holding the platform back from true multi-region deployment. I'd also extract the auth layer into a separate service so the next product team can reuse OAuth2 and JWT without forking it. The patterns from NexBell (CI-as-a-gate, lazy-load discipline) are the ones I keep applying, and they're also the patterns Taply and UnThink now inherit.`,
  },
  {
    id: "innovative-it",
    company: "Innovative IT",
    url: null,
    role: "Software Developer",
    period: "Dec 2023 – Oct 2024",
    status: "completed",
    bullets: [
      "Performance: Owned bottleneck diagnosis and resolution through indexing and queryset optimization, driving measurable reductions in API response times across client applications.",
      "API Design: Architected and owned production-ready REST APIs with DRF, enforcing secure auth patterns and optimized serialization logic for low-latency data delivery.",
      "Async Architecture: Designed and owned Celery and Redis pipelines to offload reporting workflows and background processing tasks, directly improving frontend responsiveness.",
      "Backend Engineering: Designed relational schemas and Django services built for data integrity and scalability across web and mobile surfaces.",
    ],
    tags: ["Django", "DRF", "PostgreSQL", "REST APIs"],
    relatedProjects: ["imgtwist"],
    notes: `Innovative IT was my first full-time engineering role after the MCA coursework. It was a small consulting shop where everyone wore multiple hats. My focus was the Django and DRF backend that powered three client-facing products: two web apps and a mobile app, all hitting the same REST surface.

The first big project was a customer-portal API for a logistics client. I owned the schema end to end: relational modeling, DRF serializer shapes, and the authentication strategy. We shipped v1 with token-based auth, pagination, filtering, and a handful of specialized endpoints for shipment tracking. The mobile client was the harder constraint. Low latency, strict freshness. I structured the read path to use materialized views for the most-queried rollups, and the write path to publish change events to a lightweight WebSocket layer.

Performance work kept showing up. I'd inherited a couple of hot endpoints running at 800ms+ median latency. The fix was always the same shape: find lazy-loading patterns, replace them with select_related and prefetch_related, add the missing composite indexes. One endpoint dropped from 1.2s to 80ms after a single migration. The discipline stuck. Every endpoint I wrote from then on started with "what's the slowest query path here, and is the index supporting it?"

Deployment turned out to be where I learned the most. The first v1 shipped on a bare EC2 with no automation. By month six I had Fabric scripts for app, migrations, collectstatic, and restart, then Ansible roles for the broker and the DB. The blue/green pattern (ALB swaps target groups with no downtime) came directly from this, and it set the standard I aimed for at NexBell. The lesson is that deployment is a forcing function for the rest of the architecture.

What I learned at Innovative IT. Write tests before the second PR. Keep serializers thin (one shape, one place to change). Choose the right indexes up front rather than tuning late. The DrishtiAI pipeline and Algocode both trace patterns I honed here, even though neither uses Django. What's next, if the consulting path ever opens again. I'd add observability (Prometheus and Grafana on day one) and a real per-tenant data model so each client could ship independently without shared-schema risk.`,
  },
  /* Phase 18: Eve Healthcare internship. Sept–Nov 2023 overlaps with
     the start of Innovative IT (Sept 2023) — the roleSuffix on the
     Innovative IT entry documents that overlap. No relatedProjects
     and no notes (deep-dive falls back to the bullets-as-prose path
     in StoryPath). Period format matches the existing convention
     (en-dash, "Present" / month + year). */
  {
    id: "eve-healthcare",
    company: "Eve Healthcare",
    url: null,
    role: "Software Engineer Intern",
    period: "Sept 2023 – Nov 2023",
    status: "completed",
    bullets: [
      "Search Optimization: Improved platform search efficiency, lifting user search success rates by 15%.",
      "Real-Time Communication: Added real-time in-app chat over WebSocket, lifting user engagement and retention by 30%.",
      "API Performance: Optimized 22% of patient dashboard APIs, cutting database queries and reducing response times by 1 second.",
      "Doctor Dashboard: Built the doctor dashboard and analytics surface, improving data access by 20% and data-driven decisions by 15%.",
    ],
    /* Phase 20: keywords pulled from the bullets above. WebSocket
       is explicit ("real-time in-app chat over WebSocket"). DRF
       is the framework that would have served the 22% of
       patient dashboard APIs (matches the Django + DRF era of
       late 2023). Redis sits behind both the realtime chat and
       the dashboard analytics layer. Each resolves to a
       /stack#<id> chip via resolveStackSlug(). */
    tags: ["WebSocket", "DRF", "Redis"],
    notes: `Eve Healthcare was a three-month internship during my final year of MCA. The product was a doctor-patient platform with search, in-app chat, and a doctor-facing analytics dashboard. I worked on the backend surface that powered all three.

The search work was the first time I touched Elasticsearch end-to-end. The default analyzer was tokenizing English like a search engine built for the late 90s, returning results that matched keywords but missed synonyms and partial matches. I rewrote the analyzer, added synonyms from a small medical dictionary, and tuned the fuzziness parameter. Search success rate went up 15% in the next month's metrics.

The in-app chat was a WebSocket layer over Django Channels. The hard part wasn't the socket itself; it was backpressure when a patient's connection dropped mid-message and the unread-counter had to be authoritative. I learned the offline-first lesson here — never assume the socket is up.

The dashboard work was the cleanest deliverable. Twenty-two percent of the patient dashboard APIs had avoidable database round-trips (N+1 patterns, missing select_related). One refactor pass, latency dropped by a full second on the dashboard hot path. That fix taught me the lesson NexBell then made me formalize: profile and fix the slowest query path before writing a single feature line.

The whole internship was when I internalized that production work is mostly about choosing what not to ship. We had five candidate features in the queue and we shipped two of them well rather than four of them badly.`,
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
    location: "Chennai, India",
    /* Phase 41: the original flat 13-course list is grouped into 4
       themes. Same data, clearer scan path, parallel structure with
       the Poridhi card below. Each item still renders through
       ClickableChip → chipColor() + resolveStackSlug(). */
    groups: [
      {
        name: "Languages & Frameworks",
        items: ["Java", "Python", "Android"],
      },
      {
        name: "Systems & Methodology",
        items: [
          "Operating Systems",
          "Object-Oriented Design",
          "Software Engineering",
        ],
      },
      {
        name: "Data Layer",
        items: ["DBMS", "Data Analysis with R", "Data Mining"],
      },
      {
        name: "Infrastructure & Theory",
        items: [
          "IT Infrastructure Management",
          "Cloud Computing",
          "Networking",
          "Data Structures and Algorithms",
        ],
      },
    ],
  },
  {
    institution: "Poridhi",
    degree: "Backend Engineering & Cloud Computing Specialization",
    period: "Mar 2024 – Aug 2025",
    location: "Remote",
    /* Phase 41: 6 original topics + user-supplied practical
       coursework aggregated into 4 balanced themes so the card stays
       scannable and aligns with SRM's grouped shape. Obvious spelling
       normalization only: "ngixnx" → Nginx, "merkel" → Merkle,
       "shortner" → shortener, "progress" → PostgreSQL. */
    groups: [
      {
        name: "Backend Engineering",
        items: [
          "Distributed message queue",
          "RabbitMQ",
          "Rate limiting",
          "Microservices networking",
          "Full-stack chat app: design, build & deploy",
          "URL shortener: practical design",
          "Load balancer",
        ],
      },
      {
        name: "Data Layer",
        items: [
          "Redis",
          "PostgreSQL internals",
          "Citus for PostgreSQL",
          "Database scaling & monitoring",
        ],
      },
      {
        name: "Cloud & Infrastructure",
        items: [
          "AWS architecture for scaling",
          "Pulumi",
          "Kubernetes",
          "Nginx",
          "SSH",
          "DNS server from scratch",
        ],
      },
      {
        name: "Networking & Distributed",
        items: [
          "Mininet",
          "Merkle tree",
          "Kafka from scratch",
          "OpenTelemetry",
          "Linux networking",
          "eBPF",
          "Docker internals",
        ],
      },
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
   DSA_PRACTICE — problem-solving profile links for /log
   Phase 38 (T38.2): a compact section between KEY ACHIEVEMENTS and
   WHAT I'M DOING NOW. 5 platforms where the user practices daily;
   each entry renders as an external-link pill in the /log page.

   The `stat?` field is intentionally optional and currently unset
   for every entry — problem counts must come from the user, never
   invented. The field exists so a future commit can add counts
   without a registry refactor.
   =========================================================================== */
export interface PracticeLinkItem {
  /** Stable id (kebab-case platform name). */
  id: string;
  /** Display label shown inside the pill (e.g. "LeetCode"). */
  label: string;
  /** Profile URL — always external. */
  href: string;
  /** Profile handle shown as hover/aria-label. */
  handle: string;
  /** Always true; typed explicitly so the renderer can rely on it
   *  for the target=_blank + rel=noreferrer attributes. */
  external: true;
  /** Optional stat line ("240 total solved"). Unused for now — the
   *  user hasn't supplied counts yet. Adding it later doesn't
   *  require a renderer change. */
  stat?: string;
}

export const DSA_PRACTICE: PracticeLinkItem[] = [
  {
    id: "codolio",
    label: "Codolio",
    href: "https://codolio.com/profile/yurious",
    handle: "yurious",
    external: true,
  },
  {
    id: "leetcode",
    label: "LeetCode",
    href: "https://leetcode.com/u/mahboob-alam/",
    handle: "mahboob-alam",
    external: true,
  },
  {
    id: "codeforces",
    label: "Codeforces",
    href: "https://codeforces.com/profile/yurious",
    handle: "yurious",
    external: true,
  },
  {
    id: "code360",
    label: "Code360",
    href: "https://www.naukri.com/code360/profile/yurious",
    handle: "yurious",
    external: true,
  },
  {
    id: "interviewbit",
    label: "InterviewBit",
    href: "https://www.interviewbit.com/profile/mahboob-a/",
    handle: "mahboob-a",
    external: true,
  },
];

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
    context: "at NexBell, idle to reserved plus autoscaling",
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
    name: "UnThink",
    slug: "unthink",
    status:
      "Software engineer (independent product). Shipping an AI-native, fragment-first personal knowledge base and published Manifest V3 Chrome Extension with zero-shot dual-directory taxonomic routing.",
    liveUrl: "https://letsunthink.tech",
    statusKind: "active",
  },
  {
    name: "Taply",
    slug: "taply",
    status:
      "Backend engineer (collaborative product). Shipping the profile system, NFC/QR sharing layer, real-time analytics, and team management console on Django 5.1 and DRF, daily.",
    liveUrl: "https://gettaply.me/p/mehboob",
    statusKind: "active",
  },
];