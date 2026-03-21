/**
 * CSV generation utilities.
 * Pure functions — no server dependencies — so they're easily unit-testable.
 */

/** Escape a single value for safe CSV embedding. */
export function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in double-quotes if the value contains commas, newlines, or double-quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Convert an array of objects to a CSV string. */
export function objectsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(escapeCsvValue).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCsvValue(row[h])).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
}
