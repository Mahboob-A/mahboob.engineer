/**
 * data/projects.ts
 *
 * Canonical project registry. One entry per project. Used by:
 *   - landing page (featured subset)
 *   - /work (all, with tier + domain filtering)
 *   - /work/[slug] (one, matched by slug)
 *   - /stack (reverse lookup — project co-occurrence on techs)
 *   - game mode (game_building + game_district place each project in a city)
 *
 * Source: portfolio-master-doc.md §0.4 — copied verbatim. Values not
 * changed; only wrapped in TypeScript types so we get autocomplete and
 * compile-time safety on the consumer side.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types & enums
   =========================================================================== */

/** Project lifecycle. Drives the badge color and "active/building" copy. */
export type ProjectStatus = "live" | "building" | "complete";

/** Visual prominence on /work and landing. */
export type ProjectTier = "founder" | "featured" | "showcase";

/** Free-form domain tag — used by /work filter chips. */
export type ProjectDomain =
  | "saas"
  | "platform"
  | "backend"
  | "ai"
  | "distributed"
  | "video"
  | "infra"
  | "observability";

/** Game-mode map district — where this project's building sits in Backend City. */
export type GameDistrict =
  | "saas_quarter"
  | "systems_district"
  | "media_row"
  | "cloud_ridge"
  | "protocol_street"
  | "vision_lab";

/** A single project entry as it lives in the registry. */
export interface ProjectItem {
  /** URL slug. Used in routes: /work/[slug]. */
  slug: string;
  /** Display name. */
  name: string;
  /** One-line summary. */
  tagline: string;
  /** Lifecycle state. */
  status: ProjectStatus;
  /** Prominence tier. */
  tier: ProjectTier;
  /** Year shipped / launched. */
  year: number;
  /** Live product URL, if public. */
  url: string | null;
  /** Canonical GitHub URL, if open-sourced. */
  github: string | null;
  /** Some projects (pulumi-infra) have a second client repo. */
  github_client?: string | null;
  /** Live demo URL, if available. */
  demo: string | null;
  /** YouTube demo / writeup URL, if any. */
  youtube: string | null;
  /** GitHub star count — only set for projects that have a public repo. */
  stars?: number;
  /** Filter tags used by /work. */
  domain: ProjectDomain[];
  /** Tech stack list. Every entry is passed through chipColor() to render. */
  stack: string[];
  /** 3–5 headline numbers ("<100ms profile load", "22★ GitHub", etc.). */
  metrics: string[];
  /** One-paragraph problem statement. */
  problem: string;
  /** One-paragraph "what was built" summary. */
  built: string;
  /** Game-mode building label (e.g. "Taply HQ", "Algocode Server Farm"). */
  game_building: string;
  /** Game-mode district on the Backend City map. */
  game_district: GameDistrict;
}

/** Convenience: an entry shape that can be used as `<ProjectCard project={p} />`. */
export type ProjectCardData = ProjectItem;

/* ===========================================================================
   Registry — single source of truth, copied verbatim from master §0.4
   =========================================================================== */

