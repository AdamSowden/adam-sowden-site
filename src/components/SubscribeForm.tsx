"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

type Status = "idle" | "loading" | "success" | "error";

// Cloudflare Turnstile. Optional: with no site key the widget is never
// rendered and the route relies on the same-site + form-token gates. The
// script loads only once the visitor touches the form, so the footer does
// not pull a third-party script on every page view.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_WAIT_MS = 12_000;

// The route's token lasts 15 minutes; refresh ours well inside that.
const FORM_TOKEN_MAX_AGE_MS = 5 * 60 * 1000;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

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
  // True once the visitor has focused a field: triggers the token prefetch
  // and, when configured, the Turnstile script.
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false); // focus can fire twice before the state re-renders

  const formToken = useRef<{ value: string; at: number } | null>(null);
  const turnstileEl = useRef<HTMLDivElement>(null);
  const turnstileWidget = useRef<string | null>(null);
  const turnstileToken = useRef<string | null>(null);

  const fetchFormToken = useCallback(async (force = false): Promise<string> => {
    const cached = formToken.current;
    if (!force && cached && Date.now() - cached.at < FORM_TOKEN_MAX_AGE_MS) {
      return cached.value;
    }
    const res = await fetch("/api/subscribe", { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { token?: string };
    if (!data.token) throw new Error("no form token");
    formToken.current = { value: data.token, at: Date.now() };
    return data.token;
  }, []);

  const arm = () => {
    if (armedRef.current) return;
    armedRef.current = true;
    setArmed(true);
    fetchFormToken().catch(() => {
      /* retried on submit */
    });
  };

  const renderTurnstile = useCallback(() => {
    const api = window.turnstile;
    if (!TURNSTILE_SITE_KEY || !api || !turnstileEl.current || turnstileWidget.current) return;
    turnstileWidget.current = api.render(turnstileEl.current, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: "interaction-only",
      callback: (token: string) => {
        turnstileToken.current = token;
      },
      "expired-callback": () => {
        turnstileToken.current = null;
      },
      "error-callback": () => {
        turnstileToken.current = null;
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      if (turnstileWidget.current) {
        window.turnstile?.remove(turnstileWidget.current);
        turnstileWidget.current = null;
      }
    };
  }, []);

  const awaitTurnstileToken = async (): Promise<string | null> => {
    const started = Date.now();
    while (Date.now() - started < TURNSTILE_WAIT_MS) {
      if (turnstileToken.current) return turnstileToken.current;
      await new Promise((r) => setTimeout(r, 150));
    }
    return null;
  };

  const resetChallenge = () => {
    // Turnstile tokens are single use and the route has just consumed one.
    turnstileToken.current = null;
    if (turnstileWidget.current) window.turnstile?.reset(turnstileWidget.current);
    formToken.current = null;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      let turnstileResponse: string | undefined;
      if (TURNSTILE_SITE_KEY) {
        const t = await awaitTurnstileToken();
        if (!t) {
          setStatus("error");
          setMessage(
            "We could not verify you are human. Please refresh and try again."
          );
          return;
        }
        turnstileResponse = t;
      }
      const token = await fetchFormToken();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: showName ? firstName : undefined,
          website,
          formToken: token,
          turnstileToken: turnstileResponse,
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
        // GTM hook: a trigger on this event can feed a GA4 conversion.
        // window.dataLayer is declared globally by the GTM integration.
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "newsletter_optin",
          newsletter_status: data.alreadySubscribed ? "existing" : "new",
        });
      } else {
        resetChallenge();
        setStatus("error");
        setMessage(
          data.error || "Could not save your details. Try again shortly."
        );
      }
    } catch {
      resetChallenge();
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
      {armed && TURNSTILE_SITE_KEY && (
        <Script
          src={TURNSTILE_SCRIPT}
          strategy="afterInteractive"
          onReady={renderTurnstile}
        />
      )}
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
            onFocus={arm}
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
            onFocus={arm}
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
        {/* Turnstile mounts here; empty unless a challenge is needed. */}
        {TURNSTILE_SITE_KEY && <div ref={turnstileEl} />}
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
