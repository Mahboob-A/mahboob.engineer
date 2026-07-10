## 6. HOW AI-ASSISTED DEVELOPMENT WORKS FOR THIS PROJECT

This section answers: **which AI tool, how exactly to use it, and what to type.**

### 6.1 The Tool: Cursor IDE (Recommended)

**Cursor** (cursor.com) is a code editor — like VS Code — but with an AI chat built in that can read your entire codebase and write or edit files for you. This is the primary tool for building this portfolio.

**Setup (do this once):**
1. Download Cursor from cursor.com and install it
2. Open your project folder in Cursor (File → Open Folder)
3. The AI chat panel is on the right side — press `Ctrl+L` (or `Cmd+L` on Mac) to open it

**Alternative tools (if you already use one of these):**
- **Claude Code** (terminal) — type `claude` in your project terminal, then describe the task
- **GitHub Copilot** (inside VS Code) — use the chat panel (`Ctrl+Shift+I`)
- **ChatGPT/Claude.ai** — paste the prompt, copy the code back manually (slowest option)

Cursor is recommended because it reads your existing files automatically — you don't have to paste all your code into the chat every time.

---

### 6.2 The Workflow — Step by Step

For every task in the phases below, this is the exact process:

```
Step 1 → Open Cursor, open the project folder
Step 2 → Press Ctrl+L to open the AI chat
Step 3 → Type "@" to reference a file from your project
          e.g. "@data/tokens.ts" "@data/projects.ts"
          Cursor reads those files so the AI knows what's in them
Step 4 → Paste the task prompt (from section 6.3 below)
Step 5 → Press Enter. The AI writes the code.
Step 6 → Review the code. If it looks right, click "Accept".
Step 7 → Run the dev server (pnpm dev) and check it in the browser.
Step 8 → If something looks wrong, describe what's wrong in the same chat.
          "The chip colors are wrong, the background should be #122018 not white"
```

That's the entire loop. You are the reviewer. The AI writes, you verify.

---

### 6.3 Exact Prompt to Use for Each Task

Copy-paste these prompts into Cursor's chat. Replace nothing — just add `@filename` references at the top so Cursor reads the relevant files before answering.

---

#### T1.1 — Next.js project setup
```
Initialise a new Next.js 15 project with the following setup:
- Package manager: pnpm
- TypeScript: strict mode
- Tailwind CSS v4
- App Router (not Pages Router)
- Fonts: Space Grotesk, Inter, JetBrains Mono from Google Fonts
  Load via next/font/google in app/layout.tsx
- ESLint + Prettier configured
- Folder structure as per the file tree in the master plan

Show me the exact commands to run, then create next.config.ts and app/layout.tsx.
```

---

#### T1.2 — Design tokens file
```
Create the file data/tokens.ts containing:

1. A `colors` object with these exact hex values:
   bg:#172318, surface:#1C2E1E, card:#223626, elev:#2A4030, active:#1E3828,
   border:#334E3C, borderS:#406050, t1:#D8EEE2, t2:#9AC0A0, t3:#608870,
   acc:#5CC9A0, accDim:#1E3828, aiBg:#263E2E, aiBd:#3A5844,
   amber:#f59e0b, amberDim:#2a1f06, codeBg:#0D1511

2. A `kwDark` array with 4 objects (sage, slate, amber, mauve):
   sage:  bg #122018, text #60B080
   slate: bg #0E1C2C, text #5888B8
   amber: bg #1E1608, text #B08030
   mauve: bg #1E1030, text #9870C0

3. A `fonts` object: display/body/mono font family strings

4. A `chipColor` helper function:
   Takes a tag string, returns one of 'sage'|'slate'|'amber'|'mauve'
   Rules:
   - sage:  Django, DRF, FastAPI, Python, Celery, backend tool names
   - slate: Docker, AWS, Redis, PostgreSQL, Kubernetes, Nginx, infra names
   - amber: RabbitMQ, Stripe, Kafka, async/payment/queue names
   - mauve: JWT, OAuth2, NFC, WebRTC, Gemini, AI/protocol names
   - Default: sage

Export everything. Use `as const` on the colors object.
```

---

#### T1.3 — Data registries
```
@data/tokens.ts

Create these four files by copying the registry data exactly as provided.
Do not change any values — just wrap them in proper TypeScript exports.

Files to create:
- data/projects.ts  → export const PROJECTS = [...]
- data/experience.ts → export const EXPERIENCE = [...] and export const EDUCATION = [...]
- data/blog.ts      → export const BLOG_POSTS = [...]
- data/stack.ts     → export const STACK = [...]

The data for each file is in sections 0.4, 0.5, 0.6, and 0.7 of the master plan document.
Add TypeScript types for each registry item (ProjectItem, ExperienceItem, etc).
```

