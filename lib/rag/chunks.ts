import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { BLOG_POSTS } from "@/data/blog";
import {
  AVAILABILITY,
  DIRECT_LINKS,
  FAQ,
  HOW_THE_FORM_GETS_USED,
  QUICK_CONTEXT_DOESNT,
  QUICK_CONTEXT_FITS,
  RESPONSE_TIME,
} from "@/data/contact";
import {
  EDUCATION,
  EXPERIENCE,
  KEY_ACHIEVEMENTS,
  NOW_STATUSES,
} from "@/data/experience";
import { PROJECTS } from "@/data/projects";
import { STACK } from "@/data/stack";

export type RagChunkKind =
  | "project"
  | "experience"
  | "education"
  | "blog"
  | "stack"
  | "contact"
  | "faq"
  | "question"
  | "doc"
  | "boundary";

export interface RagChunkMetadata {
  kind: RagChunkKind;
  title: string;
  slug?: string;
  url?: string;
  sourcePath: string;
  tags?: string[];
  projects?: string[];
  stack?: string[];
}

export interface RagChunk {
  id: string;
  text: string;
  metadata: RagChunkMetadata;
}

export interface RagCorpus {
  chunks: RagChunk[];
  hash: string;
}

const ROOT_DOCS = [
  "README.md",
  "portfolio-master-doc.md",
  "my-resources-for-portfolio.md",
  "prompt-guide.md",
  "portfolio-flat-mockup.html",
] as const;

const DOC_EXTENSIONS = new Set([".md", ".mdx", ".txt"]);

const COMMON_QUESTIONS: ReadonlyArray<{
  title: string;
  questions: string[];
  answer: string;
  tags: string[];
}> = [
  {
    title: "Hiring fit and role match",
    questions: [
      "Why should we hire Mahboob?",
      "What roles is Mahboob best suited for?",
      "Is Mahboob a backend engineer or platform engineer?",
    ],
    answer:
      "Mahboob is strongest where backend product work meets infrastructure: Django, DRF, FastAPI, Redis, PostgreSQL, queues, AWS, CI/CD, and system design. He has co-founded Taply, built production APIs, optimized cloud cost and queries, led PR review for a 9-person team, and shipped portfolio projects that prove distributed systems depth.",
    tags: ["hiring", "backend", "platform"],
  },
  {
    title: "Best projects to inspect first",
    questions: [
      "Which project should I look at first?",
      "What is Mahboob's strongest project?",
      "Which projects prove backend depth?",
    ],
    answer:
      "Start with Taply for live SaaS ownership, Algocode for distributed systems and isolation, Movio for video infrastructure, DrishtiAI for real-time AI pipelines, and UnThink for current AI/backend product direction. The /work page lists all projects and /work/[slug] pages give the deeper architecture story.",
    tags: ["projects", "portfolio"],
  },
  {
    title: "Current work and availability",
    questions: [
      "What is Mahboob doing now?",
      "Is Mahboob available?",
      "How can I contact Mahboob?",
    ],
    answer:
      "Mahboob is currently shipping Taply and building UnThink. He is available for backend/platform roles, open to Taply partnership conversations, and prefers direct contact through /lets-connect, email, LinkedIn, or GitHub.",
    tags: ["contact", "availability"],
  },
  {
    title: "Technical strengths",
    questions: [
      "What technologies does Mahboob know best?",
      "Where has Mahboob used Redis or PostgreSQL?",
      "Does Mahboob know distributed systems?",
    ],
    answer:
      "Mahboob's strongest recurring stack is Python, Django/DRF, FastAPI, PostgreSQL, Redis, RabbitMQ/Celery, Docker, AWS, and CI/CD. His work shows practical distributed-system patterns: queues, rate limiting, isolation, caching, async workers, streaming, and deployment automation.",
    tags: ["stack", "systems"],
  },
  {
    title: "Work style",
    questions: [
      "How does Mahboob work on a team?",
      "Can Mahboob work async?",
      "Does Mahboob lead engineering process?",
    ],
    answer:
      "Mahboob is comfortable with async-first work, long-form PRs, written decisions, CI gates, and production-focused review. At NexBell he led sprint planning and PR review for a 9-person team and introduced mandatory CI gates.",
    tags: ["work-style", "team"],
  },
  {
    title: "Learning areas and honesty",
    questions: [
      "What is Mahboob still learning?",
      "Is Mahboob expert in Go, Terraform, Kubernetes, or eBPF?",
      "What are Mahboob's growth areas?",
    ],
    answer:
      "The portfolio is intentionally honest about learning areas. Go, Terraform, Kubernetes, and eBPF are represented as active learning/growth areas unless a specific project or role says otherwise. Do not overstate them as production expertise.",
    tags: ["learning", "boundaries"],
  },
];

