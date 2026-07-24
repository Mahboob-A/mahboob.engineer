/**
 * tests/api/run-all.ts
 *
 * Test runner executing all API security and vulnerability test suites.
 */

import { execSync } from "node:child_process";

function runAllSecurityTests() {
  console.log("==================================================");
  console.log("   EXECUTING ALL SECURITY & LEAK TEST SUITES      ");
  console.log("==================================================\n");

  const suites = [
    "tests/api/contact.test.ts",
    "tests/api/rag-security.test.ts",
    "tests/api/keystatic.test.ts",
  ];

  for (const suite of suites) {
    console.log(`[TEST SUITE] ${suite}`);
    execSync(`npx tsx ${suite}`, { stdio: "inherit" });
  }

  console.log("==================================================");
  console.log("   ALL API SECURITY & LEAK TEST SUITES PASSED!   ");
  console.log("==================================================\n");
}

runAllSecurityTests();
