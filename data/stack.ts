/**
 * data/stack.ts
 *
 * Tech-by-tech registry — the source of truth for:
 *   - /stack force graph (nodes from STACK, edges auto-computed below)
 *   - /writing related-stack sidebar
 *   - landing skill-graph section (subset)
 *   - /work/[slug] related-stack chips
 *
 * Source: portfolio-master-doc.md §0.7 — copied verbatim.
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types
   =========================================================================== */

/**
 * Domain bucket used for graph coloring and chip routing.
 * Matches the kwDark palette buckets exactly (master §0.3).
 */
export type StackDomain =
  | "backend"
  | "infra"
  | "async"
  | "data"
  | "ai"
  | "video"
  | "auth"
  | "payment"
  | "learning";

/** A single tech entry. */
export interface StackItem {
  /** Stable id — used by component keys + lookup maps. */
  id: string;
  /** Display name. */
  name: string;
  /** Which domain bucket this tech belongs to. */
  domain: StackDomain;
  /** Project slugs where this tech is used (cross-referenced with PROJECTS). */
  projects: string[];
  /** Blog post slugs that reference this tech (cross-referenced with BLOG_POSTS). */
  blogs?: string[];
  /**
   * Short first-person note that the dynamic RAG terminal surfaces
   * alongside the entry. Used for techs where a one-line qualifier
   * matters more than a `projects` cross-reference list — typically
   * growth-area items or production techs that benefit from naming *where*
   * they were used. Phase 34.
   */
  depthNotes?: string;
}

/** A graph edge between two techs — derived, not stored. */
export interface StackEdge {
  /** Source tech id. */
  source: string;
  /** Target tech id. */
  target: string;
  /** Number of shared projects (edge weight in the force graph). */
  weight: number;
}

/* ===========================================================================
   STACK registry
   Source: master §0.7 — copied verbatim.
   =========================================================================== */

