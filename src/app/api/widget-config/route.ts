// GET /api/widget-config?client=<slug>
//
// Returns the public widget UI overrides for a registered client. Used
// by /widget/v1.js on script load to swap the panel's eyebrow, title,
// description, opening message, accent color, and booking URL to match
// the client whose site is hosting the embed. The system prompt is NOT
// returned by this endpoint (it's private and only ever assembled
// server-side in /api/chat). Same CORS rules as /api/chat.

import { NextRequest } from "next/server";
import { getClientConfig } from "@/lib/clients/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("client");
  const config = getClientConfig(slug);

  if (!config) {
    return new Response(
      JSON.stringify({ error: "Unknown client." }),
      {
        status: 404,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      }
    );
  }

  const widget = config.widget ?? {};

  return new Response(
    JSON.stringify({
      slug: config.slug,
      displayName: config.displayName,
      eyebrow: widget.eyebrow,
      title: widget.title,
      description: widget.description,
      openingMessage: widget.openingMessage,
      accentColor: widget.accentColor,
      bookingUrl: config.bookingUrl,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
        // Cache 5 minutes at the edge so widget loads are fast.
        "cache-control": "public, max-age=300",
        ...CORS_HEADERS,
      },
    }
  );
}
