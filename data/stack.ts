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
  /** Self-rated proficiency (0–100). Only set on `learning` domain items. */
  depth?: number;
  /**
   * Short first-person depth note that the dynamic RAG terminal surfaces
   * alongside the `depth` marker. Used for techs where a one-line qualifier
   * matters more than a `projects` cross-reference list — typically
   * learning-area items or production techs that benefit from naming *where*
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
    id: "drf",
    name: "DRF",
    domain: "backend",
    projects: ["taply", "algocode", "movio", "cutetube", "airpass"],
  },
  {
    id: "fastapi",
    name: "FastAPI",
    domain: "backend",
    projects: ["unthink", "drishti-ai", "datalineage-doctor"],
  },
  {
    id: "celery",
    name: "Celery",
    domain: "backend",
    projects: ["taply", "movio", "cutetube", "imgtwist", "unthink"],
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
     "Python" → python from the SRM MCA curriculum chips. Not
     actively deployed in production projects today; learning
     depth marker makes it visible on the force graph as a
     self-rated tech. */
  {
    id: "python",
    name: "Python",
    domain: "backend",
    projects: [],
    depth: 90,
    depthNotes:
      "Production-grade. Primary language for every backend project on this portfolio.",
  },

  // Infra
  {
    id: "docker",
    name: "Docker",
    domain: "infra",
    projects: [
      "algocode",
      "movio",
      "unthink",
      "load-balancer",
      "pulumi-infra",
    ],
  },
  {
    id: "aws",
    name: "AWS",
    domain: "infra",
    projects: ["taply", "algocode", "movio", "pulumi-infra"],
  },
  {
    id: "nginx",
    name: "Nginx",
    domain: "infra",
    projects: ["load-balancer", "pulumi-infra"],
  },
  /* Phase 12 (T12.5): added so resolveStackSlug() picks up
     "Linux networking" → linux from the Poridhi covered chips.
     `nginx` already lives in this domain; linux sits beside it. */
  {
    id: "linux",
    name: "Linux",
    domain: "infra",
    projects: [],
    depth: 85,
    depthNotes:
      "Comfortable on the command line. Namespaces, cgroups, seccomp show up in Algocode; the Linux Networking series on Medium is the public version of that muscle.",
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
  /* Phase 12 (T12.5): added so resolveStackSlug() picks up
     "Kafka internals" → kafka from the Poridhi covered chips.
     Not actively deployed in production projects today; depth
     marker makes it visible on the force graph as a self-rated
     tech. */
  {
    id: "kafka",
    name: "Kafka",
    domain: "async",
    projects: [],
    depth: 55,
    depthNotes:
      "Covered in Poridhi's backend curriculum; not in production projects yet. Confident with the mental model, haven't shipped a real consumer/producer pair at scale.",
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
      "Primary cache + Celery broker. Taply's <100ms profile reads hit Redis first; Movio's segment counter is Redis; UnThink's classify pipeline uses Redis pub/sub. The Redis HA series on Medium is the public version of how I think about replication and sentinel.",
  },

  // AI / Special
  {
    id: "gemini",
    name: "Gemini",
    domain: "ai",
    projects: ["unthink"],
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
    projects: ["taply"],
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

  // Learning
  /* Phase 12 (T12.5): id renamed `k8s` → `kubernetes` so that
     resolveStackSlug() matches "Kubernetes" → `kubernetes` (the
     bidirectional substring check failed on the old `k8s` id
     because "kubernetes".includes("k8s") is false). The display
     name was already "Kubernetes"; only the lookup id changed.
     No STACK_BY_ID["k8s"] callers exist in the codebase (verified
     via grep) so this is a clean rename. */
  {
    id: "kubernetes",
    name: "Kubernetes",
    domain: "learning",
    projects: [],
    depth: 70,
    depthNotes:
      "Comfortable with the API surface and the resource model. Haven't owned a production cluster day-to-day. The Pulumi AWS Infra project is the closest equivalent to a k8s deployment, and it stays on EC2 / ASG.",
  },
  {
    id: "terraform",
    name: "Terraform",
    domain: "learning",
    projects: [],
    depth: 50,
    depthNotes:
      "Familiar with the language and the state model. I prefer Pulumi because it lets me write real Python and unit-test the infra code. Terraform is on the learning list, not the production list.",
  },
  { id: "go", name: "Go", domain: "learning", projects: [], depth: 30, depthNotes:
      "Honest growth area. Algocode uses Linux namespaces, cgroups, and seccomp in production-shaped C++ code — that's the closest my work gets to Go-style infra. I'd learn fast on a real Go service but I'm not a Go engineer today.",
  },
  { id: "ebpf", name: "eBPF", domain: "learning", projects: [], depth: 40, depthNotes:
      "Covered in Poridhi's backend curriculum. I understand the model (kernel hooks, maps, programs) but haven't shipped anything that uses eBPF in production. The Linux Networking series on Medium touches the adjacent kernel primitives.",
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