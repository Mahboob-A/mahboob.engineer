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
  },

  // Data
  {
    id: "postgresql",
    name: "PostgreSQL",
    domain: "data",
    projects: ["taply", "algocode", "unthink", "drishti-ai", "imgtwist"],
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
  },

  // Auth
  {
    id: "jwt",
    name: "JWT/OAuth2",
    domain: "auth",
    projects: ["taply", "algocode", "nexbell"],
  },
  {
    id: "stripe",
    name: "Stripe",
    domain: "payment",
    projects: ["taply"],
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
  },
  {
    id: "terraform",
    name: "Terraform",
    domain: "learning",
    projects: [],
    depth: 50,
  },
  { id: "go", name: "Go", domain: "learning", projects: [], depth: 30 },
  { id: "ebpf", name: "eBPF", domain: "learning", projects: [], depth: 40 },
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