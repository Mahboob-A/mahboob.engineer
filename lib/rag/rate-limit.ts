/**
 * lib/rag/rate-limit.ts
 *
 * Tiny in-memory rate limiter for /api/rag. Tracks requests per IP key in
 * a module-scope Map; resets on cold start (not abuse-proof, but enough
 * grief delay).
 *
 * Production-grade abuse protection is out of scope for Phase 33. When
 * the project gets an Upstash Redis or Vercel KV instance, swap this for
 * a shared store and the route code stays the same.
 *
 * The rate-limit window is fixed at one hour and the per-IP cap is
 * `RAG_RATE_LIMIT_PER_HOUR` (default 20). These are deliberately small
 * because RAG queries are heavier than the static portfolio traffic the
 * site gets.
 */

const WINDOW_MS = 60 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

interface RateLimitConfig {
  perHour: number;
  windowMs: number;
}

function readConfig(): RateLimitConfig {
  const raw = process.env.RAG_RATE_LIMIT_PER_HOUR;
  const perHour = raw ? Number.parseInt(raw, 10) : 20;
  if (!Number.isFinite(perHour) || perHour <= 0) {
    return { perHour: 20, windowMs: WINDOW_MS };
  }
  return { perHour, windowMs: WINDOW_MS };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const { perHour, windowMs } = readConfig();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: perHour - 1, resetAt };
  }

  if (existing.count >= perHour) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: perHour - existing.count,
    resetAt: existing.resetAt,
  };
}

export function extractClientIp(req: Request): string {
  // Vercel sets `x-forwarded-for`; fall back to `x-real-ip`. Treat absent
  // headers as a single shared bucket so we don't disable the limiter.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}