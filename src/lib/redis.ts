import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Key builders ─────────────────────────────────────────────────────────────

export const keys = {
  // Cached redirect target for a short ID
  shortLink: (shortId: string) => `sl:${shortId}`,
  // Cached "not found" negative — prevents DB hit for bad IDs
  shortLinkNotFound: (shortId: string) => `sl:404:${shortId}`,
} as const;

// ─── Cache value types ────────────────────────────────────────────────────────

export interface CachedLink {
  url: string;
  redirectType: number;
}
