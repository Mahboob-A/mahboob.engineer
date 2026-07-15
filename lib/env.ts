/**
 * lib/env.ts
 *
 * Typed env-var accessor. Validates required vars at call time and
 * throws with a clear message if missing in production.
 *
 * Single source of truth for env access. Every `process.env.X`
 * reference in the codebase routes through here, so the no-env-fail-fast
 * rule has one enforcement point.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const apiKey = env.required("RESEND_API_KEY");
 *   const url = env.optional("NEXT_PUBLIC_SITE_URL", "https://mahboob.engineer");
 *
 *   // Or validate-at-startup:
 *   if (env.isProd()) env.requireGithubKeystatic();
 *
 * Phase 6 (T6.6).
 */

const isBrowser = typeof window !== "undefined";

function failInProd(varName: string): never {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[env] ${varName} is required in production but was not set. ` +
        `Set it in Vercel → Project Settings → Environment Variables. ` +
        `See docs/DEPLOY.md for the full matrix.`,
    );
  }
  /* Dev / preview: return empty string so callers can still run.
     The codebase routes that depend on the var (e.g. /api/contact)
     surface a 500 with a clear message; the rest of the app stays
     usable. */
  return "" as never;
}

interface Env {
  /** NODE_ENV check (works in both runtimes). */
  isProd(): boolean;
  /** Required var — throws in prod, returns "" in dev. */
  required(name: string): string;
  /** Optional var with a default fallback. */
  optional(name: string, fallback: string): string;
  /** Specific check for the Keystatic GitHub OAuth matrix. */
  requireGithubKeystatic(): void;
}

/**
 * Validate that every Keystatic env var is set. Throws in production
 * if any are missing (Vercel's read-only filesystem can't back the
 * admin's `local` storage).
 */
function requireGithubKeystatic(): void {
  const missing = (
    ["KEYSTATIC_SECRET",
      "KEYSTATIC_GITHUB_CLIENT_ID",
      "KEYSTATIC_GITHUB_CLIENT_SECRET",
      "KEYSTATIC_GITHUB_REPO_OWNER",
      "KEYSTATIC_GITHUB_REPO_NAME"] as const
  ).filter((k) => !process.env[k]);
  if (missing.length === 0) return;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      `[env] Keystatic GitHub OAuth is not configured for production. ` +
        `Missing: ${missing.join(", ")}. ` +
        `See docs/DEPLOY.md for the setup checklist.`,
    );
  }
  console.warn(
    `[env] Keystatic GitHub OAuth not fully configured (missing: ${missing.join(", ")}). ` +
      `Dev mode will use local storage.`,
  );
}

export const env: Env = {
  isProd(): boolean {
    return process.env.NODE_ENV === "production";
  },
  required(name: string): string {
    const v = process.env[name];
    if (v) return v;
    return failInProd(name);
  },
  optional(name: string, fallback: string): string {
    return process.env[name] ?? fallback;
  },
  requireGithubKeystatic,
};

/* Avoid unused-browser warnings — this module is server-only by
   use-case even though it's not "use server" (callers are server
   components + route handlers). */
if (isBrowser) {
  throw new Error("[lib/env] is server-only.");
}