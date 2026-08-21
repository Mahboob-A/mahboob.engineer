# Taply Systems Simulation Engineering Guide: Blueprint & Data Contract

> **Target Audience**: Taply System Architect / Research Agent  
> **Purpose**: Standardize the data extraction and engineering specification for Taply (`/work/taply`), mirroring the 5-module architectural simulation and master product sandbox pattern engineered for UnThink (`/work/unthink`).  
> **Output Target**: A complete, high-fidelity interactive system exploration module and sandbox experience for Taply on `mahboob.engineer`.

---

## 1. Executive Architectural Overview

On `mahboob.engineer`, founding projects are not presented as static case studies. Instead, they feature an **interactive dual-system layout**:

1. **System 1 (Top): Interactive System Architecture & Pipeline Explorer**  
   An interactive 5-module tabbed playground that dissects the hard backend engineering decisions, data transformations, atomic caching models, and real-time streaming infrastructure.
2. **System 2 (Below): Master Multi-Persona Product Sandbox**  
   A live end-user product simulation with interactive triggers (e.g. context menu or NFC/QR tap simulation) that dynamically ingests, categorizes, and renders live data across distinct user personas.

This guide provides the complete blueprint for **System 1 (The 5-Module Interactive System Explorer)** so that the Taply research agent can gather exact technical data, benchmarks, payloads, and state models.

---

## 2. The 5-Module Engineering Lifecycle Framework

The 5-module explorer breaks down a distributed system into 5 sequential lifecycle phases:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Module 01   │───▶│  Module 02   │───▶│  Module 03   │───▶│  Module 04   │───▶│  Module 05   │
│ Client / SLA │    │ Data Payload │    │ Core Routing │    │ Cache Epoch  │    │ Stream / Sec │
│  Ingestion   │    │ Transformation│   │  & Hierarchy │    │  & Mutexes   │    │  Invariants  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

### Module 01: Client Trigger & Sub-Latency SLA Ingestion

#### Architectural Purpose
Simulates the moment of user interaction and proves the sub-latency SLA of the edge/ingestion layer before any background asynchronous processing kicks in.

#### How It Was Built for UnThink
- **Interaction**: User clicks a highlighted snippet card to simulate right-clicking a Chrome Extension context menu.
- **Visual Feedback**: Generates an instantaneous realistic latency calculation (`210ms - 290ms`), checks SLA adherence (`<300ms Met`), and decrements a client quota gauge (`24/25 saves today`).
- **Behind the Scenes**: A 3-box pipeline breakdown showing:
  1. *Client/MV3 Capture* (<15ms)
  2. *Relational Ingestion Service* (JWT validation + Redis enqueue, returns 201 Created)
  3. *Asynchronous Worker Dispatch* (Celery task queue)

#### Taply Extraction Target
The Taply agent should provide:
- **Client Trigger**: NFC Card Tap or Dynamic QR Code Scan.
- **SLA Benchmark**: Sub-100ms Edge Redirect and vCard Payload Delivery SLA.
- **Edge Routing**: Cloudflare Edge Workers / Next.js Edge Middleware resolving dynamic shortlinks.
- **Quota & Tiering**: Free vs Pro vs Enterprise card view quotas and rate-limiting rules.
- **3-Box Pipeline**:
  1. *NFC/QR Dynamic Scan Intercept* (<12ms)
  2. *Edge Geolocation & Device Fingerprinting* (<25ms)
  3. *Relational Profile Delivery & Analytics Queue Dispatch* (<60ms)

---

### Module 02: Data Transformation & Payload Optimization

#### Architectural Purpose
Provides an interactive A/B toggle comparing **Unoptimized / Raw Data** against **Optimized / Transformed Data**, quantifying exact payload reduction percentages and stripping efficiency.

#### How It Was Built for UnThink
- **Interaction**: Toggle switch between `"Clean Markdown (1.2 KB)"` and `"Raw Web DOM (34.8 KB)"`.
- **Visual Feedback**: Code viewer rendering formatted Markdown vs minified HTML loaded with scripts, ads, and tracking pixels.
- **Metrics Bar**: 4-chip grid displaying `Payload Size`, `Tracking Scripts Cleaned (14 Active vs 0 Cleaned)`, `Stripping Engine (Trafilatura + LXML)`, and `Scraping Fallback (Firecrawl API)`.

