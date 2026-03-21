/**
 * GET /api/tasks/export
 *
 * Exports the authenticated user's tasks as a CSV download.
 * Accepts the same filter query params as GET /api/tasks so users can
 * export exactly what they see on screen.
 *
 * Query params (all optional):
 *   status, priority, search, dueDate (today|upcoming|overdue|all),
 *   tagIds (comma-separated), sortBy, sortOrder
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { objectsToCsv } from "@/lib/csv";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const dueDate = searchParams.get("dueDate");
  const tagIds = searchParams.get("tagIds")?.split(",").filter(Boolean);
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  // Build the same where clause as the main tasks endpoint
  const where: Record<string, unknown> = { userId: session.user.id };

  if (status && status !== "ALL") {
    const statuses = status.split(",");
    where.status = statuses.length > 1 ? { in: statuses } : status;
  }
  if (priority && priority !== "ALL") where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (dueDate && dueDate !== "all") {
    const now = new Date();
    const today = startOfDay(now);
    if (dueDate === "today") where.dueDate = { gte: today, lte: endOfDay(now) };
    else if (dueDate === "upcoming") where.dueDate = { gte: today, lte: addDays(today, 14) };
    else if (dueDate === "overdue") where.dueDate = { lt: today };
  }
  if (tagIds && tagIds.length > 0) {
    where.tags = { some: { tagId: { in: tagIds } } };
  }

  const validSortFields: Record<string, string> = {
    createdAt: "createdAt", updatedAt: "updatedAt",
    dueDate: "dueDate", priority: "priority", title: "title",
  };
  const orderBy = validSortFields[sortBy]
    ? { [validSortFields[sortBy]]: sortOrder }
    : { createdAt: "desc" as const };

  const tasks = await prisma.task.findMany({
    where,
    orderBy,
    include: { tags: { include: { tag: true } } },
  });

  // Flatten tasks to CSV-friendly rows
  const rows = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : "",
    completedAt: task.completedAt ? task.completedAt.toISOString() : "",
    isRecurring: task.isRecurring,
    recurringRule: task.recurringRule ?? "",
    reminderAt: task.reminderAt ? task.reminderAt.toISOString() : "",
    tags: task.tags.map((t) => t.tag.name).join("; "),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));

  const csv = objectsToCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
