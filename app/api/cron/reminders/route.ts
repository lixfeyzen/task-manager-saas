/**
 * GET /api/cron/reminders
 *
 * This endpoint should be called on a schedule (e.g. every minute or every 5 minutes)
 * to fire due reminders and send notification emails.
 *
 * Scheduling options:
 *   - Vercel Cron: add to vercel.json (see below)
 *   - Railway / Render: set up an external cron to hit this URL
 *   - Self-hosted: use a Linux cron job with curl
 *
 * Vercel cron example (vercel.json):
 *   {
 *     "crons": [{ "path": "/api/cron/reminders", "schedule": "* * * * *" }]
 *   }
 *
 * Security:
 *   Set CRON_SECRET in your environment. The endpoint will reject requests
 *   that don't include it in the Authorization header:
 *     Authorization: Bearer <CRON_SECRET>
 *
 * The handler:
 *   1. Finds all un-sent reminders whose reminderAt <= now for non-DONE tasks
 *   2. Sends a reminder email via Resend for each
 *   3. Marks reminderSent = true so they don't fire again
 *   4. Returns a summary payload for observability
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // ── Auth: reject unless the correct CRON_SECRET is provided ──────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // ── Find tasks with a due reminder that hasn't been sent yet ─────────────
  const tasks = await prisma.task.findMany({
    where: {
      reminderAt: { lte: now },
      reminderSent: false,
      status: { not: "DONE" }, // Skip already-completed tasks
    },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  if (tasks.length === 0) {
    return NextResponse.json({ fired: 0, skipped: 0, errors: 0 });
  }

  let fired = 0;
  let errors = 0;

  // Process reminders in parallel (cap concurrency via Promise.all — safe for
  // small batches; add p-limit for very large datasets in the future)
  await Promise.all(
    tasks.map(async (task) => {
      const sent = await sendReminderEmail({
        to: task.user.email,
        taskTitle: task.title,
        taskId: task.id,
        dueDate: task.dueDate,
      });

      if (sent) {
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true },
        });
        fired++;
      } else {
        errors++;
      }
    })
  );

  return NextResponse.json({ fired, skipped: 0, errors, total: tasks.length });
}
