// Light email hygiene for the newsletter route: a block list of the common
// disposable-inbox providers and a DNS check that the domain can receive
// mail at all. Neither is exhaustive; both are cheap.

import { promises as dns } from "node:dns";

// Top disposable / throwaway providers plus the ones seen in the Oct 2026
// opt-in spike (mailchuwee.com). Matched on the domain and any subdomain.
const DISPOSABLE_DOMAINS = new Set<string>([
  "mailchuwee.com",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "grr.la",
  "sharklasers.com",
  "spam4.me",
  "pokemail.net",
  "10minutemail.com",
  "10minutemail.net",
  "10minemail.com",
  "20minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.net",
  "tempmailo.com",
  "tempmail.plus",
  "tempr.email",
  "tmpmail.net",
  "tmpmail.org",
  "tmails.net",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "trashmail.com",
  "trashmail.de",
  "trashmail.me",
  "trashmail.net",
  "trash-mail.com",
  "getnada.com",
  "nada.email",
  "dispostable.com",
  "maildrop.cc",
  "throwawaymail.com",
  "throwam.com",
  "mohmal.com",
  "fakeinbox.com",
  "fakemail.net",
  "mailnesia.com",
  "emailondeck.com",
  "mintemail.com",
  "discard.email",
  "discardmail.com",
  "spamgourmet.com",
  "mailcatch.com",
  "33mail.com",
  "burnermail.io",
  "mail.tm",
  "1secmail.com",
  "1secmail.org",
  "1secmail.net",
  "moakt.com",
  "moakt.cc",
  "inboxkitten.com",
  "harakirimail.com",
  "mailsac.com",
  "tempinbox.com",
  "mytemp.email",
  "crazymailing.com",
  "emailfake.com",
  "generator.email",
  "dropmail.me",
  "luxusmail.org",
  "mailpoof.com",
  "mail-temp.com",
  "mailtemp.net",
  "emailtemporanea.com",
  "tempail.com",
  "temp-mail.ru",
  "mailexpire.com",
  "anonbox.net",
  "anonymbox.com",
  "spamex.com",
  "mailhazard.com",
  "mailnull.com",
  "mailzilla.com",
  "getairmail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "mailforspam.com",
  "spambox.us",
  "spamfree24.org",
  "binkmail.com",
  "bobmail.info",
  "safetymail.info",
  "suremail.info",
  "zetmail.com",
  "emailsensei.com",
  "incognitomail.org",
  "owlpic.com",
  "filzmail.com",
  "deadaddress.com",
  "mailmoat.com",
  "nowmymail.com",
  "koszmail.pl",
  "mailbox.in.ua",
  "rcpt.at",
  "e4ward.com",
  "spamherelots.com",
  "trbvm.com",
  "mailmetrash.com",
  "mt2015.com",
  "mt2014.com",
  "fakemailgenerator.com",
  "emailgenerator.pro",
  "internxt.com",
  "boximail.com",
  "cock.li",
]);

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase().replace(/\.$/, "");
}

/** True when the domain, or any parent domain, is a known disposable provider. */
export function isDisposableDomain(domain: string): boolean {
  const labels = domain.toLowerCase().split(".");
  for (let i = 0; i < labels.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(labels.slice(i).join("."))) return true;
  }
  return false;
}

function isNoRecord(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error("dns timeout"), { code: "ETIMEOUT" })), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Can this domain receive mail? Returns:
 *   true  — it has a usable MX record, or no MX but an A/AAAA record
 *           (RFC 5321 fallback);
 *   false — DNS says definitively that there is no MX and no address record,
 *           or the MX is a "null MX" (RFC 7505);
 *   null  — the lookup timed out or the resolver errored, so nothing is known.
 * Callers should treat `null` as "allow" to avoid dropping real people on a
 * DNS hiccup.
 */
export async function domainAcceptsMail(
  domain: string,
  timeoutMs = 1500
): Promise<boolean | null> {
  if (!domain || !/^[a-z0-9.-]+$/i.test(domain)) return false;
  try {
    const mx = await withTimeout(dns.resolveMx(domain), timeoutMs);
    const usable = mx.filter((r) => r.exchange && r.exchange !== "." && r.exchange !== "");
    if (usable.length > 0) return true;
    if (mx.length > 0) return false; // null MX: domain explicitly refuses mail
  } catch (err) {
    if (!isNoRecord(err)) return null;
  }
  // No MX. Fall back to an address record.
  const lookups = [dns.resolve4(domain), dns.resolve6(domain)];
  const results = await Promise.allSettled(lookups.map((p) => withTimeout(p, timeoutMs)));
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.length > 0) return true;
  }
  const allDefinitive = results.every(
    (r) => r.status === "rejected" && isNoRecord(r.reason)
  );
  return allDefinitive ? false : null;
}
