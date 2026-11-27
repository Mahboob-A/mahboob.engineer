/**
 * data/blog-registry.ts
 *
 * The **mutable blog post registry** — `BLOG_POSTS` plus its lookup
 * helpers. Split out of `data/blog.ts` on purpose:
 *
 *   This module holds *editable content* (titles, excerpts, notes). When
 *   a `"use client"` component imported it as a value, Turbopack bundled
 *   a **second copy** into the client chunk. Editing a title then made
 *   the server's copy and the browser's copy diverge, producing a
 *   hydration mismatch (the "SQL Joins" / "SQL JOINs" casing bug).
 *
 *   → **Server components** may import this by value.
 *   → **Client components** must not. Pass the data down as props
 *     instead. Types live in `data/blog.ts` and are safe everywhere.
 *
 * The registry has two purposes:
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

import { type BlogCategory, type BlogPostItem } from "@/data/blog";

/* ===========================================================================
   BLOG_POSTS registry
   14 Medium cross-posts + 0 native (T5.6 seeds 3 native posts).
   Order: newest at top where publishedAt is known; older / undated
   entries follow in their natural series order.
   =========================================================================== */

export const BLOG_POSTS: BlogPostItem[] = [
  /* ─── Linux Networking series (4 parts) ─────────────────────────── */
  {
    /* Post-Phase 6 bug fix: native MDX at content/posts/linux-networking-part-1.mdx
       occupies the bare slug. Suffix this Medium entry so /writing can show
       both (native wins on /writing/[slug] via last-write-wins). */
    slug: "linux-networking-part-1-medium",
    title:
      "Linux Networking for Backend Engineers. Part 1: Namespaces and Virtual Interfaces",
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
      "Starting a series on the kernel primitives that make container networking work. Namespaces, veth pairs, and bridges, explained from the ground up.",
    notes:
      "I wrote this series because almost every container networking bug I've debugged came back to one of three concepts being misunderstood. Namespaces, veth pairs, bridges. Part 1 is the ground floor.",
  },
  {
    slug: "linux-networking-part-2",
    title:
      "Linux Networking. Part 2: Communication From Namespace to Host Through Virtual Ethernet",
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
      "How namespaces actually talk to each other. Virtual ethernet pairs, packet flow, and why Docker's bridge networking works the way it does.",
    notes:
      "Namespaces don't actually talk to each other by magic — they talk via veth pairs. I wrote this because part 1 left people confused about how the routing between two namespaces actually works.",
  },
  {
    slug: "linux-networking-part-3",
    title:
      "Linux Networking. Part 3: Bridge and Default Gateway for One-Way Outbound Communication",
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
    notes:
      "Bridges, default gateways, and the one-way outbound path every container uses when reaching for the public internet. The mental model in here is the one I wish every DevOps engineer had on day one.",
  },
  {
    slug: "linux-networking-part-4",
    title:
      "Linux Networking. Part 4: SNAT and Packet Forwarding to Connect to the Internet From a Namespace",
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
      "The last mile. How source NAT (MASQUERADE) and packet forwarding complete the loop so a namespace can hit the public internet.",
    notes:
      "Source NAT (MASQUERADE) and packet forwarding complete the loop so a namespace can hit the public internet. If you only have time for one post in the series, read this one.",
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
    notes:
      "I wrote this because most Postgres tutorials skip the part where schemas stop being a toy. This covers getting Postgres running, tables that scale, and CRUD that holds up at 10M rows.",
    /* Beginner-tier — install / setup / CRUD. Stays on /writing and in
       the RAG corpus, but off the homepage's prime slots. */
    featured: false,
  },
  {
    slug: "postgresql-part-2",
    title:
      "SQL JOINs in PostgreSQL: Query Across Multiple Tables and Actually Understand What You Are Asking",
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
      "INNER, LEFT, RIGHT, FULL, and what each one actually means before the planner rewrites your query into something different.",
    notes:
      "Joins. INNER, LEFT, RIGHT, FULL, what each one means before the planner rewrites your query into something different. The mental model I wish I'd had on day one.",
    /* Beginner-tier — SQL JOINs tutorial. Off the homepage, still on
       /writing and in the RAG corpus. */
    featured: false,
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
    notes:
      "GROUP BY, HAVING, and the mental model that makes aggregation queries feel obvious. If you've ever copy-pasted an aggregation from Stack Overflow hoping for the best, this is the post for you.",
  },

  /* ─── Redis series (2 parts) ────────────────────────────────────── */
  {
    slug: "redis-part-1",
    title:
      "Your Easy Guide to Design Highly Available Systems With Redis. Part 1",
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
    notes:
      "Replication, sentinels, and the failure modes you actually have to design for when Redis is on the request path. The mental model I'd want every backend engineer to absorb before they pick a topology.",
  },
  {
    slug: "redis-part-2",
    title:
      "Step-by-Step Guide to Deploy Redis Cluster in AWS to Achieve High Availability. Part 2",
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
      "From a single EC2 to a fault-tolerant Redis Cluster. The real-world glue that turns theory into a prod deployment.",
    notes:
      "From a single EC2 to a fault-tolerant Redis Cluster. The practical glue that turns the part 1 mental model into a real production deployment.",
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
      "A practical first step into AWS networking. VPCs, subnets, security groups, and the bastion pattern explained hands-on.",
    notes:
      "A practical first step into AWS networking. VPCs, subnets, security groups, and the bastion pattern. The post the Pulumi AWS Infra project on this portfolio cites as the pre-read.",
    /* Beginner-tier — subtitled "For Dummies". Off the homepage, still
       on /writing and in the RAG corpus. */
    featured: false,
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
      "The full story behind Algocode. Microservice boundaries, RabbitMQ coordination, and running untrusted code safely inside sibling Docker containers.",
    notes:
      "The public version of the Algocode deep-dive. Microservice boundaries, RabbitMQ coordination, and running untrusted code safely inside sibling Docker containers. Read it if you're about to design a code judge or any sandbox-of-arbitrary-user-code system.",
  },
  {
    /* Post-Phase 6 bug fix: native MDX at content/posts/message-queue-101.mdx
       occupies the bare slug. Suffix this Medium entry so both can coexist. */
    slug: "message-queue-101-medium",
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
      "RabbitMQ from first principles. Why Algocode needed a message queue, how exchanges and queues actually work, and the mental model that made it click.",
    notes:
      "RabbitMQ from first principles. Why Algocode needed a message queue, how exchanges and queues actually work, and the mental model that made it click. The Medium cross-post version of the canonical piece.",
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
      "Building a real-time AI eye-screening pipeline for rural India over WebRTC. Agent architecture, queue design, and the constraints that shaped every decision.",
    notes:
      "Building a real-time AI eye-screening pipeline for rural India over WebRTC. Agent architecture, queue design, and the constraints that shaped every decision. Ties the DrishtiAI project to a real problem — 12M blind in India, 80% preventable.",
  },

  /* ─── Native MDX posts (managed by Keystatic, T5.6) ─────────────── */
  {
    slug: "linux-networking-part-1",
    title:
      "Linux Networking for Backend Engineers. Part 1: Namespaces and Virtual Interfaces",
    source: "native",
    url: "/writing/linux-networking-part-1",
    mediumUrl:
      "https://imehboob.medium.com/linux-networking-your-hands-on-guide-to-understand-how-docker-works-part-1-fbf2b6cef06f",
    tags: ["linux", "networking", "docker", "internals"],
    readMin: 10,
    category: "linux",
    series: "Linux Networking",
    part: 1,
    projects: ["unthink"],
    stack: ["Linux", "Docker"],
    excerpt:
      "Starting a hands-on series on the kernel primitives that make container networking work. Namespaces, veth pairs, and bridges, explained from the ground up.",
    publishedAt: "2026-07-15",
    notes:
      "Same content as the Medium cross-post, kept on the canonical channel for search discoverability. Read whichever version Medium surfaces.",
  },
  {
    slug: "message-queue-101",
    title:
      "Message Queue 101: Your Ultimate Guide to Understanding Message Queues",
    source: "native",
    url: "/writing/message-queue-101",
    mediumUrl:
      "https://imehboob.medium.com/message-queue-101-your-ultimate-guide-to-understand-message-queue-b2256961ab01",
    tags: ["rabbitmq", "distributed-systems", "async"],
    readMin: 7,
    category: "distributed",
    projects: ["algocode"],
    stack: ["RabbitMQ"],
    excerpt:
      "RabbitMQ from first principles. What a message queue actually solves, how exchanges and queues connect, and the mental model that makes it click when you're debugging a stuck producer at 2am.",
    publishedAt: "2026-07-15",
    notes:
      "The canonical, longer version of Message Queue 101. I wrote this one first; the Medium cross-post is a tighter reader-focused summary. Read this one for the deeper RabbitMQ mental model — flow control, dead-letter queues, the Ack patterns that survive a consumer crash.",
  },
  {
    slug: "algocode-deep-dive",
    title:
      "How I Built Algocode. A Distributed Online Judge, Microservices to Kernel Isolation",
    source: "native",
    url: "/writing/algocode-deep-dive",
    mediumUrl:
      "https://imehboob.medium.com/my-experience-building-a-leetcode-like-online-judge-and-how-you-can-build-one-7e05e031455d",
    tags: ["microservices", "docker", "rabbitmq", "distributed-systems", "linux"],
    readMin: 12,
    category: "distributed",
    projects: ["algocode"],
    stack: ["Django", "RabbitMQ", "Docker"],
    excerpt:
      "The full build story behind Algocode. Splitting a judge into three independently deployable services, coordinating through RabbitMQ, and running untrusted C++ inside sibling Docker containers with Linux namespaces + cgroups + seccomp enforcing hard resource limits.",
    publishedAt: "2026-07-15",
    notes:
      "The full build story behind Algocode. Three independently deployable services, RabbitMQ coordination, and running untrusted C++ inside sibling Docker containers with Linux namespaces + cgroups + seccomp enforcing hard resource limits. If you read one post on this portfolio, read this one.",
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

/**
 * The posts that lead the homepage's blog section.
 *
 * Only `featured: false` posts are excluded — the field defaults to
 * `true` when absent, so adding a new post to the registry puts it on
 * the homepage without touching this list. Beginner-tier posts
 * (PostgreSQL CRUD, SQL JOINs, AWS Networking "For Dummies") opt out
 * explicitly so they don't take a prime slot from the deep-dives.
 */
export const FEATURED_POSTS: readonly BlogPostItem[] = Object.freeze(
  BLOG_POSTS.filter((p) => p.featured !== false),
);

/** All unique series names declared across all posts. */
export const ALL_SERIES: readonly string[] = Object.freeze(
  Array.from(
    new Set(BLOG_POSTS.map((p) => p.series).filter((s): s is string => !!s)),
  ),
);
