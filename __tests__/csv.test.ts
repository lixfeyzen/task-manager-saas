/**
 * Unit tests for CSV generation utilities (lib/csv.ts)
 *
 * Tests cover:
 *   - escapeCsvValue: basic values, commas, quotes, newlines, null/undefined
 *   - objectsToCsv: header row, data rows, empty array, special chars
 */

import { describe, it, expect } from "vitest";
import { escapeCsvValue, objectsToCsv } from "../lib/csv";

describe("escapeCsvValue", () => {
  it("returns plain strings as-is when no special chars", () => {
    expect(escapeCsvValue("hello")).toBe("hello");
  });

  it("wraps strings with commas in double-quotes", () => {
    expect(escapeCsvValue("hello, world")).toBe('"hello, world"');
  });

  it("wraps strings with newlines in double-quotes", () => {
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });

  it("escapes embedded double-quotes by doubling them", () => {
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
  });

  it("returns empty string for null", () => {
    expect(escapeCsvValue(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeCsvValue(undefined)).toBe("");
  });

  it("converts numbers to strings", () => {
    expect(escapeCsvValue(42)).toBe("42");
    expect(escapeCsvValue(3.14)).toBe("3.14");
  });

  it("converts booleans to strings", () => {
    expect(escapeCsvValue(true)).toBe("true");
    expect(escapeCsvValue(false)).toBe("false");
  });
});

describe("objectsToCsv", () => {
  it("returns empty string for empty array", () => {
    expect(objectsToCsv([])).toBe("");
  });

  it("generates correct header and data rows", () => {
    const rows = [{ id: "1", title: "Task One", done: false }];
    const csv = objectsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,title,done");
    expect(lines[1]).toBe("1,Task One,false");
  });

  it("handles multiple rows", () => {
    const rows = [
      { a: "1", b: "x" },
      { a: "2", b: "y" },
    ];
    const csv = objectsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[0]).toBe("a,b");
    expect(lines[1]).toBe("1,x");
    expect(lines[2]).toBe("2,y");
  });

  it("escapes special characters in values", () => {
    const rows = [{ title: 'Review "Q4" report, ASAP' }];
    const csv = objectsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[1]).toBe('"Review ""Q4"" report, ASAP"');
  });

  it("handles null and undefined values as empty strings", () => {
    const rows = [{ a: null, b: undefined, c: "ok" }];
    const csv = objectsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[1]).toBe(",,ok");
  });
});