---

#### T1.5 — Shared UI components
```
@data/tokens.ts

Build these small reusable components in components/ui/:

1. Chip.tsx
   Props: { children: ReactNode, color: 'sage'|'slate'|'amber'|'mauve' }
   Reads colors from kwDark in tokens.ts
   Style: font-family mono, font-size 11px, padding 3px 9px,
          border-radius 4px, font-weight 500, letter-spacing 0.3px
   Each color variant sets background and text from kwDark[0..3]

2. Badge.tsx
   Props: { variant: 'active'|'completed'|'live'|'building', children: ReactNode }
   active/live:      green text (#5CC9A0), green border, green tint background
   completed:        muted text (#608870), border color (#334E3C)
   building:         amber text (#f59e0b), amber border, amber tint background
   Style: font-family mono, font-size 10px, padding 3px 10px,
          border-radius 999px, border 1px, font-weight 600

3. StatRow.tsx
   Props: { stats: Array<{ num: string, label: string }> }
   4-column grid, border on all sides and between columns
   num: font-family mono, font-size 26px, color amber (#f59e0b), font-weight 600
   label: font-size 12px, color t3 (#608870), line-height 1.4
   Background: surface (#1C2E1E), border color: border (#334E3C)

4. DiagramPanel.tsx
   Props: { title: string, sub: string, liveLabel?: string, children: ReactNode }
   Container with surface background, border, border-radius 8px, padding 22px
   Header row: title (mono 12px, t1 color, bold) + liveLabel (green dot + text, mono 11px)
   Sub text: mono 11px, t3 color, below title
   children renders the SVG diagram inside a horizontally scrollable div
```

---

#### T2.1 — /log page
```
@data/tokens.ts
@data/experience.ts
@components/ui/Chip.tsx
@components/ui/Badge.tsx

Build app/log/page.tsx — the full Experience & Education page.

Layout (top to bottom):
1. Back link: "← home" linking to /
2. Section header:
   - Eyebrow: "01 / DEPLOYMENT LOG" in acc color (#5CC9A0), mono font
   - Title: "The full record" in Space Grotesk, large
   - Subtext: "Every role, every result — not summarised."

3. Experience entries — loop over EXPERIENCE array from data/experience.ts
   Each entry is a card with: surface background, border, border-radius 8px, padding 24px 28px
   Card contents:
   - Top row: date range (mono, t3), company name (bold, t1), Badge with status
     If entry.url exists, company name is a link to entry.url
   - Role line: mono 12px, t3 color
   - Bullet list: all bullets from entry.bullets[]
     Each bullet: 15px, t1 color, padding-left 18px
     Bullet marker: ">" in acc color (#5CC9A0), mono font, positioned absolute left
   - Tags row: Chip components for each tag in entry.tags[]
     Assign chip color using chipColor() helper from tokens.ts

4. Section divider: "EDUCATION & TRAINING" label

5. Education cards — loop over EDUCATION from data/experience.ts
   2-column grid, each card: surface bg, border, padding 24px
   Show: institution (bold, large), degree (t2), period (mono, t3), location (t3)
   If entry.covered exists, show a list of covered topics as sage chips

6. Section divider: "KEY ACHIEVEMENTS"
   3 metric cards in a row:
   - "35%" / "AWS cloud cost reduction at NexBell"
   - "17%" / "query execution time cut across 50+ stores"
   - "1" / "enterprise customer closed at Taply"
   Each card: surface bg, border, amber number (mono, 40px, bold), label below (t2, 13px)

All colors from tokens.ts only. No hardcoded hex values in JSX.
```

---