#### Taply Extraction Target
The Taply agent should provide:
- **A/B Comparison**: `"Optimized vCard 4.0 / Dynamic PWA Micro-Payload (1.4 KB)"` vs `"Raw Heavy Multi-Link Profile & Uncompressed Assets (48.6 KB)"`.
- **Code Viewer Snippets**:
  - *Clean*: Standardized RFC 6350 vCard 4.0 representation with base64 embedded photo thumbnail and structured social endpoints.
  - *Raw*: Bloated multi-link HTML markup with uncompressed PNGs, third-party analytics tags, and redundant metadata.
- **Metrics Bar**:
  - `Payload Size`: 1.4 KB vs 48.6 KB (97.1% reduction).
  - `Offline PWA Caching`: ServiceWorker Cache-First strategy.
  - `Asset Pipeline`: Sharp WebP compression + Brotli encoding.
  - `vCard Protocol`: RFC 6350 compliant with iOS / Android auto-contact parsing.

---

### Module 03: Core Algorithmic Logic & Multi-Tenant Hierarchy

#### Architectural Purpose
Demonstrates the platform's multi-dimensional categorization, data routing, or permission hierarchy through interactive sample selectors.

#### How It Was Built for UnThink
- **Interaction**: 3 selectable sample tabs (`Redis Caching`, `PostgreSQL GIN`, `Linux Non-Root`).
- **Visual Feedback**: Interactive Dual-Tree viewer showing both the *Conceptual Topic Hierarchy* and the *Source Origin Hierarchy* with active highlighting.
- **Metadata Panel**: Shows classifier engine model, confidence percentage (`99.4%`), and generated auto-tags.

#### Taply Extraction Target
The Taply agent should provide:
- **Hierarchy Model**: Multi-Tenant Enterprise Hierarchy (Organization -> Regional Department -> Team -> Individual Digital Card -> Action Buttons).
- **Interactive Selectors**: 3 corporate role samples:
  1. *Executive / Founder*: Global card permissions, CRM bidirectional sync, custom vanity domain (`gettaply.me/p/mehboob`).
  2. *Enterprise Sales Representative*: Team brand lock, mandatory lead-capture gate, HubSpot webhook integration.
  3. *Engineering Manager*: Tech-stack social endpoints, GitHub/GitLab badges, dynamic scheduling link (Cal.com / Calendly).
- **Metadata Panel**: RBAC role evaluation, active company brand theme token, lead capture privacy compliance (GDPR/CCPA compliant).

---

### Module 04: High-Performance Caching, Versioning & Atomicity

#### Architectural Purpose
Simulates the hardest backend challenge of high-throughput platforms: cache invalidation, race conditions, atomic state changes, and mutex locking.

#### How It Was Built for UnThink
- **Interaction**: A button to `[+] Simulate Fragment Save (Trigger Atomic INCR)`.
- **Visual Feedback**: Bumps `user:{id}:cache_version` from `v42` to `v43`, calculates logical invalidation time in `<0.4ms`, and streams live Redis execution logs into a terminal.
- **Active Cache Keys Board**: Displays active Redis keys (`user:42:cache_version`, `feed:user:42:v43:page:1`, `tree:user:42:v43:counts`).

#### Taply Extraction Target
The Taply agent should provide:
- **Caching Architecture**: Redis multi-tier caching for high-concurrency public profile delivery:
  - Global profile cache: `profile:{slug}:v{version}`
  - Team member directory cache: `team:{team_id}:v{version}:members`
  - Real-time click & view counter buffer: `analytics:card:{id}:counter`
- **Interactive Mutation**: A button to `[+] Simulate Contact Save / Lead Exchange (Trigger Atomic Buffer INCR)`.
- **Atomicity Mechanism**: Atomic Redis HINCRBY for high-frequency scan tracking, combined with Celery batch-flushing to PostgreSQL every 60 seconds to prevent database write bottlenecks.
- **Execution Log Stream**:
  - `Atomic HINCRBY analytics:card:104:views -> 14,892 in 0.18ms`
  - `Profile cache hit: profile:mehboob:v12 (TTL: 86400s)`
  - `Lead capture event dispatched to Redis Pub/Sub channel`

