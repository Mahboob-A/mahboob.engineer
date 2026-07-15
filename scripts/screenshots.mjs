#!/usr/bin/env node
/**
 * scripts/screenshots.mjs
 *
 * Playwright screenshot pass. Hits every key route at three viewports
 * (375 / 768 / 1280 px), writes PNGs to `screenshots/<viewport>/<route>.png`.
 * Used as the visual regression baseline for Phase 6 (T6.9).
 *
 * Usage:
 *   pnpm dev                       # in one terminal
 *   node scripts/screenshots.mjs   # in another
 *
 * Exits 0 on success, 1 on any failure.
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.env.SITE_URL || "http://localhost:3000";
const OUT_DIR = "screenshots";

const VIEWPORTS = [
  { name: "375", width: 375, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
];

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/log", name: "log" },
  { path: "/work", name: "work" },
  { path: "/work/algocode", name: "work-algocode" },
  { path: "/work/taply", name: "work-taply" },
  { path: "/stack", name: "stack" },
  { path: "/writing", name: "writing" },
  { path: "/writing/linux-networking-part-1", name: "writing-linux" },
  { path: "/contact", name: "contact" },
  { path: "/game", name: "game" },
  { path: "/keystatic", name: "keystatic" },
];

async function main() {
  const browser = await chromium.launch();
  let failures = 0;

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      const dir = join(OUT_DIR, vp.name);
      await mkdir(dir, { recursive: true });
      const out = join(dir, `${route.name}.png`);
      try {
        const start = Date.now();
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        const elapsed = Date.now() - start;
        if (!resp) {
          console.error(`✗ ${vp.name} ${route.path}: no response`);
          failures++;
          continue;
        }
        if (resp.status() >= 400) {
          console.error(`✗ ${vp.name} ${route.path}: HTTP ${resp.status()}`);
          failures++;
          continue;
        }
        await page.screenshot({ path: out, fullPage: false });
        console.log(`✓ ${vp.name.padEnd(5)} ${route.path.padEnd(40)} → ${out}  (${elapsed}ms)`);
      } catch (err) {
        console.error(`✗ ${vp.name} ${route.path}: ${err.message}`);
        failures++;
      }
    }
    await ctx.close();
  }

  await browser.close();
  if (failures > 0) {
    console.error(`\n${failures} screenshot(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${VIEWPORTS.length * ROUTES.length} screenshots written to ${OUT_DIR}/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});