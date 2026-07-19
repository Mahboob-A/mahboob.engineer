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
  | "boundary"
  | "voice"
  | "system-prompt";

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

const DOC_CHUNK_WORD_CAP = 250;

// Common visitor questions, answered in Mahboob's first-person voice. These
// are retrieval targets so an LLM grounded on them sounds like the portfolio
// owner, not a knowledge base. Each answer is intentionally short (≤ 80
// words) and uses concrete project / company names.
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
      "I'm a backend / platform engineer. My strongest work sits where product code meets infra — Django, DRF, FastAPI, PostgreSQL, Redis, queues, AWS, CI/CD. I co-founded Taply, owned production APIs, cut AWS spend and query latency, led PR review for a 9-person team, and shipped portfolio projects that prove I can build distributed systems end to end.",
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
      "Start with Taply — live SaaS I co-founded. Then Algocode for distributed systems, Movio for video infra, DrishtiAI for real-time AI pipelines, UnThink for what I'm building now. Each /work/[slug] page goes deep on architecture. If you only have time for two: Taply and Algocode.",
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
      "I spend most days on Taply (live) and UnThink (building). I'm open to backend / platform roles, Taply partnerships, and async-first teams. Best way to reach me: /lets-connect, email connect.mahboobalam@gmail.com, or LinkedIn. I respond within a day or two.",
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
      "Python, Django, DRF, FastAPI, PostgreSQL, Redis, RabbitMQ, Celery, Docker, AWS, CI/CD. Real distributed-system work: queues, rate limiting, isolation, caching, async workers, streaming, deploy automation. Algocode and Movio are the two projects that show this depth in production-shaped code.",
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
      "Async-first, long-form PRs, written decisions. At NexBell I ran sprint planning and PR review for a 9-person team and pushed mandatory CI gates. I'm comfortable with remote and overlapping-time-zone teams, and I keep PRs small enough to review in one sitting.",
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
      "I'm honest about this in the portfolio. Go, Terraform, Kubernetes, and eBPF are flagged as learning / growth areas unless a specific project says otherwise. If you want someone to drop into a Go shop and own a service from day one, that's not me yet.",
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
        title: `${project.name} — first-person overview`,
        slug: project.slug,
        sourcePath,
        text: [
          `What it is: ${project.tagline}`,
          `Status: ${project.status} (${project.tier}). Year: ${project.year}.`,
          project.notes
            ? `In my words: ${stripLeadingHeading(project.notes)}`
            : `Why I built it: ${project.problem}`,
          `How: ${project.built}`,
          project.metrics.length
            ? `Numbers: ${project.metrics.join("; ")}.`
            : "",
          `Links: ${formatLinks(project)}`,
        ],
        metadata: shared,
      }),
      chunk({
        kind: "project",
        title: `${project.name} — architecture and deep notes`,
        slug: project.slug,
        sourcePath,
        text: [
          project.notes
            ? `## ${project.name}\n\n${stripLeadingHeading(project.notes)}`
            : `## ${project.name}\n\n${project.problem}\n\n${project.built}`,
          `Stack: ${project.stack.join(", ")}.`,
          `Domain: ${project.domain.join(", ")}.`,
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
        title: `${entry.company} — first-person overview`,
        slug: entry.id,
        url: entry.url ?? undefined,
        sourcePath,
        tags: entry.tags,
        projects: entry.relatedProjects,
        stack: entry.tags,
        text: [
          `${entry.role}${entry.roleSuffix ? ` (${entry.roleSuffix})` : ""} at ${entry.company}.`,
          `Period: ${entry.period}. Status: ${entry.status}.`,
          entry.notes
            ? `In my words: ${stripLeadingHeading(entry.notes)}`
            : `What I did: ${entry.bullets.join(" ")}`,
          entry.relatedProjects?.length
            ? `Projects from this role: ${entry.relatedProjects.join(", ")}.`
            : "",
        ],
      }),
      chunk({
        kind: "experience",
        title: `${entry.company} — story and lessons`,
        slug: entry.id,
        url: entry.url ?? undefined,
        sourcePath,
        tags: entry.tags,
        projects: entry.relatedProjects,
        stack: entry.tags,
        text: entry.notes
          ? `## ${entry.company}\n\n${stripLeadingHeading(entry.notes)}`
          : `## ${entry.company}\n\n${entry.bullets.join("\n\n")}`,
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
  return BLOG_POSTS.flatMap((post) => {
    const sourcePath = "data/blog.ts";
    const shared = {
      slug: post.slug,
      url: post.url,
      sourcePath,
      tags: [post.category, ...post.tags],
      projects: post.projects,
      stack: post.stack,
    };
    const about = [
      `Post: ${post.title}.`,
      `Source: ${post.source}. Category: ${post.category}.`,
      `Read time: ${post.readMin} minutes.`,
      `URL: ${post.url}.`,
    ].join("\n");
    const why = post.series
      ? [
          `Series: ${post.series}, part ${post.part ?? "unknown"}.`,
          post.projects?.length
            ? `Linked projects: ${post.projects.join(", ")}.`
            : "",
          post.stack?.length
            ? `Covers: ${post.stack.join(", ")}.`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";
    const claim = post.excerpt
      ? `Main argument: ${post.excerpt}`
      : post.tags.length
        ? `Covers ${post.tags.join(", ")} from the ${post.category} angle.`
        : `Post in the ${post.category} category.`;
    const personalNotes = post.notes
      ? `Why I wrote it (in my words): ${post.notes}`
      : "";
    const chunks: RagChunk[] = [
      chunk({
        kind: "blog",
        title: `${post.title} — what it is`,
        ...shared,
        text: about,
      }),
    ];
    if (why) {
      chunks.push(
        chunk({
          kind: "blog",
          title: `${post.title} — why I wrote it`,
          ...shared,
          text: why,
        }),
      );
    }
    if (personalNotes) {
      chunks.push(
        chunk({
          kind: "blog",
          title: `${post.title} — personal take`,
          ...shared,
          text: personalNotes,
        }),
      );
    }
    chunks.push(
      chunk({
        kind: "blog",
        title: `${post.title} — the takeaway`,
        ...shared,
        text: claim,
      }),
    );
    return chunks;
  });
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
        `${tech.name} sits in the ${tech.domain} bucket.`,
        tech.projects.length
          ? `Used in: ${tech.projects.join(", ")}.`
          : "Not wired into a shipped project yet — treat as learning or future-facing unless another source says otherwise.",
        tech.blogs?.length ? `Written about in: ${tech.blogs.join(", ")}.` : "",
        typeof tech.depth === "number"
          ? `Self-rated depth: ${tech.depth}/100. Don't treat as production expertise without project evidence.`
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
  const kind: RagChunkKind = sourcePath.includes("voice.md")
    ? "voice"
    : sourcePath.includes("system-prompt.md")
      ? "system-prompt"
      : sourcePath.includes("private-boundaries")
        ? "boundary"
        : "doc";
  return splitByHeading(content).map((section, index) =>
    chunk({
      kind,
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
    text: clampWords(stripNoise(section.text), DOC_CHUNK_WORD_CAP),
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

function stripLeadingHeading(text: string): string {
  // Trim a leading "## Title" line so a project/experience notes section
  // starts on its prose, not on a duplicate heading.
  return text.replace(/^\s*#{1,3}\s+.+\n+/, "").trim();
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
