import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis, keys } from "@/lib/redis";
import { urlSchema, keywordSchema } from "@/lib/url";

const updateSchema = z.object({
  url: urlSchema.optional(),
  keyword: keywordSchema,
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  clickLimit: z.number().int().positive().nullable().optional(),
  ogTitle: z.string().max(512).nullable().optional(),
  ogDescription: z.string().max(1024).nullable().optional(),
  ogImage: z.string().url().max(512).nullable().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { clicks: true } },
    },
  });

  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(link);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tagIds, keyword, ...rest } = parsed.data;

  // If keyword changed, verify new keyword doesn't conflict with another link
  if (keyword && keyword !== link.shortId) {
    const conflict = await prisma.url.findFirst({
      where: { shortId: keyword, id: { not: id } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Keyword already taken", suggestion: `${keyword}1` },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.url.update({
    where: { id },
    data: {
      ...rest,
      ...(keyword ? { shortId: keyword } : {}),
      ...(tagIds !== undefined
        ? {
            tags: {
              deleteMany: {},
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { clicks: true } },
    },
  });

  // Bust Redis cache for old and new shortId
  await Promise.all([
    redis.del(keys.shortLink(link.shortId)),
    keyword && keyword !== link.shortId ? redis.del(keys.shortLink(keyword)) : Promise.resolve(),
  ]);

  // Re-warm if still active
  if (updated.status === "ACTIVE") {
    await redis.set(keys.shortLink(updated.shortId), updated.url, {
      ex: Number(process.env.REDIS_CACHE_TTL ?? 3600),
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
    select: { shortId: true },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.url.delete({ where: { id } });
  await redis.del(keys.shortLink(link.shortId));

  return new NextResponse(null, { status: 204 });
}
