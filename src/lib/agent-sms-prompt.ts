// Channel adapter for the Site Conversation Agent when it runs over SMS
// and email instead of the website widget.
//
// Same brain, different output contract. SYSTEM_PROMPT_CORE already
// carries the persona, the methodology, the offer and the booking rules;
// re-stating any of that here would create two sources of truth that
// drift apart. This file only appends what changes when the conversation
// moves off the page: message length, formatting, and the fact that the
// agent now knows who it's talking to.

import { SYSTEM_PROMPT_CORE, BOOKING_URL } from "./chat-prompt";
import type { AgentChannel } from "./ghl";

export type AgentContext = {
  firstName?: string | null;
  source?: string | null;
  tags?: string[];
  /** e.g. "Australia/Sydney" — so the agent doesn't suggest a bad time. */
  timezone?: string | null;
  /** True on the very first outbound touch after a lead opts in. */
  isFirstTouch: boolean;
  /** True when the lead typed an opening question on the opt-in form, so
   *  the first message answers something rather than opening cold. */
  hasOpeningMessage?: boolean;
};

const SMS_CONTRACT = `
## You are now on SMS, not the website

The reader is on their phone. Everything in the rules above still
applies, with these overrides:

- HARD CAP 320 characters. One message, not a thread. If you cannot
  say it in 320 characters, say the smaller version.
- One idea. One question. Never two.
- No markdown, no bullets, no headings, no emoji. Plain text only.
- ONE paragraph. No line breaks at all. A text message is a single
  block of text, not a formatted note.
- No links unless you are sending the booking link, and never more
  than one link in a message.
- Do not use the [BOOK_QUICK_CHAT] marker on SMS. If it is time to
  book, write the link inline: ${BOOKING_URL}
- Do not open with the person's name every message. Once is enough.
- Write like a person texting, not a brand broadcasting. Contractions
  are fine. A short sentence fragment is fine.
`;

const EMAIL_CONTRACT = `
## You are now on email, not the website

- Under 120 words. One idea, one call to action.
- Return the body only, as simple HTML paragraphs (<p>...</p>). No
  inline styles, no images, no headings.
- No markdown. No bullets unless the content is genuinely a list, and
  even then prefer prose.
- Do not use the [BOOK_QUICK_CHAT] marker. Link inline instead:
  ${BOOKING_URL}
- No subject line in the body, that is passed separately.
`;

const FIRST_TOUCH_WITH_QUESTION_CONTRACT = `
## This is the first message, and they opened with a question

They put their number in seconds ago and typed the message below. Speed
is the product, so your reply is landing almost immediately.

- Answer what they actually asked, in one or two sentences. Directly.
- Then ask ONE question about their situation.
- Do not welcome them, do not thank them for signing up, do not
  explain what you are.
- Under 320 characters total.
`;

const FIRST_TOUCH_CONTRACT = `
## This is the first message, and they have not written to you yet

They just put their number in and asked to see this work. Speed is
the product, so this message is arriving within seconds of that.

- Acknowledge what they did, briefly, without being pleased with
  yourself about it.
- Ask ONE question about their situation. Do not pitch, do not
  explain the product, do not list what you can do.
- Under 200 characters for this one.
- Do NOT narrate yourself. Never say "here it is", "you asked to see
  this working", or name the product. A prospect who fills in a form
  wants their question answered, not a demonstration announced. Open
  like a person who just picked up the enquiry, not like a system
  proving it fired.
`;

function buildContextBlock(ctx: AgentContext): string {
  const parts: string[] = ["## Who you are talking to"];
  if (ctx.firstName) parts.push(`First name: ${ctx.firstName}`);
  if (ctx.source) parts.push(`Came from: ${ctx.source}`);
  if (ctx.timezone) parts.push(`Their timezone: ${ctx.timezone}`);
  if (ctx.tags && ctx.tags.length) {
    // Lifecycle tags tell the agent what has already happened with this
    // person. Filter out the internal plumbing tags, they mean nothing
    // to the conversation.
    const meaningful = ctx.tags.filter((t) => !t.startsWith("ai-"));
    if (meaningful.length) {
      parts.push(`CRM tags: ${meaningful.join(", ")}`);
    }
  }
  if (parts.length === 1) {
    parts.push(
      "No detail beyond a phone number. Find out who they are before offering anything."
    );
  }
  return parts.join("\n");
}

export function buildAgentSystemPrompt(
  channel: AgentChannel,
  ctx: AgentContext
): string {
  const blocks = [
    SYSTEM_PROMPT_CORE,
    channel === "sms" ? SMS_CONTRACT : EMAIL_CONTRACT,
    buildContextBlock(ctx),
  ];
  if (ctx.isFirstTouch) {
    blocks.push(
      ctx.hasOpeningMessage
        ? FIRST_TOUCH_WITH_QUESTION_CONTRACT
        : FIRST_TOUCH_CONTRACT
    );
  }
  return blocks.join("\n\n");
}

export const SMS_HARD_CAP_CHARS = 320;

// Last line of defence on length. The prompt asks for brevity; this
// enforces it. Cuts at the last sentence boundary that fits rather than
// mid-word, so a truncated message still reads as finished.
export function enforceSmsLength(text: string): string {
  const clean = text.trim();
  if (clean.length <= SMS_HARD_CAP_CHARS) return clean;

  const window = clean.slice(0, SMS_HARD_CAP_CHARS);
  const lastStop = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! ")
  );
  if (lastStop > 80) return window.slice(0, lastStop + 1).trim();
  return window.slice(0, SMS_HARD_CAP_CHARS - 1).trim();
}
