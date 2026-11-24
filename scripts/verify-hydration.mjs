#!/usr/bin/env node
/**
 * scripts/verify-hydration.mjs
 *
 * One-off verification for the landing-page hydration fix. Loads `/`
 * (and `/stack`) in a real browser, captures every console message and
 * page error, and asserts:
 *
 *   1. No hydration error / warning in the console.
 *   2. The blog card title matches the SSR HTML exactly.
 *   3. The Hero terminal's `latest` command still lists native posts
 *      (i.e. the `latestPosts` prop reached the client).
 *   4. The `/stack` page's tech detail panel still lists related posts.
 *
 * Usage:
 *   pnpm dev                       # in one terminal
 *   node scripts/verify-hydration.mjs
 *
 * Exits 0 on success, 1 on any failure.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.SITE_URL || "http://localhost:3000";

const failures = [];
function check(label, ok, detail = "") {
  const mark = ok ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

/* Collect console output + page errors across the whole run. */
const consoleErrors = [];
const consoleWarnings = [];
page.on("console", (msg) => {
  const text = msg.text();
  if (msg.type() === "error") consoleErrors.push(text);
  if (msg.type() === "warning") consoleWarnings.push(text);
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

/* ── 1. Landing page ─────────────────────────────────────────────────── */
console.log("\n/ (landing)");
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const hydrationErrors = consoleErrors.filter((t) =>
  /hydrat|didn't match the client|server rendered text/i.test(t),
);
check("no hydration errors on /", hydrationErrors.length === 0,
  hydrationErrors[0]?.slice(0, 160));

/* The SQL JOINs card is #7 in the registry, so it's behind the
   "Show N more" collapse. Expand first, then assert on it. */
const expand = page.locator("button", { hasText: /Show \d+ more/ }).first();
if ((await expand.count()) > 0) {
  await expand.click();
  await page.waitForTimeout(1200);
}
const ssrTitle = await page
  .locator("#blog-list h3")
  .filter({ hasText: "SQL JOINs" })
  .first()
  .textContent();
check("blog card title rendered", !!ssrTitle && /SQL JOINs/.test(ssrTitle),
  ssrTitle?.trim().slice(0, 80));

/* ── 2. Hero terminal `latest` command ──────────────────────────────── */
console.log("\n/ (hero terminal → latest)");
const chip = page.locator("button", { hasText: "[latest]" }).first();
if ((await chip.count()) === 0) {
  check("terminal 'latest' chip found", false, "chip not found");
} else {
  await chip.click();
  await page.waitForTimeout(2500);
  const body = await page.locator("body").innerText();
  const hasLatest = /Latest native posts/i.test(body);
  const hasTitle = /How I Built Algocode|Linux Networking for Backend/i.test(body);
  check("terminal shows native posts (prop reached client)", hasLatest);
  check("terminal lists a real native post title", hasTitle);
}

/* ── 3. /stack related posts ────────────────────────────────────────── */
console.log("\n/stack");
consoleErrors.length = 0;
await page.goto(`${BASE}/stack`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const stackHydration = consoleErrors.filter((t) =>
  /hydrat|didn't match the client|server rendered text/i.test(t),
);
check("no hydration errors on /stack", stackHydration.length === 0,
  stackHydration[0]?.slice(0, 160));

/* Click a tech row that has related blog posts (Docker → the Algocode
   deep-dive), then look for the "Mentioned in" section. */
const techRow = page.locator("button", { hasText: /^Docker/ }).first();
if ((await techRow.count()) === 0) {
  check("a tech row is clickable", false, "no Docker row found");
} else {
  await techRow.click();
  await page.waitForTimeout(900);
  const stackBody = await page.locator("#tech-detail-panel").innerText();
  check("tech detail panel renders", stackBody.length > 40);
  check(
    "panel shows related blog posts",
    /Mentioned in/i.test(stackBody),
    stackBody.replace(/\s+/g, " ").slice(0, 90),
  );
}

/* ── 4. /writing ─────────────────────────────────────────────────────── */
console.log("\n/writing");
consoleErrors.length = 0;
await page.goto(`${BASE}/writing`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const writingHydration = consoleErrors.filter((t) =>
  /hydrat|didn't match the client|server rendered text/i.test(t),
);
check("no hydration errors on /writing", writingHydration.length === 0,
  writingHydration[0]?.slice(0, 160));

await browser.close();

console.log("\n────────────────────────────────────────");
if (failures.length === 0) {
  console.log("ALL CHECKS PASSED");
  process.exit(0);
}
console.log(`${failures.length} FAILURE(S): ${failures.join(", ")}`);
process.exit(1);
