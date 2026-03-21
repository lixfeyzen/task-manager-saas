/**
 * Unit tests for recurrence utilities (lib/recurrence.ts)
 *
 * Tests cover:
 *   - Daily recurrence
 *   - Weekly recurrence
 *   - Monthly recurrence including month-end / leap-year edge cases
 *   - Weekdays recurrence skipping weekends
 *   - Null due date (base falls back to today)
 *   - Unknown rule fallback
 *   - isValidRecurringRule type guard
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getNextDueDate, isValidRecurringRule } from "../lib/recurrence";

describe("getNextDueDate", () => {
  describe("daily", () => {
    it("advances by exactly 1 day", () => {
      const base = new Date("2024-03-15T00:00:00.000Z");
      const next = getNextDueDate(base, "daily");
      expect(next.toISOString().startsWith("2024-03-16")).toBe(true);
    });
  });

  describe("weekly", () => {
    it("advances by exactly 7 days", () => {
      const base = new Date("2024-03-15T00:00:00.000Z");
      const next = getNextDueDate(base, "weekly");
      expect(next.toISOString().startsWith("2024-03-22")).toBe(true);
    });
  });

  describe("monthly", () => {
    it("advances by one calendar month (normal date)", () => {
      const base = new Date("2024-03-15T00:00:00.000Z");
      const next = getNextDueDate(base, "monthly");
      expect(next.getMonth()).toBe(3); // April is month index 3
      expect(next.getDate()).toBe(15);
    });

    it("clamps Jan 31 to Feb 29 in a leap year", () => {
      const base = new Date("2024-01-31T00:00:00.000Z");
      const next = getNextDueDate(base, "monthly");
      // 2024 is a leap year — Feb has 29 days
      expect(next.getFullYear()).toBe(2024);
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(29);
    });

    it("clamps Jan 31 to Feb 28 in a non-leap year", () => {
      const base = new Date("2023-01-31T00:00:00.000Z");
      const next = getNextDueDate(base, "monthly");
      // 2023 is not a leap year — Feb has 28 days
      expect(next.getFullYear()).toBe(2023);
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(28);
    });

    it("advances March 31 to April 30 (month-end clamping)", () => {
      const base = new Date("2024-03-31T00:00:00.000Z");
      const next = getNextDueDate(base, "monthly");
      expect(next.getMonth()).toBe(3); // April
      expect(next.getDate()).toBe(30);
    });
  });

  describe("weekdays", () => {
    it("advances Friday to Monday (skips Sat and Sun)", () => {
      // 2024-03-15 is a Friday
      const base = new Date("2024-03-15T00:00:00.000Z");
      const next = getNextDueDate(base, "weekdays");
      expect(next.getDay()).toBe(1); // Monday
      expect(next.toISOString().startsWith("2024-03-18")).toBe(true);
    });

    it("advances Thursday to Friday (no skip needed)", () => {
      // 2024-03-14 is a Thursday
      const base = new Date("2024-03-14T00:00:00.000Z");
      const next = getNextDueDate(base, "weekdays");
      expect(next.getDay()).toBe(5); // Friday
    });

    it("advances Saturday to Monday (same-day handling)", () => {
      // 2024-03-16 is a Saturday — next weekday is Mon 18
      const base = new Date("2024-03-16T00:00:00.000Z");
      const next = getNextDueDate(base, "weekdays");
      expect(next.getDay()).toBe(1); // Monday
    });
  });

  describe("null dueDate fallback", () => {
    it("uses today as base when dueDate is null", () => {
      const before = Date.now();
      const next = getNextDueDate(null, "daily");
      const after = Date.now();
      // Result should be roughly tomorrow (within same-day tolerance)
      expect(next.getTime()).toBeGreaterThanOrEqual(before);
      expect(next.getTime()).toBeLessThanOrEqual(after + 24 * 60 * 60 * 1000 + 1000);
    });
  });

  describe("unknown rule fallback", () => {
    it("falls back to +1 day for an unrecognised rule", () => {
      const base = new Date("2024-03-15T00:00:00.000Z");
      // @ts-expect-error — intentionally testing invalid rule
      const next = getNextDueDate(base, "hourly");
      expect(next.toISOString().startsWith("2024-03-16")).toBe(true);
    });
  });
});

describe("isValidRecurringRule", () => {
  it("returns true for all valid rules", () => {
    expect(isValidRecurringRule("daily")).toBe(true);
    expect(isValidRecurringRule("weekly")).toBe(true);
    expect(isValidRecurringRule("monthly")).toBe(true);
    expect(isValidRecurringRule("weekdays")).toBe(true);
  });

  it("returns false for invalid values", () => {
    expect(isValidRecurringRule("hourly")).toBe(false);
    expect(isValidRecurringRule("")).toBe(false);
    expect(isValidRecurringRule(null)).toBe(false);
    expect(isValidRecurringRule(undefined)).toBe(false);
  });
});
