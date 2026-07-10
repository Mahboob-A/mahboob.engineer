# mahboob.engineer — Master Build Plan
**Version:** 2.0 | **Author:** Mahboob Alam | **Status:** Active

> This document is the single source of truth for all AI-assisted development.
> Every section is written so an agent can build the piece described without
> asking a follow-up question. Do not deviate from these specs without a
> separate change note.

---

## 0. MASTER DATA — Read Before Touching Any File

### 0.1 Identity

```
Name:         Mahboob Alam
Title:        Co-Founder & Backend Engineer
Location:     Bangalore / Chennai, India
Email:        connect.mahboobalam@gmail.com
Phone:        +91-7908184346
Domain:       mahboob.engineer
Blog:         The Backend Diaries
```

### 0.2 Social Links (all verified, use exactly)

```
GitHub:       https://github.com/Mahboob-A
LinkedIn:     https://linkedin.com/in/i-mahboob-alam
Medium:       https://imehboob.medium.com
Taply:        https://gettaply.me
Portfolio:    https://mahboob.engineer
Email:        mailto:connect.mahboobalam@gmail.com
```

### 0.3 Design Tokens (single source — every component must import from here)

```typescript
// tokens.ts
export const colors = {
  bg:        '#172318',
  surface:   '#1C2E1E',
  card:      '#223626',
  elev:      '#2A4030',
  active:    '#1E3828',
  border:    '#334E3C',
  borderS:   '#406050',
  t1:        '#D8EEE2',
  t2:        '#9AC0A0',
  t3:        '#608870',
  acc:       '#5CC9A0',
  accDim:    '#1E3828',
  aiBg:      '#263E2E',
  aiBd:      '#3A5844',
  amber:     '#f59e0b',
  amberDim:  '#2a1f06',
  codeBg:    '#0D1511',
} as const

export const kwLight = [
  { bg: '#CAE8D8', text: '#1C5E40' }, // sage
  { bg: '#C8DDEF', text: '#1C4872' }, // slate
  { bg: '#F0E2CC', text: '#724410' }, // amber
  { bg: '#E6D4EE', text: '#5E2474' }, // mauve
]

export const kwDark = [
  { bg: '#122018', text: '#60B080' }, // sage
  { bg: '#0E1C2C', text: '#5888B8' }, // slate
  { bg: '#1E1608', text: '#B08030' }, // amber
  { bg: '#1E1030', text: '#9870C0' }, // mauve
]

// Tag color assignment rules:
// sage  → backend tools (Django, DRF, FastAPI, Python, Celery)
// slate → infra/runtime (Docker, AWS, K8s, Nginx, Redis, PostgreSQL)
// amber → async/messaging (RabbitMQ, Stripe, Kafka, queues, payments)
// mauve → protocols/AI/special (JWT, OAuth2, NFC, WebRTC, Gemini, LLMs)

export const fonts = {
  display: "'Space Grotesk', sans-serif",
  body:    "'Inter', sans-serif",
  mono:    "'JetBrains Mono', monospace",
}
```

### 0.4 Full Project Registry (canonical source)

Each project entry is used across work page, game mode, and stack mapping.

