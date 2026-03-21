/**
 * Email sending via Resend.
 *
 * Required environment variables:
 *   RESEND_API_KEY   — your Resend API key (get one at resend.com)
 *   EMAIL_FROM       — sender address, e.g. "TaskManager <noreply@yourdomain.com>"
 *
 * If RESEND_API_KEY is not set, emails are logged to the console instead
 * so the rest of the app continues to work in local development without
 * an API key configured.
 */

import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM ?? "TaskManager <noreply@taskmanager.app>";

export interface ReminderEmailPayload {
  to: string;
  taskTitle: string;
  taskId: string;
  dueDate?: Date | null;
}

/**
 * Send a task reminder email.
 * Returns true on success, false on failure.
 */
export async function sendReminderEmail(payload: ReminderEmailPayload): Promise<boolean> {
  const { to, taskTitle, taskId, dueDate } = payload;
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const taskUrl = `${appUrl}/tasks`;
  const dueDateStr = dueDate
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(dueDate)
    : "soon";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#7C5CFF;margin-bottom:8px">⏰ Task Reminder</h2>
      <p style="font-size:16px;margin-bottom:4px">
        You have a task due <strong>${dueDateStr}</strong>:
      </p>
      <div style="background:#f5f3ff;border-left:4px solid #7C5CFF;padding:12px 16px;border-radius:4px;margin:16px 0">
        <strong style="font-size:16px">${taskTitle}</strong>
      </div>
      <a href="${taskUrl}"
         style="display:inline-block;background:#7C5CFF;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">
        View Task
      </a>
      <p style="margin-top:24px;font-size:12px;color:#888">
        Task ID: ${taskId} · Sent by TaskManager
      </p>
    </div>
  `;

  const resend = getResend();

  if (!resend) {
    // Dev fallback: log instead of sending
    console.log(`[Email DEV] Reminder to ${to}: "${taskTitle}" due ${dueDateStr}`);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Reminder: "${taskTitle}" is due ${dueDateStr}`,
      html,
    });
    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return false;
  }
}
