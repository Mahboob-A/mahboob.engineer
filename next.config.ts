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
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  },
];

const nextConfig: NextConfig = {
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
