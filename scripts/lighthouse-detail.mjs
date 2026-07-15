#!/usr/bin/env node
/**
 * scripts/lighthouse-detail.mjs — quick diagnostic
 *
 * Run Lighthouse on a single route with full category output.
 */
import lighthouse from "lighthouse";

const url = process.argv[2] || "http://localhost:3000/stack";

const result = await lighthouse(url, {
  port: 9222,
  output: "json",
  logLevel: "error",
  onlyCategories: ["accessibility"],
});

const audits = result.lhr.audits;
const cat = result.lhr.categories.accessibility;

console.log(`URL: ${url}  score=${Math.round(cat.score * 100)}`);
console.log(`\nFailing audits:`);
for (const ref of cat.auditRefs) {
  const a = audits[ref.id];
  if (a && a.score !== null && a.score < 1 && ref.weight > 0) {
    console.log(`  ✗ [weight ${ref.weight}] ${ref.id} — ${a.title}`);
    if (a.description) {
      console.log(`    ${a.description.split(".")[0]}.`);
    }
    if (a.details && a.details.items && a.details.items.length > 0) {
      for (const item of a.details.items.slice(0, 3)) {
        const sel = item.node?.selector || JSON.stringify(item).slice(0, 120);
        const snippet = item.node?.snippet || "";
        console.log(`      selector: ${sel}`);
        if (snippet) console.log(`      snippet:  ${snippet.slice(0, 200)}`);
      }
    }
  }
}