import { customAlphabet } from "nanoid";
import { siteConfig } from "@/config/site";
import { prisma } from "./prisma";

// URL-safe, no ambiguous chars (0/O, 1/l/I)
const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
const generate = customAlphabet(alphabet, siteConfig.shortIdLength);

export function generateShortId(): string {
  return generate();
}

/** Resolve a desired keyword to one that is definitely available.
 *  foo → foo (available) | foo1 → foo2 → … (collision loop)
 */
export async function resolveKeyword(desired: string): Promise<string> {
  const base = desired.toLowerCase().replace(/[^a-z0-9_-]/g, "");

  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await prisma.url.findUnique({
      where: { shortId: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}${suffix}`;
    suffix++;
  }
}

/** Pick a random ID that's guaranteed unique in DB. */
export async function uniqueRandomId(): Promise<string> {
  while (true) {
    const id = generateShortId();
    const existing = await prisma.url.findUnique({
      where: { shortId: id },
      select: { id: true },
    });
    if (!existing) return id;
  }
}
