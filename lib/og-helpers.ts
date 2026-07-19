/**
 * lib/og-helpers.ts
 *
 * Helpers for building the OG image URL. Phase 31.2 switched from
 * the dynamic @vercel/og generator (app/opengraph-image.tsx) to
 * static PNG assets under /public/. This file now resolves an OG
 * surface type to a static URL.
 *
 * Every page's `generateMetadata()` calls
 * `ogUrlFor({ title, description, surface })` to populate
 * `metadata.openGraph.images[0].url`.
 *
 * - `surface: "default"` resolves to /og-default.png — used by
 *   the landing + /log + /stack + /lets-connect + /work.
 * - `surface: "writing"` resolves to /og-writing.png — used by
 *   /writing + /writing/[slug].
 * - `surface: "project"` resolves to /og-projects/{slug}.png —
 *   falls back to the default OG if a per-project PNG hasn't
 *   been generated yet.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahboob.engineer";

const DEFAULT_DESCRIPTION =
  "Co-Founder & Backend Engineer building distributed systems, async pipelines, and infrastructure.";

export type OgSurface = "default" | "writing" | "project";

/**
 * Per-project OG cards that the user has generated. Anything in
 * this set routes to /og-projects/{slug}.png. Anything missing
 * falls back to /og-default.png so incomplete coverage doesn't
 * 404 share previews.
 */
const GENERATED_PROJECT_OG_SLUGS = new Set([
  "algocode",
  "movio",
  "drishti-ai",
]);

/**
 * Build the absolute URL for the OG card matching the given surface.
 * For project surfaces, slug-aware: looks up per-project PNG,
 * falls back to the default OG if none generated.
 */
export function ogUrlFor(args: {
  title?: string;
  description?: string;
  surface?: OgSurface;
  slug?: string;
}): string {
  const surface = args.surface ?? "default";
  if (surface === "writing") {
    return `${SITE_URL}/og-writing.png`;
  }
  if (surface === "project" && args.slug && GENERATED_PROJECT_OG_SLUGS.has(args.slug)) {
    return `${SITE_URL}/og-projects/${args.slug}.png`;
  }
  return `${SITE_URL}/og-default.png`;
}

export const OG_IMAGE_DEFAULT_URL = `${SITE_URL}/og-default.png`;

export const ogConstants = {
  defaultTitle: "Mahboob Alam",
  defaultDescription: DEFAULT_DESCRIPTION,
  width: 1200,
  height: 630,
} as const;