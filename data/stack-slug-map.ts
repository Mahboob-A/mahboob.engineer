/**
 * data/stack-slug-map.ts
 *
 * Resolve a project's `stack[]` display string (e.g. "Django 5.1",
 * "RabbitMQ") to the canonical /stack hash id ("django",
 * "rabbitmq"). One-way, idempotent, deterministic.
 *
 * Used by components/sections/Projects.tsx so each stack chip on
 * a project card becomes a clickable link to `/stack#<id>` and
 * StackShell's useSyncExternalStore honors the deep-link.
 *
 * Algorithm: longest substring match wins. For each stack item's
 * `id`, check whether it appears as a contiguous substring in the
 * lowercased + non-alphanum-stripped chip string. Pick the
 * longest-matching id (specificity).
 *
 * Phase 6 (T7).
 */

import { STACK } from "./stack";

/**
 * Normalize a chip string for matching: lowercase + strip
 * non-alphanumeric characters.
 *
 * "Django 5.1" → "django51"
 * "RabbitMQ"   → "rabbitmq"
 * "DRF"        → "drf"
 * "JWT/OAuth2" → "jwtoauth2"
 */
function normalizeForMatching(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve a project's stack display string to its canonical
 * /stack hash id. Returns `null` if no stack item matches.
 *
 * Bidirectional substring match: the chip string may be either
 * a substring of an id ("Django" ⊂ "django" — trivially true) or
 * the id may be a substring of the chip ("Postgres" ⊂ "postgresql"
 * via the reverse check). Longest id wins.
 */
export function resolveStackSlug(display: string): string | null {
  const norm = normalizeForMatching(display);
  if (!norm) return null;

  let best: { id: string; len: number } | null = null;
  for (const item of STACK) {
    const idNorm = normalizeForMatching(item.id);
    if (idNorm.length === 0) continue;
    /* Bidirectional containment: chip contains id OR id contains
       chip (substring). Either direction is a valid match. */
    const matches = norm.includes(idNorm) || idNorm.includes(norm);
    if (!matches) continue;
    /* Prefer the longer id (specificity). If the chip is the
       shorter one (e.g. "postgres" vs id "postgresql"), still pick
       the longer id — the id is the more canonical form. */
    if (best === null || idNorm.length > best.len) {
      best = { id: item.id, len: idNorm.length };
    }
  }
  return best?.id ?? null;
}