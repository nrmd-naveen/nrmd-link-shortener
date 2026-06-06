import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";

const createKeySchema = z.object({
  name: z.string().trim().min(1).max(128),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPreview: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
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

  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Generate a secure random key prefixed with "nrmd_"
  const rawKey = `nrmd_${randomBytes(32).toString("hex")}`;
  const keyHash = sha256(rawKey);
  const keyPreview = rawKey.slice(0, 12); // "nrmd_" + 7 chars

  const apiKey = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      keyHash,
      keyPreview,
      userId: session.user.id,
    },
    select: { id: true, name: true, keyPreview: true, createdAt: true },
  });

  // Return the raw key ONCE — never stored again
  return NextResponse.json({ ...apiKey, key: rawKey }, { status: 201 });
}
