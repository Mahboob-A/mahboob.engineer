import type { NextConfig } from "next";

/**
 * next.config.ts
 *
 * Phase 6 (T6.5): adds a global `headers()` function that injects
 * security headers on every response. Headers apply to the whole
 * site (static assets + page responses) — Vercel augments these
 * automatically with HSTS + HTTPS-only on the `.vercel.app` preview
 * hostname.
 *
 * The headers are the standard "sane defaults" set:
 *   - X-Content-Type-Options: nosniff  — block MIME sniffing
 *   - X-Frame-Options: DENY           — block iframe embedding
 *   - Referrer-Policy: strict-origin-when-cross-origin
 *   - Permissions-Policy: deny camera / mic / geolocation by default
 */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; worker-src 'self' blob:; frame-ancestors 'none';",
  },
];

const getBuildDate = (): string => {
  if (process.env.VERCEL_GIT_COMMIT_DATE) {
    return new Date(process.env.VERCEL_GIT_COMMIT_DATE).toISOString().slice(0, 7);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require("child_process");
    const dateStr = execSync("git log -1 --format=%cd --date=format:%Y-%m", {
      encoding: "utf-8",
    }).trim();
    if (dateStr && /^\d{4}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
  } catch {
    /* Fallback to current month if git command is unavailable */
  }
  return new Date().toISOString().slice(0, 7);
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: getBuildDate(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
