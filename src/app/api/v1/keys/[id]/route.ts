import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const key = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.apiKey.delete({ where: { id } });

  logAudit({
    userId: session.user.id,
    action: "apikey.delete",
    entityId: id,
    entityType: "apikey",
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
