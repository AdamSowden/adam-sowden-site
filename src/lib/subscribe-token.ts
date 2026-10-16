// Signed, time-limited form token for the newsletter route.
//
// The form fetches a token from GET /api/subscribe just before it posts. The
// token is an HMAC over an expiry and a nonce, so a client that never loaded
// the page (the bots posting JSON straight at the route) has nothing valid to
// send. It is stateless: no store, works across lambdas, costs one hash.
//
// Secret: SUBSCRIBE_TOKEN_SECRET if set, otherwise derived from GHL_API_KEY
// so the guard works with zero extra configuration. The derivation is a
// one-way hash; the API key never leaves the server either way.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const FORM_TOKEN_TTL_MS = 15 * 60 * 1000;

export function formTokenSecret(): string | null {
  const explicit = process.env.SUBSCRIBE_TOKEN_SECRET;
  if (explicit) return explicit;
  const key = process.env.GHL_API_KEY;
  if (!key) return null;
  return createHash("sha256").update(`subscribe-form-token:${key}`).digest("hex");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function mintFormToken(secret: string, now: number = Date.now()): string {
  const payload = `${now + FORM_TOKEN_TTL_MS}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** A token-shaped string that will never verify. Returned to callers we do not trust. */
export function decoyFormToken(now: number = Date.now()): string {
  return `${now + FORM_TOKEN_TTL_MS}.${randomBytes(9).toString("base64url")}.${randomBytes(32).toString("base64url")}`;
}

export function verifyFormToken(
  token: unknown,
  secret: string,
  now: number = Date.now()
): boolean {
  if (typeof token !== "string" || token.length > 200) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expRaw, nonce, mac] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || !nonce || !mac) return false;
  if (exp < now) return false;
  if (exp > now + FORM_TOKEN_TTL_MS + 60_000) return false; // not one we minted
  const expected = sign(`${expRaw}.${nonce}`, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