#### T2.2 — /work page
```
@data/tokens.ts
@data/projects.ts
@components/ui/Chip.tsx
@components/ui/Badge.tsx

Build app/work/page.tsx — all projects with filtering.

Layout:
1. Back link + section header ("02 / SYSTEMS", "Everything I've built end-to-end")

2. Filter bar — horizontal row of clickable pills
   Options: All | SaaS/Founder | Distributed | Video | AI/ML | Infra | Backend
   Active filter stored in useState. Default: "All"
   When a filter is active, only show projects where project.domain.includes(filter)
   Pill style: mono 12px, border, border-radius 999px, padding 6px 16px
   Active pill: acc background tint, acc text, acc border

3. Three tier sections (only show section if it has visible projects after filtering):

   TIER 1 — "FOUNDER PROJECTS"
   Show projects where tier === 'founder'
   Full-width stacked cards. Each card:
   - Left column (320px): placeholder SVG box with project name centered (diagram goes here later)
   - Right column: Badge (status), project name (display, 22px), tagline (mono, t3),
     problem text (lbl + text), metrics as amber metric chips, stack as Chip components,
     links row (github | demo | youtube as available)

   TIER 2 — "FEATURED BUILDS"
   Show projects where tier === 'featured'
   2-column grid, same card format as tier 1 but slightly smaller

   TIER 3 — "SHOWCASE"
   Show projects where tier === 'showcase'
   3-column grid, compact card: name, tagline, 3 stack chips, GitHub link only

4. All cards are clickable links to /work/[project.slug]

All data from PROJECTS registry. All colors from tokens.ts.
```

---

#### T2.4 — /stack page (D3 graph)
```
@data/tokens.ts
@data/stack.ts
@data/projects.ts
@data/blog.ts

Build app/stack/page.tsx — the tech dependency graph page.

This page has two parts:

PART 1 — D3 Force Graph (desktop only, hidden on mobile)
Create a client component StackGraph.tsx in components/stack/.
It renders an SVG using D3's force simulation.

Nodes: each item in STACK registry
  Node radius: 8 + (node.projects?.length ?? 0) * 3  (bigger = used in more projects)
  Node color by domain:
    backend  → stroke acc (#5CC9A0),  fill card (#223626)
    infra    → stroke amber (#f59e0b), fill card (#223626)
    data     → stroke #5888B8 (slate), fill card (#223626)
    ai/video/auth/payment → stroke #9870C0 (mauve), fill card (#223626)
    learning → stroke t3 (#608870), fill card (#223626), stroke-dasharray 4 3

Edges: connect two nodes if they share at least one project in their .projects arrays
  Compute edges at runtime from STACK data
  Edge color: border (#334E3C), stroke-width 1.2

D3 simulation: forceLink, forceManyBody strength -120, forceCenter, forceCollide radius+8

Interaction:
  On node hover: dim all other nodes to opacity 0.2, highlight connected edges in acc color
  On node click: lock the selection (stays highlighted on mouseout)
                 call setSelectedTech(node.id) — this updates the detail panel below
  On background click: clear selection

Labels: text centered in node, mono font, 10.5px, t1 color

PART 2 — Tech Detail Panel (below graph)
A React component TechDetailPanel.tsx that reads selectedTech from state.
When a tech is selected, shows:
- Tech name + domain badge
- One-line description (hardcode a short description per tech id — see below)
- "Used in N projects:" → compact project cards (name + tagline only, links to /work/slug)
- "Written about:" → compact blog cards if blog.ts has matching stack entries
- Proficiency bar for non-learning nodes (omit for learning nodes)

Mobile fallback (< 768px): hide D3 graph entirely, show an alphabetical list of all techs.
Clicking a tech in the list expands the detail panel inline.

Short descriptions per tech id to hardcode:
  django: "Python web framework — ORM, auth, admin, middleware"
  drf: "Django REST Framework — serializers, viewsets, routers"
  fastapi: "Async Python API framework — used for AI classification and SSE"
  celery: "Distributed task queue — async jobs, scheduled tasks, 3 queue setup"
  rabbitmq: "Message broker — AMQP queues for async service coordination"
  redis: "In-memory data store — caching, pub/sub, Celery broker"
  postgresql: "Primary relational database across all production systems"
  mongodb: "Document store — used for code submission results in Algocode"
  docker: "Container runtime — sibling containers, kernel-level isolation"
  aws: "Cloud infrastructure — EC2, S3, CloudFront, CodePipeline, RDS"
  nginx: "Reverse proxy and load balancer"
  ffmpeg: "Video transcoding — HLS and MPEG-DASH rendition generation"
  webrtc: "Peer-to-peer protocol — file transfer and video streaming"
  sse: "Server-Sent Events — real-time classification updates in UnThink"
  gemini: "Gemini 2.0 Flash — AI classification layer, model-agnostic design"
  jwt: "JWT + OAuth2 + TOTP 2FA — auth across Taply and NexBell systems"
  stripe: "Payment processing — subscriptions, webhooks, billing portal"
  k8s: "Kubernetes — container orchestration (actively studying, ~70%)"
  terraform: "Infrastructure as Code tool (actively studying, ~50%)"
  go: "Go language — systems programming (actively learning)"
  ebpf: "Linux kernel observability and networking (studying)"
```

