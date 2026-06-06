import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tagSchema = z.object({
  name: z.string().trim().min(1).max(64),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color")
    .default("#6366f1"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { urls: true } } },
  });

  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const tag = await prisma.tag.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json(tag, { status: 201 });
}
