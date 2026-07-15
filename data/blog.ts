/**
 * data/blog.ts
 *
 * Blog post registry. The `BLOG_POSTS` array below has two purposes:
 *
 *   1. The canonical **Medium cross-post** registry — these 14 entries
 *      drive the static fallback when the Medium RSS feed can't be
 *      fetched, and they appear in the /writing list at build time
 *      alongside the build-time RSS result.
 *
 *   2. A registration record for **native MDX posts** — entries with
 *      `source: "native"` and `url: "/writing/<slug>"` here mirror the
 *      MDX files committed under content/posts/ (managed by Keystatic,
 *      Phase 5 T5.1+). The same slug is rendered via app/writing/[slug].
 *
 * Source: portfolio-master-doc.md §0.6 — extended in T5.0 with all
 *         14 Medium posts from the user-provided catalog (Linux
 *         Networking ×4, PostgreSQL ×3, Redis ×2, AWS Networking 101,
 *         Algocode, Message Queue 101, DrishtiAI).
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
   Types
   =========================================================================== */

/** Top-level category — drives the 8-chip filter on /writing. */
export type BlogCategory =
  | "distributed"
  | "linux"
  | "docker"
  | "video"
  | "ai"
  | "platform"
  | "career";

/** All categories with display labels — used by BlogFilter. */
export const CATEGORIES: ReadonlyArray<{ id: BlogCategory; label: string }> = [
  { id: "distributed", label: "Distributed Systems" },
  { id: "linux", label: "Linux / Networking" },
  { id: "docker", label: "Docker / Containers" },
  { id: "video", label: "Video" },
  { id: "ai", label: "AI / ML" },
  { id: "platform", label: "Platform" },
  { id: "career", label: "Career" },
];

/** Where the post lives. */
export type BlogSource = "native" | "medium";

/** A single blog post entry — native OR medium. */
export interface BlogPostItem {
  /** URL slug, used as the route param /writing/[slug]. */
  slug: string;
  /** Display title. */
  title: string;
  /** Where the post is hosted. */
  source: BlogSource;
  /**
   * Canonical URL for the post. Native posts use a relative path
   * (e.g. "/writing/..."); Medium posts use the full URL.
   */
  url: string;
  /** Tags shown on the post card. */
  tags: string[];
  /** Estimated read time in minutes. */
  readMin: number;
  /** Top-level category for the /writing filter chips. */
  category: BlogCategory;
  /** Project slugs this post references — used for "related projects" sidebar. */
  projects?: string[];
  /** Tech ids this post references — used for "related stack" sidebar. */
  stack?: string[];
  /** Series name if this post is part of a series. Optional. */
  series?: string;
  /** Part number within the series. Optional. */
  part?: number;
  /** Short excerpt shown on the post card. */
  excerpt?: string;
  /** Publication date in ISO 8601. Optional for native drafts. */
  publishedAt?: string;
}

/* ===========================================================================
   BLOG_POSTS registry
   14 Medium cross-posts + 0 native (T5.6 seeds 3 native posts).
   Order: newest at top where publishedAt is known; older / undated
   entries follow in their natural series order.
   =========================================================================== */

