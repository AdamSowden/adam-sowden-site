// Per-client config for the embeddable chat widget.
//
// A "client" here is a third party Adam hosts a chat widget for, e.g.,
// Virtus Financial Group. Each client gets a per-tenant systemPrompt
// (assembled from their methodology + voice + compliance docs) and
// optional UI overrides for the widget panel header.
//
// Configs live under src/lib/clients/<slug>/. The methodology .md
// source files live under data/clients/<slug>/ (bundled at build).

export type ClientConfig = {
  slug: string;
  /** Internal display name, used in logs and the widget header default. */
  displayName: string;
  /** Full system prompt the chat backend hands to Claude. */
  systemPrompt: string;
  /** Where the chat's "Book a chat" CTA should point. */
  bookingUrl: string;
  /** Optional widget panel overrides. Fall through to defaults if absent. */
  widget?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    openingMessage?: string;
    /** Hex colour (#RRGGBB) for the chat bubble + send button. */
    accentColor?: string;
  };
};