export const PROJECTS: ProjectItem[] = [
  {
    slug: "taply",
    name: "Taply",
    tagline: "Digital business card platform — NFC, QR, analytics, teams",
    status: "live",
    tier: "founder",
    year: 2026,
    url: "https://gettaply.me",
    github: null,
    demo: "https://gettaply.me/p/mehboob",
    youtube: null,
    domain: ["saas", "platform", "backend"],
    stack: [
      "Django 5.1",
      "DRF",
      "Next.js 15",
      "React 19",
      "Redis",
      "PostgreSQL",
      "Stripe",
      "JWT",
      "OAuth2",
      "TOTP 2FA",
      "Django-Q2",
      "NFC",
      "QR",
      "vCard",
    ],
    metrics: [
      "<100ms profile load",
      "4 subscription tiers",
      "11 profile section types",
      "1 enterprise customer live",
    ],
    problem:
      "88% of paper business cards are thrown away in a week — no tracking, no updates, dead channel.",
    built:
      "Full-stack SaaS — NFC+QR sharing, real-time analytics, team RBAC console, Stripe billing. Architected and built the entire backend from scratch as co-founder.",
    game_building: "Taply HQ",
    game_district: "saas_quarter",
  },
  {
    slug: "unthink",
    name: "UnThink",
    tagline: "Fragment-first personal knowledge base for engineers",
    status: "building",
    tier: "founder",
    year: 2026,
    url: null,
    github: null,
    demo: null,
    youtube: null,
    domain: ["ai", "backend", "platform"],
    stack: [
      "Django 5",
      "FastAPI",
      "Celery",
      "Redis",
      "PostgreSQL",
      "Gemini 2.0 Flash",
      "SSE",
      "React 18",
      "Manifest V3",
    ],
    metrics: [
      "<300ms Django save API",
      "model-agnostic AI layer",
      "<$100/mo per 1k users",
      "3 Celery task queues",
    ],
    problem:
      "Every save tool requires a context switch — the friction is high enough that engineers simply don't bother capturing what they learn.",
    built:
      "Dual-backend (Django + FastAPI) with Celery coordinating 3 queues. AI classifies and organizes every fragment automatically. Browser extension as primary capture interface.",
    game_building: "UnThink Labs",
    game_district: "saas_quarter",
  },
  {
    slug: "algocode",
    name: "Algocode",
    tagline: "Distributed online judge for C++ — microservices, kernel isolation",
    status: "complete",
    tier: "featured",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Algocode",
    demo: null,
    youtube: null,
    stars: 22,
    domain: ["distributed", "backend", "infra"],
    stack: [
      "Django",
      "DRF",
      "RabbitMQ",
      "Docker (sibling)",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "AWS EC2",
      "Azure VM",
      "Linux namespaces",
      "cgroups",
      "seccomp",
    ],
    metrics: [
      "3 independent services",
      "AC/WA/TLE/MLE/SegFault verdicts",
      "kernel-level isolation",
      "token-bucket rate limiting",
      "22★ GitHub",
    ],
    problem:
      "Running untrusted user code at scale without a shared blast radius between submissions.",
    built:
      "3 independently deployable services (Auth, Code Manager, RCE Engine) coordinated through RabbitMQ. Each submission spawns an ephemeral sibling Docker container with Linux namespaces, cgroups, and seccomp enforcing strict CPU/memory/time limits.",
    game_building: "Algocode Server Farm",
    game_district: "systems_district",
  },
  {
    slug: "movio",
    name: "Movio",
    tagline: "YouTube-scale VOD platform — HLS, DASH, DRM, CDN microservices",
    status: "complete",
    tier: "featured",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Movio",
    demo: null,
    youtube: null,
    domain: ["video", "distributed", "backend"],
    stack: [
      "Django",
      "Celery",
      "FFmpeg",
      "HLS",
      "MPEG-DASH",
      "DRM",
      "AWS S3",
      "CloudFront CDN",
      "RabbitMQ",
      "Redis",
    ],
    metrics: [
      "multi-bitrate HLS + DASH output",
      "DRM content protection",
      "CDN-backed delivery",
      "microservices architecture",
    ],
    problem:
      "Deliver adaptive-bitrate video with content protection at scale, without relying on a managed video API.",
    built:
      "Transcoding pipeline producing HLS and MPEG-DASH renditions via FFmpeg workers, DRM packaging, and CloudFront CDN delivery for adaptive playback across all devices.",
    game_building: "Movio Studios",
    game_district: "media_row",
  },
  {
    slug: "datalineage-doctor",
    name: "DataLineage Doctor",
    tagline: "LLM-powered RCA engine for data quality incidents — OpenMetadata",
    status: "complete",
    tier: "featured",
    year: 2025,
    url: null,
    github: "https://github.com/Mahboob-A/datalineage-doctor",
    demo: null,
    youtube: "https://youtu.be/p9yGq0KsWhw",
    domain: ["ai", "platform", "backend", "observability"],
    stack: [
      "Python",
      "LLM (OpenAI/Gemini)",
      "OpenMetadata API",
      "FastAPI",
      "PostgreSQL",
      "Docker",
    ],
    metrics: [
      "lineage blast radius analysis",
      "automated RCA",
      "ownership mapping",
    ],
    problem:
      "Data quality incidents in large pipelines have no automated root cause analysis — engineers manually trace lineage graphs for hours.",
    built:
      "LLM-powered engine that ingests OpenMetadata lineage graphs, computes blast radius, identifies ownership, and generates structured RCA reports with remediation recommendations.",
    game_building: "DataLineage Doctor HQ",
    game_district: "systems_district",
  },
  {
    slug: "cutetube",
    name: "CuteTube",
    tagline: "Video-on-demand service — monolith-first YouTube clone",
    status: "complete",
    tier: "showcase",
    year: 2023,
    url: null,
    github: "https://github.com/Mahboob-A/CuteTube",
    demo: null,
    youtube: null,
    domain: ["video", "backend"],
    stack: [
      "Django",
      "DRF",
      "PostgreSQL",
      "Redis",
      "Celery",
      "FFmpeg",
      "AWS S3",
    ],
    metrics: [
      "video upload + processing",
      "streaming delivery",
      "user auth + channels",
    ],
    problem:
      "Learning video platform architecture from the ground up — before building Movio at scale.",
    built:
      "Monolith-first YouTube-like VOD service with video upload, FFmpeg transcoding, user channels, playlists, comments, and streaming delivery. The foundation that led to Movio's microservices architecture.",
    game_building: "CuteTube Studio",
    game_district: "media_row",
  },
  {
    slug: "drishti-ai",
    name: "DrishtiAI",
    tagline:
      "Eye disease detection via vision agents — WebRTC, sub-1s, rural India",
    status: "complete",
    tier: "featured",
    year: 2025,
    url: null,
    github: "https://github.com/Mahboob-A/drishti-ai",
    demo: null,
    youtube: "https://youtu.be/8LUT89UYnSc",
    domain: ["ai", "backend", "distributed"],
    stack: [
      "Django",
      "FastAPI",
      "React Native",
      "React Web",
      "OpenCV",
      "WebRTC",
      "RabbitMQ",
      "Docker",
    ],
    metrics: [
      "sub-1s response over WebRTC",
      "5-layer CV pipeline",
      "multilingual voice guidance",
      "4-service monorepo",
    ],
    problem:
      "ASHA health workers in rural India need to perform eye screenings without specialist access, on basic smartphones.",
    built:
      "4-service monorepo (Django, FastAPI, React Native, React Web) with a 5-layer computer vision pipeline — ingest, preprocessing, inference, postprocessing, multilingual voice output — delivered over WebRTC.",
    game_building: "DrishtiAI Vision Lab",
    game_district: "vision_lab",
  },
  {
    slug: "airpass",
    name: "AirPass",
    tagline:
      "P2P file transfer over WebRTC — no server storage, no size limit",
    status: "complete",
    tier: "showcase",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/airpass",
    demo: null,
    youtube: null,
    domain: ["backend", "distributed"],
    stack: ["Django", "Django Channels", "WebRTC", "WebSocket", "JavaScript"],
    metrics: [
      "peer-to-peer — no server storage",
      "multiple file types",
      "room-based sharing",
    ],
    problem:
      "File transfer services store your files on third-party servers. True P2P means the file never touches a server.",
    built:
      "WebRTC-based P2P file transfer — Django Channels for signaling, WebRTC data channels for direct peer transfer. No file stored on any server. Room codes for easy sharing.",
    game_building: "AirPass Exchange",
    game_district: "protocol_street",
  },
  {
    slug: "pulumi-infra",
    name: "Pulumi AWS Infra",
    tagline:
      "Production-grade scalable AWS infrastructure as code with Pulumi",
    status: "complete",
    tier: "showcase",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/scalable-aws-infra-backend-pulumi",
    github_client:
      "https://github.com/Mahboob-A/scalable-aws-infra-client-pulumi",
    demo: null,
    youtube: null,
    domain: ["infra", "platform"],
    stack: [
      "Pulumi",
      "Python",
      "AWS VPC",
      "EC2",
      "RDS",
      "S3",
      "ALB",
      "Auto Scaling Groups",
      "Route53",
      "ACM",
    ],
    metrics: [
      "multi-AZ high availability",
      "auto-scaling capacity",
      "IaC — fully reproducible",
      "separate client + backend repos",
    ],
    problem:
      "Production AWS infrastructure should be reproducible, version-controlled, and deployable without clicking through the console.",
    built:
      "Two-repo Pulumi project (backend infra + client infra) defining highly available multi-AZ AWS infrastructure: VPC, subnets, ALB, EC2 Auto Scaling, RDS, S3, Route53, ACM — all as Python code.",
    game_building: "Pulumi Cloud Towers",
    game_district: "cloud_ridge",
  },
  {
    slug: "imgtwist",
    name: "ImgTwist",
    tagline:
      "Image showcase platform — Django, async processing, social features",
    status: "complete",
    tier: "showcase",
    year: 2023,
    url: null,
    github: "https://github.com/Mahboob-A/ImgTwist",
    demo: null,
    youtube: null,
    domain: ["backend"],
    stack: ["Django", "Celery", "Redis", "PostgreSQL", "Pillow", "AWS S3"],
    metrics: ["async image processing", "social features", "S3 storage"],
    problem:
      "Learning async task processing and image pipelines end-to-end with Django + Celery.",
    built:
      "Image showcase platform — upload, async resize/processing via Celery, S3 storage, social follow/like/comment system.",
    game_building: "ImgTwist Gallery",
    game_district: "protocol_street",
  },
  {
    slug: "load-balancer",
    name: "Load Balancer Lab",
    tagline:
      "Nginx + Docker load balancing — round robin, sticky sessions, health checks",
    status: "complete",
    tier: "showcase",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Load-Balancer-Nginx-Docker",
    demo: null,
    youtube: null,
    domain: ["infra", "platform", "backend"],
    stack: ["Nginx", "Docker", "Docker Compose", "Shell scripting"],
    metrics: [
      "round-robin LB",
      "sticky sessions",
      "health check failover",
      "upstream scaling experiments",
    ],
    problem:
      "Understanding load balancing internals by implementing and breaking it — not just configuring it.",
    built:
      "Practical LB implementation and experiments: round-robin, IP hash, least connections, upstream health checks, zero-downtime deploys with Nginx + Docker Compose.",
    game_building: "LB Junction",
    game_district: "protocol_street",
  },
];

/* ===========================================================================
   Lookup helpers
   =========================================================================== */

/** O(1) slug → project lookup. */
export const PROJECTS_BY_SLUG: Readonly<Record<string, ProjectItem>> =
  Object.freeze(
    PROJECTS.reduce<Record<string, ProjectItem>>((acc, p) => {
      acc[p.slug] = p;
      return acc;
    }, {}),
  );

/** Find a project by slug, returns undefined if missing. */
export function getProjectBySlug(slug: string): ProjectItem | undefined {
  return PROJECTS_BY_SLUG[slug];
}

/** Filter helper used by /work tier sections. */
export function projectsByTier(tier: ProjectTier): ProjectItem[] {
  return PROJECTS.filter((p) => p.tier === tier);
}

/** Filter helper used by /work domain chips. */
export function projectsByDomain(domain: ProjectDomain): ProjectItem[] {
  return PROJECTS.filter((p) => p.domain.includes(domain));
}

/** Featured projects for the landing page. */
export const FOUNDER_PROJECTS: ProjectItem[] = projectsByTier("founder");
export const FEATURED_PROJECTS: ProjectItem[] = projectsByTier("featured");
export const SHOWCASE_PROJECTS: ProjectItem[] = projectsByTier("showcase");
