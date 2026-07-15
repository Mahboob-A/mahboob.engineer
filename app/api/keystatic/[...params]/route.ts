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
 */
import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";

export const { GET, POST } = makeRouteHandler({ config });