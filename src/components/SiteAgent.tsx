"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import ChatWidget from "@/components/ChatWidget";
import {
  getAgentPageContext,
  getServerAgentPageContext,
  subscribeAgentPageContext,
} from "@/lib/agent-page-context";

// The site-wide conversation agent: a launcher pinned to the right edge
// of every page, opening a panel that docks to the right (full screen on
// phones). Mounted once in the root layout. The conversation itself is
// the same ChatWidget that runs inline on blog posts and the product
// demos; this only changes where it lives.
//
// The launcher is server-rendered, so the data-conversation-agent marker
// is present on every page for crawlers that do not run JavaScript (the
// Smart Site Analyzer's engagement check reads it).

export default function SiteAgent() {
  const [open, setOpen] = useState(false);
  const article = useSyncExternalStore(
    subscribeAgentPageContext,
    getAgentPageContext,
    getServerAgentPageContext
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Keep the page from scrolling under the full-screen panel on phones.
    const prev = document.body.style.overflow;
    if (window.innerWidth < 768) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  // Let any element on the page open the agent: <a href="#ask-adam"> or
  // a button dispatching this event. JumpToChat uses the anchor.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("site-agent:open", onOpen);
    const onHash = () => {
      if (window.location.hash === "#ask-adam") setOpen(true);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("site-agent:open", onOpen);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return (
    <>
      {/* Launcher: a pill in the bottom-right corner of every page, always
          visible, matching the CTAButton geometry. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask Adam's AI a question"
        aria-expanded={open}
        aria-controls="site-agent-panel"
        data-conversation-agent="first-party"
        data-agent-capabilities="answers-from-site-content,qualifies,books"
        className={`fixed z-50 right-4 bottom-4 md:right-6 md:bottom-6 max-w-[calc(100vw-2rem)] flex items-center gap-2 rounded-full bg-[#e11d48] text-white shadow-lg hover:bg-[#be123c] transition px-5 py-2.5 text-left ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ChatIcon />
        <span className="text-sm font-medium leading-snug">
          Welcome to my site.
          <br />
          How can I help you today?
        </span>
      </button>

      {/* Backdrop on wide screens so a click outside closes the panel. */}
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/20 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        id="site-agent-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Adam's AI"
        // Inline transform rather than translate-x-* utilities: the dev
        // build was not applying the open-state class, and an inline style
        // cannot be lost to a class scan.
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
        className="fixed z-[60] inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl border-l border-black/10 flex flex-col transition-transform duration-300"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <div>
            <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em]">
              Adam&apos;s AI
            </p>
            <p className="text-sm text-black/60">
              You&apos;re talking to a Smart Site. Ask it anything.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close chat"
            className="rounded-full border border-black/10 w-9 h-9 flex items-center justify-center text-black/60 hover:bg-black/5 transition"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>
        <div className="flex-1 min-h-0">
          {/* Mount the conversation only once opened so the home page does
              not pay for it, and keep it mounted afterwards so the thread
              survives closing and reopening. */}
          {(open || mountedOnce(open)) && (
            <ChatWidget article={article} panel />
          )}
        </div>
      </aside>
    </>
  );
}

// Tracks whether the panel has ever been opened in this page lifetime.
let everOpened = false;
function mountedOnce(open: boolean) {
  if (open) everOpened = true;
  return everOpened;
}

function ChatIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