---

### Module 05: Real-Time Event Streaming & Hardened Security Posture

#### Architectural Purpose
Showcases the production runtime environment: real-time event streaming channels (SSE/WebSockets/Webhooks) paired with concrete container and cloud security invariants.

#### How It Was Built for UnThink
- **Stream Side**: Live SSE event log terminal displaying `fragment.created`, `ai.classification.done`, and `dashboard.tree.sync`.
- **Security Side**: 4-point production security checklist (`Non-Root UID 10001`, `cap_drop: ALL`, `Unprivileged Alpine Nginx`, `0 Exposed Host Ports`).

#### Taply Extraction Target
The Taply agent should provide:
- **Stream Side**: Live Webhook & Event Dispatch Channel:
  - `event: card.scanned` (`{"card_id": "c_901", "geo": "San Francisco, CA", "device": "iOS 18"}`)
  - `event: lead.captured` (`{"lead_id": "ld_441", "email": "vp@acme.corp", "crm_sync": "hubspot"}`)
  - `event: team.directory.sync` (`{"team_id": "t_sales", "active_cards": 128}`)
- **Security Side**: Enterprise Security & Privacy Invariants:
  - *Data Isolation*: Multi-tenant schema isolation with tenant-scoped database queries.
  - *PII Encryption*: AES-256 field-level encryption on captured lead contact details.
  - *NFC Anti-Spoofing*: Signed URL tokens with timestamp verification to prevent card cloning.
  - *Rate-Limiting*: Cloudflare WAF + Redis Token Bucket rate limiting (max 60 scans/min per IP).

---

## 3. UI Component Architecture & Design Constraints

To maintain 100% aesthetic harmony with the rest of `mahboob.engineer`, all simulation components must follow these strict rules:

### Strict Typography & Style Invariants
1. **Zero Emojis**: Do not use any Unicode emojis (`⚡`, `🧹`, `🧠`, `🔒`, `📁`, `🌐`, `✓`, `⚠`). Instead, use clean mono badges (`[CAPTURE]`, `[CLEAN]`, `[ROUTING]`, `[EPOCH]`, `[SANDBOX]`, `[OK]`, `[WARN]`, `[DIR]`, `[SRC]`) or pure SVG path icons.
2. **Zero Em Dashes (`—`)**: Replace all em dashes with colons `:`, parentheses `()`, or periods `.`.
3. **Color Palette Tokens**:
   - Backgrounds: `bg-code-bg` (`#121C13`), `bg-surface` (`#1F2E21`), `bg-bg` (`#172318`)
   - Borders: `border-border` (`rgba(255,255,255,0.08)`), `border-[#2B4A3A]/60`
   - Text: `text-t1` (`#F0FDF4`), `text-t2` (`#A7D4B2`), `text-t3` (`#6E8B75`)
   - Primary Accents: `text-amber` (`#F59E0B`), `text-acc` (`#5CC9A0`)
   - Dynamic Accents: Indigo (`#818CF8`), Sky Blue (`#38BDF8`), Teal (`#2DD4BF`)

### Layout Geometry
```tsx
<div className="w-full space-y-6">
  {/* Tab Navigation Header */}
  <div className="border-border bg-surface/80 flex flex-wrap gap-2 rounded-xl border p-2 backdrop-blur-md">
    {TABS.map((tab) => (
      <button key={tab.id} className="...">
        <span className="font-mono text-[10px] font-bold text-amber border border-amber/30 bg-amber/10 px-1.5 py-0.5 rounded">
          {tab.badge}
        </span>
        <span className="text-amber font-mono text-[10px] font-bold tracking-wider uppercase">
          {tab.step}
        </span>
        <span className="font-display text-[13px] font-semibold">{tab.label}</span>
        <span className="text-t3 font-mono text-[10.5px]">{tab.tag}</span>
      </button>
    ))}
  </div>

  {/* AnimatePresence Stage Container */}
  <div className="border-border bg-code-bg relative min-h-[460px] overflow-hidden rounded-2xl border p-6 md:p-8">
    <AnimatePresence mode="wait">
      {/* Active Module Component */}
    </AnimatePresence>
  </div>
</div>
```

---

