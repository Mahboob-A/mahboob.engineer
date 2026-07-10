/**
 * lib/mode.ts
 *
 * Mode toggle (flat | game) state. Master §6 rule #4:
 *   "No browser storage in Next.js. Cookie for mode preference only."
 *
 * Architecture:
 *   - The cookie is read on the server via `getModeFromCookies()` in a
 *     Server Component (Navbar on every page).
 *   - The user can flip it via a `<form action="/api/mode" method="post">`
 *     — a tiny Route Handler that reads the current value, toggles, and
 *     sets the new cookie with `redirect()` back to the current URL.
 *   - No localStorage. No client-side React state for the mode itself.
 */

import { cookies } from "next/headers";

export type Mode = "flat" | "game";

export const MODE_COOKIE = "mahboob_mode";
const ONE_YEAR = 60 * 60 * 24 * 365;

const DEFAULT_MODE: Mode = "flat";

/** Read the current mode from the request cookies (server-side). */
export async function getModeFromCookies(): Promise<Mode> {
  const store = await cookies();
  const c = store.get(MODE_COOKIE)?.value;
  return c === "game" ? "game" : DEFAULT_MODE;
}

/** Build the Set-Cookie header value for a target mode. */
export function buildModeCookie(mode: Mode): string {
  return `${MODE_COOKIE}=${mode}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
}
