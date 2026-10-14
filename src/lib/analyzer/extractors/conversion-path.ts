// Dimension 9, Conversion path and speed-to-lead. Spec Group A (the eight
// checks) plus CRO items 3, 4, 17.

import type { ExtractorResult, Finding } from "../types";
import { classifyChat } from "./engagement";
import { finding, hostOf, na, pathOf, type ExtractorContext } from "./common";

const BOOKING_RE = /calendly\.com|cal\.com\/|leadconnectorhq\.com\/widget\/booking|msgsndr\.com\/widget\/booking|meetings\.hubspot\.com|acuityscheduling\.com|tidycal\.com|zcal\.co|savvycal\.com|oncehub\.com|youcanbook\.me|appointlet|book(ing|-a-call|-call|now)?(\/|$)/i;
const RESPONSE_RE = /(respond|reply|replies|get back|answer)[^.]{0,40}\b(within|in under|in)\s+(\d+|one|two|a few|minutes|seconds|an hour|the hour|24 hours|one business day)|\b(24\/7|around the clock|same[- ]day response|instant(ly)? (reply|response))/i;
const CTA_RE = /\b(book|get|start|schedule|talk|call|contact|apply|download|try|request|claim|join|see|show me|send me)\b/i;
const PHONE_TEXT_RE = /(\+?\d[\d\s().-]{8,}\d)/;

export async function runConversionPath(ctx: ExtractorContext): Promise<ExtractorResult> {
  const { crawl } = ctx;
  const f: Finding[] = [];
  const pages = crawl.pages;
  const home = crawl.home!;
  const chat = classifyChat(crawl);
  const allLinks = pages.flatMap((p) => p.links.map((l) => l.href));
  const allIframes = pages.flatMap((p) => p.iframes);
  const allText = pages.map((p) => p.text).join("\n");

  // cp-01 form field count
  const forms = pages.flatMap((p) => p.forms.map((fm) => ({ fm, page: pathOf(p.finalUrl) })));
  const contactForms = forms.filter((x) => x.fm.hasEmail || x.fm.hasPhone || x.fm.fieldCount >= 3);
  if (!contactForms.length) f.push(na(9, "cp-01", 15, "No contact form found on crawled pages."));
  else {
    const best = contactForms.reduce((a, b) => (a.fm.fieldCount <= b.fm.fieldCount ? a : b));
    f.push(finding(9, "cp-01", best.fm.fieldCount <= 5 ? "pass" : best.fm.fieldCount <= 8 ? "partial" : "fail", 15, `Shortest contact form has ${best.fm.fieldCount} fields (${best.page}).`, [best.page]));
  }

  // cp-04 booking link
  const booking = [...allLinks, ...allIframes].find((u) => BOOKING_RE.test(u) && !/\/blog\//i.test(u));
  // cp-05 phone
  const tel = pages.flatMap((p) => p.telLinks);
  const phoneText = PHONE_TEXT_RE.test(home.text);

  // cp-02 paths other than a form
  const paths: string[] = [];
  if (booking) paths.push("booking link");
  if (tel.length) paths.push("tap-to-call phone");
  if (chat.cls >= 3) paths.push("chat that converses");
  else if (chat.cls > 0) paths.push("chat capture widget");
  f.push(finding(9, "cp-02", paths.length >= 2 ? "pass" : paths.length === 1 ? "partial" : "fail", 15, paths.length ? `A ready buyer can act via: ${paths.join(", ")}.` : "The only way to act is a form, email or an untracked phone number."));

  // cp-03 chat converses
  f.push(finding(9, "cp-03", chat.cls >= 3 ? "pass" : chat.cls > 0 ? "partial" : "fail", 12, chat.cls >= 3 ? `Chat present (${chat.vendors.find((v) => v.cls === chat.cls)?.name}).` : chat.cls > 0 ? `Chat bubble is a capture or scripted widget (${chat.vendors[0]?.name}); it collects details rather than answering.` : "No chat surface."));

  f.push(finding(9, "cp-04", booking ? "pass" : "fail", 12, booking ? `Booking link present: ${hostOf(booking) || booking}.` : "No booking or calendar link found on crawled pages."));
  f.push(finding(9, "cp-05", tel.length ? "pass" : phoneText ? "partial" : "fail", 10, tel.length ? `${tel.length} tap-to-call link(s) (${tel[0]}).` : phoneText ? "A phone number appears as text but is not a tel: link." : "No phone number found."));

  // cp-06 response-time promise
  const m = allText.match(RESPONSE_RE);
  f.push(finding(9, "cp-06", m ? "pass" : "fail", 10, m ? `Response promise stated: "${m[0].trim().slice(0, 120)}".` : "No stated response time anywhere on crawled pages."));

  // cp-07 after-hours path
  const afterHours = chat.cls === 4 || Boolean(booking) || /24\/7|around the clock/i.test(allText);
  f.push(finding(9, "cp-07", afterHours ? "pass" : chat.cls === 3 ? "partial" : "fail", 10, afterHours ? "An after-hours path exists (agent, booking link, or a 24/7 statement)." : chat.cls === 3 ? "Live chat during hours only; after hours the visitor is back to a form." : "No path that works outside business hours."));

  // cp-08 CTA on every page
  const withCta = pages.filter((p) => p.links.some((l) => l.internal && CTA_RE.test(l.text) && l.text.length <= 60) || p.forms.length > 0 || p.telLinks.length > 0);
  const share = withCta.length / Math.max(1, pages.length);
  f.push(finding(9, "cp-08", share === 1 ? "pass" : share >= 0.6 ? "partial" : "fail", 8, `${withCta.length} of ${pages.length} crawled pages carry a call to action.`));

  // cp-09 confirmation surface
  const thank = [...crawl.sitemap.urls.map((u) => u.loc), ...allLinks].find((u) => /thank|confirm|booked|success/i.test(hostOf(u) ? new URL(u).pathname : u));
  f.push(finding(9, "cp-09", thank ? "pass" : "fail", 4, thank ? `Confirmation page exists: ${new URL(thank).pathname}.` : "No thank-you or confirmation page found."));

  // cp-10 first-person CTA copy
  const ctaTexts = pages.flatMap((p) => p.links.filter((l) => l.internal && CTA_RE.test(l.text) && l.text.length <= 60).map((l) => l.text));
  const firstPerson = ctaTexts.filter((t) => /\b(my|me)\b/i.test(t));
  const second = ctaTexts.filter((t) => /\byour\b/i.test(t));
  if (!ctaTexts.length) f.push(na(9, "cp-10", 4, "No CTA link text to assess."));
  else f.push(finding(9, "cp-10", firstPerson.length ? "pass" : second.length ? "partial" : "fail", 4, firstPerson.length ? `First-person CTA copy: "${firstPerson[0]}".` : second.length ? `CTA copy uses "your" ("${second[0]}"); first person converts better.` : `CTA copy is generic: "${ctaTexts[0]}".`));

  return { dimension: 9, findings: f };
}
