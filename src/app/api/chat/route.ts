import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM_PROMPT_CORE,
  buildArticleContext,
} from "@/lib/chat-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 20;
const MAX_USER_MESSAGE_CHARS = 2000;

// CORS for the embeddable widget (public/widget/v1.js). The widget can
// be loaded onto any third-party site (GHL, WordPress, raw HTML) and
// posts back here from a different origin. Wide-open during the pilot;
// tighten to an allow-list of customer domains once the productised
// version ships and we know which origins are paying for it.
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  article?: {
    title?: string;
    articleSection?: string;
    metaDescription?: string;
    bodyPlain?: string;
  };
};

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const { role, content } = m as {
      role?: unknown;
      content?: unknown;
    };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    out.push({
      role,
      content: trimmed.slice(0, MAX_USER_MESSAGE_CHARS),
    });
  }
  // Keep only the tail of the conversation so prompts stay bounded.
  return out.slice(-MAX_MESSAGES);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chat is not configured." }),
      {
        status: 503,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      {
        status: 400,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No messages provided." }),
      {
        status: 400,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }
  if (messages[messages.length - 1].role !== "user") {
    return new Response(
      JSON.stringify({
        error: "Last message must be from the user.",
      }),
      {
        status: 400,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  const articleContext = buildArticleContext(body.article ?? {});

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const apiStream = client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT_CORE,
              cache_control: { type: "ephemeral" },
            },
            {
              type: "text",
              text: articleContext,
            },
          ],
          messages,
        });

        for await (const event of apiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            // Brand-voice backstop: em dashes are a hard no. Replace any
            // that slip through the prompt with a comma before the chunk
            // reaches the client.
            const cleaned = event.delta.text.replace(/\s*—\s*/g, ", ");
            controller.enqueue(encoder.encode(cleaned));
          }
        }
        controller.close();
      } catch (err) {
        console.error("chat api error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\nSomething went wrong with the conversation. Please try again, or book a Quick Chat directly.\n\n[BOOK_QUICK_CHAT]"
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
      ...CORS_HEADERS,
    },
  });
}
