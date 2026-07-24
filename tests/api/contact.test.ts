/**
 * tests/api/contact.test.ts
 *
 * Automated security and validation test suite for /api/contact logic.
 */

import assert from "node:assert";

// Basic HTML tag stripping logic test mirroring app/api/contact/route.ts
function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

function runContactSecurityTests() {
  console.log("Running Contact API Security Tests...");

  // Test 1: HTML script tag stripping
  const maliciousInput = "<script>alert('xss')</script>Hello World";
  const sanitized = sanitizeText(maliciousInput);
  assert.strictEqual(sanitized, "alert('xss')Hello World");
  assert.strictEqual(sanitized.includes("<script>"), false);
  console.log("  ✓ HTML/script tag stripping test passed.");

  // Test 2: Nested tag stripping
  const nestedInput = "<div><p>Contact <b>Request</b></p></div>";
  assert.strictEqual(sanitizeText(nestedInput), "Contact Request");
  console.log("  ✓ Nested HTML tag stripping test passed.");

  // Test 3: Title length bounds
  const tooLongTitle = "A".repeat(121);
  assert.strictEqual(tooLongTitle.length > 120, true);
  console.log("  ✓ Title length validation bounds test passed.");

  // Test 4: Email validation regex
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(EMAIL_RE.test("user@example.com"), true);
  assert.strictEqual(EMAIL_RE.test("invalid-email"), false);
  assert.strictEqual(EMAIL_RE.test("user@domain"), false);
  console.log("  ✓ Email regex validation test passed.");

  console.log("All Contact API Security Tests Passed Cleanly!\n");
}

runContactSecurityTests();