export const STACK: StackItem[] = [
  // Backend
  {
    id: "django",
    name: "Django",
    domain: "backend",
    projects: [
      "taply",
      "algocode",
      "movio",
      "cutetube",
      "drishti-ai",
      "airpass",
      "imgtwist",
    ],
    blogs: ["building-leetcode-online-judge"],
    depthNotes:
      "Primary backend framework. Eleven section types in Taply, three-service split in Algocode, ten-step Celery pipeline in Movio, Django Channels for AirPass. I reach for Django when the data model is relational and the read path needs a cache.",
  },
  {
    id: "saas",
    name: "SaaS",
    domain: "backend",
    projects: ["unthink", "taply"],
    depthNotes:
      "End-to-end production SaaS engineering: multi-tenancy, subscription billing, asynchronous queue architectures, and high-performance caching for UnThink and Taply.",
  },
  {
    id: "drf",
    name: "DRF",
    domain: "backend",
    projects: ["unthink", "taply", "algocode", "movio", "cutetube", "airpass"],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    domain: "backend",
    projects: ["unthink", "drishti-ai", "datalineage-doctor"],
    depthNotes:
      "High-concurrency async streaming layer. UnThink uses FastAPI for Server-Sent Events (SSE) token chunk dispatch from dual-AI models directly to the React web app. Datalineage Doctor uses it for webhook ingestion.",
  },
  {
    id: "celery",
    name: "Celery",
    domain: "backend",
    projects: ["unthink", "taply", "movio", "cutetube", "imgtwist"],
    depthNotes:
      "Distributed task execution backbone. UnThink routes jobs across 3 priority queues (ai_urgent for streaming summaries, default for entities, bulk for deep indexing). Movio runs a 10-step transcoding pipeline.",
  },
  {
    id: "websocket",
    name: "WebSocket",
    domain: "backend",
    projects: ["airpass", "drishti-ai"],
  },
  {
    id: "sse",
    name: "SSE",
    domain: "backend",
    projects: ["unthink"],
    depthNotes:
      "Server-Sent Events for real-time token streaming and progressive taxonomic classification in UnThink, connecting FastAPI async generators to the React dashboard.",
  },
  {
    id: "webrtc",
    name: "WebRTC",
    domain: "backend",
    projects: ["airpass", "drishti-ai"],
    depthNotes:
      "DrishtiAI's eye-screening pipeline runs over Stream SDK WebRTC; AirPass is P2P file transfer over a WebRTC data channel. Both projects share the same Django Channels signaling shape.",
  },
  /* Phase 12 (T12.5): added so resolveStackSlug() picks up
     "Python" → python from the SRM MCA curriculum chips. */
  {
    id: "python",
    name: "Python",
    domain: "backend",
    projects: [],
    depthNotes:
      "Production-grade. Primary language for every backend project on this portfolio.",
  },
  {
    id: "go",
    name: "Go",
    domain: "backend",
    projects: ["safebox"],
    depthNotes:
      "Core language for systems programming and Linux isolation tooling. Safebox is written in Go 1.24 with direct syscall orchestration, user namespaces, OverlayFS management, and Landlock LSM integration.",
  },

  // Infra
  {
    id: "docker",
    name: "Docker",
    domain: "infra",
    projects: [
      "unthink",
      "algocode",
      "movio",
      "load-balancer",
      "pulumi-infra",
    ],
  },
  {
    id: "aws",
    name: "AWS",
    domain: "infra",
    projects: ["unthink", "taply", "algocode", "movio", "pulumi-infra"],
  },
  {
    id: "nginx",
    name: "Nginx",
    domain: "infra",
    projects: ["unthink", "load-balancer", "pulumi-infra"],
  },
  /* Phase 12 (T12.5): added so resolveStackSlug() picks up
     "Linux networking" → linux from the Poridhi covered chips.
     `nginx` already lives in this domain; linux sits beside it. */
  {
    id: "linux",
    name: "Linux",
    domain: "infra",
    projects: ["algocode", "safebox"],
    depthNotes:
      "Comfortable on the command line. Namespaces, cgroups, seccomp show up in Algocode and Safebox; the Linux Networking series on Medium is the public version of that muscle.",
  },
  {
    id: "pulumi",
    name: "Pulumi",
    domain: "infra",
    projects: ["pulumi-infra"],
  },
  {
    id: "cicd",
    name: "CI/CD",
    domain: "infra",
    projects: ["taply"],
  },
  {
    id: "open-source",
    name: "Open Source",
    domain: "infra",
    projects: [
      "safebox",
      "algocode",
      "movio",
      "drishti-ai",
      "datalineage-doctor",
    ],
    depthNotes:
      "Publicly available open source tools, distributed systems, and libraries published on GitHub under permissive licensing.",
  },

  // Messaging
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    domain: "async",
    projects: ["algocode", "movio", "drishti-ai"],
    blogs: ["message-queue-101"],
    depthNotes:
      "Primary async backbone for microservice splits. Algocode's three services communicate only through RabbitMQ, Movio's transcoder workers consume from the upload queue, and DrishtiAI's CV pipeline queues frames to the inference service.",
  },

  // Data
  {
    id: "postgresql",
    name: "PostgreSQL",
    domain: "data",
    projects: ["taply", "algocode", "unthink", "drishti-ai", "imgtwist"],
    depthNotes:
      "Primary OLTP store. Comfortable with composite indexes, query plan reading, lazy-load discipline, and JSONB for schemaless data (Algocode notes that swap is next).",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    domain: "data",
    projects: ["algocode", "movio"],
  },
  {
    id: "redis",
    name: "Redis",
    domain: "data",
    projects: ["taply", "algocode", "movio", "cutetube", "unthink", "imgtwist"],
    depthNotes:
      "Primary in-memory cache, Celery broker, and atomic counter engine. Taply's sub-80ms edge reads and Redis HINCRBY tap counters hit Redis first; UnThink uses Redis for priority task brokering and epoch-based cache invalidation.",
  },

  // AI / Special
  {
    id: "gemini",
    name: "Gemini",
    domain: "ai",
    projects: ["unthink"],
    depthNotes:
      "Multimodal AI reasoning engine in UnThink's dual-AI taxonomy router, with automatic sub-500ms fallback routing to Fireworks AI on rate limits or upstream timeouts.",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    domain: "ai",
    projects: ["unthink"],
    depthNotes:
      "Multi-model LLM gateway in UnThink with latency-aware failover between Gemini 1.5 Flash and Fireworks Llama-3.",
  },
  {
    id: "chrome-mv3",
    name: "Chromium MV3",
    domain: "ai",
    projects: ["unthink"],
    depthNotes:
      "Manifest V3 browser extension architecture with background service workers, context menu actions, and in-page DOM extraction via Trafilatura.",
  },
  {
    id: "opencv",
    name: "OpenCV",
    domain: "ai",
    projects: ["drishti-ai"],
  },
  {
    id: "ffmpeg",
    name: "FFmpeg",
    domain: "video",
    projects: ["movio", "cutetube"],
    depthNotes:
      "Movio's transcoder workers produce HLS and DASH renditions. CuteTube's monolith did the same in a single Celery flow before the microservice split. Known limitation: ffmpeg can't inject subtitle info into manifest.mpd, so Movio has Task 07 for that.",
  },

  // Auth
  {
    id: "jwt",
    name: "JWT/OAuth2",
    domain: "auth",
    projects: ["taply", "algocode", "nexbell"],
    depthNotes:
      "Taply uses Django-Q2 for token rotation and JWT for session restore. NexBell's full rewrite from session cookies to OAuth2/JWT ran old and new in parallel for a month. Algocode uses JWT between Auth and Code Manager services.",
  },
  {
    id: "stripe",
    name: "Stripe",
    domain: "payment",
    projects: ["unthink"],
  },
  /* Phase 21: bKash was the dominant Bangladesh mobile-wallet
     gateway at NexBell (the multi-vendor marketplace serving
     50+ independent stores). I integrated the refund and
     disbursement flows against their REST API in late 2024.
     The "nexbell" project slug is a reference string — it ties
     the tech back to the company context even though no
     /work/<nexbell> case study exists today. Will render in
     the /stack payment category next to Stripe. */
  {
    id: "bkash",
    name: "bKash",
    domain: "payment",
    projects: ["nexbell"],
  },
];

