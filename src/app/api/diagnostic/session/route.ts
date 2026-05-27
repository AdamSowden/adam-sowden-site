// GET /api/diagnostic/session?token=...
//
// Restores a session for refresh resilience. The frontend stores the
// session token in sessionStorage and calls this on mount to recover
// the in-progress conversation or the final report.

import { NextRequest } from "next/server";
import { getSession, isExpired } from "@/lib/diagnostic-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";
  if (!token) {
    return Response.json({ session: null });
  }

  let session;
  try {
    session = await getSession(token);
  } catch (err) {
    console.error("[/api/diagnostic/session] store error:", err);
    return Response.json({ session: null }, { status: 503 });
  }

  if (!session) {
    return Response.json({ session: null });
  }

  // Surface inactivity-expired sessions as "expired" so the frontend can
  // start a fresh one rather than rendering a half-dead conversation.
  if (!session.isComplete && isExpired(session)) {
    return Response.json({ session: null, expired: true });
  }

  return Response.json({
    session: {
      questionIndex: session.questionIndex,
      isComplete: session.isComplete,
      firstName: session.firstName,
      conversationHistory: session.conversationHistory,
      report: session.report,
    },
  });
}