```typescript
export const PROJECTS = [
  {
    slug:       'taply',
    name:       'Taply',
    tagline:    'Digital business card platform — NFC, QR, analytics, teams',
    status:     'live',      // live | building | complete
    tier:       'founder',   // founder | featured | showcase
    year:       2026,
    url:        'https://gettaply.me',
    github:     null,        // private
    demo:       'https://gettaply.me/p/mehboob',
    youtube:    null,
    domain:     ['saas', 'platform', 'backend'],
    stack:      ['Django 5.1', 'DRF', 'Next.js 15', 'React 19', 'Redis',
                 'PostgreSQL', 'Stripe', 'JWT', 'OAuth2', 'TOTP 2FA',
                 'Django-Q2', 'NFC', 'QR', 'vCard'],
    metrics:    ['<100ms profile load', '4 subscription tiers',
                 '11 profile section types', '1 enterprise customer live'],
    problem:    '88% of paper business cards are thrown away in a week — no tracking, no updates, dead channel.',
    built:      'Full-stack SaaS — NFC+QR sharing, real-time analytics, team RBAC console, Stripe billing. Architected and built the entire backend from scratch as co-founder.',
    game_building: 'Taply HQ',
    game_district: 'saas_quarter',
  },
  {
    slug:       'unthink',
    name:       'UnThink',
    tagline:    'Fragment-first personal knowledge base for engineers',
    status:     'building',
    tier:       'founder',
    year:       2026,
    url:        null,
    github:     null,
    demo:       null,
    youtube:    null,
    domain:     ['ai', 'backend', 'platform'],
    stack:      ['Django 5', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL',
                 'Gemini 2.0 Flash', 'SSE', 'React 18', 'Manifest V3'],
    metrics:    ['<300ms Django save API', 'model-agnostic AI layer',
                 '<$100/mo per 1k users', '3 Celery task queues'],
    problem:    'Every save tool requires a context switch — the friction is high enough that engineers simply don\'t bother capturing what they learn.',
    built:      'Dual-backend (Django + FastAPI) with Celery coordinating 3 queues. AI classifies and organizes every fragment automatically. Browser extension as primary capture interface.',
    game_building: 'UnThink Labs',
    game_district: 'saas_quarter',
  },
  {
    slug:       'algocode',
    name:       'Algocode',
    tagline:    'Distributed online judge for C++ — microservices, kernel isolation',
    status:     'complete',
    tier:       'featured',
    year:       2024,
    url:        null,
    github:     'https://github.com/Mahboob-A/Algocode',
    demo:       null,
    youtube:    null,
    stars:      22,
    domain:     ['distributed', 'backend', 'infra'],
    stack:      ['Django', 'DRF', 'RabbitMQ', 'Docker (sibling)',
                 'PostgreSQL', 'MongoDB', 'Redis', 'AWS EC2', 'Azure VM',
                 'Linux namespaces', 'cgroups', 'seccomp'],
    metrics:    ['3 independent services', 'AC/WA/TLE/MLE/SegFault verdicts',
                 'kernel-level isolation', 'token-bucket rate limiting', '22★ GitHub'],
    problem:    'Running untrusted user code at scale without a shared blast radius between submissions.',
    built:      '3 independently deployable services (Auth, Code Manager, RCE Engine) coordinated through RabbitMQ. Each submission spawns an ephemeral sibling Docker container with Linux namespaces, cgroups, and seccomp enforcing strict CPU/memory/time limits.',
    game_building: 'Algocode Server Farm',
    game_district: 'systems_district',
  },
  {
    slug:       'movio',
    name:       'Movio',
    tagline:    'YouTube-scale VOD platform — HLS, DASH, DRM, CDN microservices',
    status:     'complete',
    tier:       'featured',
    year:       2024,
    url:        null,
    github:     'https://github.com/Mahboob-A/Movio',
    demo:       null,
    youtube:    null,
    domain:     ['video', 'distributed', 'backend'],
    stack:      ['Django', 'Celery', 'FFmpeg', 'HLS', 'MPEG-DASH',
                 'DRM', 'AWS S3', 'CloudFront CDN', 'RabbitMQ', 'Redis'],
    metrics:    ['multi-bitrate HLS + DASH output', 'DRM content protection',
                 'CDN-backed delivery', 'microservices architecture'],
    problem:    'Deliver adaptive-bitrate video with content protection at scale, without relying on a managed video API.',
    built:      'Transcoding pipeline producing HLS and MPEG-DASH renditions via FFmpeg workers, DRM packaging, and CloudFront CDN delivery for adaptive playback across all devices.',
    game_building: 'Movio Studios',
    game_district: 'media_row',
  },
  {
    slug:       'datalineage-doctor',
    name:       'DataLineage Doctor',
    tagline:    'LLM-powered RCA engine for data quality incidents — OpenMetadata',
    status:     'complete',
    tier:       'featured',
    year:       2025,
    url:        null,
    github:     'https://github.com/Mahboob-A/datalineage-doctor',
    demo:       null,
    youtube:    'https://youtu.be/p9yGq0KsWhw',
    domain:     ['ai', 'platform', 'backend'],
    stack:      ['Python', 'LLM (OpenAI/Gemini)', 'OpenMetadata API',
                 'FastAPI', 'PostgreSQL', 'Docker'],
    metrics:    ['lineage blast radius analysis', 'automated RCA', 'ownership mapping'],
    problem:    'Data quality incidents in large pipelines have no automated root cause analysis — engineers manually trace lineage graphs for hours.',
    built:      'LLM-powered engine that ingests OpenMetadata lineage graphs, computes blast radius, identifies ownership, and generates structured RCA reports with remediation recommendations.',
    game_building: 'DataLineage Doctor HQ',
    game_district: 'systems_district',
  },
  {
    slug:       'cutetube',
    name:       'CuteTube',
    tagline:    'Video-on-demand service — monolith-first YouTube clone',
    status:     'complete',
    tier:       'showcase',
    year:       2023,
    url:        null,
    github:     'https://github.com/Mahboob-A/CuteTube',
    demo:       null,
    youtube:    null,
    domain:     ['video', 'backend'],
    stack:      ['Django', 'DRF', 'PostgreSQL', 'Redis', 'Celery', 'FFmpeg', 'AWS S3'],
    metrics:    ['video upload + processing', 'streaming delivery', 'user auth + channels'],
    problem:    'Learning video platform architecture from the ground up — before building Movio at scale.',
    built:      'Monolith-first YouTube-like VOD service with video upload, FFmpeg transcoding, user channels, playlists, comments, and streaming delivery. The foundation that led to Movio\'s microservices architecture.',
    game_building: 'CuteTube Studio',
    game_district: 'media_row',
  },
  {
    slug:       'drishti-ai',
    name:       'DrishtiAI',
    tagline:    'Eye disease detection via vision agents — WebRTC, sub-1s, rural India',
    status:     'complete',
    tier:       'featured',
    year:       2025,
    url:        null,
    github:     'https://github.com/Mahboob-A/drishti-ai',
    demo:       null,
    youtube:    'https://youtu.be/8LUT89UYnSc',
    domain:     ['ai', 'backend', 'distributed'],
    stack:      ['Django', 'FastAPI', 'React Native', 'React Web',
                 'OpenCV', 'WebRTC', 'RabbitMQ', 'Docker'],
    metrics:    ['sub-1s response over WebRTC', '5-layer CV pipeline',
                 'multilingual voice guidance', '4-service monorepo'],
    problem:    'ASHA health workers in rural India need to perform eye screenings without specialist access, on basic smartphones.',
    built:      '4-service monorepo (Django, FastAPI, React Native, React Web) with a 5-layer computer vision pipeline — ingest, preprocessing, inference, postprocessing, multilingual voice output — delivered over WebRTC.',
    game_building: 'DrishtiAI Vision Lab',
    game_district: 'vision_lab',
  },
  {
    slug:       'airpass',
    name:       'AirPass',
    tagline:    'P2P file transfer over WebRTC — no server storage, no size limit',
    status:     'complete',
    tier:       'showcase',
    year:       2024,
    url:        null,
    github:     'https://github.com/Mahboob-A/airpass',
    demo:       null,
    youtube:    null,
    domain:     ['backend', 'distributed'],
    stack:      ['Django', 'Django Channels', 'WebRTC', 'WebSocket', 'JavaScript'],
    metrics:    ['peer-to-peer — no server storage', 'multiple file types', 'room-based sharing'],
    problem:    'File transfer services store your files on third-party servers. True P2P means the file never touches a server.',
    built:      'WebRTC-based P2P file transfer — Django Channels for signaling, WebRTC data channels for direct peer transfer. No file stored on any server. Room codes for easy sharing.',
    game_building: 'AirPass Exchange',
    game_district: 'protocol_street',
  },
  {
    slug:       'pulumi-infra',
    name:       'Pulumi AWS Infra',
    tagline:    'Production-grade scalable AWS infrastructure as code with Pulumi',
    status:     'complete',
    tier:       'showcase',
    year:       2024,
    url:        null,
    github:     'https://github.com/Mahboob-A/scalable-aws-infra-backend-pulumi',
    github_client: 'https://github.com/Mahboob-A/scalable-aws-infra-client-pulumi',
    demo:       null,
    youtube:    null,
    domain:     ['infra', 'platform'],
    stack:      ['Pulumi', 'Python', 'AWS VPC', 'EC2', 'RDS', 'S3',
                 'ALB', 'Auto Scaling Groups', 'Route53', 'ACM'],
    metrics:    ['multi-AZ high availability', 'auto-scaling capacity',
                 'IaC — fully reproducible', 'separate client + backend repos'],
    problem:    'Production AWS infrastructure should be reproducible, version-controlled, and deployable without clicking through the console.',
    built:      'Two-repo Pulumi project (backend infra + client infra) defining highly available multi-AZ AWS infrastructure: VPC, subnets, ALB, EC2 Auto Scaling, RDS, S3, Route53, ACM — all as Python code.',
    game_building: 'Pulumi Cloud Towers',
    game_district: 'cloud_ridge',
  },
  {
    slug:       'imgtwist',
    name:       'ImgTwist',
    tagline:    'Image showcase platform — Django, async processing, social features',
    status:     'complete',
    tier:       'showcase',
    year:       2023,
    url:        null,
    github:     'https://github.com/Mahboob-A/ImgTwist',
    demo:       null,
    youtube:    null,
    domain:     ['backend'],
    stack:      ['Django', 'Celery', 'Redis', 'PostgreSQL', 'Pillow', 'AWS S3'],
    metrics:    ['async image processing', 'social features', 'S3 storage'],
    problem:    'Learning async task processing and image pipelines end-to-end with Django + Celery.',
    built:      'Image showcase platform — upload, async resize/processing via Celery, S3 storage, social follow/like/comment system.',
    game_building: 'ImgTwist Gallery',
    game_district: 'protocol_street',
  },
  {
    slug:       'load-balancer',
    name:       'Load Balancer Lab',
    tagline:    'Nginx + Docker load balancing — round robin, sticky sessions, health checks',
    status:     'complete',
    tier:       'showcase',
    year:       2024,
    url:        null,
    github:     'https://github.com/Mahboob-A/Load-Balancer-Nginx-Docker',
    demo:       null,
    youtube:    null,
    domain:     ['infra', 'platform'],
    stack:      ['Nginx', 'Docker', 'Docker Compose', 'Shell scripting'],
    metrics:    ['round-robin LB', 'sticky sessions', 'health check failover',
                 'upstream scaling experiments'],
    problem:    'Understanding load balancing internals by implementing and breaking it — not just configuring it.',
    built:      'Practical LB implementation and experiments: round-robin, IP hash, least connections, upstream health checks, zero-downtime deploys with Nginx + Docker Compose.',
    game_building: 'LB Junction',
    game_district: 'protocol_street',
  },
]
```

