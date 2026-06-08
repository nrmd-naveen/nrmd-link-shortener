export const siteConfig = {
  name: "NRMD Links",
  description: "The fastest way to shorten URLs — no login required.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://nrmd.link",
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? "nrmd.link",

  // Anonymous link lifetime — configurable via env
  anonTtlHours: Number(process.env.ANON_LINK_TTL_HOURS ?? 24),

  // Short ID defaults
  shortIdLength: Number(process.env.SHORT_ID_LENGTH ?? 5),

  // Redis cache TTL for hot links (seconds)
  redisCacheTtl: Number(process.env.REDIS_CACHE_TTL ?? 3600),

  // Rate limits
  rateLimit: {
    // Anonymous shortening: 10 links per hour per IP
    anon: {
      requests: Number(process.env.RATE_LIMIT_ANON_REQUESTS ?? 10),
      windowSeconds: Number(process.env.RATE_LIMIT_ANON_WINDOW ?? 3600),
    },
    // Authenticated shortening: 100 links per hour per user
    auth: {
      requests: Number(process.env.RATE_LIMIT_AUTH_REQUESTS ?? 100),
      windowSeconds: Number(process.env.RATE_LIMIT_AUTH_WINDOW ?? 3600),
    },
    // API key: 1000 per hour per key
    api: {
      requests: Number(process.env.RATE_LIMIT_API_REQUESTS ?? 1000),
      windowSeconds: Number(process.env.RATE_LIMIT_API_WINDOW ?? 3600),
    },
  },
} as const;
