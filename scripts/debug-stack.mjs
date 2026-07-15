import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push("pageerror: " + err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push("console error: " + msg.text());
});
page.on("requestfailed", (req) => errors.push("request failed: " + req.url() + " — " + req.failure()?.errorText));

await page.goto("http://localhost:3000/stack", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(2000);

console.log("HTML lang:", await page.evaluate(() => document.documentElement.lang));
console.log("Body innerHTML first 200:", (await page.evaluate(() => document.body.innerHTML)).slice(0, 200));
console.log("Errors:", errors.length);
errors.slice(0, 10).forEach((e) => console.log("  -", e));

await browser.close();
