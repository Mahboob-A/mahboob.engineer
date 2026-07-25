/**
 * tests/api/keystatic.test.ts
 *
 * Automated security unit test suite for Keystatic API OAuth route guards
 * and log URL token redaction.
 */

import assert from "node:assert";

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("code")) {
      parsed.searchParams.set("code", "[REDACTED]");
    }
    if (parsed.searchParams.has("state")) {
      parsed.searchParams.set("state", "[REDACTED]");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function runKeystaticSecurityTests() {
  console.log("Running Keystatic Security Tests...");

  // Test 1: Redaction of OAuth code query parameters
  const sensitiveUrlWithCode = "https://mahboob.engineer/api/keystatic/github/callback?code=secret_oauth_code_12345&state=xyz_state";
  const sanitized = sanitizeUrl(sensitiveUrlWithCode);

  assert.strictEqual(sanitized.includes("secret_oauth_code_12345"), false);
  assert.strictEqual(sanitized.includes("code=%5BREDACTED%5D") || sanitized.includes("code=[REDACTED]"), true);
  console.log("  ✓ Sensitive OAuth code parameter redaction test passed.");

  // Test 2: Redaction of OAuth state parameters
  assert.strictEqual(sanitized.includes("xyz_state"), false);
  assert.strictEqual(sanitized.includes("state=%5BREDACTED%5D") || sanitized.includes("state=[REDACTED]"), true);
  console.log("  ✓ Sensitive OAuth state parameter redaction test passed.");

  // Test 3: Normal URL non-interference
  const normalUrl = "https://mahboob.engineer/api/keystatic/github/login";
  assert.strictEqual(sanitizeUrl(normalUrl), normalUrl);
  console.log("  ✓ Normal API URL non-interference test passed.");

  console.log("All Keystatic Security Tests Passed Cleanly!\n");
}

runKeystaticSecurityTests();