---

#### T4 — Game Mode (high-level prompt, run once to set up structure)
```
Set up the Phaser 3 game mode for a Next.js 15 project.

1. Install: pnpm add phaser
2. Create game/config.ts — Phaser.Game config:
   type: Phaser.AUTO, width: window.innerWidth, height: window.innerHeight,
   backgroundColor: '#172318', pixelArt: true,
   physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }
   scenes: [PreloadScene, WorldScene, UIScene]

3. Create game/index.tsx — React wrapper component
   'use client' — this is client-only
   useEffect to mount Phaser game on a div ref
   Clean up game.destroy(true) on unmount
   Renders a div that covers full viewport

4. Create game/EventBridge.ts — singleton event emitter
   import EventEmitter from 'eventemitter3'
   export const bridge = new EventEmitter()
   Events: OPEN_OVERLAY, CLOSE_OVERLAY, GAME_RESUME, SHOW_HINT, HIDE_HINT

5. Create app/game/page.tsx
   'use client'
   Import game/index.tsx with dynamic import, ssr: false
   Show a loading screen (terminal style, dark green) while Phaser loads
   Show a mode selector first (see Section 5.6 of master plan for design)
   Once user clicks "Game Mode", mount the Phaser component

6. Create stub files (empty classes) for:
   game/scenes/PreloadScene.ts
   game/scenes/WorldScene.ts
   game/scenes/UIScene.ts
   game/entities/Player.ts
   game/entities/Building.ts
   game/entities/Villain.ts

I'll fill in the implementation scene by scene after this setup is done.
```

---

### Phase Task Tables

#### Phase 1 — Foundation (2–3 days)

| ID | Task | Prompt to use |
|---|---|---|
| T1.1 | Next.js 15 init | T1.1 prompt above |
| T1.2 | Design tokens | T1.2 prompt above |
| T1.3 | Data registries | T1.3 prompt above |
| T1.4 | Root layout | Ask Cursor: "Build app/layout.tsx. Load Space Grotesk, Inter, JetBrains Mono via next/font/google. Set background #172318 on body. Set metadata: title 'Mahboob Alam', description 'Co-Founder & Backend Engineer'." |
| T1.5 | UI components | T1.5 prompt above |
| T1.6 | Navbar + Footer | Ask Cursor: "Build Navbar.tsx: sticky, bg rgba(23,35,24,0.88) blur, height 62px. Logo: 'mahboob.engineer' in mono with live green dot. Nav links: log/work/stack/writing/contact. Mode toggle pill: flat (active) + game (dim). All from tokens.ts." |
| T1.7 | Homepage | Ask Cursor: "@portfolio-flat-mockup.html Migrate this HTML file into Next.js components. Each section becomes a component in components/sections/. Replace all hardcoded data with imports from data/*.ts." |

#### Phase 2 — Inner Pages (3–4 days)

| ID | Task | Prompt to use |
|---|---|---|
| T2.1 | /log | T2.1 prompt above |
| T2.2 | /work grid | T2.2 prompt above |
| T2.3 | /work/[slug] | Ask Cursor: "@data/projects.ts Build app/work/[slug]/page.tsx. generateStaticParams() returns all project slugs. Page reads matching project from PROJECTS. Layout: back link, status badge, name, tagline, two-column hero (text left, SVG diagram right — import from components/diagrams/[slug]-diagram.tsx), metrics row, 'THE BUILD' prose section, stack breakdown, links row." |
| T2.4 | /stack | T2.4 prompt above |
| T2.5 | /contact | Ask Cursor: "Build app/contact/page.tsx. Two-column layout. Left: terminal-style contact form (same aesthetic as landing — dark code-bg, terminal bar with dots, mono font). Right sidebar: availability status card, direct social links (GitHub/LinkedIn/Medium/Taply/email), FAQ with 3 Q&A pairs. All links from Section 0.2 of the master plan." |

#### Phase 3 — Blog/CMS (2–3 days)

| ID | Task | Notes |
|---|---|---|
| T3.1 | Keystatic setup | `pnpm add @keystatic/core @keystatic/next` then run `keystatic init` |
| T3.2 | /writing list | Ask Cursor with the Section 2.5 layout description |
| T3.3 | /writing/[slug] | Ask Cursor: "Build MDX post renderer with Shiki syntax highlighting and auto-generated table of contents from headings" |
| T3.4 | Medium RSS | Ask Cursor: "Build lib/medium-rss.ts that fetches https://imehboob.medium.com/feed using rss-parser, maps items to BlogPost type, called at build time in /writing page.tsx as an async Server Component" |
| T3.5 | Seed posts | Write 3 MDX files manually in content/posts/. Keystatic will manage them after that. |

