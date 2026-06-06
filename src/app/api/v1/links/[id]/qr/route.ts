import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, generateQrSvg } from "@/lib/qr";
import { siteConfig } from "@/config/site";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "png";
  const size = Math.min(1000, Math.max(100, Number(searchParams.get("size") ?? 300)));
  const dark = searchParams.get("dark") ?? "#000000";
  const light = searchParams.get("light") ?? "#ffffff";

  const link = await prisma.url.findFirst({
    where: { id, userId: session.user.id },
    select: { shortId: true },
  });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shortUrl = `${siteConfig.url}/${link.shortId}`;

  if (format === "svg") {
    const svg = await generateQrSvg(shortUrl, { darkColor: dark, lightColor: light });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-${link.shortId}.svg"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // PNG as data URL — strip the prefix and send raw bytes
  const dataUrl = await generateQrDataUrl(shortUrl, { size, darkColor: dark, lightColor: light });
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${link.shortId}.png"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
