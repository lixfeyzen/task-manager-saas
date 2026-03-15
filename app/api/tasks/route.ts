import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { startOfDay, endOfDay, addDays } from "date-fns";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
  recurringRule: z.string().optional().nullable(),
});

const TASK_INCLUDE = {
  tags: { include: { tag: true } },
};

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

  const where: Record<string, unknown> = { userId: session.user.id };

  // Status filter (supports comma-separated values)
  if (status && status !== "ALL") {
    const statuses = status.split(",");
    if (statuses.length > 1) {
      where.status = { in: statuses };
    } else {
      where.status = status;
    }
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
    if (dueDate === "today") {
      where.dueDate = { gte: today, lte: endOfDay(now) };
    } else if (dueDate === "upcoming") {
      where.dueDate = { gte: today, lte: addDays(today, 14) };
    } else if (dueDate === "overdue") {
      where.dueDate = { lt: today };
    }
  }

  if (tagIds && tagIds.length > 0) {
    where.tags = { some: { tagId: { in: tagIds } } };
  }

  const validSortFields: Record<string, string> = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    dueDate: "dueDate",
    priority: "priority",
    title: "title",
  };

  const orderBy = validSortFields[sortBy]
    ? { [validSortFields[sortBy]]: sortOrder }
    : { createdAt: "desc" as const };

  const tasks = await prisma.task.findMany({
    where,
    include: TASK_INCLUDE,
    orderBy,
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const { title, description, status, priority, dueDate, tagIds, isRecurring, recurringRule } = parsed.data;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        isRecurring,
        recurringRule,
        userId: session.user.id,
        completedAt: status === "DONE" ? new Date() : null,
        tags: tagIds.length > 0 ? {
          create: tagIds.map((tagId) => ({ tagId })),
        } : undefined,
      },
      include: TASK_INCLUDE,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    console.error("Create task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
