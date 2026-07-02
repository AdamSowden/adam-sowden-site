"use client";

import { FormEvent, useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const STUCK_OPTIONS = [
  "Content creation",
  "Lead generation",
  "Paid Ads",
  "Email and nurture",
  "Brand voice consistency",
  "Sales and marketing handoff",
];

const TRIED_OPTIONS = [
  "Doing it myself",
  "AI marketing tools",
  "An agency",
  "An in-house team",
  "Freelancers and contractors",
  "Nothing systematic yet",
];

const PLATFORM_OPTIONS = [
  "Email / Newsletter",
  "LinkedIn",
  "X (Twitter)",
  "Facebook",
  "Instagram",
  "Google Ads",
  "YouTube",
  "TikTok",
  "Podcast",
];

const PRODUCT_FIT_OPTIONS = [
  "Instant lead response (Speed-to-Lead Agent)",
  "Turning audience engagement into conversations (Outreach Agent)",
  "Turning website visitors into conversations (Site Conversation Agent)",
  "Self-serve AI workers (Your Own AI Marketing Team)",
  "A complete inbound system (Content Ecosystem)",
  "Outbound and Paid Ads (Marketing Ecosystem)",
  "Not sure yet",
  "Some combination of these",
];

export default function QuestionnaireForm() {
  const [email, setEmail] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [stuckOn, setStuckOn] = useState<string[]>([]);
  const [stuckOther, setStuckOther] = useState("");
  const [tried, setTried] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [platformOther, setPlatformOther] = useState("");
  const [productFit, setProductFit] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Auto-fill email if GHL redirects with ?email=... in the URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const e = params.get("email");
    if (e) setEmail(e);
  }, []);

  function toggle(list: string[], value: string, max?: number): string[] {
    if (list.includes(value)) return list.filter((v) => v !== value);
    if (max && list.length >= max) return list;
    return [...list, value];
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          businessDescription,
          stuckOn: [
            ...stuckOn,
            ...(stuckOther.trim() ? [`Other: ${stuckOther.trim()}`] : []),
          ],
          tried,
          platforms: [
            ...platforms,
            ...(platformOther.trim()
              ? [`Other: ${platformOther.trim()}`]
              : []),
          ],
          productFit,
          additionalContext,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage("Thanks. Adam will see this before your call.");
      } else {
        setStatus("error");
        setMessage(
          data.error ||
            "Couldn't save your answers. Try again, or just bring this to the call."
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again shortly.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-black/10 rounded-2xl p-8 md:p-10">
        <p className="text-[#188bf6] text-xs font-medium uppercase tracking-[0.18em] mb-3">
          Got it
        </p>
        <p className="font-serif text-2xl md:text-3xl tracking-tight text-[#111111] leading-snug">
          {message}
        </p>
        <p className="mt-4 text-[#111111]/70 leading-relaxed">
          The booking confirmation email has the call details. See you
          then.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition disabled:opacity-60";
  const labelClass = "block font-semibold text-[#111111] mb-2";
  const subLabelClass = "block text-sm text-[#111111]/60 mb-3";

  function CheckGroup({
    options,
    selected,
    onChange,
    max,
    name,
  }: {
    options: string[];
    selected: string[];
    onChange: (next: string[]) => void;
    max?: number;
    name: string;
  }) {
    return (
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isChecked = selected.includes(opt);
          const isDisabled =
            max !== undefined && !isChecked && selected.length >= max;
          return (
            <label
              key={opt}
              className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 cursor-pointer transition ${
                isChecked
                  ? "border-[#188bf6] bg-[#188bf6]/5"
                  : isDisabled
                    ? "border-black/10 opacity-50 cursor-not-allowed"
                    : "border-black/10 hover:border-black/30"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => onChange(toggle(selected, opt, max))}
                className="h-4 w-4 accent-[#188bf6]"
              />
              <span className="text-[15px] text-[#111111]">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-white border border-black/10 rounded-2xl p-8 md:p-10 space-y-10"
    >
      <div>
        <label htmlFor="q-email" className={labelClass}>
          Email
        </label>
        <p className={subLabelClass}>
          So Adam knows which booking this matches.
        </p>
        <input
          id="q-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbusiness.com"
          required
          maxLength={200}
          autoComplete="email"
          disabled={status === "loading"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="q-business" className={labelClass}>
          1. What does your business do?
        </label>
        <p className={subLabelClass}>
          A couple of sentences is plenty.
        </p>
        <textarea
          id="q-business"
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          maxLength={2000}
          disabled={status === "loading"}
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <span className={labelClass}>
          2. Where in your marketing are you most stuck right now?
        </span>
        <p className={subLabelClass}>Choose any that apply.</p>
        <CheckGroup
          options={STUCK_OPTIONS}
          selected={stuckOn}
          onChange={setStuckOn}
          name="stuckOn"
        />
        <input
          type="text"
          value={stuckOther}
          onChange={(e) => setStuckOther(e.target.value)}
          placeholder="Other (optional)"
          maxLength={200}
          disabled={status === "loading"}
          className={`${inputClass} mt-3`}
        />
      </div>

      <div>
        <span className={labelClass}>3. What have you tried so far?</span>
        <p className={subLabelClass}>Choose any that apply.</p>
        <CheckGroup
          options={TRIED_OPTIONS}
          selected={tried}
          onChange={setTried}
          name="tried"
        />
      </div>

      <div>
        <span className={labelClass}>
          4. What platforms have you marketed on?
        </span>
        <p className={subLabelClass}>Choose any that apply.</p>
        <CheckGroup
          options={PLATFORM_OPTIONS}
          selected={platforms}
          onChange={setPlatforms}
          name="platforms"
        />
        <input
          type="text"
          value={platformOther}
          onChange={(e) => setPlatformOther(e.target.value)}
          placeholder="Other (optional)"
          maxLength={200}
          disabled={status === "loading"}
          className={`${inputClass} mt-3`}
        />
      </div>

      <div>
        <span className={labelClass}>
          5. Which of these would change your business the most?
        </span>
        <p className={subLabelClass}>
          Pick up to 2. ({productFit.length}/2)
        </p>
        <CheckGroup
          options={PRODUCT_FIT_OPTIONS}
          selected={productFit}
          onChange={setProductFit}
          max={2}
          name="productFit"
        />
      </div>

      <div>
        <label htmlFor="q-extra" className={labelClass}>
          6. Anything else Adam should know before the call?
        </label>
        <p className={subLabelClass}>Optional.</p>
        <textarea
          id="q-extra"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          maxLength={2000}
          disabled={status === "loading"}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Honeypot: hidden from real users, bots fill every field */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        aria-hidden="true"
        className="hidden"
      />

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="rounded-full bg-[#188bf6] text-white px-7 py-3.5 text-base font-medium hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Sending..." : "Send to Adam"}
        </button>
        {status === "error" && message && (
          <p className="mt-4 text-sm text-red-600">{message}</p>
        )}
        <p className="mt-4 text-xs text-black/55">
          Goes straight into your booking record. Adam reads it before the
          call.
        </p>
      </div>
    </form>
  );
}