export const BLOG_POSTS: BlogPostItem[] = [
  /* ─── Linux Networking series (4 parts) ─────────────────────────── */
  {
    slug: "linux-networking-part-1",
    title:
      "Linux Networking for Backend Engineers — Part 1: Namespaces & Virtual Interfaces",
    source: "medium",
    url: "https://imehboob.medium.com/linux-networking-your-hands-on-guide-to-understand-how-docker-works-part-1-fbf2b6cef06f",
    tags: ["linux", "networking", "docker", "internals"],
    readMin: 10,
    category: "linux",
    series: "Linux Networking",
    part: 1,
    projects: ["unthink"],
    stack: ["Linux", "Docker"],
    excerpt:
      "Starting a series on the kernel primitives that make container networking work — namespaces, veth pairs, and bridges, explained from the ground up.",
  },
  {
    slug: "linux-networking-part-2",
    title:
      "Linux Networking — Part 2: Communication From Namespace to Host Through Virtual Ethernet",
    source: "medium",
    url: "https://imehboob.medium.com/linux-networking-communication-from-namespace-to-host-through-virtual-ethernet-part-2-a661521c9b5d",
    tags: ["linux", "networking", "namespaces", "veth"],
    readMin: 9,
    category: "linux",
    series: "Linux Networking",
    part: 2,
    projects: ["unthink"],
    stack: ["Linux"],
    excerpt:
      "How namespaces actually talk to each other — virtual ethernet pairs, packet flow, and why Docker's bridge networking works the way it does.",
  },
  {
    slug: "linux-networking-part-3",
    title:
      "Linux Networking — Part 3: Bridge and Default Gateway for One-Way Outbound Communication",
    source: "medium",
    url: "https://imehboob.medium.com/linux-networking-bridge-and-default-gateway-for-one-way-outbound-communication-part-3-32e3ba1c9a84",
    tags: ["linux", "networking", "bridge", "gateway"],
    readMin: 8,
    category: "linux",
    series: "Linux Networking",
    part: 3,
    projects: ["unthink"],
    stack: ["Linux"],
    excerpt:
      "Linux bridges, default gateways, and the one-way outbound path every container uses when it reaches for the internet.",
  },
  {
    slug: "linux-networking-part-4",
    title:
      "Linux Networking — Part 4: SNAT and Packet Forwarding to Connect to the Internet From a Namespace",
    source: "medium",
    url: "https://imehboob.medium.com/linux-networking-snat-and-packet-forwarding-to-connect-to-internet-from-namespace-part-4-558a505794bd",
    tags: ["linux", "networking", "nat", "iptables"],
    readMin: 9,
    category: "linux",
    series: "Linux Networking",
    part: 4,
    projects: ["unthink"],
    stack: ["Linux"],
    excerpt:
      "The last mile — how source NAT (MASQUERADE) and packet forwarding complete the loop so a namespace can hit the public internet.",
  },

  /* ─── PostgreSQL series (3 parts) ───────────────────────────────── */
  {
    slug: "postgresql-part-1",
    title:
      "PostgreSQL Part 1: Install, Setup, Creating Tables and CRUD Operations",
    source: "medium",
    url: "https://medium.com/@imehboob/install-setup-postgresql-creating-tables-and-crud-operations-part-1-5fe1bed693d2",
    tags: ["postgresql", "database", "sql", "crud"],
    readMin: 7,
    category: "platform",
    series: "PostgreSQL",
    part: 1,
    projects: ["taply", "algocode"],
    stack: ["PostgreSQL"],
    excerpt:
      "Getting PostgreSQL running, the right way to think about tables, and CRUD that holds up when the schema is no longer a toy.",
  },
  {
    slug: "postgresql-part-2",
    title:
      "SQL Joins in PostgreSQL: Query Across Multiple Tables and Actually Understand What You Are Asking",
    source: "medium",
    url: "https://medium.com/@imehboob/sql-joins-in-postgresql-query-across-multiple-tables-and-actually-understand-what-you-are-asking-6b4dec98cd5c",
    tags: ["postgresql", "sql", "joins"],
    readMin: 8,
    category: "platform",
    series: "PostgreSQL",
    part: 2,
    projects: ["taply", "algocode"],
    stack: ["PostgreSQL"],
    excerpt:
      "INNER, LEFT, RIGHT, FULL — and what each one actually means before the planner rewrites your query into something different.",
  },
  {
    slug: "postgresql-part-3",
    title:
      "Aggregations & Grouping in SQL: The Queries Behind Every Dashboard and Report",
    source: "medium",
    url: "https://medium.com/@imehboob/aggregations-grouping-in-sql-the-queries-behind-every-dashboard-and-report-part-3-9bd1ce9bd6a0",
    tags: ["postgresql", "sql", "aggregations"],
    readMin: 8,
    category: "platform",
    series: "PostgreSQL",
    part: 3,
    projects: ["taply", "algocode"],
    stack: ["PostgreSQL"],
    excerpt:
      "GROUP BY, HAVING, and the mental model that makes aggregation queries feel obvious instead of guessing at syntax.",
  },

  /* ─── Redis series (2 parts) ────────────────────────────────────── */
  {
    slug: "redis-part-1",
    title:
      "Your Easy Guide to Design Highly Available Systems With Redis — Part 1",
    source: "medium",
    url: "https://medium.com/@imehboob/your-easy-guide-to-design-highly-available-system-with-redis-part-1-812d3baec45b",
    tags: ["redis", "high-availability", "cache", "distributed"],
    readMin: 8,
    category: "distributed",
    series: "Redis HA",
    part: 1,
    projects: ["taply", "algocode", "unthink"],
    stack: ["Redis"],
    excerpt:
      "Replication, sentinels, and the failure modes you actually have to design for when Redis is on the request path.",
  },
  {
    slug: "redis-part-2",
    title:
      "Step-by-Step Guide to Deploy Redis Cluster in AWS to Achieve High Availability — Part 2",
    source: "medium",
    url: "https://medium.com/@imehboob/step-by-step-guide-to-deploy-redis-cluster-in-aws-to-achieve-high-availability-part-2-93d96afdb2b4",
    tags: ["redis", "aws", "cluster", "high-availability"],
    readMin: 10,
    category: "distributed",
    series: "Redis HA",
    part: 2,
    projects: ["taply", "unthink"],
    stack: ["Redis", "AWS"],
    excerpt:
      "From a single EC2 to a fault-tolerant Redis Cluster — the real-world glue that turns theory into a prod deployment.",
  },

  /* ─── Standalone cross-posts ────────────────────────────────────── */
  {
    slug: "aws-networking-101",
    title:
      "AWS Networking 101: By Deploying a Bastion Server (For Dummies)",
    source: "medium",
    url: "https://medium.com/@imehboob/aws-networking-101-by-deploying-a-bastion-server-for-dummies-5458cd3a97b6",
    tags: ["aws", "networking", "bastion", "vpc"],
    readMin: 9,
    category: "platform",
    projects: ["pulumi-infra"],
    stack: ["AWS", "Nginx"],
    excerpt:
      "A practical first step into AWS networking — VPCs, subnets, security groups, and the bastion pattern explained hands-on.",
  },
  {
    slug: "building-leetcode-online-judge",
    title:
      "My Experience Building a LeetCode-like Online Judge (and How You Can)",
    source: "medium",
    url: "https://imehboob.medium.com/my-experience-building-a-leetcode-like-online-judge-and-how-you-can-build-one-7e05e031455d",
    tags: ["microservices", "docker", "rabbitmq", "distributed-systems"],
    readMin: 8,
    category: "distributed",
    projects: ["algocode"],
    stack: ["Django", "RabbitMQ", "Docker"],
    excerpt:
      "The full story behind Algocode — microservice boundaries, RabbitMQ coordination, and running untrusted code safely inside sibling Docker containers.",
  },
  {
    slug: "message-queue-101",
    title:
      "Message Queue 101: Your Ultimate Guide to Understanding Message Queues",
    source: "medium",
    url: "https://imehboob.medium.com/message-queue-101-your-ultimate-guide-to-understand-message-queue-b2256961ab01",
    tags: ["rabbitmq", "distributed-systems", "async"],
    readMin: 6,
    category: "distributed",
    projects: ["algocode"],
    stack: ["RabbitMQ"],
    excerpt:
      "RabbitMQ from first principles — why Algocode needed a message queue, how exchanges and queues actually work, and the mental model that made it click.",
  },
  {
    slug: "drishti-ai-eye-screening-agent",
    title:
      "DrishtiAI: Building an AI Eye-Screening Agent for Rural India in 7 Days",
    source: "medium",
    url: "https://imehboob.medium.com/drishti-ai-building-an-ai-eye-screening-agent-for-rural-india-in-7-days-2fc3d4ccc1fe",
    tags: ["ai", "computer-vision", "webrtc", "mobile"],
    readMin: 10,
    category: "ai",
    projects: ["drishti-ai"],
    stack: ["Django", "FastAPI", "WebRTC", "Gemini"],
    excerpt:
      "Building a real-time AI eye-screening pipeline for rural India over WebRTC — agent architecture, queue design, and the constraints that shaped every decision.",
  },
];

