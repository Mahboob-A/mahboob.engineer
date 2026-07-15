/**
 * app/api/keystatic/[...params]/route.ts
 *
 * Keystatic API route — handles read/write for the local filesystem
 * (dev) or GitHub (prod). Catch-all dynamic segment covers all the
 * admin's internal endpoints (collection list, single-entry,
 * asset upload, etc.).
 *
 * Keystatic 5.x: `makeRouteHandler({config, clientId?, clientSecret?,
 * secret?})` returns an object with GET + POST handlers — App Router
 * compatible. clientId/clientSecret/secret fall back to env vars
 * automatically (KEYSTATIC_GITHUB_CLIENT_ID etc.).
 *
 * Phase 6 (T6.6): runtime guard that returns a clear 500 if GitHub
 * OAuth env vars aren't set in production. The build still succeeds
 * (warnings only); the runtime check protects the admin from silent
 * `local`-storage failures on Vercel's read-only filesystem.
 */
import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";

const { GET: keystaticGet, POST: keystaticPost } = makeRouteHandler({
  config,
});

function isMissingOAuthEnv(): boolean {
  return (
    !process.env.KEYSTATIC_SECRET ||
    !process.env.KEYSTATIC_GITHUB_CLIENT_ID ||
    !process.env.KEYSTATIC_GITHUB_CLIENT_SECRET ||
    !process.env.KEYSTATIC_GITHUB_REPO_OWNER ||
    !process.env.KEYSTATIC_GITHUB_REPO_NAME
  );
}

function missingEnvResponse() {
  return new Response(
    JSON.stringify({
      ok: false,
      error:
        "Keystatic GitHub OAuth env vars are not configured on this server. " +
        "Set KEYSTATIC_SECRET + KEYSTATIC_GITHUB_CLIENT_ID + KEYSTATIC_GITHUB_CLIENT_SECRET " +
        "+ KEYSTATIC_GITHUB_REPO_OWNER + KEYSTATIC_GITHUB_REPO_NAME in Vercel → " +
        "Environment Variables. See docs/DEPLOY.md for the setup checklist.",
    }),
    {
      status: 500,
      headers: { "content-type": "application/json" },
    },
  );
}

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production" && isMissingOAuthEnv()) {
    return missingEnvResponse();
  }
  return keystaticGet(request);
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production" && isMissingOAuthEnv()) {
    return missingEnvResponse();
  }
  return keystaticPost(request);
}