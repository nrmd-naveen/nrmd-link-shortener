import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normaliseUrl, urlSchema, fetchUrlMeta } from "@/lib/url";
import { uniqueRandomId } from "@/lib/short-id";
import { siteConfig } from "@/config/site";
import { logAudit } from "@/lib/audit";

const bulkCreateSchema = z.object({
  urls: z.array(urlSchema).min(1).max(50),
});

const bulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bulkCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const results = await Promise.all(
    parsed.data.urls.map(async (rawUrl) => {
      try {
        const url = normaliseUrl(rawUrl);
        const shortId = await uniqueRandomId();
        const meta = await fetchUrlMeta(url);

        const link = await prisma.url.create({
          data: {
            shortId,
            url,
            userId: session.user.id,
            title: meta.title,
            description: meta.description,
            favicon: meta.favicon,
          },
        });

        logAudit({
          userId: session.user.id,
          action: "link.create",
          entityId: link.id,
          entityType: "link",
          meta: { shortId: link.shortId, url: link.url, bulk: true },
        }).catch(() => {});

        return {
          url,
          shortId: link.shortId,
          shortUrl: `${siteConfig.url}/${link.shortId}`,
        };
      } catch (err) {
        return { url: rawUrl, error: err instanceof Error ? err.message : "Unknown error" };
      }
    })
  );

  return NextResponse.json({ results }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bulkStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { ids, status } = parsed.data;

  await prisma.url.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { status },
  });

  logAudit({
    userId: session.user.id,
    action: "link.bulk_update",
    entityType: "link",
    meta: { ids, status },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { ids } = parsed.data;

  const links = await prisma.url.findMany({
    where: { id: { in: ids }, userId: session.user.id },
    select: { id: true },
  });
  const ownedIds = links.map((l) => l.id);

  await prisma.url.deleteMany({
    where: { id: { in: ownedIds } },
  });

  logAudit({
    userId: session.user.id,
    action: "link.bulk_delete",
    entityType: "link",
    meta: { ids: ownedIds },
  }).catch(() => {});

  return NextResponse.json({ deleted: ownedIds.length });
}
