import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
import { siteConfig } from "@/config/site";

const { anon, auth, api } = siteConfig.rateLimit;

export const anonRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(anon.requests, `${anon.windowSeconds} s`),
  prefix: "rl:anon",
  analytics: true,
});

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(auth.requests, `${auth.windowSeconds} s`),
  prefix: "rl:auth",
  analytics: true,
});

export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(api.requests, `${api.windowSeconds} s`),
  prefix: "rl:api",
  analytics: true,
});