### 0.5 Experience Registry

```typescript
export const EXPERIENCE = [
  {
    id:       'taply',
    company:  'Taply',
    url:      'https://gettaply.me',
    role:     'Co-Founder & Backend Engineer',
    period:   'May 2026 – Present',
    status:   'active',
    bullets: [
      'Co-founded Taply and architected the backend profile system — 11 section types, 4 layout variants, live theme customization, drag-and-drop ordering, version history with rollback — on Django 5.1 and DRF.',
      'Shipped the NFC and QR sharing layer: tap or scan opens a user\'s live profile in under 100ms via Redis-cached profile loads, with one-tap vCard save.',
      'Built the real-time analytics engine tracking profile views, NFC taps, QR scans, and vCard saves — plus a leads inbox that captures visitor contact requests.',
      'Delivered the team management console — role-based branding controls, bulk CSV onboarding, per-rep analytics — the feature set that closed Taply\'s first paying enterprise customer.',
      'Integrated Stripe (Checkout + Portal + Webhooks) for billing across Free, Pro, Business, and Enterprise tiers.',
    ],
    tags: ['Django 5.1', 'DRF', 'Next.js 15', 'Redis', 'PostgreSQL', 'Stripe', 'JWT/OAuth2/2FA', 'NFC/QR'],
  },
  {
    id:       'nexbell',
    company:  'NexBell Inc.',
    url:      null,
    role:     'Software Engineer',
    period:   'Nov 2024 – Jun 2026',
    status:   'completed',
    bullets: [
      'Led sprint planning and PR review for a 9-person engineering team; introduced mandatory CI gates that tightened delivery consistency across releases.',
      'Rebuilt the login system on OAuth2, JWT, and RBAC — closing authentication vulnerabilities in the legacy session-based flow.',
      'Redesigned composite indexes and rewrote ORM queries across a multi-vendor MySQL system, cutting query execution time by 17% across 50+ store deployments.',
      'Migrated idle AWS resources to reserved-instance and auto-scaling capacity; rebuilt CI/CD with CodePipeline + Docker — cut cloud spend by 35% and reduced deployment lead time from hours to minutes.',
    ],
    tags: ['Django', 'MySQL', 'AWS/CodePipeline', 'OAuth2/JWT', 'CI/CD', 'Team Leadership'],
  },
  {
    id:       'innovative-it',
    company:  'Innovative IT',
    url:      null,
    role:     'Software Developer',
    period:   'Sept 2023 – Oct 2024',
    status:   'completed',
    bullets: [
      'Built and owned production REST APIs with DRF — relational schema design, serialization logic, secure low-latency delivery across web and mobile clients.',
      'Diagnosed and resolved backend performance bottlenecks through query and index optimization, reducing API response times across client applications.',
    ],
    tags: ['Django', 'DRF', 'PostgreSQL', 'REST APIs'],
  },
]

export const EDUCATION = [
  {
    institution: 'SRM Institute of Science and Technology',
    degree:      'Master of Computer Application (MCA)',
    period:      'Jan 2025 – Dec 2026',
    location:    'India',
  },
  {
    institution: 'Poridhi',
    degree:      'Backend Engineering & Cloud Computing Specialization',
    period:      'Mar 2024 – Aug 2025',
    location:    'Remote',
    covered:     ['Docker internals', 'Kubernetes', 'Linux networking', 'eBPF', 'Kafka internals', 'Observability stack (Prometheus, Grafana, Jaeger, OpenTelemetry)'],
  },
]
```

