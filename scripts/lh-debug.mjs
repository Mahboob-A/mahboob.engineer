import lighthouse from "lighthouse";
import { writeFileSync } from "node:fs";

const url = process.argv[2] || "http://localhost:3000/stack";
const r = await lighthouse(url, {
  port: 9222,
  output: "json",
  logLevel: "silent",
  onlyCategories: ["accessibility"],
});
writeFileSync("/tmp/lh-result.json", JSON.stringify(r.lhr, null, 2));
console.log("Final URL navigated:", r.lhr.finalDisplayedUrl || r.lhr.finalUrl);
console.log("Final URL requested:", r.lhr.requestedUrl);
console.log("Run warnings:", r.lhr.runWarnings);
console.log("Top-level errors:", r.lhr.runtimeError);