/* ===========================================================================
   Lookup helpers
   =========================================================================== */

/** O(1) slug → post lookup. */
export const BLOG_POSTS_BY_SLUG: Readonly<Record<string, BlogPostItem>> =
  Object.freeze(
    BLOG_POSTS.reduce<Record<string, BlogPostItem>>((acc, p) => {
      acc[p.slug] = p;
      return acc;
    }, {}),
  );

/** All posts that are part of a named series, ordered by `part` ascending. */
export function postsInSeries(seriesName: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.series === seriesName).sort(
    (a, b) => (a.part ?? 0) - (b.part ?? 0),
  );
}

/** All posts that reference a given project slug. */
export function postsByProject(projectSlug: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.projects?.includes(projectSlug));
}

/** All posts that reference a given tech id (matches `stack[]`). */
export function postsByStack(stackId: string): BlogPostItem[] {
  return BLOG_POSTS.filter((p) =>
    p.stack?.some((s) => s.toLowerCase().includes(stackId.toLowerCase())),
  );
}

/** All posts in a given category. */
export function postsByCategory(category: BlogCategory): BlogPostItem[] {
  return BLOG_POSTS.filter((p) => p.category === category);
}

/** All unique series names declared across all posts. */
export const ALL_SERIES: readonly string[] = Object.freeze(
  Array.from(
    new Set(BLOG_POSTS.map((p) => p.series).filter((s): s is string => !!s)),
  ),
);
