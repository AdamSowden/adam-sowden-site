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
  /**
   * Optional per-client CTA override. When absent, the widget uses its
   * defaults: marker "[BOOK_QUICK_CHAT]", label "Book a chat", and opens
   * `bookingUrl` in a new tab. Set this to change the marker the model
   * emits, the button label, and/or to scroll the host page to an element
   * instead of navigating away.
   */
  cta?: {
    /** The marker the model emits and the widget strips + renders a button for. */
    marker?: string;
    /** Button label text. */
    label?: string;
    /**
     * If set, the CTA scrolls the host page to the element with this id
     * (smooth) instead of opening `bookingUrl`. Falls back to `bookingUrl`
     * if no such element exists on the page.
     */
    scrollToId?: string;
  };
};
