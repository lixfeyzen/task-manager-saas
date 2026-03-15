import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
  filters: z.record(z.string(), z.unknown()),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.string().default("desc"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const views = await prisma.savedView.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ views });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, icon, sortBy, sortOrder, filters } = parsed.data;

  const view = await prisma.savedView.create({
    data: {
      name,
      icon,
      sortBy,
      sortOrder,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filters: filters as any,
      userId: session.user.id,
    },
  });
  return NextResponse.json({ view }, { status: 201 });
}
