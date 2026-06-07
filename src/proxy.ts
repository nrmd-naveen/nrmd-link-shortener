import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { CachedLink } from "@/lib/redis";

// Use the Edge-compatible Redis client directly (no shared lib import — proxy runs on edge)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Paths that should never be treated as short IDs
const BYPASS_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
  "/login",
  "/register",
  "/dashboard",
  "/features",
  "/pricing",
  "/about",
  "/terms",
  "/privacy",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let non-redirect paths through
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Root path — let the page handle it
  if (pathname === "/") return NextResponse.next();

  // If the first segment looks like a URL (browser-bar shortening), let Next.js handle it
  const firstSegment = pathname.slice(1).split("/")[0];
  if (
    firstSegment.includes(".") ||
    firstSegment.startsWith("http%3A") ||
    firstSegment.startsWith("https%3A")
  ) {
    return NextResponse.next();
  }

  const shortId = firstSegment;

  // ── 1. Check Redis cache ───────────────────────────────────────────────────
  const cacheKey = `sl:${shortId}`;
  const notFoundKey = `sl:404:${shortId}`;

  const [cached, isNotFound] = await Promise.all([
    redis.get<CachedLink | string>(cacheKey),
    redis.get<number>(notFoundKey),
  ]);

  if (isNotFound) {
    return NextResponse.next(); // let the 404 page render
  }

  if (cached) {
    // Handle both the new object format and legacy string format
    if (typeof cached === "string") {
      return buildRedirect(req, cached, shortId, 302);
    }
    return buildRedirect(req, cached.url, shortId, cached.redirectType);
  }

  // ── 2. Cache miss — fall through to the page route ────────────────────────
  // The [...slug] page does the DB lookup, records the click, warms the cache, then redirects.
  return NextResponse.next();
}

function buildRedirect(
  req: NextRequest,
  destination: string,
  shortId: string,
  redirectType: number
): NextResponse {
  // Preserve any query params appended by the visitor
  const dest = new URL(destination);
  req.nextUrl.searchParams.forEach((value, key) => {
    if (!dest.searchParams.has(key)) dest.searchParams.set(key, value);
  });

  const status = redirectType === 301 ? 301 : 302;
  const res = NextResponse.redirect(dest, { status });
  // Mark as edge-cached so analytics can detect it
  res.headers.set("x-nrmd-source", "edge-cache");
  res.headers.set("x-nrmd-id", shortId);
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
