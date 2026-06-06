import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const days = Math.min(90, Math.max(1, Number(searchParams.get("days") ?? 30)));

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, shortId: true },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const since = startOfDay(subDays(new Date(), days));

  const clicks = await prisma.click.findMany({
    where: { urlId: id, createdAt: { gte: since } },
    select: {
      createdAt: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      os: true,
      referrerDomain: true,
    },
  });

  const totalClicks = clicks.length;

  // Time series — group by day
  type ClickRow = (typeof clicks)[number];

  const byDay: Record<string, number> = {};
  for (let i = days; i >= 0; i--) {
    byDay[format(subDays(new Date(), i), "yyyy-MM-dd")] = 0;
  }
  for (const c of clicks) {
    const day = format(c.createdAt, "yyyy-MM-dd");
    if (day in byDay) byDay[day]++;
  }
  const timeSeries = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  // Breakdowns
  const countries = topN(clicks.map((c: ClickRow) => c.country ?? "Unknown"));
  const devices = topN(clicks.map((c: ClickRow) => c.device ?? "unknown"));
  const browsers = topN(clicks.map((c: ClickRow) => c.browser ?? "Unknown"));
  const os = topN(clicks.map((c: ClickRow) => c.os ?? "Unknown"));
  const referrers = topN(
    clicks.map((c: ClickRow) => c.referrerDomain ?? "Direct / None"),
    10
  );

  return NextResponse.json({
    totalClicks,
    timeSeries,
    countries,
    devices,
    browsers,
    os,
    referrers,
  });
}

function topN(values: string[], n = 10): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}
