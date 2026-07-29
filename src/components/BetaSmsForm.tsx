"use client";

import { FormEvent, useState } from "react";

// Must match CONSENT_TEXT in src/app/api/beta/optin/route.ts. The wording
// shown here is the wording recorded against the contact, so if you
// change one, change both and bump CONSENT_TEXT_VERSION.
const CONSENT_TEXT =
  "I consent to receive automated text messages from Adam Sowden at the phone number provided. Message frequency may vary. Message and data rates may apply. Reply HELP for help or STOP to opt out.";

type Status = "idle" | "loading" | "success" | "error";

export default function BetaSmsForm() {
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/beta/optin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName,
          phone,
          email,
          question,
          consent,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(
          data.error || "Could not save your details. Try again shortly."
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again shortly.");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-black/15 bg-white px-5 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition disabled:opacity-60";

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-black/10 bg-[#F9FAFB] p-8 md:p-10">
        <p className="font-serif text-2xl text-[#111111] mb-3">
          Watch your phone.
        </p>
        <p className="text-[#111111]/75 leading-relaxed">
          The first message is on its way, usually within a minute. Reply to
          it like you would to any other text and see how the conversation
          goes. Reply STOP at any point and it stops immediately.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          required
          disabled={status === "loading"}
          maxLength={80}
          autoComplete="given-name"
          className={inputClass}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile, with country code"
          required
          disabled={status === "loading"}
          maxLength={24}
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        disabled={status === "loading"}
        maxLength={200}
        autoComplete="email"
        className={inputClass}
      />

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Anything you want to throw at it? (optional)"
        disabled={status === "loading"}
        maxLength={500}
        rows={3}
        className={`${inputClass} resize-none`}
      />

      <label className="flex items-start gap-3 text-sm text-[#111111]/70 leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={status === "loading"}
          className="mt-1 h-4 w-4 shrink-0 accent-[#188bf6]"
        />
        <span>{CONSENT_TEXT}</span>
      </label>

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

      <button
        type="submit"
        disabled={
          status === "loading" || !phone.trim() || !firstName.trim() || !consent
        }
        className="self-start rounded-full bg-[#188bf6] text-white px-7 py-3 text-sm font-medium hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Starting..." : "Text me now"}
      </button>

      {status === "error" && message && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      <p className="text-xs text-black/55">
        Your number is used for this conversation and nothing else. No list,
        no newsletter, no passing it on. Reply STOP to end it.
      </p>
    </form>
  );
}
