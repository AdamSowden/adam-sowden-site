"use client";

import { useEffect, useRef } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  messages: ChatMessage[];
  isLoading: boolean;
  isGeneratingReport: boolean;
};

export default function ChatArea({
  messages,
  isLoading,
  isGeneratingReport,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, isGeneratingReport]);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 pb-6">
      {messages.map((m, i) =>
        m.role === "assistant" ? (
          <AssistantBubble key={i} content={m.content} />
        ) : (
          <UserBubble key={i} content={m.content} />
        )
      )}
      {isLoading && !isGeneratingReport && <TypingIndicator />}
      {isGeneratingReport && <ReportLoadingBubble />}
      <div ref={bottomRef} />
    </div>
  );
}

function AssistantBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#0a0f1e] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
        A
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] bg-[#F9FAFB] border border-black/5 rounded-[4px_16px_16px_16px] px-4 py-3 text-[#111111] text-[15px] leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex items-start justify-end mb-4">
      <div className="max-w-[85%] sm:max-w-[75%] bg-[#188bf6] text-white rounded-[16px_4px_16px_16px] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4" aria-label="Assistant is typing">
      <div className="w-7 h-7 rounded-full bg-[#0a0f1e] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
        A
      </div>
      <div className="bg-[#F9FAFB] border border-black/5 rounded-[4px_16px_16px_16px] px-4 py-3 inline-flex gap-1.5 items-center">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="block w-2 h-2 rounded-full bg-black/30 animate-pulse"
      style={{ animationDelay: delay, animationDuration: "1.2s" }}
    />
  );
}

function ReportLoadingBubble() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#0a0f1e] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
        A
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] bg-[#F9FAFB] border border-black/5 rounded-[4px_16px_16px_16px] px-4 py-3 text-[#111111] text-[15px] leading-relaxed">
        Your report is being generated. This takes around 20 to 30 seconds.
        I am reading through everything you shared and writing your
        personalised analysis now.
        <div className="mt-3 inline-flex gap-1.5 items-center">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </div>
      </div>
    </div>
  );
}
