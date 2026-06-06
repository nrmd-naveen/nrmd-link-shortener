import { z } from "zod";

export const urlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .transform((v) => (v.startsWith("http") ? v : `https://${v}`))
  .pipe(z.string().url("Must be a valid URL"));

export const keywordSchema = z
  .string()
  .trim()
  .max(64, "Keyword too long (max 64 chars)")
  .regex(
    /^[a-zA-Z0-9_-]*$/,
    "Only letters, numbers, hyphens, and underscores"
  )
  .optional();

/** Normalise a URL for deduplication — strips trailing slash, lowercases scheme+host */
export function normaliseUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    u.hostname = u.hostname.toLowerCase();
    // remove default ports
    if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
      u.port = "";
    }
    // remove trailing slash from bare paths
    if (u.pathname === "/") u.pathname = "/";
    return u.toString();
  } catch {
    return rawUrl;
  }
}

/** Extract the domain from a URL string, returns null on failure */
export function extractDomain(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
}

/** Fetch OG metadata for a URL (runs server-side only, best-effort) */
export async function fetchUrlMeta(
  url: string
): Promise<{ title: string | null; description: string | null; favicon: string | null }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "nrmd.link/1.0 (+https://nrmd.link)" },
    });
    if (!res.ok) return { title: null, description: null, favicon: null };

    const html = await res.text();

    const title =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
      null;

    const description =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1] ??
      html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ??
      null;

    const origin = new URL(url).origin;
    const favicon =
      html.match(/<link[^>]+rel="icon"[^>]+href="([^"]+)"/i)?.[1] ??
      `${origin}/favicon.ico`;

    return {
      title: title?.trim().slice(0, 512) ?? null,
      description: description?.trim().slice(0, 1024) ?? null,
      favicon: favicon?.trim().slice(0, 512) ?? null,
    };
  } catch {
    return { title: null, description: null, favicon: null };
  }
}
