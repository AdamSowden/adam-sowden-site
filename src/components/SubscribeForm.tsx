"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function SubscribeForm({
  variant = "light",
  showName = false,
  buttonLabel = "Subscribe",
  successMessage = "You're in. The first essay lands Monday.",
  alreadyMessage = "You're already on the list.",
}: {
  variant?: "light" | "card";
  showName?: boolean;
  buttonLabel?: string;
  successMessage?: string;
  alreadyMessage?: string;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: showName ? firstName : undefined,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.alreadySubscribed ? alreadyMessage : successMessage);
        setEmail("");
        setFirstName("");
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

  const wrapperClass =
    variant === "card"
      ? "bg-[#F9FAFB] border border-black/10 rounded-2xl p-8 md:p-10"
      : "";
  const inputClass =
    "flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition disabled:opacity-60";
  const buttonClass =
    "rounded-full bg-[#188bf6] text-white px-6 py-3 text-sm font-medium hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

  if (status === "success") {
    return (
      <div className={wrapperClass}>
        <p className="text-[#111111] text-base md:text-lg leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 max-w-xl"
        noValidate
      >
        {showName && (
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name (optional)"
            disabled={status === "loading"}
            maxLength={80}
            autoComplete="given-name"
            className={inputClass}
          />
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            disabled={status === "loading"}
            maxLength={200}
            autoComplete="email"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className={buttonClass}
          >
            {status === "loading" ? "Sending..." : buttonLabel}
          </button>
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
        {status === "error" && message && (
          <p className="text-sm text-red-600">{message}</p>
        )}
        {status !== "error" && (
          <p className="text-xs text-black/55">
            One short email each Monday. One idea. Unsubscribe anytime.
          </p>
        )}
      </form>
    </div>
  );
}
