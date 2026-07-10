/**
 * app/api/mode/route.ts
 *
 * POST /api/mode — flip the mode cookie between "flat" and "game",
 * then redirect back to the page that submitted the form.
 *
 * Cookie-only state (no localStorage, no DB) per master §6 rule #4.
 * Body shape: application/x-www-form-urlencoded with `mode` + `next`.
 */

import { NextResponse } from "next/server";
import type { Mode } from "@/lib/mode";
import { buildModeCookie, MODE_COOKIE } from "@/lib/mode";

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const desiredRaw = form.get("mode");
  const next = (form.get("next") as string | null) ?? "/";

  // Validate against the cookie's two possible values.
  const desired: Mode = desiredRaw === "game" ? "game" : "flat";

  const url = new URL(next, req.url);
  const res = NextResponse.redirect(url, { status: 303 });

  // Setting via Set-Cookie header keeps this single-purpose endpoint free
  // of any Next.js cookie helpers.
  res.headers.append("Set-Cookie", buildModeCookie(desired));
  // Defensive: also strip the cookie if someone forces an empty value.
  if (desiredRaw === null) {
    res.headers.append("Set-Cookie", `${MODE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`);
  }

  return res;
}
