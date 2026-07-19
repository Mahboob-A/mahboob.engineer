/**
 * proxy.ts
 *
 * Sets `x-pathname` on page requests so Server Components that need a
 * request-time path fallback can read it via `headers().get("x-pathname")`.
 *
 * Navbar active-link highlighting is now client-side in ActiveNavLink, but
 * the mode toggle still uses this path as a no-JS redirect fallback.
 */

import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("x-pathname", request.nextUrl.pathname);

  return response;
}

/* Match every route except Next.js internals + static assets.
   - _next/* — Next.js dev/build artifacts
   - api/*   — API routes
   - favicon, robots, sitemap — static files
   - Files with extensions — public assets */
export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\..*).*)"],
};
