/**
 * lib/og-helpers.ts
 *
 * Helpers for building the OG image URL. The actual rendering happens in
 * `app/opengraph-image.tsx` (which receives the URL's query params). Every
 * page's `generateMetadata()` calls `ogUrlFor({ title, description })`
 * to populate `metadata.openGraph.images[0].url`.
 *
 * Centralized here so the URL pattern + defaults stay in sync between the
 * renderer and the callers.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahboob.engineer";

const DEFAULT_TITLE = "Backend Engineer";
const DEFAULT_DESCRIPTION =
  "Co-Founder & Backend Engineer building distributed systems, async pipelines, and infrastructure.";

/**
 * Build the absolute URL for an OG card.
 * Title and description are query-string encoded; the route reads them via
 * `useSearchParams` (or in the OG context, via the `next/og` request).
 */
export function ogUrlFor(args: { title?: string; description?: string }): string {
  const params = new URLSearchParams();
  params.set("title", args.title ?? DEFAULT_TITLE);
  params.set("description", args.description ?? DEFAULT_DESCRIPTION);
  return `${SITE_URL}/opengraph-image?${params.toString()}`;
}

/**
 * The canonical absolute URL to the OG endpoint (no params).
 * Used as `metadata.metadataBase` is the canonical root; this is the OG root.
 */
export const OG_IMAGE_DEFAULT_URL = ogUrlFor({
  title: "Mahboob Alam",
  description: DEFAULT_DESCRIPTION,
});

/**
 * Site-wide constants — exposed for callers that want the same URL helpers.
 */
export const ogConstants = {
  defaultTitle: DEFAULT_TITLE,
  defaultDescription: DEFAULT_DESCRIPTION,
  width: 1200,
  height: 630,
} as const;