export async function buildRagCorpus(rootDir = process.cwd()): Promise<RagCorpus> {
  const chunks = [
    ...buildProjectChunks(),
    ...buildExperienceChunks(),
    ...buildEducationChunks(),
    ...buildBlogChunks(),
    ...buildStackChunks(),
    ...buildContactChunks(),
    ...buildQuestionChunks(),
    ...(await buildDocumentChunks(rootDir)),
  ];
  const deduped = dedupeChunks(chunks);
  return {
    chunks: deduped,
    hash: hashCorpus(deduped),
  };
}

function buildProjectChunks(): RagChunk[] {
  return PROJECTS.flatMap((project) => {
    const sourcePath = "data/projects.ts";
    const shared = {
      slug: project.slug,
      url: project.url ?? project.demo ?? project.github ?? undefined,
      sourcePath,
      tags: [...project.domain, ...project.stack],
      projects: [project.slug],
      stack: project.stack,
    };
    return [
      chunk({
        kind: "project",
        title: `${project.name} project overview`,
        slug: project.slug,
        sourcePath,
        text: [
          `${project.name} (${project.year}) is a ${project.status} ${project.tier} project.`,
          project.tagline,
          `Problem: ${project.problem}`,
          `Built: ${project.built}`,
          `What it proves: ${project.name} proves ${project.domain.join(", ")} work with ${project.stack.slice(0, 8).join(", ")}.`,
          `Metrics: ${project.metrics.join("; ")}.`,
          `Links: ${formatLinks(project)}`,
        ],
        metadata: shared,
      }),
      chunk({
        kind: "project",
        title: `${project.name} architecture and deep notes`,
        slug: project.slug,
        sourcePath,
        text: [
          `Architecture notes for ${project.name}.`,
          project.notes ?? `${project.problem}\n\n${project.built}`,
          `Stack: ${project.stack.join(", ")}.`,
          `Game building: ${project.game_building} in ${project.game_district}.`,
        ],
        metadata: shared,
      }),
    ];
  });
}

function buildExperienceChunks(): RagChunk[] {
  return EXPERIENCE.flatMap((entry) => {
    const sourcePath = "data/experience.ts";
    return [
      chunk({
        kind: "experience",
        title: `${entry.company} role overview`,
        slug: entry.id,
        url: entry.url ?? undefined,
        sourcePath,
        tags: entry.tags,
        projects: entry.relatedProjects,
        stack: entry.tags,
        text: [
          `${entry.company}: ${entry.role}${entry.roleSuffix ? ` (${entry.roleSuffix})` : ""}.`,
          `Period: ${entry.period}. Status: ${entry.status}.`,
          `Impact bullets: ${entry.bullets.join(" ")}`,
          entry.relatedProjects?.length
            ? `Related projects: ${entry.relatedProjects.join(", ")}.`
            : "No related portfolio project is explicitly linked.",
        ],
      }),
      chunk({
        kind: "experience",
        title: `${entry.company} story and lessons`,
        slug: entry.id,
        url: entry.url ?? undefined,
        sourcePath,
        tags: entry.tags,
        projects: entry.relatedProjects,
        stack: entry.tags,
        text: [
          `Deep-dive story for ${entry.company}.`,
          entry.notes ?? entry.bullets.join("\n\n"),
        ],
      }),
    ];
  });
}

function buildEducationChunks(): RagChunk[] {
  return EDUCATION.map((item) =>
    chunk({
      kind: "education",
      title: item.institution,
      sourcePath: "data/experience.ts",
      tags: [...(item.covered ?? []), ...(item.courses ?? [])],
      text: [
        `${item.institution}: ${item.degree}.`,
        `Period: ${item.period}. Location: ${item.location}.`,
        item.covered?.length ? `Covered: ${item.covered.join(", ")}.` : "",
        item.courses?.length ? `Courses: ${item.courses.join(", ")}.` : "",
      ],
    }),
  );
}

