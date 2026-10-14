// URL validation and SSRF guard for the Analyzer fetcher.
//
// The public endpoint fetches whatever URL it is handed, so every request and
// every redirect hop goes through here first (site-analyser-spec.md §11, §13).
// Rules: http/https only; hostname must resolve; no private, loopback,
// link-local, multicast, CGNAT, documentation or metadata ranges in any
// resolved address; no bare IP targets at all; a short hostname blocklist.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type GuardOk = { ok: true; url: URL; host: string; addresses: string[] };
export type GuardFail = {
  ok: false;
  reason: "invalid-url" | "blocked-scheme" | "blocked-host" | "dns-failed" | "private-address";
  detail: string;
};
export type GuardResult = GuardOk | GuardFail;

const BLOCKED_HOST_SUFFIXES = [
  "localhost", ".localhost", ".local", ".internal", ".home.arpa", ".lan",
  "metadata.google.internal", ".vercel-internal", ".onion",
];

export function normaliseInput(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  if (s.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^\[|\]$/g, "");
    // Hostname must look like a hostname (or an IP, which guardUrl then refuses).
    if (!/^[a-z0-9.-]+$/i.test(host) && !host.includes(":")) return null;
    u.hash = "";
    u.username = "";
    u.password = "";
    return u.toString();
  } catch {
    return null;
  }
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function inCidr4(ip: string, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return ((ipv4ToInt(ip) & mask) >>> 0) === ((ipv4ToInt(base) & mask) >>> 0);
}

const PRIVATE_V4 = [
  "0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16",
  "172.16.0.0/12", "192.0.0.0/24", "192.0.2.0/24", "192.168.0.0/16",
  "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24", "224.0.0.0/4",
  "240.0.0.0/4", "255.255.255.255/32",
];

export function isPrivateIPv4(ip: string): boolean {
  return PRIVATE_V4.some((c) => inCidr4(ip, c));
}

export function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible forms.
  const mapped = lower.match(/^(?:::ffff:|::)(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (lower === "::" || lower === "::1") return true;
  // Expand first hextet for prefix checks.
  const first = lower.split(":")[0] || "0";
  const h = parseInt(first.padStart(4, "0"), 16);
  if ((h & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((h & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
  if ((h & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  if (lower.startsWith("2001:db8")) return true; // documentation
  if (lower.startsWith("64:ff9b")) {
    // NAT64 well-known prefix embeds an IPv4.
    return true;
  }
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return true; // unknown shape: refuse
}

export function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOST_SUFFIXES.some((s) => h === s.replace(/^\./, "") || h.endsWith(s))) return true;
  return false;
}

export type Resolver = (host: string) => Promise<string[]>;

export const defaultResolver: Resolver = async (host) => {
  const res = await lookup(host, { all: true, verbatim: true });
  return res.map((r) => r.address);
};

/**
 * Validate a URL for fetching. Resolves DNS and refuses if ANY address is private.
 * Call this for the initial URL and again for every redirect target.
 */
export async function guardUrl(input: string, resolver: Resolver = defaultResolver): Promise<GuardResult> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "invalid-url", detail: "Not a valid URL." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "blocked-scheme", detail: `Scheme ${url.protocol} is not allowed.` };
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host) return { ok: false, reason: "invalid-url", detail: "Missing hostname." };
  if (isIP(host)) {
    return { ok: false, reason: "blocked-host", detail: "Bare IP addresses are not analysed." };
  }
  if (isBlockedHostname(host)) {
    return { ok: false, reason: "blocked-host", detail: `Host ${host} is not allowed.` };
  }
  if (!host.includes(".")) {
    return { ok: false, reason: "blocked-host", detail: "Single-label hostnames are not allowed." };
  }
  let addresses: string[];
  try {
    addresses = await resolver(host);
  } catch (e) {
    return { ok: false, reason: "dns-failed", detail: `Could not resolve ${host}: ${(e as Error).message}` };
  }
  if (!addresses.length) {
    return { ok: false, reason: "dns-failed", detail: `No addresses for ${host}.` };
  }
  const bad = addresses.find(isPrivateAddress);
  if (bad) {
    return { ok: false, reason: "private-address", detail: `${host} resolves to a non-public address.` };
  }
  return { ok: true, url, host, addresses };
}

/** Same registrable host, ignoring a leading www. */
export function sameSite(a: string, b: string): boolean {
  const strip = (h: string) => h.toLowerCase().replace(/^www\./, "");
  return strip(a) === strip(b);
}
