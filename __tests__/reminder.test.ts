/**
 * Unit tests for email utility stubs (lib/email.ts)
 *
 * Since Resend requires a network call, we test the DEV fallback path
 * (no RESEND_API_KEY set) and verify the function returns true in that mode.
 *
 * For full integration tests, see the test plan in the README.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("sendReminderEmail (dev fallback — no RESEND_API_KEY)", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Ensure key is not set in the test environment
    delete process.env.RESEND_API_KEY;
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("returns true without throwing when key is absent", async () => {
    // Dynamic import so env var is checked at call time
    const { sendReminderEmail } = await import("../lib/email");

    const result = await sendReminderEmail({
      to: "user@example.com",
      taskTitle: "Finish test coverage",
      taskId: "task_123",
      dueDate: new Date("2024-12-01"),
    });

    expect(result).toBe(true);
  });

  it("logs a dev message to console", async () => {
    const { sendReminderEmail } = await import("../lib/email");

    await sendReminderEmail({
      to: "user@example.com",
      taskTitle: "Write docs",
      taskId: "task_456",
      dueDate: null,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Email DEV]")
    );
  });
});
