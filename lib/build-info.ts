/**
 * lib/build-info.ts
 *
 * Centralized site build metadata and version provider.
 * Reads environment variables injected at build time with fallbacks.
 */

const RAW_BUILD_DATE =
  process.env.NEXT_PUBLIC_BUILD_DATE ||
  process.env.VERCEL_GIT_COMMIT_DATE ||
  new Date().toISOString();

/** Formatted deployment date string (e.g. "2026-07"). */
export const BUILD_DATE = RAW_BUILD_DATE.slice(0, 7);

/** Site version string. */
export const SITE_VERSION = "v2.0";