function buildBlogChunks(): RagChunk[] {
  return BLOG_POSTS.map((post) =>
    chunk({
      kind: "blog",
      title: post.title,
      slug: post.slug,
      url: post.url,
      sourcePath: "data/blog.ts",
      tags: [post.category, ...post.tags],
      projects: post.projects,
      stack: post.stack,
      text: [
        `${post.title} is a ${post.source} post in ${post.category}.`,
        post.series ? `Series: ${post.series}, part ${post.part ?? "unknown"}.` : "",
        `Read time: ${post.readMin} minutes.`,
        post.excerpt ?? "",
        post.projects?.length ? `Related projects: ${post.projects.join(", ")}.` : "",
        post.stack?.length ? `Related stack: ${post.stack.join(", ")}.` : "",
        `URL: ${post.url}.`,
      ],
    }),
  );
}

function buildStackChunks(): RagChunk[] {
  return STACK.map((tech) =>
    chunk({
      kind: "stack",
      title: `${tech.name} stack usage`,
      slug: tech.id,
      sourcePath: "data/stack.ts",
      tags: [tech.domain, tech.name],
      projects: tech.projects,
      stack: [tech.id, tech.name],
      text: [
        `${tech.name} belongs to the ${tech.domain} domain.`,
        tech.projects.length
          ? `Used in or referenced by: ${tech.projects.join(", ")}.`
          : "Not yet wired into a shipped project; treat as learning or future-facing unless another source says otherwise.",
        tech.blogs?.length ? `Written about in: ${tech.blogs.join(", ")}.` : "",
        typeof tech.depth === "number"
          ? `Learning depth marker: ${tech.depth}/100. Do not overstate as production expertise without project evidence.`
          : "",
      ],
    }),
  );
}

function buildContactChunks(): RagChunk[] {
  return [
    chunk({
      kind: "contact",
      title: "Contact and availability",
      sourcePath: "data/contact.ts",
      tags: ["contact", "availability"],
      text: [
        `Availability: ${AVAILABILITY.map((item) => item.text).join(" ")}`,
        `Response time: ${RESPONSE_TIME}.`,
        `Direct links: ${DIRECT_LINKS.map((link) => `${link.label} ${link.handle} ${link.href}`).join("; ")}.`,
        `Good fit: ${QUICK_CONTEXT_FITS.map((item) => item.text).join(" ")}`,
        `Not a fit: ${QUICK_CONTEXT_DOESNT.map((item) => item.text).join(" ")}`,
        `Form handling: ${HOW_THE_FORM_GETS_USED.map((item) => item.text).join(" ")}`,
      ],
    }),
    ...FAQ.map((item) =>
      chunk({
        kind: "faq",
        title: item.question,
        sourcePath: "data/contact.ts",
        tags: ["faq", "contact"],
        text: `Question: ${item.question}\nAnswer: ${item.answer}`,
      }),
    ),
    ...KEY_ACHIEVEMENTS.map((item) =>
      chunk({
        kind: "experience",
        title: `Achievement: ${item.label}`,
        sourcePath: "data/experience.ts",
        tags: ["achievement", "metric"],
        text: `${item.num}: ${item.label}. ${item.context ?? ""}`,
      }),
    ),
    ...NOW_STATUSES.map((item) =>
      chunk({
        kind: "project",
        title: `Current status: ${item.name}`,
        slug: item.slug,
        url: item.liveUrl ?? undefined,
        sourcePath: "data/experience.ts",
        tags: ["now", item.statusKind],
        projects: [item.slug],
        text: `${item.name} is ${item.statusKind}. ${item.status}`,
      }),
    ),
  ];
}

function buildQuestionChunks(): RagChunk[] {
  return COMMON_QUESTIONS.map((item) =>
    chunk({
      kind: "question",
      title: item.title,
      sourcePath: "lib/rag/chunks.ts",
      tags: item.tags,
      text: [
        `Common visitor questions: ${item.questions.join(" ")}`,
        `Recommended grounded answer: ${item.answer}`,
      ],
    }),
  );
}

async function buildDocumentChunks(rootDir: string): Promise<RagChunk[]> {
  const docPaths = [
    ...ROOT_DOCS.map((docPath) => path.join(rootDir, docPath)),
    ...(await listMarkdownDocs(path.join(rootDir, "docs"))),
    ...(await listMarkdownDocs(path.join(rootDir, "content"))),
  ];
  const chunks: RagChunk[] = [];
  for (const absolutePath of docPaths) {
    const relativePath = path.relative(rootDir, absolutePath);
    if (relativePath.startsWith("progress/")) continue;
    if (relativePath === "docs/RAG_TERMINAL.md") {
      // This is still useful, but the split docs are richer. Keep both.
    }
    const content = await readOptionalFile(absolutePath);
    if (!content) continue;
    chunks.push(...chunkDocument(relativePath, content));
  }
  return chunks;
}

