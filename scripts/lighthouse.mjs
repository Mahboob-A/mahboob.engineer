#!/usr/bin/env node
/**
 * scripts/lighthouse.mjs
 *
 * Lighthouse audit pass. Hits every key route at desktop preset,
 * captures perf / a11y / best-practices / SEO scores, writes JSON.
 *
 * Usage:
 *   pnpm dev                       # in one terminal
 *   node scripts/lighthouse.mjs    # in another
 *
 * Output:
 *   lighthouse-report.json — JSON blob of all scores
 *   lighthouse-report.json prints a summary table to stdout
 *
 * Phase 6 (T6.9).
 */

import lighthouse from "lighthouse";
import { writeFile } from "node:fs/promises";

const BASE = process.env.SITE_URL || "http://localhost:3000";

const ROUTES = [
  "/",
  "/log",
  "/work",
  "/work/algocode",
  "/stack",
  "/writing",
  "/writing/linux-networking-part-1",
  "/contact",
];

const TARGETS = { performance: 90, accessibility: 95, "best-practices": 95, seo: 95 };

async function auditOne(route) {
  const result = await lighthouse(
    `${BASE}${route}`,
    {
      port: 9222, // unused; lighthouse v12 requires this even when launching chrome internally
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    },
  );
  if (!result) return null;
  const cats = result.lhr.categories;
  return {
    route,
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    "best-practices": Math.round(cats["best-practices"].score * 100),
    seo: Math.round(cats.seo.score * 100),
  };
}

async function main() {
  console.log(`Auditing ${ROUTES.length} routes via Lighthouse (desktop preset)...`);
  const results = [];
  for (const route of ROUTES) {
    try {
      const start = Date.now();
      const r = await auditOne(route);
      const elapsed = Date.now() - start;
      if (!r) {
        console.error(`✗ ${route}: lighthouse returned no result`);
        continue;
      }
      results.push(r);
      const flag =
        r.performance < TARGETS.performance ||
        r.accessibility < TARGETS.accessibility ||
        r["best-practices"] < TARGETS["best-practices"] ||
        r.seo < TARGETS.seo
          ? "✗"
          : "✓";
      console.log(
        `${flag} ${route.padEnd(40)} perf=${r.performance}  a11y=${r.accessibility}  bp=${r["best-practices"]}  seo=${r.seo}  (${elapsed}ms)`,
      );
    } catch (err) {
      console.error(`✗ ${route}: ${err.message}`);
    }
  }

  await writeFile("lighthouse-report.json", JSON.stringify(results, null, 2));

  /* Summary */
  const n = results.length;
  if (n === 0) {
    console.error("\nNo results captured.");
    process.exit(1);
  }
  const avg = (k) => Math.round(results.reduce((s, r) => s + r[k], 0) / n);
  const min = (k) => Math.min(...results.map((r) => r[k]));
  const minRoute = (k) => results.find((r) => r[k] === min(k))?.route ?? "?";

  console.log(`\n── Average across ${n} routes ──`);
  console.log(`  performance:     ${avg("performance")}  (min: ${min("performance")} @ ${minRoute("performance")})`);
  console.log(`  accessibility:   ${avg("accessibility")}  (min: ${min("accessibility")} @ ${minRoute("accessibility")})`);
  console.log(`  best-practices:  ${avg("best-practices")}  (min: ${min("best-practices")} @ ${minRoute("best-practices")})`);
  console.log(`  seo:             ${avg("seo")}  (min: ${min("seo")} @ ${minRoute("seo")})`);

  const anyLow = results.some(
    (r) =>
      r.performance < TARGETS.performance ||
      r.accessibility < TARGETS.accessibility ||
      r["best-practices"] < TARGETS["best-practices"] ||
      r.seo < TARGETS.seo,
  );
  if (anyLow) {
    console.error(`\n✗ At least one route is below target.`);
    process.exit(1);
  }
  console.log(`\n✓ All routes meet targets.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});