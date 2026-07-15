/**
 * lib/metadata.ts
 *
 * Tiny helpers around Next.js's `Metadata` type. Every inner page calls
 * these so we never repeat the title/OG boilerplate.
 *
 * Conventions (master §2):
 *   - Eyebrow numbering: "01 / DEPLOYMENT LOG", "02 / SYSTEMS", etc.
 *   - Each section title sits above a one-line description.
 *   - The full title uses the root layout's template: "%s — Mahboob Alam"
 *     so calling `pageMetadata("Log")` produces "Log — Mahboob Alam".
 *
 * Phase 6 (T6.1): every metadata helper populates `openGraph.images` with
 * a query-param-driven OG card. The renderer lives at `/opengraph-image`;
 * the URL builder lives in `lib/og-helpers.ts`.
 *
 * Usage:
 *   // app/work/page.tsx
 *   export const metadata = pageMetadata("Work", "All systems, end-to-end");
 *
 *   // app/work/[slug]/page.tsx
 *   export async function generateMetadata({ params }) {
 *     const project = getProjectBySlug(params.slug);
 *     return projectMetadata(project);
 *   }
 */

import type { Metadata } from "next";
import { ogUrlFor, ogConstants } from "@/lib/og-helpers";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mahboob.engineer";
const SITE_NAME = "mahboob.engineer";
const DEFAULT_DESCRIPTION = ogConstants.defaultDescription;

/**
 * Base OG image entry shared by all three helpers. The URL is built by
 * `ogUrlFor({ title, description })` so a single helper file owns the
 * query-string contract (T6.1).
 */
function ogImage(title: string, description: string) {
  return [
    {
      url: ogUrlFor({ title, description }),
      width: ogConstants.width,
      height: ogConstants.height,
      alt: `${title} — ${SITE_NAME}`,
    },
  ];
}

/* ──────────────────────────────────────────────────────────────────────
   pageMetadata — for simple pages (e.g. /log, /stack, /contact, /writing)
   ────────────────────────────────────────────────────────────────────── */
export function pageMetadata(
  title: string,
  description: string = DEFAULT_DESCRIPTION,
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      images: ogImage(title, description),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage(title, description).map((i) => i.url),
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────
   projectMetadata — for /work/[slug] (case-study pages)
   ────────────────────────────────────────────────────────────────────── */
export function projectMetadata(args: {
  name: string;
  tagline: string;
  slug: string;
  status: "live" | "building" | "complete";
}): Metadata {
  const title = args.name;
  const description = args.tagline;
  const path = `/work/${args.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type: "article",
      images: ogImage(title, description),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage(title, description).map((i) => i.url),
    },
    alternates: {
      canonical: path,
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────
   blogMetadata — for /writing/[slug]
   ────────────────────────────────────────────────────────────────────── */
export function blogMetadata(args: {
  title: string;
  excerpt?: string;
  slug: string;
  readMin: number;
}): Metadata {
  const description = args.excerpt ?? `${args.title} — ${args.readMin} min read.`;
  const path = `/writing/${args.slug}`;

  return {
    title: args.title,
    description,
    openGraph: {
      title: args.title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      type: "article",
      images: ogImage(args.title, description),
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description,
      images: ogImage(args.title, description).map((i) => i.url),
    },
    alternates: {
      canonical: path,
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────
   Constants — exposed so callers (Navbar, Footer) can reference the
   canonical site name / URL without re-declaring.
   ────────────────────────────────────────────────────────────────────── */
export const siteConstants = {
  url: SITE_URL,
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
} as const;
