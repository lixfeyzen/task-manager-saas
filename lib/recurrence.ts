/**
 * Recurrence utilities for task scheduling.
 * All functions are pure — no side effects — so they're easily unit-testable.
 */

import { addDays, addMonths, getDay, startOfDay } from "date-fns";

export type RecurringRule = "daily" | "weekly" | "monthly" | "weekdays";

/**
 * Given the current due date and a recurring rule, return the next due date.
 *
 * Edge cases handled:
 * - monthly: date-fns addMonths() correctly handles month-end (Jan 31 → Feb 28/29)
 * - weekdays: skips Saturday (6) and Sunday (0)
 * - null dueDate: uses today as the base so recurrence still fires
 */
export function getNextDueDate(currentDue: Date | null, rule: RecurringRule): Date {
  const base = currentDue ? startOfDay(currentDue) : startOfDay(new Date());

  switch (rule) {
    case "daily":
      return addDays(base, 1);

    case "weekly":
      return addDays(base, 7);

    case "monthly":
      // addMonths handles month-end: 2024-01-31 + 1 month = 2024-02-29 (leap) or 2024-02-28
      return addMonths(base, 1);

    case "weekdays": {
      // Advance at least one day, then keep skipping until Mon–Fri
      let next = addDays(base, 1);
      while (getDay(next) === 0 || getDay(next) === 6) {
        next = addDays(next, 1);
      }
      return next;
    }

    default:
      // Fallback: treat unknown rules as daily
      return addDays(base, 1);
  }
}

/**
 * Returns true when a task's recurrence rule is a recognised value.
 */
export function isValidRecurringRule(rule: string | null | undefined): rule is RecurringRule {
  return rule === "daily" || rule === "weekly" || rule === "monthly" || rule === "weekdays";
}
