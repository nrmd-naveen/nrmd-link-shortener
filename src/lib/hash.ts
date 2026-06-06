import { createHash } from "crypto";

/** SHA-256 of (value + salt). Used for privacy-safe IP storage and API key hashing. */
export function sha256(value: string, salt = ""): string {
  return createHash("sha256").update(value + salt).digest("hex");
}

/** Derive a stable per-request IP hash using the app secret as salt */
export function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET ?? "nrmd-salt";
  return sha256(ip, salt);
}
