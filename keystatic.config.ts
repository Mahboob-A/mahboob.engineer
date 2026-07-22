/**
 * keystatic.config.ts
 *
 * Git-based CMS config for native blog posts. The Keystatic admin
 * lives at /keystatic (mounted from app/keystatic/[[...params]]/page.tsx).
 *
 * Storage backend:
 * - Dev: `local` — reads/writes directly to content/posts/.
 * - Prod: `github` — requires KEYSTATIC_GITHUB_CLIENT_ID,
 *   KEYSTATIC_GITHUB_CLIENT_SECRET, KEYSTATIC_SECRET,
 *   KEYSTATIC_GITHUB_REPO_OWNER, and KEYSTATIC_GITHUB_REPO_NAME.
 *   Runtime validation lives in app/api/keystatic/[...params]/route.ts.
 *
 * Schema mirrors the BlogPostItem type in data/blog.ts so that:
 * - T5.6's seeded MDX files are loadable in the admin.
 * - Future native posts can be authored via the admin and rendered
 *   by the same /writing/[slug] page.
 *
 * Built with Keystatic 0.5's `fields.*` namespace API (the v0.5
 * generation, not the legacy inline-{label,validation} schema).
 *
 * Phase 6 (T6.6): production API requests return a clear 500 if
 * GitHub OAuth env vars are missing. Local dev still uses `local`
 * storage. The dev console prints a clear warning if env vars are
 * missing so the user knows to set them up before deploying.
 *
 * Source: master §2.5 schema spec; extended in T5.1.
 */

import { config, collection, fields } from "@keystatic/core";

/** Categories — must mirror the BlogCategory union in data/blog.ts. */
const CATEGORY_OPTIONS = [
  { label: "Distributed Systems", value: "distributed" },
  { label: "Linux / Networking", value: "linux" },
  { label: "Docker / Containers", value: "docker" },
  { label: "Video", value: "video" },
  { label: "AI / ML", value: "ai" },
  { label: "Platform", value: "platform" },
  { label: "Career", value: "career" },
] as const;

/**
 * In production, warn loudly if GitHub OAuth env vars are missing.
 * Vercel's read-only filesystem can't back the admin's `local`
 * storage, so the admin route will fail at first access — but the
 * build itself still succeeds so a user can deploy, see the warning,
 * and add the env vars + redeploy. The first /api/keystatic request
 * returns 500 with a clear message; /keystatic shows a graceful error.
 *
 * In dev, fall back silently to `local` storage.
 */
const isProd = process.env.NODE_ENV === "production";

// Log configuration warnings only on the server
if (typeof window === "undefined") {
  if (isProd) {
    const missing = [
      "KEYSTATIC_SECRET",
      "KEYSTATIC_GITHUB_CLIENT_ID",
      "KEYSTATIC_GITHUB_CLIENT_SECRET",
      "KEYSTATIC_GITHUB_REPO_OWNER",
      "KEYSTATIC_GITHUB_REPO_NAME"
    ].filter((k) => !process.env[k]);

    if (missing.length > 0) {
      console.warn(
        `[keystatic.config] PRODUCTION: GitHub OAuth env vars missing: ${missing.join(", ")}. ` +
          `Set them in Vercel → Project Settings → Environment Variables. ` +
          `Until then, Keystatic API routes will return a 500 error.`
      );
    }
  } else {
    const missing = [
      "KEYSTATIC_SECRET",
      "KEYSTATIC_GITHUB_CLIENT_ID",
      "KEYSTATIC_GITHUB_CLIENT_SECRET"
    ].filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.warn(
        `[keystatic.config] GitHub OAuth environment variables not set. Using local storage for development.`
      );
    }
  }
}

const storage = isProd
  ? {
      kind: "github" as const,
      repo: {
        owner: process.env.KEYSTATIC_GITHUB_REPO_OWNER ?? "Mahboob-A",
        name: process.env.KEYSTATIC_GITHUB_REPO_NAME ?? "mahboob.engineer",
      },
    }
  : { kind: "local" as const };

export default config({
  storage,

  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "content/posts/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true, length: { max: 120 } } },
          slug: {
            label: "URL slug",
            description:
              "URL slug derived from the title. Used at /writing/<slug>.",
          },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          description:
            "Short summary shown on the /writing card. Plain text. ~240 char max.",
          validation: { isRequired: true, length: { max: 240 } },
          multiline: true,
        }),
        category: fields.select({
          label: "Category",
          description:
            "Top-level topic — drives the /writing filter chips. Must mirror BlogCategory.",
          options: [...CATEGORY_OPTIONS],
          defaultValue: "platform",
        }),
        tags: fields.array(
          fields.text({
            label: "Tag",
            validation: { isRequired: true, length: { max: 24 } },
          }),
          {
            label: "Tags",
            description:
              "Up to 4 tags. Used for search and detail chips.",
            validation: { length: { min: 1, max: 4 } },
          },
        ),
        series: fields.text({
          label: "Series (optional)",
          description:
            'If this post is part of a numbered series, set the series name (e.g. "Linux Networking").',
          validation: { length: { max: 64 } },
        }),
        part: fields.integer({
          label: "Series part (optional)",
          description:
            "Part number within the series. Use 1, 2, 3 ... Only meaningful when Series is set.",
        }),
        projects: fields.array(
          fields.text({
            label: "Project slug",
            validation: { isRequired: true, length: { max: 64 } },
          }),
          {
            label: "Related project slugs (optional)",
            description:
              'Project slugs this post references. Drives the "related projects" sidebar.',
          },
        ),
        stack: fields.array(
          fields.text({
            label: "Stack id",
            validation: { isRequired: true, length: { max: 32 } },
          }),
          {
            label: "Related stack ids (optional)",
            description:
              'Tech ids this post references. Drives the "related stack" sidebar.',
          },
        ),
        readMin: fields.integer({
          label: "Read time (minutes)",
          description: "Estimated reading time — surfaced on the card.",
          validation: { isRequired: true, min: 1, max: 60 },
        }),
        publishedAt: fields.text({
          label: "Published date (optional)",
          description:
            'Publication date in ISO 8601 (e.g. "2026-07-15"). Optional for drafts.',
          validation: { length: { max: 10 } },
        }),
        content: fields.mdx({
          label: "Content",
          description:
            "MDX body. Supports GitHub-flavored markdown + JSX components (callouts, diagrams, etc.).",
        }),
      },
    }),
  },
});
