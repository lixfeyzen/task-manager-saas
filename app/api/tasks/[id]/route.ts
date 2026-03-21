import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getNextDueDate, isValidRecurringRule } from "@/lib/recurrence";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringRule: z.string().optional().nullable(),
  reminderAt: z.string().optional().nullable(),
});

const TASK_INCLUDE = {
  tags: { include: { tag: true } },
};

async function getTask(taskId: string, userId: string) {
  return prisma.task.findFirst({ where: { id: taskId, userId } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, userId: session.user.id },
    include: TASK_INCLUDE,
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getTask(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { tagIds, dueDate, status, reminderAt, ...rest } = parsed.data;

    const completedAt =
      status === "DONE" && existing.status !== "DONE" ? new Date()
      : status !== "DONE" && existing.status === "DONE" ? null
      : undefined;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        reminderAt: reminderAt !== undefined ? (reminderAt ? new Date(reminderAt) : null) : undefined,
        // Reset reminderSent when a new reminderAt is set
        ...(reminderAt ? { reminderSent: false } : {}),
        ...(completedAt !== undefined && { completedAt }),
        ...(tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: TASK_INCLUDE,
    });

    // ─── Recurrence: auto-create next occurrence when a recurring task is completed ───
    const justCompleted = status === "DONE" && existing.status !== "DONE";
    if (justCompleted && task.isRecurring && isValidRecurringRule(task.recurringRule)) {
      const nextDue = getNextDueDate(task.dueDate, task.recurringRule);

      // Carry over the current tag set to the new occurrence
      const currentTagIds = task.tags.map((t) => t.tag.id);

      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: "TODO",
          priority: task.priority,
          isRecurring: true,
          recurringRule: task.recurringRule,
          dueDate: nextDue,
          userId: task.userId,
          // Copy reminder offset if present (shift by same amount from new due date)
          ...(currentTagIds.length > 0 && {
            tags: { create: currentTagIds.map((tagId) => ({ tagId })) },
          }),
        },
      });
    }

    return NextResponse.json({ task });
  } catch (err) {
    console.error("Update task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getTask(id, session.user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