### 0.6 Blog Posts Registry

```typescript
export const BLOG_POSTS = [
  {
    slug:    'building-leetcode-online-judge',
    title:   'My Experience Building a LeetCode-like Online Judge (and How You Can)',
    source:  'medium',
    url:     'https://imehboob.medium.com/my-experience-building-a-leetcode-like-online-judge-and-how-you-can-build-one-7e05e031455d',
    tags:    ['microservices', 'docker', 'rabbitmq', 'distributed-systems'],
    readMin: 8,
    projects: ['algocode'],
    stack:    ['Django', 'RabbitMQ', 'Docker'],
  },
  {
    slug:    'message-queue-101',
    title:   'Message Queue 101: Your Ultimate Guide to Understanding Message Queues',
    source:  'medium',
    url:     'https://imehboob.medium.com/message-queue-101-your-ultimate-guide-to-understand-message-queue-b2256961ab01',
    tags:    ['rabbitmq', 'distributed-systems', 'async'],
    readMin: 6,
    projects: ['algocode'],
    stack:    ['RabbitMQ'],
  },
  {
    slug:    'linux-networking-part-1',
    title:   'Linux Networking for Backend Engineers — Part 1: Namespaces & Virtual Interfaces',
    source:  'medium',
    url:     'https://imehboob.medium.com',
    tags:    ['linux', 'networking', 'docker', 'internals'],
    readMin: 10,
    series:  'Linux Networking',
    part:    1,
    stack:   ['Linux', 'Docker'],
  },
  // Add more posts as published
]
```

### 0.7 Stack Registry (for /stack page mapping)

```typescript
export const STACK = [
  // Backend
  { id: 'django',    name: 'Django',    domain: 'backend', projects: ['taply','algocode','movio','cutetube','drishti-ai','airpass','imgtwist'], blogs: ['building-leetcode-online-judge'] },
  { id: 'drf',       name: 'DRF',       domain: 'backend', projects: ['taply','algocode','movio','cutetube','airpass'] },
  { id: 'fastapi',   name: 'FastAPI',   domain: 'backend', projects: ['unthink','drishti-ai','datalineage-doctor'] },
  { id: 'celery',    name: 'Celery',    domain: 'backend', projects: ['taply','movio','cutetube','imgtwist','unthink'] },
  { id: 'websocket', name: 'WebSocket', domain: 'backend', projects: ['airpass','drishti-ai'] },
  { id: 'sse',       name: 'SSE',       domain: 'backend', projects: ['unthink'] },
  { id: 'webrtc',    name: 'WebRTC',    domain: 'backend', projects: ['airpass','drishti-ai'] },
  // Infra
  { id: 'docker',    name: 'Docker',    domain: 'infra',   projects: ['algocode','movio','unthink','load-balancer','pulumi-infra'] },
  { id: 'aws',       name: 'AWS',       domain: 'infra',   projects: ['taply','algocode','movio','pulumi-infra'] },
  { id: 'nginx',     name: 'Nginx',     domain: 'infra',   projects: ['load-balancer','pulumi-infra'] },
  { id: 'pulumi',    name: 'Pulumi',    domain: 'infra',   projects: ['pulumi-infra'] },
  { id: 'cicd',      name: 'CI/CD',     domain: 'infra',   projects: ['taply'] },
  // Messaging
  { id: 'rabbitmq',  name: 'RabbitMQ',  domain: 'async',   projects: ['algocode','movio','drishti-ai'], blogs: ['message-queue-101'] },
  // Data
  { id: 'postgresql',name: 'PostgreSQL',domain: 'data',    projects: ['taply','algocode','unthink','drishti-ai','imgtwist'] },
  { id: 'mongodb',   name: 'MongoDB',   domain: 'data',    projects: ['algocode','movio'] },
  { id: 'redis',     name: 'Redis',     domain: 'data',    projects: ['taply','algocode','movio','cutetube','unthink','imgtwist'] },
  // AI / Special
  { id: 'gemini',    name: 'Gemini',    domain: 'ai',      projects: ['unthink'] },
  { id: 'opencv',    name: 'OpenCV',    domain: 'ai',      projects: ['drishti-ai'] },
  { id: 'ffmpeg',    name: 'FFmpeg',    domain: 'video',   projects: ['movio','cutetube'] },
  // Auth
  { id: 'jwt',       name: 'JWT/OAuth2',domain: 'auth',    projects: ['taply','algocode','nexbell'] },
  { id: 'stripe',    name: 'Stripe',    domain: 'payment', projects: ['taply'] },
  // Learning
  { id: 'k8s',       name: 'Kubernetes',domain: 'learning',depth: 70 },
  { id: 'terraform', name: 'Terraform', domain: 'learning',depth: 50 },
  { id: 'go',        name: 'Go',        domain: 'learning',depth: 30 },
  { id: 'ebpf',      name: 'eBPF',      domain: 'learning',depth: 40 },
]
```

---

## 1. SITE ARCHITECTURE

### 1.1 Route Map

```
mahboob.engineer/
│
├── /                   # Landing page (homepage) — DONE (see mockup)
│
├── /log                # Full experience + education deep-dive
├── /work               # All projects — filterable grid
├── /work/[slug]        # Individual project case study
├── /stack              # Technology graph + per-tech mapping
├── /writing            # Blog list — categories + search
├── /writing/[slug]     # Individual blog post (MDX)
├── /contact            # Full contact page
│
└── /game               # GTA-style game mode (dynamic import, desktop only)
```

### 1.2 Navigation Behaviour

