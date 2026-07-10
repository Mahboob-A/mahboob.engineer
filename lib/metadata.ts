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

const SITE_URL = "https://mahboob.engineer";
const SITE_NAME = "mahboob.engineer";
const DEFAULT_DESCRIPTION =
  "Co-Founder & Backend Engineer building distributed systems, async pipelines, and infrastructure.";

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description,
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