## 4. Taply Agent Research Checklist & Data Questionnaire

The Taply research agent should fill out the following exact questionnaire to provide the full dataset required for implementation:

### Questionnaire for Module 1: Ingestion & Scan SLA
- [ ] What is the average redirect and profile delivery latency under real production workloads (e.g. `45ms - 85ms`)?
- [ ] What edge routing technology is used (e.g. Cloudflare Workers, Next.js Edge, Nginx)?
- [ ] What rate limits and daily view quotas are enforced across Free and Enterprise tiers?
- [ ] What are the 3 sequential steps in the Taply scan ingestion pipeline?

### Questionnaire for Module 2: Data Normalization & Asset Compression
- [ ] What is the exact payload size difference between a full unoptimized profile and the optimized dynamic vCard 4.0 micro-payload (e.g. `48.6 KB vs 1.4 KB`)?
- [ ] What image optimization and CDN caching strategies are applied to profile avatars and team logos?
- [ ] Provide sample code for the RFC 6350 vCard generation vs the uncompressed raw HTML profile.

### Questionnaire for Module 3: Enterprise Multi-Tenant RBAC Hierarchy
- [ ] What are the 3 distinct persona/role profiles in Taply (e.g. Executive Founder, Enterprise Sales Representative, Engineering Manager)?
- [ ] What is the exact organizational tree structure (e.g. `Acme Corp / Global Sales / North America / John Doe`)?
- [ ] What CRM integrations (HubSpot, Salesforce, Zapier) and lead-capture validation rules are enforced?

### Questionnaire for Module 4: High-Performance Caching & Analytics Buffer
- [ ] What are the exact Redis key naming conventions for profile delivery, team rosters, and real-time scan counters?
- [ ] How are scan/click analytics buffered in Redis before batch-syncing to PostgreSQL?
- [ ] What is the measured latency for atomic analytics increments and cache invalidation on profile edits (e.g. `<0.25ms`)?
- [ ] Provide 4 realistic Redis CLI log lines showing atomic operations and cache hits.

### Questionnaire for Module 5: Event Streaming & Security Invariants
- [ ] What real-time webhook events are emitted when a lead is captured or a card is scanned?
- [ ] What enterprise security measures protect NFC endpoints and lead PII (e.g. signed tokens, AES-256 field encryption, CORS isolation, multi-tenant DB schemas)?

---

## 5. TypeScript Contract Skeleton for `TaplyInteractiveExplorer.tsx`

```typescript
export type TaplyTabKey = "scan" | "vcard" | "rbac" | "cache" | "webhooks";

export interface TaplyTabMeta {
  id: TaplyTabKey;
  step: string;
  label: string;
  badge: string;
  tag: string;
}

export const TAPLY_TABS: TaplyTabMeta[] = [
  {
    id: "scan",
    step: "01",
    label: "NFC / QR Ingestion",
    badge: "SCAN",
    tag: "Sub-80ms Edge SLA",
  },
  {
    id: "vcard",
    step: "02",
    label: "vCard Compression",
    badge: "PAYLOAD",
    tag: "97% Reduction",
  },
  {
    id: "rbac",
    step: "03",
    label: "Multi-Tenant RBAC",
    badge: "ENTERPRISE",
    tag: "Hierarchical Teams",
  },
  {
    id: "cache",
    step: "04",
    label: "Analytics Buffer",
    badge: "ATOMIC",
    tag: "Zero DB Stampede",
  },
  {
    id: "webhooks",
    step: "05",
    label: "CRM Webhook Stream",
    badge: "PIPELINE",
    tag: "AES-256 PII Hardened",
  },
];
```

---

## 6. Next Steps for Implementation

1. **Feed this document to the Taply Agent**.
2. **Collect the completed Taply data dictionary** (benchmarks, code snippets, persona definitions, and logs).
3. **Generate**:
   - `components/work/TaplyInteractiveExplorer.tsx` (The 5-Module Interactive System Explorer)
   - `components/work/taply-simulation-data.ts` (The Multi-Persona Sandbox Dataset)
   - `components/work/TaplySimulation.tsx` (The Master Interactive Product Sandbox)
4. **Integrate both systems seamlessly into `app/work/[slug]/page.tsx` for `/work/taply`**.