- **From landing page:** clicking log/work/stack/writing/contact navigates to a **new route** (`/log`, `/work` etc.) — not a scroll anchor. Each inner page is its own full-page layout.
- **Inner page layout:** shared `<InnerLayout>` with a back arrow to `/` in the top-left, and the same sticky navbar.
- **Active nav link** highlighted on inner pages based on current route.
- **Mode toggle** (flat | game) persists in navbar on all pages. Game link goes to `/game`.

### 1.3 Shared Components Required

```
<Navbar />             — fixed top, logo, links, mode toggle
<InnerPageHeader />    — page-level title, section num, description
<BackLink />           — "← home" in top-left on all inner pages
<Chip color="sage|slate|amber|mauve" />   — KW colored tag chip
<Badge variant="active|completed|live|building" />
<DiagramPanel title sub liveLabel />      — wrapper for SVG diagrams
<ProjectCard project={} variant="full|compact" />
<BlogCard post={} />
<StatRow stats={[{num, label}]} />
<TerminalBlock />      — contact form shell
```

---

## 2. INNER PAGE SPECS

### 2.1 `/log` — Experience & Education

**Purpose:** A hiring manager's deep-dive. Everything on the landing is a summary. This page has the full story.

**Layout:**

```
[BackLink]
[InnerPageHeader — "01 / DEPLOYMENT LOG" — "The full record"]

[Timeline — 3 experience entries, vertical left-border line]
  Each entry expands to show full bullets, not truncated

[Separator: "EDUCATION & TRAINING"]

[Education cards — 2 cards: SRM MCA + Poridhi specialization]
  Poridhi card lists what was covered in the program

[Separator: "KEY ACHIEVEMENTS ACROSS ALL ROLES"]
  3 metric cards: "35% AWS cost reduction" / "17% query time cut" / "Enterprise customer closed"
  Use amber metric styling, large monospace numbers

[Separator: "WHAT I'M DOING NOW"]
  Two-column: Taply (live) + UnThink (building)
  Brief 2-sentence status each, with live product link
```

**Data source:** `EXPERIENCE`, `EDUCATION` from Section 0.

**No new data needed — all info already in the registry.**

---

### 2.2 `/work` — All Projects

**Purpose:** Full project showcase with filtering. The landing shows 4. This shows all 11+.

**Layout:**

```
[BackLink]
[InnerPageHeader — "02 / SYSTEMS" — "Everything I've built end-to-end"]

[Filter bar — horizontal chip row]
  Filters: All | SaaS/Founder | Distributed Systems | Video | AI/ML | Infra/Platform | Backend
  Default: All

[Tier section: "FOUNDER PROJECTS" — 2 cards: Taply, UnThink]
  Full-width featured cards with architecture diagram thumbnails

[Tier section: "FEATURED BUILDS" — project grid 2-col]
  Algocode, Movio, DataLineage Doctor, DrishtiAI
  Same card format as landing but slightly more compact

[Tier section: "SHOWCASE" — project grid 3-col compact]
  CuteTube, AirPass, Pulumi Infra, ImgTwist, Load Balancer
  Compact cards: name, tagline, stack chips, GitHub link only
```

**Clicking any card → navigates to `/work/[slug]`**

**Filter logic:** clicking a domain filter shows only projects where `project.domain.includes(filter)`. Client-side, no API needed.

---

### 2.3 `/work/[slug]` — Project Case Study

**Purpose:** Deep-dive into a single project. This is a separate static page per project.

**Layout:**

```
[BackLink — "← all work"]
[Project status badge + year]
[Project name — display font, large]
[Tagline — mono, muted]

[Two-column hero: Left = problem/built text | Right = architecture diagram SVG]

[Metrics row — 4 metric chips]

[Horizontal rule]

[THE BUILD — prose section, 3-5 paragraphs]
  - What the problem really was
  - Key architectural decisions made
  - What was technically interesting
  - What I'd do differently

[Stack breakdown — categorized list]
  Backend: ...
  Infrastructure: ...
  Data layer: ...

[Links row — GitHub | Demo | YouTube | Write-up]

[Horizontal rule]

[RELATED WRITING — if any blog posts reference this project]
  BlogCard components filtered by project slug

[RELATED STACK — tech nodes used in this project]
  Small chip grid linking to /stack#[tech-id]
```

**Static generation:** `generateStaticParams()` maps all PROJECTS slugs. Page data comes from `PROJECTS` registry — no CMS needed for project pages.

**Architecture diagrams:** Each project's SVG is a standalone component in `/components/diagrams/[slug]-diagram.tsx`. Import into the case study page. Reuse from landing where applicable.

---

### 2.4 `/stack` — Technology Deep-Dive

**Purpose:** The most technically impressive inner page. Shows not just what tech you know, but where you've used it, how deep you go, and what you've written about it.

**Layout:**

```
[BackLink]
[InnerPageHeader — "03 / DEPENDENCY GRAPH" — "Where every tool connects to every system"]

[D3 Force Graph — full width, interactive]
  Node sizing: proportional to number of projects using it
  Node coloring: domain-based (backend=acc green, infra=amber, data=slate, ai=mauve, learning=dashed)
  Edges: project co-occurrence (thicker = more projects in common)
  Hover: highlights connected nodes and shows sidebar
  Click: locks selection, scrolls to detail panel below

[Domain filter pills — click to isolate domain in graph]

[Detail panel — appears when node clicked or hovered]
  Renders below the graph:
  ┌──────────────────────────────────────────────────────────┐
  │ [Tech name + domain badge]                               │
  │ [One-line description of what it is]                     │
  │                                                          │
  │ Used in N projects:                                      │
  │ [ProjectCard compact] [ProjectCard compact] ...          │
  │                                                          │
  │ Written about it:                                        │
  │ [BlogCard compact] [BlogCard compact] ...                │
  │                                                          │
  │ Proficiency: ████████░░ 80%  (only for non-learning)    │
  │ Currently: Active in production / Learning (~70%)        │
  └──────────────────────────────────────────────────────────┘

[Full tech index — below graph, ungrouped alphabetical list]
  Each tech → click expands inline to same detail panel
  Mobile fallback: graph hidden, only the index shown
```

