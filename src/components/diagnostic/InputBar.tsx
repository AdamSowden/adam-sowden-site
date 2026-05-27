"use client";

import { KeyboardEvent, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
};

export default function InputBar({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type your answer here...",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim().length > 0) onSubmit();
    }
  };

  const handleSend = () => {
    if (disabled || value.trim().length === 0) return;
    onSubmit();
    textareaRef.current?.focus();
  };

  return (
    <div className="bg-white border-t border-black/10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          maxLength={2000}
          className="flex-1 min-h-[48px] max-h-[120px] resize-none rounded-lg border border-black/15 bg-white px-4 py-3 text-[15px] leading-snug text-[#111111] outline-none focus:border-[#188bf6] transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || value.trim().length === 0}
          aria-label="Send"
          className="w-12 h-12 rounded-lg bg-[#188bf6] text-white flex items-center justify-center hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="mx-auto max-w-3xl px-4 sm:px-6 pb-3 text-[11px] text-black/45">
        Your details are stored securely and used only to generate and send
        your report.{" "}
        <a
          href="/privacy"
          className="underline hover:text-[#188bf6] transition"
        >
          Privacy
        </a>
        .
      </p>
    </div>
  );
}