/* ===========================================================================
   Lookup helpers
   =========================================================================== */

/** O(1) id → tech lookup. */
export const STACK_BY_ID: Readonly<Record<string, StackItem>> = Object.freeze(
  STACK.reduce<Record<string, StackItem>>((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {}),
);

/** All items in a single domain. */
export function stackByDomain(domain: StackDomain): StackItem[] {
  return STACK.filter((t) => t.domain === domain);
}

/** Learning-domain items (rendered with dashed border on the force graph). */
export const LEARNING_STACK: StackItem[] = stackByDomain("learning");

/** Production items — everything not in the "learning" bucket. */
export const PRODUCTION_STACK: StackItem[] = STACK.filter(
  (t) => t.domain !== "learning",
);

/* ===========================================================================
   Edge computation — used by /stack force graph
   Two techs share an edge if they have at least one project in common.
   Edge weight = number of shared projects (heavier = thicker line).
   =========================================================================== */

/** O(n²) edge computation. Returns only unique edges (a-b, not b-a). */
export function computeStackEdges(): StackEdge[] {
  const edges: StackEdge[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < STACK.length; i++) {
    for (let j = i + 1; j < STACK.length; j++) {
      const a = STACK[i];
      const b = STACK[j];
      const shared = a.projects.filter((p) => b.projects.includes(p));
      if (shared.length > 0) {
        const key = `${a.id}|${b.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ source: a.id, target: b.id, weight: shared.length });
        }
      }
    }
  }

  // Heavier edges first so the force graph renderer can pick a stable order.
  return edges.sort((x, y) => y.weight - x.weight);
}

/** Eagerly pre-computed edge list — kept cached because the registry is static. */
export const STACK_EDGES: readonly StackEdge[] = Object.freeze(
  computeStackEdges(),
);

/** Reverse lookup: project slug → techs used by that project. */
export function techsByProject(slug: string): StackItem[] {
  return STACK.filter((t) => t.projects.includes(slug));
}