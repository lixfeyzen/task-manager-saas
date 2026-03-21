/**
 * Unit tests for rate limiting utilities (lib/rate-limit.ts)
 *
 * Tests cover:
 *   - Allow requests within the limit
 *   - Block requests that exceed the limit
 *   - Window reset: requests succeed again after window expires
 *   - Different keys are tracked independently
 *   - getClientIp: X-Forwarded-For extraction, fallback to "unknown"
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, getClientIp } from "../lib/rate-limit";

// We use a very short window (100ms) so tests don't need to wait long
const TIGHT_CONFIG = { limit: 3, windowMs: 200 };

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `test-allow-${Date.now()}`;
    const r1 = checkRateLimit(key, TIGHT_CONFIG);
    const r2 = checkRateLimit(key, TIGHT_CONFIG);
    const r3 = checkRateLimit(key, TIGHT_CONFIG);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests that exceed the limit", () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, TIGHT_CONFIG);
    checkRateLimit(key, TIGHT_CONFIG);
    checkRateLimit(key, TIGHT_CONFIG);

    const r4 = checkRateLimit(key, TIGHT_CONFIG);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("resets the window after windowMs elapses", async () => {
    const key = `test-reset-${Date.now()}`;
    checkRateLimit(key, TIGHT_CONFIG);
    checkRateLimit(key, TIGHT_CONFIG);
    checkRateLimit(key, TIGHT_CONFIG);

    // Exhaust the limit
    expect(checkRateLimit(key, TIGHT_CONFIG).success).toBe(false);

    // Wait for the window to expire
    await new Promise((r) => setTimeout(r, 250));

    // Should be allowed again
    expect(checkRateLimit(key, TIGHT_CONFIG).success).toBe(true);
  });

  it("tracks different keys independently", () => {
    const keyA = `test-a-${Date.now()}`;
    const keyB = `test-b-${Date.now()}`;

    // Exhaust key A
    checkRateLimit(keyA, TIGHT_CONFIG);
    checkRateLimit(keyA, TIGHT_CONFIG);
    checkRateLimit(keyA, TIGHT_CONFIG);
    expect(checkRateLimit(keyA, TIGHT_CONFIG).success).toBe(false);

    // Key B should still be fine
    expect(checkRateLimit(keyB, TIGHT_CONFIG).success).toBe(true);
  });

  it("returns correct remaining count", () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = checkRateLimit(key, TIGHT_CONFIG);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, TIGHT_CONFIG);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, TIGHT_CONFIG);
    expect(r3.remaining).toBe(0);
  });

  it("returns a resetAt in the future", () => {
    const key = `test-resetat-${Date.now()}`;
    const before = Date.now();
    const result = checkRateLimit(key, TIGHT_CONFIG);
    expect(result.resetAt).toBeGreaterThan(before);
    expect(result.resetAt).toBeLessThanOrEqual(before + TIGHT_CONFIG.windowMs + 10);
  });
});

describe("getClientIp", () => {
  it("extracts the first IP from X-Forwarded-For", () => {
    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("returns a single IP from X-Forwarded-For without proxy chain", () => {
    const req = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when X-Forwarded-For is absent", () => {
    const req = new Request("http://localhost/test");
    expect(getClientIp(req)).toBe("unknown");
  });
});
