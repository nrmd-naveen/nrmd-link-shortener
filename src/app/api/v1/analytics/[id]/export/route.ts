import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") === "json" ? "json" : "csv";
  const range = searchParams.get("range") ?? "30d";

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, shortId: true },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let since: Date | undefined;
  if (range === "7d")  since = subDays(new Date(), 7);
  if (range === "30d") since = subDays(new Date(), 30);
  if (range === "90d") since = subDays(new Date(), 90);

  const clicks = await prisma.click.findMany({
    where: {
      urlId: id,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: {
      createdAt: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      os: true,
      referrerDomain: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const filename = `clicks-${link.shortId}-${range}.${format}`;

  if (format === "json") {
    return new NextResponse(JSON.stringify(clicks), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // CSV
  const CSV_HEADERS = "createdAt,country,city,device,browser,os,referrerDomain";
  const rows = clicks.map((c) =>
    [
      c.createdAt.toISOString(),
      c.country ?? "",
      c.city ?? "",
      c.device ?? "",
      c.browser ?? "",
      c.os ?? "",
      c.referrerDomain ?? "",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [CSV_HEADERS, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
