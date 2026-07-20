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
  /** Extra YouTube URLs beyond the canonical `youtube`. Used by projects
   * that have multiple demo / explainer videos (Algocode, Movio). */
  youtube_extra?: string[];
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
  /** Deeper build prose for the /work/[slug] case-study page. Multi-paragraph
   * string separated by `\n\n`. Lifecycle arc: how the idea formed → how the
   * problem got framed → what was built → how it was tested/deployed → what's next.
   * Tone: simple, human, conversational. Optional — case-study falls back to
   * `problem` + `built` paragraphs if missing. */
  notes?: string;
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
    tagline: "Digital business card platform. NFC, QR, analytics, and teams.",
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
      "88% of paper business cards are thrown away in a week. No tracking, no updates, dead channel.",
    built:
      "Full-stack SaaS built around NFC+QR sharing, real-time analytics, a team RBAC console, and Stripe billing. Architected and built the entire backend from scratch as co-founder.",
    notes:
      `Taply came out of a real pain. Paper business cards get thrown out within a week. You can't update them. You can't tell if anyone looked at yours. The first version was a weekend hack, an NFC sticker with a URL slug that opened a public profile. It worked in my own network but had no sharing layer. You couldn't tap and have the contact saved to your phone in one motion. That's what 'tap or scan' really meant. Not a fancy QR code, but a single vCard save that just works.

The backend got rebuilt three times before it became Taply v1. Django 5.1 and DRF stayed across all three versions because nothing else handled the relational shape of an editable profile, with eleven section types, version history, and rollback. Redis came in for the read path because re-rendering a profile from Postgres on every tap wasn't going to hit the under-100ms target we'd promised.

Stripe was the other big learning. The first integration was rough. Subscriptions, one-time upgrades, webhooks, customer portal, and dunning. We hit every edge case. The first enterprise customer came through the team management console, with bulk CSV onboarding, per-rep analytics, and role-based branding. That feature set was the one that finally got someone to pay.

We're now iterating on v2 with a drag-and-drop profile builder and a leads inbox that captures who tapped, when, and how often. The analytics layer is the one that closes the loop on the original promise. Knowing if anyone actually looked at your card.

What's next if we keep building. A tier-1 enterprise tier with SAML SSO. UTM-aware links and A/B-tested profile versions for a deeper analytics surface. A public Taply API so other SaaS products can plug into Taply profiles as a primary identity, which is also a route toward a 'Taply as identity provider' positioning.`,
    game_building: "Taply HQ",
    game_district: "saas_quarter",
  },
  {
    slug: "unthink",
    name: "UnThink",
    tagline: "Fragment-first personal knowledge base for engineers.",
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
      "Every save tool requires a context switch, and the friction is high enough that engineers don't bother capturing what they learn.",
    built:
      "Dual-backend (Django and FastAPI) with Celery coordinating three queues. AI classifies and organizes every fragment automatically. Browser extension as primary capture interface.",
    notes:
      `UnThink started from frustration with my own note-taking. I'd save a snippet, then never open it again. The friction of 'pick a folder, write a tag' was high enough that I'd skip capturing things entirely. The whole product idea is: don't make me name anything. The unit of saving is a fragment, two to four lines, not a page, and the AI figures out the folder and tags.

The architectural decision that shaped everything else was the dual backend. Django handles auth, quota, and the save API, with under 300ms return so the browser extension feels snappy. FastAPI handles the AI classification pipeline and the SSE stream that updates the dashboard when classification completes. They talk via Redis pub/sub and Celery (three queues, classification, scraping, and reports) and never call each other directly. This split exists because Django is great for relational CRUD and FastAPI is great for streaming LLM responses. Using one for both was tempting but wrong.

SSE over WebSocket was an early call. We don't need bidirectional, and SSE just works through any HTTP proxy. The browser extension (Manifest V3, Chromium only) is the primary capture interface. Right-click on selected text, hit Send to UnThink, done. The folder taxonomy is the part I'm proudest of. Every fragment lands in exactly two folders, a topic folder like Tech/DevOps/Redis and a source folder from the page title. Tags equal folder membership, so editing a tag later is just moving the fragment between folders.

Quota limits are honest. 25 right-click saves a day, 250 a month. I'd rather have a clear ceiling than a vague fair-use line. We're still in development, but the capture, classify, and file loop is solid.

What's next. Replacing the Jina and Firecrawl fallback scrapers with a single in-house crawler, plus an offline mode for the extension.`,
    game_building: "UnThink Labs",
    game_district: "saas_quarter",
  },
  {
    slug: "algocode",
    name: "Algocode",
    tagline: "Distributed online judge for C++. Microservices and kernel isolation.",
    status: "complete",
    tier: "featured",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Algocode",
    demo: null,
    youtube: "https://youtu.be/EgtAEjH53BA",
    youtube_extra: ["https://youtu.be/TbiRWL-11Fo"],
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
    notes:
      `Algocode was the project where I had to think about what 'securely running untrusted code' actually means. The naive version is a Docker container per submission, and it sounds fine until you realize that 'shared blast radius' is the entire problem. One user submits a fork bomb, the whole node dies.

The fix was Linux isolation primitives. Namespaces for filesystem and process isolation. cgroups for CPU and memory caps. seccomp to whitelist the syscalls a C++ judge actually needs, since the syscall surface for a C++ binary is small and predictable. Each submission gets a sibling container that lives only as long as the submission, with hard wall-clock limits and a hard syscall allowlist.

The system splits into three independently deployable services. Auth handles user management and tokens. Code Manager is the public-facing API. It validates the user, writes the submission to its own database, and publishes an event to RabbitMQ tagged by language. RCE Engine consumes from its language-specific queue and runs the judge in the hard-isolated sibling container. Results publish back via a unified RabbitMQ result queue, and Code Manager caches in Redis and persists to Mongo.

The whole thing runs on free-tier AWS EC2 plus an Azure VM (1GB RAM each), which is why the rate-limit middleware exists. Three submissions per minute per user, via Token Bucket. I built the limiter in Django Middleware rather than reaching for an API gateway, because adding cloud spend for one feature felt wrong. The split into three repos (algocode-auth, code-manager, rcee) was deliberate. Independent deploys and independent failures.

What's next, if I pick this back up. Skip Mongo for results and use Postgres JSONB, one less service to operate. Build a frontend. Add Java and Python judges (the RCE Engine stubs are in place). The rate-limit logic deserves a small dashboard so I can see who's hitting it.`,
    game_building: "Algocode Server Farm",
    game_district: "systems_district",
  },
  {
    slug: "movio",
    name: "Movio",
    tagline: "YouTube-scale VOD platform. HLS, DASH, DRM, and CDN microservices.",
    status: "complete",
    tier: "featured",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Movio",
    demo: null,
    youtube: "https://youtu.be/Y2_KYdhKGhw",
    youtube_extra: ["https://youtu.be/F_R2KIXYBMU"],
    stars: 13,
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
    notes:
      `Movio is the project where the lessons from CuteTube finally clicked. CuteTube had worked as a monolith, with upload, transcode in a Celery pipeline, and serve via CDN. It broke under real upload traffic because one worker was doing everything. Movio took the same idea and split the worker into a 10-step Celery canvas. Download from S3, delete the source, extract subtitle, upload subtitle (Lambda-triggered), transcode to MP4, segment into DASH with adaptive bitrate (360/480/720 at 800/1200/2400 Kbps), edit manifest.mpd to add subtitle info, upload segments in parallel, publish back to API, then cleanup local files.

The single-most-important detail was the segment upload. It's a Celery Group sub-task. One worker uploading 1000 segments holds an S3 connection open for too long and leaves idle cores. By batching into groups of 10 across available workers, all the cores do something. ffmpeg is genuinely limited here. It can't write subtitle info into manifest.mpd, so Task 07 exists to programmatically edit the manifest and append the AdaptationSet block. That's not a bug in my code, it's a known ffmpeg limitation.

The architecture is three microservices (Auth, API, Worker) communicating only via RabbitMQ events. The Worker doesn't accept direct HTTP from API. Each service has its own repo and its own deployment. Auth was rebuilt from scratch in JWT (no third-party packages) because I wanted to understand the full token lifecycle. The Worker service's Nginx exists purely for health checks and admin. That's intentional. The whole point of microservices is that the Worker is reachable only through events.

Things I'd improve if I kept going. Rate-limit the upload API with the same Token Bucket I used in Algocode. Add real WhatsApp and email notifications on completion. Move the Worker to a real container with burst capacity so a single large upload doesn't block the queue.

ProStream (live streaming) is the sibling project and CuteTube (monolith) is the previous generation. Together the three cover three shapes a video product can take.`,
    game_building: "Movio Studios",
    game_district: "media_row",
  },
  {
    slug: "datalineage-doctor",
    name: "DataLineage Doctor",
    tagline: "LLM-powered RCA engine for data quality incidents, with OpenMetadata.",
    status: "complete",
    tier: "featured",
    year: 2025,
    url: null,
    github: "https://github.com/Mahboob-A/datalineage-doctor",
    demo: null,
    youtube: "https://youtu.be/p9yGq0KsWhw",
    stars: 25,
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
      "Data quality incidents in large pipelines have no automated root cause analysis. Engineers manually trace lineage graphs for hours.",
    built:
      "LLM-powered engine that ingests OpenMetadata lineage graphs, computes blast radius, identifies ownership, and generates structured RCA reports with remediation recommendations.",
    notes:
      `DataLineage Doctor started from a real Monday morning. Your revenue dashboard shows $0 at 9 AM. The CEO is already asking why. The data steward is somewhere in a Slack thread trying to figure out which upstream pipeline broke. The fix is automated RCA. A webhook from OpenMetadata kicks off a structured agent that pulls lineage, DQ history, pipeline status, ownership, and prior incident memory, then writes a structured report with timeline, blast radius, confidence, and remediation.

The architecture is FastAPI, Celery, Redis, Postgres with SQLAlchemy 2.0 async, Alembic, and an httpx-based OpenMetadata client. The interesting piece is the agent. It runs an iterative tool-calling loop. It calls tools (lineage API, DQ API, pipeline status API, blast radius calculator, incident history), parses strict JSON responses, and decides whether to call another tool or stop. Every tool call is logged. Every failure is normalized into a structured error payload.

We parse the final response into a strict RCAReport Pydantic model and recompute the confidence label from the confidence score. LLMs tend to over-confess, so a re-map is healthier than trusting the raw output. The typed OM client has retry and compatibility guards. OpenMetadata's API has been pretty stable, but breaking changes happen between minor versions, and we'd rather fail loudly than silently skip a step.

The dashboard is Jinja2 plus React Flow via CDN (no SPA build), with auto-refreshing high-severity cases. Subdomain architecture in prod (dldoctor.app, prometheus.dldoctor.app, grafana.dldoctor.app, om.dldoctor.app) behind one Nginx. Six Prometheus metrics feed a pre-provisioned Grafana dashboard. Open loop is writing the RCA back into OpenMetadata via its native Incident API, version-aware and best-effort.

What's next. HMAC webhook signature verification. Real auth on the dashboard. Multi-tenant routing. The repo has 25 stars and 11 forks on GitHub, which I'm genuinely proud of for a niche tool. The whole thing runs with make demo against a local OpenMetadata stack, and that's how I test changes before pushing.`,
    game_building: "DataLineage Doctor HQ",
    game_district: "systems_district",
  },
  {
    slug: "cutetube",
    name: "CuteTube",
    tagline: "Video-on-demand service. A monolith-first YouTube clone.",
    status: "complete",
    tier: "showcase",
    year: 2023,
    url: null,
    github: "https://github.com/Mahboob-A/CuteTube",
    demo: null,
    youtube: null,
    stars: 8,
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
      "Learning video platform architecture from the ground up, before building Movio at scale.",
    built:
      "Monolith-first YouTube-like VOD service with video upload, FFmpeg transcoding, user channels, playlists, comments, and streaming delivery. The foundation that led to Movio's microservices architecture.",
    notes:
      `CuteTube was the project that taught me what a video pipeline actually looks like. It's a YouTube clone: signup, watch videos, upload your own. The engineering meat is the Celery pipeline that turns a raw upload into adaptive-bitrate DASH segments. The pipeline tracks the format, transcodes the container, creates a Celery group with chord and callbacks, segments with ABR (360/480/720/1080p at 800/1200/2400/4800 Kbps), batches uploads to S3, deletes local files, updates metadata via callback, and retries with exponential backoff. The whole thing in one repo, because I wanted to learn it end to end before splitting.

The hardest single thing was the Celery pipeline. I spent a lot of late nights aligning the canvas for various edge cases. Auth was hand-rolled (no third-party packages) because I wanted to understand the password hash and session lifecycle from scratch. The stream workflow is OS-aware. Windows clients get MP4 segments, macOS and Linux get MOV, and the DASH player picks based on capability. Gcore CDN sits in front of AWS S3 via custom domain cdn.algocode.site.

The original reason this project isn't deployed to prod is honest and a bit embarrassing. The Celery pipeline needs at least 3GB RAM to process video, and the free AWS EC2 I had only gave me 1GB. So it lives on GitHub, not on a server. CuteTube Version 04 added PlayReady DRM via Microsoft's test server, but free DRM license servers are unreliable so it's still flagged as under development.

CuteTube is the monolith version of what became Movio (microservices) and ProStream (live). The lesson I keep coming back to. Do the hard things while you're learning, so the implementation becomes easier. Building a complex VOD monolith made building Movio's microservices architecture tractable. I knew what each piece was supposed to do.

What's next, if I ever revisit this. Move the worker to a small container with burst capacity so the 3GB constraint stops blocking the project. Finally wire up real DRM with a paid license server.`,
    game_building: "CuteTube Studio",
    game_district: "media_row",
  },
  {
    slug: "drishti-ai",
    name: "DrishtiAI",
    tagline:
      "Eye disease detection via vision agents. WebRTC, sub-1s, rural India.",
    status: "complete",
    tier: "featured",
    year: 2025,
    url: null,
    github: "https://github.com/Mahboob-A/drishti-ai",
    demo: null,
    youtube: "https://youtu.be/8LUT89UYnSc",
    stars: 14,
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
      "4-service monorepo (Django, FastAPI, React Native, React Web) with a 5-layer computer vision pipeline. Ingest, preprocessing, inference, postprocessing, and multilingual voice output, all delivered over WebRTC.",
    notes:
      `DrishtiAI was a 7-day build, and the constraint shaped everything. India has 12 million blind people, the largest blind population globally, and 80% of that blindness is preventable or treatable. The bottleneck isn't medicine or surgical capacity. It's early detection. ASHA workers visit every rural household but had no standardized AI-assisted screening tool.

The 7-day clock came from a hackathon framing (we were building for a friend's grant deadline), so the design had to be ruthlessly scoped. An ASHA app that records an eye exam, a server-side model that screens in real time, and a PHC dashboard that lets an admin review flagged cases. The Vision Agent runs at 3 FPS through 5 layers. MediaPipe Face Mesh for the 478-landmark eye ROI. OpenCV for JECI jaundice scoring and scleral redness. Roboflow inference for cataract, leukocoria, and strabismus classification (max 2 calls per session, these are slow). Moondream VQA for descriptive conditions. Gemini 2.5 Flash for clinical synthesis.

The 5-layer design deliberately balances latency (layers 1-2 every frame) with accuracy (layer 3 throttled). WebRTC over Stream SDK carries the Android camera stream to a FastAPI service which runs the agent. The Django backend handles the relational side: family registry, session history, PHC admin API. The ASHA worker doesn't pick the conditions. They're auto-selected based on age, gender, pregnancy, and lactation. Multilingual voice (Hindi and Bengali) walks through the 7-step protocol. Every session ends with a referral recommendation, even when no findings are detected.

We use Prometheus and Grafana to monitor per-layer latency, and that's where we catch regressions. The 4-service monorepo (Django, FastAPI, React Native, React Web) shipped via 9 Docker Compose services with one-command deploy.

What's next, if I keep going. HMAC-signed session audit logs. Real auth on the dashboard. A PoC of multi-tenant per-state deployment (Bengal first, then UP). The Medium write-up of the build is live, and it's the most-read thing on my Medium.`,
    game_building: "DrishtiAI Vision Lab",
    game_district: "vision_lab",
  },
  {
    slug: "airpass",
    name: "AirPass",
    tagline:
      "P2P file transfer over WebRTC. No server storage, no size limit.",
    status: "complete",
    tier: "showcase",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/airpass",
    demo: null,
    youtube: null,
    stars: 12,
    domain: ["backend", "distributed"],
    stack: ["Django", "Django Channels", "WebRTC", "WebSocket", "JavaScript"],
    metrics: [
      "peer-to-peer no server storage",
      "multiple file types",
      "room-based sharing",
    ],
    problem:
      "File transfer services store your files on third-party servers. True P2P means the file never touches a server.",
    built:
      "WebRTC-based P2P file transfer, using Django Channels for signaling and WebRTC data channels for direct peer transfer. No file stored on any server. Room codes for easy sharing.",
    notes:
      `AirPass came from a privacy frustration. Every 'send a file' tool on the web uploads your file to someone else's server. The file sits there, decrypted, until they decide to delete it. True peer-to-peer means the file never touches a server. The relay only exchanges the connection metadata (SDP offers, SDP answers, ICE candidates), then the two browsers stream the bytes directly.

That's what AirPass is. The signaling layer is FastAPI, kept simple, just enough to coordinate the handshake. The actual transfer is a WebRTC data channel. Rooms are 6-digit codes plus a QR variant for mobile entry. They auto-expire after 30 minutes or on disconnect, and the room is in-memory only, with zero persistence.

The chunking was the tricky engineering piece. 64KB slices with reliable, ordered delivery handle multi-gigabyte transfers without crashing the browser. Backpressure is throttled so neither side OOMs. Optional AES-256-GCM end-to-end encryption is available, and the key never leaves the two peers. Optional bcrypt password protection on rooms for the paranoid case. The frontend is intentionally vanilla JS, not a framework. That's a transparency call, not a stylistic one. You can read every line that touches your file. The signaling server has zero knowledge of file contents. It sees only metadata (room id, peer count, transfer progress).

Deployment was tested with coturn for TURN server fallback (NAT traversal), nginx and docker, and a couple of deploy scripts. AirPass is dormant now, but the pattern is one I'd reach for again, for any case where 'upload to a third party' is the wrong default.

What's next, if I revive it. A mobile wrapper. A richer signaling protocol for multi-peer fan-out (think: send to 5 friends in one go).`,
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
    stars: 8,
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
      "IaC, fully reproducible",
      "separate client + backend repos",
    ],
    problem:
      "Production AWS infrastructure should be reproducible, version-controlled, and deployable without clicking through the console.",
    built:
      "Two-repo Pulumi project (backend infra and client infra) defining highly available multi-AZ AWS infrastructure. VPC, subnets, ALB, EC2 Auto Scaling, RDS, S3, Route53, and ACM, all as Python code.",
    notes:
      `This project's reason to exist is in the problem statement. Production AWS infra should be reproducible. Click-ops doesn't scale, doesn't review, and doesn't survive a real outage at 2 AM. The Pulumi script (Python) provisions everything you'd expect a production-grade AWS environment to need. A VPC (10.10.0.0/16) with public subnets in 2 AZs and private subnets in 3, an Internet Gateway, a NAT Gateway and Elastic IP, public and private route tables, four layered security groups, a key pair, an Auto Scaling Group plus ALB for the Django app, and four manually-created EC2 instances outside the ASG for non-scaling workloads.

The split into two repos, backend infra and client infra, was deliberate. Separate IAM boundaries, separate blast radius, separate release schedule. The flow is. SSH from local into the Bastion server (public subnet), SSH into private instances, traffic hits ALB, ALB routes to Django app instances in private subnets, and the DB connection to PostgreSQL is also in a private subnet. The ASG handles traffic spikes by scaling app instances across the private subnets.

What's missing and obvious in retrospect. There's no RDS (Postgres is on EC2), no ACM for HTTPS termination even though the security group allows 443, no centralized logging, no CI/CD on the infra itself, and no Secrets Manager. The next iteration would fix each of those in order. RDS first (data persistence deserves it), then HTTPS (no excuse in 2024), then CloudWatch and alarms, then a true pipeline so the infra is testable.

The pattern I want to reuse is defense-in-depth subnet isolation and the Bastion pattern for any private resource. Pulumi over Terraform or CloudFormation because I prefer real programming languages over DSLs. Python lets me write loops, helpers, and unit tests for the infra code itself.`,
    game_building: "Pulumi Cloud Towers",
    game_district: "cloud_ridge",
  },
  {
    slug: "imgtwist",
    name: "ImgTwist",
    tagline:
      "Image showcase platform. Django, async processing, social features.",
    status: "complete",
    tier: "showcase",
    year: 2023,
    url: null,
    github: "https://github.com/Mahboob-A/ImgTwist",
    demo: null,
    youtube: null,
    stars: 8,
    domain: ["backend"],
    stack: ["Django", "Celery", "Redis", "PostgreSQL", "Pillow", "AWS S3"],
    metrics: ["async image processing", "social features", "S3 storage"],
    problem:
      "Learning async task processing and image pipelines end-to-end with Django + Celery.",
    built:
      "Image showcase platform with upload, async resize and processing via Celery, S3 storage, and a social follow, like, and comment system.",
    notes:
      `ImgTwist is one of my earlier projects, built to learn the full Django, Celery, S3, and Docker stack on a real product rather than a toy. The product shape is a generalized image hosting platform: upload, async resize, and social features, exposed via a custom domain under algocode.site.

The architecture is what you'd expect. Django REST API under /api/v1, Celery for async image processing, Redis as the broker, Postgres for relational data, AWS S3 for blob storage, all running on a single EC2 instance behind Nginx Proxy Manager with SSL. The rate limiter (Token Bucket in Django Middleware) is implemented, but honestly not yet enforced per-app. That's the standing improvement.

The same algocode.site domain hosts both ImgTwist and Algocode as subdomains, a pattern I'd reuse for any portfolio-of-projects site. Subdomains are managed in Nginx Proxy Manager, exposed via Portainer for Docker orchestration, documented via auto-generated Swagger and Redoc. The most interesting thing about the deployment was getting Portainer, Nginx Proxy Manager, a Django app, a Celery worker, Redis, and Postgres into one docker-compose up workflow. That's the muscle memory I've relied on since.

Improvements I'd prioritize. Enforce the rate limiter per-app per-IP. Add a CDN in front of S3 for the public read path. Swap the single EC2 for the Pulumi infra I built later. This project's infra was the prototype that Pulumi replaced.`,
    game_building: "ImgTwist Gallery",
    game_district: "protocol_street",
  },
  {
    slug: "load-balancer",
    name: "Load Balancer Lab",
    tagline:
      "Nginx and Docker load balancing. Round robin, sticky sessions, health checks.",
    status: "complete",
    tier: "showcase",
    year: 2024,
    url: null,
    github: "https://github.com/Mahboob-A/Load-Balancer-Nginx-Docker",
    demo: null,
    youtube: null,
    stars: 7,
    domain: ["infra", "platform", "backend"],
    stack: ["Nginx", "Docker", "Docker Compose", "Shell scripting"],
    metrics: [
      "round-robin LB",
      "sticky sessions",
      "health check failover",
      "upstream scaling experiments",
    ],
    problem:
      "Understanding load balancing internals by implementing and breaking it, not just configuring it.",
    built:
      "Practical LB implementation and experiments: round-robin, IP hash, least connections, upstream health checks, zero-downtime deploys with Nginx + Docker Compose.",
    notes:
      `This was a 'learn by breaking things' project. I wanted to actually understand load balancing, not just configure Nginx once and move on, but watch the behavior, push traffic at it, and see what happens.

The setup is a Docker Compose stack with Nginx as the reverse proxy and load balancer, multiple upstream containers behind it, and a /app/test route that returns a server-specific response, so I can visually confirm which upstream handled a given request. The two strategies I demonstrated first were plain Round Robin (default Nginx upstream balancing, even distribution across upstreams) and Weighted Round Robin (per-server weight directives, three servers at 3:2:1 distribution).

The make docker-up command creates the Docker network first, then brings up the whole stack. The network-first ordering matters because Nginx needs to resolve upstream hostnames at boot, not at first request. The manual mode, running each make command one by one, is the version I'd recommend for actually learning. You see each container come up in order and can verify the routing at each step. Animated GIFs in the README show the round-robin and weighted behavior.

The original plan was to extend this into AWS-based load balancing (the project title says 'Docker as well as AWS and Other Experiments'), but I never got back to it. If I revive it, I'd add sticky-session experiments with cookie-based affinity, health-check failover, and a comparison page between Nginx, HAProxy, and Traefik on the same workload. The pattern of 'compose Nginx with upstreams and verify with a /test endpoint' is one I now reach for any time I want to understand how a load balancer actually behaves.`,
    game_building: "LB Junction",
    game_district: "protocol_street",
  },
  {
    slug: "prostream",
    name: "ProStream",
    tagline:
      "Low-latency live streaming. Twitch-inspired, Agora-backed, tip-economy enabled.",
    status: "complete",
    tier: "showcase",
    year: 2023,
    url: null,
    github: "https://github.com/Mahboob-A/prostream/",
    demo: null,
    youtube: "https://youtu.be/TCOQNh2Kd-E",
    youtube_extra: ["https://youtu.be/z5IY4pMIIQM"],
    stars: 10,
    domain: ["backend", "video", "distributed"],
    stack: [
      "Django",
      "DRF",
      "React",
      "PostgreSQL",
      "WebSocket",
      "Route53",
      "AWS",
      "Agora",
      "SSLCommerz",
    ],
    metrics: [
      "Agora-backed low-latency streaming",
      "tip economy with 22% platform fee",
      "OTP auth + document verification",
      "team of 3, 2 countries",
    ],
    problem:
      "Live streaming platforms typically rely on managed vendor APIs and centralized storage, driving up cost, vendor lock-in, and viewer latency. Replicating core Twitch-like functionality (low-latency streaming, identity verification, tipping, creator monetization) on stock cloud infra is doable but full of moving parts.",
    built:
      "Twitch-inspired live streaming platform built by a 3-person distributed team (India + Bangladesh). Django + DRF backend with custom auth (OTP recovery), streamer verification flow, in-app wallet + tipping via SSLCommerz, withdraw flow with 22% platform fee. Agora SD-RTN for low-latency one-to-many broadcasts, Django Channels + Redis Pub/Sub for high-concurrency chat and viewer-count syncing, Dynamic Token Server for HMAC-signed access tokens to prevent stream-sniping. Frontend on Vercel (React); backend on AWS EC2 behind Route53.",
    notes:
      `ProStream started as a university-team experiment. Two engineers in Bangladesh and me in India wanted to know if we could ship a real streaming product without paying for a vendor. We split work over Slack, did daily standups at hours that made nobody happy, and tracked tasks in Jira. The Stripe-of-streaming setup (Django and DRF on EC2, React on Vercel, Postgres, Route53) was familiar territory by this point. I'd been through it with Movio.

The new pieces were Agora (low-latency one-to-many via their SD-RTN) and the wallet and tipping flow. Both turned out to be deeper than they look. Agora gave us the streaming pipeline, but we still had to gate who could tune in. The Dynamic Token Server in Django mints HMAC-signed time-bound tokens so only viewers in the channel can join. That piece was the difference between an open stream and a stream-snipe-able one.

The tipping flow (wallet to tip to withdrawal to 22% platform fee to SSLCommerz payout) was the trickier build. We had to teach ourselves Pakistani-payments rails, build a ledger to keep balances honest under concurrent tips, and write the moderator console that lets us approve document verifications, ban abusive streamers, and refund disputed tips.

Testing happened against free-tier sandboxes (Agora and SSLCommerz both have generous developer tiers), but we still blew through quota twice and learned to gate the dev environment behind a flag. Deployment to a single AWS EC2 instance worked, with Postgres on the same box, but we knew we wanted multi-AZ before any real launch.

ProStream sits as a sibling project to CuteTube (the monolith version) and Movio (the microservices VOD version). Together the three cover three different shapes a video product can take. The codebase is dormant now, but the architecture is one I'd reuse in a heartbeat. Django as the orchestrator, React as the headless frontend, and a third-party video vendor only for the actual media path.`,
    game_building: "ProStream Studio",
    game_district: "media_row",
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
