# UnThink — Founder Project & System Architecture Deep-Dive

> **Single Source of Truth for Engineering Portfolio, Technical Case Studies, and Founder Profiles.**  
> *Live Application:* [letsunthink.tech](https://letsunthink.tech)  
> *Chrome Web Store Extension:* [Install UnThink on Chrome Web Store](https://chromewebstore.google.com/detail/unthink/lnbjgaieajhiidbicphgckpojaphhono)  
> *Role:* Founder & Full-Stack Systems Engineer (100% Solo Build: System Design, Backend, AI Pipeline, Browser Extension, Frontend SPA, AWS Infrastructure & Hardening).

---

## 1. Executive Summary & Core Value Proposition

**UnThink** is an AI-native, fragment-first personal knowledge repository and web capture engine built specifically for software engineers, researchers, and technical professionals. It eliminates the cognitive overhead of traditional bookmarking and note-taking tools by automating categorization, dual-directory taxonomic filing, and clean Markdown extraction at the moment of capture.

```
Traditional Note Tools (Friction-Heavy):
[Read Article] -> [Open Notion/Obsidian] -> [Create Note] -> [Pick Folder] -> [Write Tags] -> [Context Destroyed]

UnThink (Zero-Friction):
[Highlight Text] -> [Right-Click "Send to UnThink"] -> [Sub-300ms Save ACK] -> [AI Auto-Files in Background]
```

### Key Headline Metrics
- **`<300ms` Ingestion SLA**: Synchronous Django REST API response time for browser extension captures.
- **Zero-Decision Filing**: Autonomous zero-shot dual-directory routing (Topic Hierarchy + Source Origin).
- **3-Tier Multi-Key Caching**: Multi-key Redis cache with deterministic versioning and atomic invalidation.
- **3 Dedicated Celery Queues**: Isolated task processing for Scraping, AI Classification, and Report Generation.
- **Manifest V3 Published Extension**: Approved and live on the [Chrome Web Store](https://chromewebstore.google.com/detail/unthink/lnbjgaieajhiidbicphgckpojaphhono).
- **`<$100/mo` Cost Efficiency**: Sustainable unit economics per 1,000 active users through stateless LLM routing and multi-tier caching.

---

## 2. The Problem & Product USP

### The "Digital Landfill" Problem
Every major knowledge tool on the market (Notion, Obsidian, Evernote, Pocket, Readwise) suffers from a fundamental paradox:
1. **High Capture Friction**: Asking a developer to select a destination folder, tag categories, or write a title while reading interrupts flow state. Users postpone saving, and knowledge is lost.
2. **The 85%+ Graveyard**: Over 85% of saved bookmarks and full-page clippings are never opened again because they capture bloated, unorganized HTML rather than targeted atomic insights.
3. **Manual Organizational Debt**: As note collections grow, folder structures become obsolete, search queries fail on fuzzy memory, and maintenance becomes an unpaid chore.

### The UnThink Solution & USP
- **Fragment-First Primitive**: The atomic unit of storage is a *fragment* (2 to 8 lines of focused code, terminal commands, or insights) rather than entire 3,000-word messy web pages.
- **Zero-Decision Dual Taxonomy**: Every captured fragment is classified by AI into two parallel folder structures:
  1. *Conceptual Topic Hierarchy* (e.g., `Technology / Backend / Distributed Systems / Redis`).
  2. *Source Context Hierarchy* (e.g., `Medium / The Backend Diaries` or `GitHub / Docs`).
- **Clutter-Free Ingestion Engine**: Automatically strips advertisements, navigation menus, cookie banners, tracking scripts, and bloated styles into pristine GitHub-flavored Markdown.
- **Privacy-First AI**: Stateless model execution where user knowledge fragments are never used for training third-party public models.

---

## 3. High-Level System Architecture

UnThink utilizes a **Monorepo Service Architecture** with specialized micro-orchestration designed to separate high-throughput transactional CRUD from long-running, asynchronous AI and streaming pipelines.

```
+---------------------------------------------------------------------------------------------+
|                                    CLIENT INGESTION LAYER                                   |
|                                                                                             |
|   +---------------------------------------+     +---------------------------------------+   |
|   |  Chrome Extension (Manifest V3)       |     |  React 18 SPA (Vite + Tailwind CSS)   |   |
|   |  - Right-click Context Menu Capture   |     |  - Keyboard-first Navigation (Cmd+K)  |   |
|   |  - Ephemeral Service Worker           |     |  - Dual-Directory Tree Explorer       |   |
|   |  - Direct Quota Sync & Auth Bridge    |     |  - Real-Time Server-Sent Events (SSE) |   |
|   +---------------------------------------+     +---------------------------------------+   |
+----------------------------------------------+----------------------------------------------+
                                               |
                                        HTTPS / SSL (:443)
                                               |
+----------------------------------------------v----------------------------------------------+
|                         REVERSE PROXY & SECURITY GATEWAY (Nginx)                            |
|  - Alpine Unprivileged Container (Non-root user 101)                                        |
|  - Rate-Limiting: IP Burst & Route Throttling (30 req/min auth, 120 req/min API)            |
|  - Strict CSP, HSTS, X-Content-Type-Options & Zero Host Port Exposure                      |
+----------------------------------------------+----------------------------------------------+
                        |                                              |
     Path: /api/v1/*, /admin/*                               Path: /api/v1/ai/stream/*
                        |                                              |
+-----------------------v-----------------------+   +------------------v----------------------+
|       CORE API SERVICE (Django 5.1 + DRF)     |   |    STREAMING AI SERVICE (FastAPI)       |
|  - Transactional ACID Relational CRUD         |   |  - Async LLM Streaming Orchestration   |
|  - JWT & OAuth2 Authentication (Refresh/Acc) |   |  - Real-Time Server-Sent Events (SSE)   |
|  - Daily/Monthly Quota Enforcement & Tiering |   |  - Stateless Token Generation           |
|  - Stripe / Dodo Payments Webhook Handlers    |   |                                         |
|  - Multi-Key Redis Cache Management           |   |                                         |
+-----------------------+-----------------------+   +------------------+----------------------+
                        |                                              |
                        +----------------------+-----------------------+
                                               |
+----------------------------------------------v----------------------------------------------+
|                           ASYNCHRONOUS TASK BROKER & QUEUES                                 |
|                                                                                             |
|   +-------------------------------------------------------------------------------------+   |
|   |  Redis 7.2 (Instance 1: Celery Broker & Pub/Sub Event Bus)                          |   |
|   +-------------------------------------------------------------------------------------+   |
|                                               |                                             |
|        +--------------------------------------+-------------------------------------+        |
|        |                                      |                                     |        |
|  [Queue 1: classification]              [Queue 2: scraping]                   [Queue 3: reports]     |
|  High-priority AI taxonomy              On-demand DOM parsing                 Background digests,    |
|  & zero-shot folder routing             & Firecrawl fallback                  analytics & cleanups   |
+-----------------------------------------------+---------------------------------------------+
                                                |
+-----------------------------------------------v---------------------------------------------+
|                                CELERY WORKER CLUSTER                                        |
|                                                                                             |
|   +--------------------------+  +--------------------------+  +--------------------------+  |
|   | AI Classification Engine |  | Web Ingestion & Scraper  |  | Digest & Summary Worker  |  |
|   | - Primary: Fireworks AI  |  | - Custom DOM Traversal   |  | - Weekly knowledge briefs|  |
|   | - Failover: Gemini Flash |  | - Firecrawl API Fallback |  | - Unread item resurfacing|  |
|   +--------------------------+  +--------------------------+  +--------------------------+  |
+-----------------------------------------------+---------------------------------------------+
                                                |
                        +-----------------------+-----------------------+
                        |                                               |
+-----------------------v-----------------------+   +-------------------v---------------------+
|      PERSISTENCE LAYER (PostgreSQL 16)        |   |    CACHE STORE (Redis 7.2 - Instance 2) |
|  - Relational Fragments, Folders & Tags       |   |  - Multi-Key Namespaced Query Cache     |
|  - JSONB Metadata & Extraction Diagnostics    |   |  - User Tree & Tag Summary Caches       |
|  - B-Tree Indexes on (user_id, created_at)    |   |  - Deterministic Version Keys           |
+-----------------------------------------------+---------------------------------------------+
```

---

## 4. Deep-Dive: The Browser Extension (Manifest V3)

The UnThink browser extension is the primary ingestion gateway. Built on **Chromium Manifest V3**, it was designed for instant responsiveness, resilient background lifecycle handling, and frictionless authentication.

*Live Extension Link:* **`https://chromewebstore.google.com/detail/unthink/lnbjgaieajhiidbicphgckpojaphhono`**

```
+-----------------------------------------------------------------------------+
|                     CHROME EXTENSION (MANIFEST V3) INTERNALS                |
|                                                                             |
|   [ Webpage Context ]                                                       |
|   1. User highlights text on any article/documentation.                     |
|   2. Right-click context menu -> "Send to UnThink" (or Alt+Shift+S).        |
|                                                                             |
|   [ Service Worker (background.js) ]                                        |
|   3. Read cached JWT & Quota from chrome.storage.sync (0ms network cost).   |
|   4. Optimistic Badge Update: Badge turns green "OK" with sound feedback.   |
|   5. POST payload to /api/v1/fragments/ (<300ms SLA).                       |
|   6. If API returns 201 Created: Service worker updates local quota count.  |
|                                                                             |
|   [ Dashboard Bridge (dashboard_bridge.js) ]                                |
|   7. Listens to letsunthink.tech auth events via externally_connectable.    |
|   8. Automatically synchronizes JWT tokens without manual API key entry.   |
+-----------------------------------------------------------------------------+
```

### 1. Solving the Manifest V3 Ephemeral Service Worker Problem
Under Manifest V3, background pages were replaced by Service Workers that terminate after 30 seconds of inactivity.
- **Problem**: Persistent variables in memory are wiped out when Chrome puts the worker to sleep. State held in globals causes intermittent save failures and lost auth state.
- **Solution**: Designed a stateless service worker pattern. Every event reads authentication state, quota counters, and API endpoints directly from `chrome.storage.sync` and `chrome.storage.local`.
- On wake-up, the worker initializes context menus idempotently in `chrome.runtime.onInstalled` and handles message passing asynchronously.

### 2. Zero-Click Dashboard Bridge & Authentication Handshake
- Users do not need to generate or copy-paste API tokens into the extension popup.
- Configured Chrome's `externally_connectable` permission matching `https://letsunthink.tech/*`.
- When a user logs in on the web app, `dashboard_bridge.js` broadcasts an authenticated session handshake. The extension captures the token securely, stores it in encrypted browser storage, and configures the `chrome.runtime.setUninstallURL` with user-specific telemetry parameters.

### 3. Native Zero-Dependency Popup Experience
- The extension popup (`popup.html` and `popup.js`) is written in native modern JavaScript with zero heavy runtime frameworks, loading in under **10ms**.
- Features a live quota visualizer (e.g., `18 / 25 daily saves remaining`), direct note capture textarea, keyboard navigation, and immediate sync with the cloud sanctuary.

### 4. Automated Production Packaging Pipeline
- Created custom build and packaging automation (`scripts/build.js` and `scripts/package.js`).
- Running `make verify-extension-build` automatically:
  1. Injects production endpoints (`https://letsunthink.tech` and `https://api.letsunthink.tech/api/v1`).
  2. Strips dev host permissions and local debug keys.
  3. Validates all 5 icon resolutions (16x16, 32x32, 48x48, 128x128, 256x256).
  4. Generates an automated, clean release archive (`dist/prod/unthink-extension-<version>.zip`) ready for the Chrome Web Store Developer Dashboard.

---

## 5. Major Engineering Challenge: Multi-Key Caching & Invalidation

### The Problem: Multidimensional Query Invalidation
In UnThink, read operations drastically outnumber writes, but reads are multidimensional and computationally expensive.

Users expect instant rendering of:
1. **Paginated Fragment Feeds**: Filtered by folder, tag, search query, and sort order.
2. **Recursive Folder Trees**: Calculated hierarchy with fragment counts per node.
3. **Global Tag Clouds**: Aggregated counts of all tags owned by the user.
4. **Quota Counters**: Daily and monthly save counters.

#### The Invalidation Nightmare
When a user adds, edits, moves, or deletes a single fragment:
- The fragment's detail cache is invalidated.
- The user's paginated list caches (across multiple pages, filters, and sorts) become stale.
- The parent folder's recursive child count changes.
- If the tag was changed, the global tag summary count changes.
- The user's daily quota counter changes.

A naive `KEYS *` or global cache flush pattern causes:
- High Redis CPU spikes (blocking the single-threaded Redis event loop).
- Cache stampedes (thundering herds hitting PostgreSQL simultaneously).
- Stale data bugs if any individual key is missed.

```
Naive Invalidation (Broken):
[Fragment Updated] -> Redis KEYS frag:u:123:* -> [Redis Blocks for 400ms] -> [Cache Stampede on Postgres]

UnThink Deterministic Versioning (Sub-millisecond):
[Fragment Updated] -> INCR user:123:cache_version -> [All user list/tree keys instantly invalidated logically]
```

### The Engineering Solution: Deterministic Epoch Versioning & Atomic Pipelines

#### 1. Deterministic User Cache Versioning
Instead of hunting down hundreds of individual paginated cache keys, every user has an atomic cache version counter:
```
Key: user:{user_id}:cache_version  ->  Value: 42
```
All cache keys incorporate this version in their key schema:
```
frag:u:{user_id}:v:{version}:list:p{page}:f{folder_id}:t{tag}
folder:u:{user_id}:v:{version}:tree
tag:u:{user_id}:v:{version}:summary
```

When any fragment is created, updated, or deleted:
1. The backend executes `INCR user:{user_id}:cache_version`.
2. Instantly, all subsequent reads look for keys containing version `43`.
3. Old keys at version `42` are never accessed again and are reclaimed automatically by Redis via standard TTL (Time-To-Live expiration).
4. **Execution Time**: **`<1ms`**. Zero scanning, zero blocking.

#### 2. Targeted Pipelined Invalidation for Granular Operations
For single-entity updates where global list invalidation is unnecessary (e.g., toggling fragment favorite status):
- The backend utilizes Redis **Pipelines** to batch delete specific entity keys atomically in a single network round-trip.

```python
def invalidate_fragment_detail(user_id: int, fragment_id: int):
    """
    Atomic multi-key invalidation using a Redis pipeline.
    Avoids blocking Redis and executes in a single round-trip.
    """
    pipe = redis_client.pipeline()
    pipe.delete(f"frag:detail:{fragment_id}")
    pipe.delete(f"frag:raw_md:{fragment_id}")
    pipe.execute()
```

#### 3. Cache Stampede Protection (Mutex Locking & Probabilistic Expiry)
For expensive folder tree aggregations:
- When a cache miss occurs, worker threads acquire a short-lived Redis distributed lock (`mutex:folder_tree:{user_id}`).
- The first thread recalculates the tree and populates Redis; subsequent concurrent threads wait for the lock and read the populated cache, preventing database overload.

---

## 6. Zero-Shot AI Classification & Dual Taxonomy Engine

### 1. Dual-Directory Taxonomic Routing
When a fragment is captured, it is processed asynchronously by the Celery `classification_queue`. The engine passes the fragment content, title, and metadata to an LLM with strict structured JSON output guarantees.

The prompt forces the model into a deterministic two-axis classification:

```json
{
  "topic_path": "Technology/Backend/Distributed Systems/Redis",
  "source_path": "Medium/The Backend Diaries",
  "tags": ["redis", "distributed-systems", "caching", "high-availability"],
  "summary": "Explains Redis sentinel failover mechanisms and split-brain mitigation.",
  "confidence_score": 0.96
}
```

- **Topic Path**: Maps to the conceptual domain tree.
- **Source Path**: Maps to the publisher, platform, or origin domain.
- **Database Upsert**: The Django worker parses the hierarchy, creates missing parent/child folder nodes in PostgreSQL via `get_or_create`, and links the fragment using a many-to-many relationship.

### 2. Multi-Model Failover Cascade
To maintain 99.9% classification uptime while minimizing inference costs:
1. **Primary Model**: Fireworks AI / Fast Open LLM (sub-500ms latency, high token economy).
2. **Secondary Failover**: Google Gemini 2.0 Flash (high reasoning, large context window).
3. **Tertiary Heuristic Fallback**: Local regex & URL-domain parser (executes if external AI providers experience outages).

---

## 7. Web Ingestion & Clutter-Free Scraper Engine

When a user clips a URL or saves a full article:
1. **DOM Clutter Stripping**: Custom DOM parser traverses the HTML tree and strips scripts, styles, iframes, SVGs, base64 images, navbars, sidebars, and tracking widgets.
2. **Readability Normalization**: Extracts core article body text, preserves header hierarchy (`#`, `##`, `###`), converts syntax-highlighted code blocks into fenced markdown with language tags.
3. **Firecrawl API Integration**: For single-page applications (SPAs) and JavaScript-heavy paywalled or obfuscated pages, the ingestion engine offloads rendering to the Firecrawl API before running Markdown normalization.

---

## 8. AWS Infrastructure & Production Hardening

UnThink runs on a hardened, containerized infrastructure deployed on AWS EC2.

```
+-----------------------------------------------------------------------------+
|                           PRODUCTION SECURITY POSTURE                       |
|                                                                             |
|   1. Non-Root Execution: All Docker containers run as unprivileged users.   |
|   2. Linux Kernel Hardening: cap_drop: ALL enforced on every service.       |
|   3. Zero Host Port Exposure: Backend (:8000), AI (:8001), PostgreSQL       |
|      (:5432), and Redis (:6379) are INTERNAL ONLY on a private bridge.     |
|   4. Single Gateway: Only Nginx (:8080/443) binds to the host.              |
|   5. Telemetry & Observability: Centralized Sentry error monitoring & logs. |
+-----------------------------------------------------------------------------+
```

### Security Invariants & Hardening Verification
- **Automated Security Verification Gate**: `make verify-prod` parses the resolved Docker Compose AST before deployment and enforces:
  - Exactly 1 published port (Nginx reverse proxy).
  - `cap_drop: ALL` present on all 7 service definitions.
  - Absence of debugging tools (e.g. Flower) in production environments.
- **Nginx Linter Gate**: `make verify-nginx` tests the Nginx configuration inside an Alpine container prior to deployment.
- **Database Collation & Connection Pooling**: PostgreSQL configured with persistent volumes, tuned `shared_buffers`, and strict connection pooling via Django persistent connections.

---

## 9. Key Engineering Learnings & System Design Trade-offs

| Decision | Chosen Architecture | Rejected Alternative | Engineering Rationale |
| :--- | :--- | :--- | :--- |
| **Service Architecture** | Monorepo Services (Django + FastAPI) | Monolithic Django or Single FastAPI | Django provides rock-solid relational ORM, migrations, and auth. FastAPI excels at async streaming and LLM orchestration. Combining them cleanly via Celery in a monorepo avoids compromise. |
| **Real-time Updates** | Server-Sent Events (SSE) | WebSockets | Unidirectional server-to-client updates are all that's required for AI classification completion. SSE works natively over standard HTTP, auto-reconnects, and bypasses proxy firewall issues. |
| **Broker vs Cache** | Two Isolated Redis Instances | Single Shared Redis Instance | Prevents heavy Celery queue bursts from evicting hot query cache keys under high load. |
| **Invalidation Strategy** | Deterministic Version Epochs | Granular `KEYS *` or Tag Flushes | Sub-millisecond invalidation time with zero Redis blocking spikes. |
| **Browser Extension** | Stateless Manifest V3 Service Worker | Background Script / Heavy Bundles | Complies with modern Chrome security standards, 10ms popup load time, zero memory leaks. |

---

## 10. Roadmap & Upcoming Deep-Tech Features (TODOs)

### 1. Hybrid Semantic & Intent-Based Search
- **Architecture**: Integrating `pgvector` dense vector embeddings (OpenAI text-embedding-3-small or Gemini Embeddings) with PostgreSQL full-text search (BM25 / `tsvector`).
- **Reciprocal Rank Fusion (RRF)**: Merging keyword search with conceptual similarity so queries like `"that python redis cache fix"` return the exact fragment even if exact keywords differ.
- **Latency Target**: Sub-200ms `Cmd+K` keyboard-first search modal across 10,000+ personal fragments.

### 2. Weekly Sunday AI Knowledge Digest
- **Architecture**: A weekly Celery Beat cron job scheduled for Sunday mornings.
- **Synthesis Engine**: Aggregates all fragments saved over the past 7 days, clusters them by topic, and uses an LLM to generate an executive brief with:
  - Key concepts learned.
  - Actionable code snippets.
  - Resurfacing of unread or high-value fragments from previous months.
- **Delivery**: Delivered via in-app digest viewer and email notifications.

### 3. Offline-First Extension Sync Engine
- Local IndexedDB capture buffer in the Chrome extension.
- Enables engineers to clip documentation and code snippets while offline (e.g. on flights); auto-syncs and triggers AI classification upon network reconnection.

---

## 11. Complete Tech Stack Inventory

```
+-------------------+---------------------------------------------------------------------+
| Layer             | Technologies & Libraries                                            |
+-------------------+---------------------------------------------------------------------+
| Backend Core      | Python 3.12, Django 5.1, Django REST Framework, SimpleJWT, Gunicorn |
| Streaming & AI    | FastAPI, Uvicorn, Pydantic v2, Server-Sent Events (SSE), HTTPX      |
| Task & Message    | Celery 5.4, Redis 7.2 (Broker & Result Backend), Celery Beat       |
| Database & Cache  | PostgreSQL 16, Redis 7.2 (Query Cache Store), pgvector (Roadmap)   |
| AI & LLM Engine   | Fireworks AI (Mixtral / Llama 3), Google Gemini 2.0 Flash           |
| Browser Extension | Chrome Manifest V3, JavaScript (ES2024), Chrome Storage Sync/Local  |
| Frontend Web SPA  | React 18, Vite 5, Tailwind CSS, Lucide Icons, Vitest, Testing Lib   |
| Scraping & DOM    | BeautifulSoup4, Readability.js, Firecrawl API                       |
| Infrastructure    | Docker, Docker Compose, Nginx Unprivileged, AWS EC2, Sentry         |
| Testing & Quality | Pytest, Pytest-Django, Vitest, ESLint, Flake8 (500+ Automated Tests)|
+-------------------+---------------------------------------------------------------------+
```

---

## 12. Portfolio Ready Data Snippet (For AI Agent Portfolio Update)

The following structured block can be copied directly by an AI agent to update `mahboob.engineer/work/unthink`:

```json
{
  "slug": "unthink",
  "title": "UnThink",
  "tagline": "AI-powered, fragment-first personal knowledge base and web capture engine.",
  "role": "Founder & Full-Stack Systems Engineer",
  "status": "live",
  "period": "2026 – Present",
  "links": {
    "live": "https://letsunthink.tech",
    "extension": "https://chromewebstore.google.com/detail/unthink/lnbjgaieajhiidbicphgckpojaphhono"
  },
  "metrics": [
    { "label": "Save API SLA", "value": "<300ms" },
    { "label": "AI Taxonomy", "value": "Zero-shot Dual-Directory" },
    { "label": "Cache Invalidation", "value": "Deterministic Epochs" },
    { "label": "Task Queues", "value": "3 Celery Queues" },
    { "label": "Operating Cost", "value": "<$100/mo per 1k users" }
  ],
  "stack": [
    "Django 5.1",
    "FastAPI",
    "PostgreSQL 16",
    "Redis 7.2",
    "Celery",
    "Gemini 2.0 Flash",
    "Fireworks AI",
    "Chrome Manifest V3",
    "React 18",
    "Tailwind CSS",
    "Docker",
    "AWS"
  ],
  "highlights": [
    "Architected and shipped UnThink end-to-end as sole founder: a production AI second-brain SaaS and published Manifest V3 Chrome Extension.",
    "Engineered a unified monorepo with decoupled services (Django for relational CRUD & quota limits; FastAPI for real-time SSE streaming and LLM routing).",
    "Solved multi-dimensional cache invalidation across paginated lists, recursive folder trees, and tag summaries via Redis deterministic epoch versioning.",
    "Integrated asynchronous zero-shot AI classification across isolated Celery task queues, automatically routing fragments into conceptual and origin taxonomies.",
    "Hardened production Docker deployment on AWS EC2 with non-root security profiles, cap_drop: ALL, unprivileged Nginx, and zero exposed internal ports."
  ]
}
```