import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

// Vercel Cron — runs daily at midnight UTC
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Protect with CRON_SECRET so only Vercel can trigger this
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 1. Delete expired anonymous links
  const deletedAnon = await prisma.url.deleteMany({
    where: {
      isAnonymous: true,
      anonExpiresAt: { lte: now },
    },
  });

  // 2. Mark date-expired user links as EXPIRED
  const markedExpired = await prisma.url.updateMany({
    where: {
      expiresAt: { lte: now },
      status: "ACTIVE",
    },
    data: { status: "EXPIRED" },
  });

  // 3. Bust Redis cache for newly-expired links (best-effort — cache TTL will handle the rest)
  // We rely on natural cache expiry here since iterating all keys is expensive

  return NextResponse.json({
    deletedAnonymous: deletedAnon.count,
    markedExpired: markedExpired.count,
    timestamp: now.toISOString(),
  });
}