**D3 implementation:**
- Use `d3-force` simulation
- Nodes from `STACK` registry
- Edges auto-computed: two nodes connect if they share a project in `STACK[n].projects`
- SVG rendered by D3, not React — mount in `useEffect`, clean up on unmount
- Selected node state in React `useState`, D3 updates class `active` on the SVG node
- Detail panel is React, reads from `STACK` + `PROJECTS` + `BLOG_POSTS` registries

---

### 2.5 `/writing` — Blog

**Purpose:** Full blog section. Native posts via Keystatic CMS + Medium cross-posts via RSS.

**Layout:**

```
[BackLink]
[InnerPageHeader — "04 / THE BACKEND DIARIES" — "How I think, not just what I shipped"]

[Search bar — plaintext search across titles and tags]
  Placeholder: "search posts..."

[Category filter row]
  All | Distributed Systems | Linux/Networking | Docker/Containers | Video | AI/ML | Platform | Career

[Source filter — two toggles]
  [✓ Native] [✓ Medium]

[Featured post — large card, most recent]

[Post grid — 3 column (2 on tablet, 1 on mobile)]
  Each post card shows:
  - Source badge (native | medium)
  - Category chip
  - Title
  - 2-line excerpt
  - Read time
  - Tags (3 max)
  - "Read →" link

[Series section — below main grid]
  "Linux Networking Series" — parts 1, 2, 3, 4 as a horizontal scroll
```

**CMS: Keystatic**

Schema for native posts:
```typescript
// keystatic.config.ts
fields: {
  title:    fields.text({ label: 'Title' }),
  excerpt:  fields.text({ label: 'Excerpt', multiline: true }),
  category: fields.select({ options: ['distributed', 'linux', 'docker', 'video', 'ai', 'platform', 'career'] }),
  tags:     fields.array(fields.text({ label: 'Tag' })),
  series:   fields.text({ label: 'Series name (optional)' }),
  part:     fields.number({ label: 'Series part number (optional)' }),
  projects: fields.array(fields.text({ label: 'Related project slug' })),
  stack:    fields.array(fields.text({ label: 'Related tech id' })),
  readMin:  fields.number({ label: 'Read time in minutes' }),
  content:  fields.mdx({ label: 'Content' })
}
```

**Medium RSS:** Fetch `https://imehboob.medium.com/feed` at build time (`getStaticProps` or RSC). Parse with `rss-parser`. Cross-posts display with "medium" badge and open in new tab.

**Individual post page `/writing/[slug]`:**

```
[BackLink — "← all posts"]
[Category + series label]
[Title — display font large]
[Date · Read time · Tags]

[Table of contents — sticky sidebar on desktop, collapsed on mobile]

[MDX content — Shiki syntax highlighting, custom components for callouts/diagrams]

[Divider]

[Related projects — if post.projects.length > 0]
[Related stack — if post.stack.length > 0]
[Next/prev post in series — if post.series exists]
```

---

### 2.6 `/contact` — Full Contact Page

**Purpose:** Everything in one place — form, all social links, availability status, FAQ.

**Layout:**

```
[BackLink]
[InnerPageHeader — "05 / OPEN AN ISSUE"]

[Two-column layout: Left = form | Right = sidebar]

LEFT — Contact Form (terminal aesthetic):
  [Terminal shell — same style as landing]
  [Title input]
  [Description textarea]
  [Email input]
  [Labels: hiring | taply-collab | consulting | open-source | just-saying-hi]
  [Submit → shows toast]

RIGHT — Sidebar:
  [Availability card]
    ● Available for backend roles (remote)
    ● Open to platform/infra positions
    ● Taply partnership enquiries welcome
    Current response time: within 24h

  [Direct links — vertical list]
    GitHub → github.com/Mahboob-A
    LinkedIn → linkedin.com/in/i-mahboob-alam
    Medium → imehboob.medium.com
    Taply → gettaply.me
    Email → connect.mahboobalam@gmail.com
    Resume → [PDF download link]

  [FAQ — 3 questions]
    Q: Are you open to relocating?
    A: Open to remote-first roles globally. In-office in Bangalore/Chennai possible.

    Q: What stage of companies do you prefer?
    A: Startups to mid-size. Series A–C is the sweet spot — large enough to have real systems problems, small enough to own architecture decisions.

    Q: Do you take freelance/consulting work?
    A: Case by case. Backend architecture, system design reviews, Django/FastAPI consulting.
```

---

## 3. TECH STACK DECISION

```
Framework:   Next.js 15 (App Router, TypeScript)
Styling:     Tailwind CSS v4
Fonts:       Space Grotesk + Inter + JetBrains Mono (Google Fonts)
Animations:  Framer Motion 12 (entrance animations, page transitions)
Data viz:    D3.js v7 (skill force graph on /stack)
CMS:         Keystatic (git-based, MDX, admin at /keystatic)
MD render:   next-mdx-remote + Shiki (syntax highlighting)
RSS parse:   rss-parser (Medium feed at build time)
Game:        Phaser 3.x (dynamic import, client-only)
Map editor:  Tiled Map Editor (JSON export, loaded by Phaser)
Deployment:  Vercel (zero-config, ISR for blog posts)
Analytics:   Vercel Analytics (privacy-first, free tier)

Package manager: pnpm
TypeScript:      strict mode
Linting:         ESLint + Prettier
```

**Why these choices:**
- Next.js 15 App Router: RSC for data-heavy pages (blog, stack), client components only where interaction needed
- Keystatic over Sanity/Notion: git-based = zero dependency, local admin, free forever, MDX support
- Phaser 3 over Unity/PixiJS: most mature 2D web engine, Tiled integration, large community
- D3 over Recharts/Nivo: force-directed graph not available in component libraries; D3 gives full control

---

## 4. PROJECT FILE STRUCTURE

