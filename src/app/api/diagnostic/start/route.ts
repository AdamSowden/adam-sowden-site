// POST /api/diagnostic/start
//
// Creates a new diagnostic session and returns the opening message. The
// opening message is hardcoded (not LLM-generated) so it's instant and
// can't drift.

import { randomUUID } from "node:crypto";
import { createSession } from "@/lib/diagnostic-store";
import { OPENING_MESSAGE } from "@/lib/diagnostic-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 32-character session token built from a UUID v4 (cryptographically
// random). Avoids adding nanoid as a top-level dep, which broke
// postcss's transitive resolution of nanoid/non-secure.
function generateSessionToken(): string {
  return randomUUID().replace(/-/g, "");
}

export async function POST() {
  try {
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, OPENING_MESSAGE);
    return Response.json({
      sessionToken,
      message: OPENING_MESSAGE,
      questionIndex: 1,
    });
  } catch (err) {
    console.error("[/api/diagnostic/start] error:", err);
    // Don't leak env var names or stack details to the browser. Log the
    // technical message server-side; show the user a friendly one.
    return Response.json(
      {
        error:
          "The diagnostic is temporarily unavailable. Please try again in a few minutes.",
      },
      { status: 503 }
    );
  }
}
