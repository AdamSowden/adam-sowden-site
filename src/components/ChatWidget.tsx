"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BOOKING_URL } from "@/lib/site";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ArticleContext = {
  title?: string;
  articleSection?: string;
  metaDescription?: string;
  bodyPlain?: string;
};

const BOOK_MARKER = "[BOOK_QUICK_CHAT]";

const OPENING_ASSISTANT_MESSAGE = "What do you help with today?";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatWidget({
  article,
}: {
  article: ArticleContext;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "opening",
      role: "assistant",
      content: OPENING_ASSISTANT_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "error">(
    "idle"
  );
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    // Skip the mount effect (the seeded opening message). Without this
    // guard, scrollIntoView fires on first render and pulls the whole
    // page down to the chat widget — landing readers at the bottom of
    // the blog post when they arrive from an email link.
    if (!hasUserInteractedRef.current) return;
    listEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || status === "streaming") return;

      // From this point on, autoscroll the chat container as new
      // messages stream in. Suppressed before now so the page does
      // not jump on initial mount.
      hasUserInteractedRef.current = true;

      const userMessage: Message = {
        id: uid(),
        role: "user",
        content: trimmed,
      };
      const assistantId = uid();
      const assistantPlaceholder: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      // Build the history that goes to the API: exclude the opening
      // message since it is a client-side greeting, not a real turn.
      const apiMessages = [
        ...messages
          .filter((m) => m.id !== "opening")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ];

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setInput("");
      setStatus("streaming");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, article }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Chat request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: acc } : m
            )
          );
        }
        setStatus("idle");
      } catch (err) {
        console.error(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Something went wrong with the conversation. Please try again, or book a Quick Chat directly.\n\n" +
                    BOOK_MARKER,
                }
              : m
          )
        );
        setStatus("error");
      }
    },
    [article, messages, status]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-14 md:py-16">
        <div className="bg-[#F9FAFB] border border-black/10 rounded-2xl overflow-hidden">
          <div className="px-6 md:px-8 pt-8 pb-2">
            <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-3">
              The Participation Layer
            </p>
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight leading-tight text-[#111111]">
              Ask about this essay.
            </h2>
            <p className="mt-3 text-[#111111]/70 leading-relaxed">
              A conversation trained on the full methodology and this
              essay&apos;s content. Not a pitch. A discussion.
            </p>
          </div>
          <div className="px-4 md:px-6 py-6 space-y-4">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {status === "streaming" &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content === "" && (
                <TypingDots />
              )}
            <div ref={listEndRef} />
          </div>
          <form
            onSubmit={handleSubmit}
            className="px-4 md:px-6 pb-6 pt-2 flex gap-2 border-t border-black/5 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question..."
              disabled={status === "streaming"}
              maxLength={1800}
              className="flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "streaming" || !input.trim()}
              className="rounded-full bg-[#188bf6] text-white px-5 py-3 text-sm font-medium hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const showBookCTA =
    message.role === "assistant" && message.content.includes(BOOK_MARKER);
  const cleaned = message.content.replace(BOOK_MARKER, "").trim();

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#188bf6] text-white px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
          {cleaned}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="rounded-2xl rounded-tl-sm bg-white border border-black/10 px-4 py-3 text-[15px] text-[#111111] leading-relaxed whitespace-pre-wrap">
          {cleaned || <span className="text-black/30">…</span>}
        </div>
        {showBookCTA && (
          <a
            href={BOOKING_URL}
            className="inline-flex items-center mt-3 rounded-full bg-[#188bf6] text-white px-4 py-2 text-sm font-medium hover:bg-[#0d78dc] transition"
          >
            Book a Quick Chat with Adam
          </a>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm bg-white border border-black/10 px-4 py-3 text-sm text-black/40">
        <span className="inline-flex items-center gap-1">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 bg-black/35 rounded-full"
      style={{
        animation: "chatDotPulse 1.1s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  );
}