async function listMarkdownDocs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownDocs(absolutePath);
      if (!entry.isFile()) return [];
      if (!DOC_EXTENSIONS.has(path.extname(entry.name))) return [];
      return [absolutePath];
    }),
  );
  return nested.flat();
}

async function readOptionalFile(absolutePath: string): Promise<string | null> {
  const fileStat = await stat(absolutePath).catch(() => null);
  if (!fileStat?.isFile()) return null;
  return readFile(absolutePath, "utf8");
}

function chunkDocument(sourcePath: string, content: string): RagChunk[] {
  const title = firstMarkdownHeading(content) ?? sourcePath;
  return splitByHeading(content).map((section, index) =>
    chunk({
      kind: sourcePath.includes("private-boundaries") ? "boundary" : "doc",
      title: index === 0 ? title : `${title}: ${section.heading}`,
      sourcePath,
      tags: tagsForPath(sourcePath),
      text: [`Source document: ${sourcePath}.`, section.text],
    }),
  );
}

function splitByHeading(content: string): Array<{ heading: string; text: string }> {
  const sections: Array<{ heading: string; text: string }> = [];
  const lines = content.split(/\r?\n/);
  let heading = "Overview";
  let buffer: string[] = [];
  for (const line of lines) {
    const match = /^(#{1,3})\s+(.+)$/.exec(line);
    if (match && buffer.join("\n").trim().length > 0) {
      sections.push({ heading, text: buffer.join("\n").trim() });
      heading = match[2].trim();
      buffer = [line];
      continue;
    }
    if (match) heading = match[2].trim();
    buffer.push(line);
  }
  if (buffer.join("\n").trim().length > 0) {
    sections.push({ heading, text: buffer.join("\n").trim() });
  }
  return sections.map((section) => ({
    ...section,
    text: clampWords(stripNoise(section.text), 650),
  }));
}

function chunk(input: {
  kind: RagChunkKind;
  title: string;
  slug?: string;
  url?: string;
  sourcePath: string;
  tags?: readonly string[];
  projects?: readonly string[];
  stack?: readonly string[];
  text: string | readonly string[];
  metadata?: Partial<RagChunkMetadata>;
}): RagChunk {
  const text =
    typeof input.text === "string"
      ? input.text
      : input.text.filter(Boolean).join("\n");
  const metadata: RagChunkMetadata = {
    kind: input.kind,
    title: input.title,
    slug: input.slug,
    url: input.url,
    sourcePath: input.sourcePath,
    tags: unique(input.tags),
    projects: unique(input.projects),
    stack: unique(input.stack),
    ...input.metadata,
  };
  return {
    id: stableId(input.kind, input.sourcePath, input.slug ?? input.title, text),
    text: text.trim(),
    metadata,
  };
}

function stableId(
  kind: RagChunkKind,
  sourcePath: string,
  key: string,
  text: string,
): string {
  const digest = createHash("sha256").update(text).digest("hex").slice(0, 12);
  return `${kind}:${slugify(sourcePath)}:${slugify(key)}:${digest}`;
}

function hashCorpus(chunks: readonly RagChunk[]): string {
  return createHash("sha256")
    .update(
      JSON.stringify(
        chunks.map((item) => ({
          id: item.id,
          text: item.text,
          metadata: item.metadata,
        })),
      ),
    )
    .digest("hex");
}

function dedupeChunks(chunks: readonly RagChunk[]): RagChunk[] {
  const seen = new Set<string>();
  return chunks.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return item.text.length > 0;
  });
}

function firstMarkdownHeading(content: string): string | null {
  return /^#\s+(.+)$/m.exec(content)?.[1].trim() ?? null;
}

function stripNoise(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, (block) => clampWords(block, 120))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clampWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")} ...`;
}

function tagsForPath(sourcePath: string): string[] {
  const parts = sourcePath
    .split(/[/.]/)
    .map((part) => part.toLowerCase())
    .filter((part) => part.length > 2);
  return unique(parts) ?? [];
}

function unique(values?: readonly string[]): string[] | undefined {
  if (!values) return undefined;
  const result = [...new Set(values.filter(Boolean))];
  return result.length > 0 ? result : undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatLinks(project: (typeof PROJECTS)[number]): string {
  return [
    project.url ? `live ${project.url}` : "",
    project.demo ? `demo ${project.demo}` : "",
    project.github ? `github ${project.github}` : "",
    project.youtube ? `youtube ${project.youtube}` : "",
  ]
    .filter(Boolean)
    .join("; ");
}