```
mahboob.engineer/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata
│   ├── page.tsx                # Landing (homepage)
│   ├── log/
│   │   └── page.tsx
│   ├── work/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── stack/
│   │   └── page.tsx
│   ├── writing/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── game/
│       └── page.tsx            # Dynamic import only
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── InnerLayout.tsx     # Shared inner-page shell
│   │   └── BackLink.tsx
│   ├── ui/
│   │   ├── Chip.tsx            # KW color chip
│   │   ├── Badge.tsx
│   │   ├── StatRow.tsx
│   │   ├── DiagramPanel.tsx
│   │   ├── TerminalBlock.tsx
│   │   └── Toast.tsx
│   ├── sections/               # Landing page sections
│   │   ├── Hero.tsx
│   │   ├── DeployLog.tsx
│   │   ├── Projects.tsx
│   │   ├── SkillGraph.tsx
│   │   ├── Blog.tsx
│   │   └── Contact.tsx
│   ├── diagrams/               # Per-project SVG diagrams
│   │   ├── AlgocodeDiagram.tsx
│   │   ├── TaplyDiagram.tsx
│   │   ├── UnthinkDiagram.tsx
│   │   ├── MovioDiagram.tsx
│   │   └── ...
│   ├── work/
│   │   ├── ProjectCard.tsx     # full + compact variants
│   │   ├── ProjectFilter.tsx
│   │   └── ProjectCaseStudy.tsx
│   ├── stack/
│   │   ├── D3ForceGraph.tsx
│   │   └── TechDetailPanel.tsx
│   └── writing/
│       ├── BlogCard.tsx
│       ├── BlogFilter.tsx
│       └── SeriesNav.tsx
│
├── data/
│   ├── tokens.ts               # Design tokens (Section 0.3)
│   ├── projects.ts             # PROJECTS registry (Section 0.4)
│   ├── experience.ts           # EXPERIENCE + EDUCATION (Section 0.5)
│   ├── blog.ts                 # BLOG_POSTS registry (Section 0.6)
│   └── stack.ts                # STACK registry (Section 0.7)
│
├── content/                    # Keystatic managed
│   └── posts/                  # MDX blog posts
│       ├── linux-networking-part-1.mdx
│       └── ...
│
├── game/                       # Phaser game (isolated)
│   ├── index.tsx               # Game wrapper component
│   ├── config.ts               # Phaser game config
│   ├── scenes/
│   │   ├── PreloadScene.ts
│   │   ├── WorldScene.ts       # Main map scene
│   │   ├── UIScene.ts          # HUD overlay
│   │   └── overlays/           # React overlays per building
│   │       ├── TaplyOverlay.tsx
│   │       ├── AlgocodeOverlay.tsx
│   │       └── ...
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Building.ts
│   │   └── Villain.ts
│   └── maps/
│       └── backend-city.json   # Tiled export
│
├── lib/
│   ├── mdx.ts                  # MDX processing
│   ├── medium-rss.ts           # Medium RSS fetcher
│   └── utils.ts
│
├── public/
│   ├── assets/
│   │   ├── tilesets/           # Game tilesets
│   │   └── sprites/            # Character sprites
│   └── resume.pdf
│
└── keystatic.config.ts
```

---

## 5. GAME MODE — FULL SPECIFICATION

### 5.1 Concept

A top-down 2D pixel art city called **"Backend City"** where every building is a project or section of your portfolio. The visitor controls a pixel-art developer character and explores the city — walking into buildings reveals project details, encountering villains reveals your honest "learning areas."

This is content-first. Every building has real information inside. The game is the delivery mechanism, not a gimmick.

