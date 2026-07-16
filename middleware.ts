/**
 * middleware.ts
 *
 * Sets `x-pathname` on every Server Component request so Server
 * Components can read the actual URL via `headers().get("x-pathname")`.
 *
 * Why: Navbar (a Server Component) needs to know the current URL to
 * highlight the active nav link. Next.js doesn't expose a stable
 * "current pathname" header out of the box — `x-invoke-path` is only
 * set for matched routes in some versions, `next-url` is the request
 * URL but only for App Router fetches, and `referer` only works when
 * the user clicks a link. So direct loads on inner routes
 * (`/log/taply`, `/work/algocode`) lose the active-state highlight
 * because all three fall through to `/`.
 *
 * This middleware reads `req.nextUrl.pathname` (always available on
 * Edge runtime) and forwards it as `x-pathname`. Server Components
 * read it via `headers().get("x-pathname")`.
 *
 * Phase 12 (T12.1) — fixes the Navbar active-state glow regression
 * reported after Phase 11 (T11.4).
 */

import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Forward the pathname so Server Components can read it via
  // `headers().get("x-pathname")`. Strip query string + hash —
  // pathname is what Navbar / future Server Components need.
  response.headers.set("x-pathname", request.nextUrl.pathname);

  return response;
}

/* Match every route except Next.js internals + static assets.
   - _next/* — Next.js dev/build artifacts
   - api/*   — API routes (their own routing)
   - favicon, robots, sitemap — static files
   - Files with extensions — public assets (images, etc.) */
export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)"],
};