#### Phase 4 — Game Mode (5–7 days)

| ID | Task | Notes |
|---|---|---|
| T4.0 | Structure setup | T4 prompt above (run first) |
| T4.1 | Generate assets | Midjourney prompt in Section 5.5. Download, slice into tilesets. |
| T4.2 | Tiled map | Open Tiled Editor, create 60×50 map, draw districts per Section 5.2 layout |
| T4.3 | PreloadScene | Ask Cursor: "Build PreloadScene.ts that loads: tileset PNG, character spritesheet (32×48, 4 directions × 4 frames), building interaction sound. Shows a progress bar while loading." |
| T4.4 | WorldScene | Ask Cursor: "Build WorldScene.ts. Load backend-city.json tilemap. Create player at spawn point. Add arcade physics. Loop over 'Buildings' object layer from Tiled, create invisible interaction zones. On E key press inside zone: bridge.emit('OPEN_OVERLAY', { slug, type }). Camera follows player with lerp 0.1." |
| T4.5 | Player movement | Ask Cursor: "Build Player.ts entity. 4-directional WASD/arrow movement at 160px/sec. Sprite with walk animation per direction (4 frames each). Stop animation when velocity is zero." |
| T4.6 | React overlays | Ask Cursor: "In game/index.tsx, listen to bridge event OPEN_OVERLAY. When fired: pause Phaser (game.scene.pause), render the matching overlay component over the canvas. Overlays in game/scenes/overlays/: one .tsx per project slug. Each overlay shows the project from PROJECTS matching the slug. Close on ESC or close button → bridge.emit('CLOSE_OVERLAY'), Phaser resumes." |
| T4.7 | Villain system | Ask Cursor: "Build Villain.ts entity in Phaser. Place 3 villains on the map at their positions. On player collision: pause game, emit OPEN_OVERLAY with type='villain' and villain id. Build VillainOverlay.tsx: shows villain name, learning area, progress bar (HP style), current training resources, and close button." |
| T4.8 | HUD (UIScene) | Ask Cursor: "Build UIScene.ts that runs in parallel with WorldScene. Shows: minimap (60×50 grid, visited=bright green dot, player=acc dot) bottom-left, district name top-right updates as player moves zones, '[E] Enter building' hint bottom-center when player is near a zone." |

#### Phase 5 — Polish + Deploy (2 days)

| ID | Task | Notes |
|---|---|---|
| T5.1 | SEO | Ask Cursor: "Add generateMetadata() to every page. Root metadata: title template '%s — Mahboob Alam'. OG image via @vercel/og with the dark green background and name." |
| T5.2 | Animations | Ask Cursor: "Add Framer Motion fadeInUp to all section entries using IntersectionObserver. AnimatePresence on route transitions." |
| T5.3 | Mobile | Ask Cursor: "Audit all pages for mobile. /stack: hide D3 graph below 768px, show tech list. /game: show 'Game mode requires desktop' message with link to /." |
| T5.4 | Deploy | Push to GitHub → import repo in Vercel → set custom domain mahboob.engineer → done |

---

## 7. PROMPT PATTERNS — RULES FOR EVERY PROMPT

**Before sending any prompt to Cursor, always add `@filename` references** for every file the AI needs to read. Without these, Cursor guesses and gets things wrong.

Mandatory references to include in most prompts:
```
@data/tokens.ts        ← always include this
@data/projects.ts      ← for any page showing projects
@data/experience.ts    ← for /log page
@data/stack.ts         ← for /stack page
@data/blog.ts          ← for /writing or /stack page
```

**When something looks wrong**, describe it concisely in the same chat thread:
```
The chip background is white — it should be #122018 (sage dark from tokens.ts kwDark[0].bg)
```

**When the AI writes something you didn't ask for**, tell it:
```
Remove the [thing]. I didn't ask for that. Keep everything else the same.
```

**Good prompt structure (fill in the blanks):**
```
@data/tokens.ts
@[any other relevant file]

Build [component/page name] in [file path].

Requirements:
- [requirement 1]
- [requirement 2]
- [requirement 3]

Rules:
- All colors from tokens.ts only. No hardcoded hex values.
- All content from data/*.ts registries. No hardcoded strings.
- [any other constraint specific to this component]
```
