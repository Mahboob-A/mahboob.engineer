/**
 * lib/rag/rate-limit.ts
 *
 * Rate limiter for /api/rag. Uses Upstash Redis with a sliding window of
 * 20 requests per 30 minutes. Falls back to a local in-memory Map during
 * local development if Redis credentials are not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Upstash Redis only if keys are present
export const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "30 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/my-portfolio",
    })
  : null;

const WINDOW_MS = 30 * 60 * 1000; // 30 minutes

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  // 1. Use Upstash Redis if configured (recommended for production)
  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(key);
    return {
      allowed: success,
      remaining,
      resetAt: reset,
    };
  }

  // 2. Fall back to local in-memory rate-limiter for development / preview
  const per30Min = 20;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: per30Min - 1, resetAt };
  }

  if (existing.count >= per30Min) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: per30Min - existing.count,
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