### 5.2 Map Layout — Backend City

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLOUD RIDGE (NW)              │  SYSTEMS DISTRICT (N)              │
│  ┌──────────┐  ┌──────────┐   │  ┌──────────┐  ┌──────────┐       │
│  │ Pulumi   │  │  AWS HQ  │   │  │ Algocode │  │Datalineage│      │
│  │  Towers  │  │          │   │  │  Server  │  │  Doctor   │      │
│  └──────────┘  └──────────┘   │  │  Farm    │  └──────────┘       │
│                                │  └──────────┘                      │
├────────────────────────────────┴───────────────────────────────────┤
│                                                                      │
│  SAAS QUARTER (W)          [BACKEND DIARIES HQ]     MEDIA ROW (E)  │
│  ┌──────────┐              ┌────────────────┐   ┌──────────┐       │
│  │  Taply   │              │  🗞 Newspaper  │   │  Movio   │       │
│  │   HQ     │    roads     │  & Blog HQ     │   │  Studios │       │
│  └──────────┘              └────────────────┘   └──────────┘       │
│  ┌──────────┐                                   ┌──────────┐       │
│  │ UnThink  │                                   │ CuteTube │       │
│  │  Labs    │                                   │ Broadcast│       │
│  └──────────┘                                   └──────────┘       │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│  PROTOCOL STREET (SW)                    VISION LAB (SE)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  ┌──────────────────┐     │
│  │ AirPass  │ │ImgTwist  │ │    LB    │  │  DrishtiAI       │     │
│  │ Exchange │ │ Gallery  │ │ Junction │  │  Vision Lab      │     │
│  └──────────┘ └──────────┘ └──────────┘  └──────────────────┘     │
│                                                                      │
│  LEARNING GROUNDS (center-south) — villain encounter zones          │
│  [The Gopher King]   [Terraform Titan]   [eBPF Phantom]            │
└─────────────────────────────────────────────────────────────────────┘
```

**Special buildings:**
- **Backend Diaries HQ** (center) — opens /writing inside game
- **Skills Academy** (NE) — shows the D3 skill graph as an in-game map room
- **Contact Bureau** (center-west) — shows the contact form in-game terminal style

### 5.3 Villain System

| Villain | Location | Learning area | HP (progress) | What shows on encounter |
|---|---|---|---|---|
| The Gopher King | Learning Grounds | Go language | 30/100 | "Go's concurrency model. Training in progress. See my study plan." |
| Terraform Titan | Learning Grounds | Terraform/IaC | 50/100 | "Infrastructure as Code mastery. 50% there. Already used Pulumi." |
| eBPF Phantom | Cloud Ridge edge | eBPF/kernel | 40/100 | "Kernel programming. Studied namespaces and cgroups. eBPF is next." |

Villain encounters are **honest, not embarrassing.** They show you're aware of your growth areas and actively working on them. This is what good senior engineers do.

**Encounter screen design:**
```
┌─────────────────────────────────────────────┐
│  ⚠ LEARNING AREA DETECTED                   │
│                                             │
│  THE GOPHER KING                            │
│  "You approach the Go language territory"   │
│                                             │
│  Current strength: ██████░░░░ 30/100        │
│                                             │
│  Active training:                           │
│  → "Building Systems with Go" — Poridhi     │
│  → Container runtime internals in Go        │
│                                             │
│  "Come back when you've leveled up."        │
│                                             │
│  [Continue exploring]  [View study plan →]  │
└─────────────────────────────────────────────┘
```

### 5.4 Building Interaction Design

Every building interaction has the same flow:
1. Walk within interaction radius (shown by subtle highlight ring)
2. Press `E` or tap (mobile) → game freezes, React overlay renders
3. Overlay shows the project case study (same content as /work/[slug])
4. Press `ESC` or click X to close → game resumes

**Overlay variants by building type:**
- **Project building:** Full project case study (problem, built, metrics, stack, links)
- **Blog HQ:** Shows /writing list inside the overlay
- **Skills Academy:** Shows the D3 graph in a compact version
- **Contact Bureau:** Shows the terminal contact form
- **Villain:** Shows the learning-area encounter screen

### 5.5 Technical Spec

**Engine:** Phaser 3.87.0

**Map:** 60×50 tiles, 32×32 tile size = 1920×1600 world pixels

**Camera:** Follows player with lerp 0.1. World bounds set to map size.

**Tileset:** Custom pixel art city tileset. Generate with AI prompt:
```
"top-down 2D pixel art city tileset, 32x32 tiles, dark forest-green color palette
(#172318 background), tech/cyberpunk city aesthetic, buildings include: server farm,
studio, lab, newspaper HQ, office tower, exchange building, road tiles, grass tiles,
sidewalk tiles. 16-bit style, clean pixel art."
```

**Character sprite:** 32×48 pixels, 4-direction walk cycle, 4 frames per direction.
```
"pixel art developer character, top-down view, 4 directions (down, up, left, right),
4 walk frames each, holding a laptop, dark hoodie, 32x48 px, transparent background"
```

**Phaser scene structure:**
```typescript
// WorldScene.ts
class WorldScene extends Phaser.Scene {
  // Tilemap from /public/assets/maps/backend-city.json
  // Object layer "Buildings" contains rectangles with custom properties:
  //   { name: "Algocode Server Farm", slug: "algocode", type: "project" }
  // Object layer "Villains" contains villain spawn points
  // Object layer "SpawnPoint" contains player start position

  create() {
    this.createMap()       // load tilemap
    this.createPlayer()    // spawn player
    this.createColliders() // building walls
    this.createZones()     // interaction zones from object layer
    this.createCamera()    // follow player
    this.createUI()        // launch UIScene in parallel
  }

  // On zone overlap: emit 'SHOW_INTERACTION_HINT' event
  // On E key press when in zone: emit 'OPEN_OVERLAY' with { slug, type }
}
```

**React ↔ Phaser bridge:**
```typescript
// EventBridge.ts — singleton EventEmitter
export const bridge = new EventEmitter()

// In WorldScene: bridge.emit('OPEN_OVERLAY', { slug: 'algocode', type: 'project' })
// In React game wrapper: bridge.on('OPEN_OVERLAY', (data) => setOverlay(data))
// Close: bridge.emit('CLOSE_OVERLAY') → React unmounts overlay, bridge.emit('GAME_RESUME') → Phaser unpauses
```

**Dynamic import (prevents game from bloating main bundle):**
```typescript
// app/game/page.tsx
'use client'
import dynamic from 'next/dynamic'

const GameComponent = dynamic(() => import('@/game'), {
  ssr: false,
  loading: () => <GameLoader />, // Shows animated terminal loading screen
})
```

### 5.6 Game Mode UI

**HUD elements (rendered as Phaser UIScene, overlaid on WorldScene):**
- Top-left: Minimap (60×50 grid, shows visited=bright, unvisited=dark tiles, player=mint dot)
- Top-right: "BACKEND CITY" title + district name (updates as player moves zones)
- Bottom-center: Interaction hint "[E] Enter" when near a building
- Bottom-right: Controls hint "WASD / Arrow keys"

**Pause menu (ESC key, not in an overlay):**
```
┌─────────────────────────────┐
│  PAUSED                     │
│  Backend City               │
│  ─────────────────          │
│  [Resume]                   │
│  [View flat portfolio]      │
│  [Toggle sound]             │
│  [Exit game mode]           │
└─────────────────────────────┘
```

**Mode selector screen (first load at `/game`):**
```
$ mahboob@engineer:~/explore

  Two ways to experience this portfolio.

  [1] Standard Mode    ← recommended if you're short on time
      flat, fast, all info structured

  [2] Game Mode        ← recommended if you want the full story
      explore Backend City, discover projects, meet the villains

  > _
```

---


## 6. KEY RULES (enforce in every prompt)

1. **All colors from `data/tokens.ts` only.** Never hardcode a hex value in a component.
2. **All content from `data/*.ts` registries.** Never hardcode project names, descriptions, or links in JSX.
3. **No localStorage anywhere.** Game state is in-memory Phaser only.
4. **No browser storage in Next.js.** Cookie for mode preference only.
5. **Game mode is client-only.** `'use client'` + `dynamic(() => import(...), { ssr: false })`.
6. **D3 mounts in useEffect.** Never render D3 nodes in JSX — D3 writes to the SVG ref directly.
7. **Phaser and D3 are never imported at module level** in any server component.
8. **Medium RSS fetched at build time** via `async` Server Component or `getStaticProps`. Never client-side.
9. **Keystatic runs on Vercel** with GitHub auth for the admin panel in production.
10. **Fonts loaded via `next/font/google`** in root layout — never via a `<link>` tag.
