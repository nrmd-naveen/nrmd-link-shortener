import { UAParser } from "ua-parser-js";
import { hashIp } from "./hash";
import { prisma } from "./prisma";

interface ClickMeta {
  urlId: string;
  request: {
    headers: Headers;
    ip?: string;
    geo?: {
      country?: string;
      city?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
  };
}

export async function recordClick({ urlId, request }: ClickMeta): Promise<void> {
  const ua = request.headers.get("user-agent") ?? "";
  const referrer = request.headers.get("referer") ?? request.headers.get("referrer") ?? null;

  // Parse user agent
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const device = getDeviceType(result);
  const browser = result.browser.name ?? null;
  const os = result.os.name ?? null;

  // Referrer domain extraction
  let referrerDomain: string | null = null;
  if (referrer) {
    try {
      referrerDomain = new URL(referrer).hostname;
    } catch {
      // malformed referrer — ignore
    }
  }

  // Geo from Vercel edge headers (set by middleware / Next.js edge runtime)
  const country =
    request.geo?.country ??
    request.headers.get("x-vercel-ip-country") ??
    null;
  const city =
    request.geo?.city ??
    request.headers.get("x-vercel-ip-city") ??
    null;
  const region =
    request.geo?.region ??
    request.headers.get("x-vercel-ip-country-region") ??
    null;
  const latitude = request.geo?.latitude ?? null;
  const longitude = request.geo?.longitude ?? null;

  // Privacy-safe IP hash
  const rawIp =
    request.ip ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  const ipHash = rawIp ? hashIp(rawIp) : null;

  // Skip obvious bots
  if (isBot(ua)) return;

  await prisma.click.create({
    data: {
      urlId,
      country: country?.slice(0, 2) ?? null,
      city: city?.slice(0, 128) ?? null,
      region: region?.slice(0, 128) ?? null,
      latitude: latitude?.slice(0, 16) ?? null,
      longitude: longitude?.slice(0, 16) ?? null,
      device,
      browser: browser?.slice(0, 64) ?? null,
      os: os?.slice(0, 64) ?? null,
      referrer: referrer?.slice(0, 1024) ?? null,
      referrerDomain: referrerDomain?.slice(0, 256) ?? null,
      ipHash,
    },
  });
}

function getDeviceType(result: UAParser.IResult): string {
  const type = result.device.type;
  if (!type) return "desktop";
  if (type === "mobile") return "mobile";
  if (type === "tablet") return "tablet";
  return "other";
}

const BOT_PATTERN =
  /bot|crawler|spider|slurp|ia_archiver|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i;

function isBot(ua: string): boolean {
  return BOT_PATTERN.test(ua);
}
