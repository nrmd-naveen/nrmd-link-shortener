import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normaliseUrl, urlSchema, keywordSchema, fetchUrlMeta } from "@/lib/url";
import { resolveKeyword, uniqueRandomId } from "@/lib/short-id";
import { anonRatelimit, authRatelimit } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";
import { addHours } from "date-fns";

const createLinkSchema = z.object({
  url: urlSchema,
  keyword: keywordSchema,
  // Link controls (auth-only features)
  expiresAt: z.string().datetime().optional(),
  clickLimit: z.number().int().positive().optional(),
  password: z.string().min(1).max(128).optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  ogTitle: z.string().max(512).optional(),
  ogDescription: z.string().max(1024).optional(),
  ogImage: z.string().url().max(512).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // ── Rate limiting ────────────────────────────────────────────────────────
  const rateLimiter = session?.user ? authRatelimit : anonRatelimit;
  const rateLimitKey = session?.user ? session.user.id : ip;
  const { success, limit, remaining, reset } = await rateLimiter.limit(rateLimitKey);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const {
    url: rawUrl,
    keyword,
    expiresAt,
    clickLimit,
    password,
    tagIds,
    ogTitle,
    ogDescription,
    ogImage,
  } = parsed.data;

  // Authenticated-only controls
  if (!session?.user && (expiresAt || clickLimit !== undefined || password || tagIds?.length)) {
    return NextResponse.json(
      { error: "Sign in to use advanced link features." },
      { status: 401 }
    );
  }

  const normalisedUrl = normaliseUrl(rawUrl);

  // ── Deduplication (only for authenticated users — anon links are ephemeral) ──
  if (session?.user && !keyword) {
    const existing = await prisma.url.findFirst({
      where: { url: normalisedUrl, userId: session.user.id },
      select: { shortId: true },
    });
    if (existing) {
      return NextResponse.json({
        shortId: existing.shortId,
        shortUrl: `${siteConfig.url}/${existing.shortId}`,
        duplicate: true,
      });
    }
  }

  // ── Resolve short ID ────────────────────────────────────────────────────
  const shortId = keyword ? await resolveKeyword(keyword) : await uniqueRandomId();

  // ── Fetch OG metadata (non-blocking best-effort) ──────────────────────
  const meta = await fetchUrlMeta(normalisedUrl);

  // ── Password hashing (bcrypt via Web Crypto — edge-safe) ─────────────
  let hashedPassword: string | null = null;
  if (password) {
    const { hash } = await import("bcryptjs");
    hashedPassword = await hash(password, 10);
  }

  // ── Create record ────────────────────────────────────────────────────
  const isAnon = !session?.user;
  const anonExpiresAt = isAnon
    ? addHours(new Date(), siteConfig.anonTtlHours)
    : null;

  const link = await prisma.url.create({
    data: {
      shortId,
      url: normalisedUrl,
      userId: session?.user?.id ?? null,
      isAnonymous: isAnon,
      anonExpiresAt,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clickLimit: clickLimit ?? null,
      password: hashedPassword,
      title: meta.title,
      description: meta.description,
      favicon: meta.favicon,
      ogTitle: ogTitle ?? null,
      ogDescription: ogDescription ?? null,
      ogImage: ogImage ?? null,
      ...(tagIds?.length && session?.user
        ? {
            tags: {
              create: tagIds.map((tagId) => ({ tagId })),
            },
          }
        : {}),
    },
  });

  return NextResponse.json(
    {
      shortId: link.shortId,
      shortUrl: `${siteConfig.url}/${link.shortId}`,
      url: link.url,
      isAnonymous: link.isAnonymous,
      expiresAt: link.anonExpiresAt ?? link.expiresAt,
    },
    { status: 201 }
  );
}

// ── GET /api/v1/links — list authenticated user's links ────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const search = searchParams.get("search") ?? undefined;
  const tagId = searchParams.get("tagId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const where = {
    userId: session.user.id,
    ...(search
      ? {
          OR: [
            { shortId: { contains: search, mode: "insensitive" as const } },
            { url: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(status ? { status: status as "ACTIVE" | "PAUSED" | "ARCHIVED" | "EXPIRED" } : {}),
  };

  const [links, total] = await Promise.all([
    prisma.url.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        _count: { select: { clicks: true } },
      },
    }),
    prisma.url.count({ where }),
  ]);

  return NextResponse.json({
    links,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
