"use client";

// Smart Site Analyzer, client surface.
// Flow (site-analyser-spec.md §9): one field, one button -> honest progress
// naming each check -> headline finding and two or three specifics on screen
// with no gate -> full report offered by email, optional cost inputs below.
// Public result shows a band and pass/partial/fail counts only (§6, §15).

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { bandLabelFor, bandMeaningFor } from "@/lib/analyzer/scoring";

type Counts = { pass: number; partial: number; fail: number; uncertain: number; na: number };
type PublicJob = {
  token: string;
  url: string;
  host: string;
  state: "queued" | "fast" | "slow" | "done" | "partial" | "failed";
  preliminary: boolean;
  steps: { label: string; at: number }[];
  error: string | null;
  band: "Leaking" | "Invisible" | "Static" | "Working" | null;
  headline: { statement: string; consequence: string; dimension: number } | null;
  specifics: { dimension: number; label: string; statement: string; consequence: string; status: string }[];
  jobs: { job: string; label: string; verdict: "Working" | "Partly" | "Not yet"; measured: boolean; counts: Counts }[];
  checksRun: number;
  couldNotCheck: { scope: string; reason: string }[];
  pagesChecked: number;
  hasEmail: boolean;
};


// window.dataLayer is declared globally by the GTM integration.
function track(event: string, data: Record<string, unknown> = {}) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  }
}

const inputClass = "flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-[15px] focus:outline-none focus:border-[#188bf6] transition disabled:opacity-60";
const buttonClass = "rounded-full bg-[#188bf6] text-white px-6 py-3 text-sm font-medium hover:bg-[#0d78dc] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

export default function AnalyzerClient({ initialUrl = "" }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [job, setJob] = useState<PublicJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const terminal = job?.state === "done" || job?.state === "partial" || job?.state === "failed";

  const poll = useCallback(async (token: string) => {
    try {
      const res = await fetch(`/api/analyzer/job/${token}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { job: PublicJob };
      setJob(data.job);
      if (data.job.state === "done" || data.job.state === "partial" || data.job.state === "failed") {
        track("analyzer_result", { band: data.job.band, state: data.job.state, host: data.job.host });
        return;
      }
      pollTimer.current = setTimeout(() => void poll(token), 1500);
    } catch {
      pollTimer.current = setTimeout(() => void poll(token), 3000);
    }
  }, []);

  const start = useCallback(async (target: string) => {
    if (starting) return;
    setStarting(true);
    setError(null);
    setJob(null);
    track("analyzer_start", { url: target });
    try {
      const res = await fetch("/api/analyzer/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: target }) });
      const data = (await res.json().catch(() => ({}))) as { job?: PublicJob; error?: string };
      if (!res.ok || !data.job) {
        setError(data.error || "The analyzer could not start. Try again in a moment.");
        return;
      }
      setJob(data.job);
      if (data.job.state === "fast" || data.job.state === "slow" || data.job.state === "queued") pollTimer.current = setTimeout(() => void poll(data.job!.token), 1500);
      else track("analyzer_result", { band: data.job.band, state: data.job.state, host: data.job.host });
    } catch {
      setError("Network error. Check the connection and try again.");
    } finally {
      setStarting(false);
    }
  }, [poll, starting]);

  useEffect(() => {
    if (initialUrl && !autoStarted.current) {
      autoStarted.current = true;
      void start(initialUrl);
    }
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (url.trim()) void start(url.trim());
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3" aria-label="Analyze a website">
        <input
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yourwebsite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          disabled={starting || (job !== null && !terminal)}
          aria-label="Website address"
          required
        />
        <button type="submit" className={buttonClass} disabled={starting || (job !== null && !terminal) || !url.trim()}>
          {starting ? "Starting…" : job && !terminal ? "Checking…" : "Analyze my site"}
        </button>
      </form>
      <p className="mt-3 text-xs text-black/55">Public pages only. We fetch what any visitor can see, we do not log in, submit forms, or send enquiries.</p>

      {error && (
        <div className="mt-8 rounded-2xl border border-black/10 bg-[#F9FAFB] p-6" role="alert">
          <p className="text-[#111111] font-medium">{error}</p>
        </div>
      )}

      {job && <Progress job={job} />}
      {job && job.state === "failed" && <FailedState job={job} />}
      {job && job.band && job.state !== "failed" && <Result job={job} />}
      {job && terminal && job.state !== "failed" && <EmailOffer job={job} onSaved={(j) => setJob(j)} />}
    </div>
  );
}

function Progress({ job }: { job: PublicJob }) {
  const running = job.state === "fast" || job.state === "slow" || job.state === "queued";
  return (
    <section className="mt-10" aria-live="polite">
      <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">
        {running ? `Checking ${job.host}` : `Checked ${job.host}`}
      </h2>
      <ol className="mt-4 space-y-2">
        {job.steps.map((s, i) => {
          const last = i === job.steps.length - 1;
          return (
            <li key={`${s.label}-${s.at}`} className="flex items-start gap-3 text-[15px] text-[#111111]/80">
              <span className={`mt-[7px] inline-block h-2 w-2 rounded-full ${last && running ? "bg-[#188bf6] animate-pulse" : "bg-[#111111]/40"}`} aria-hidden />
              <span>{s.label}</span>
            </li>
          );
        })}
      </ol>
      {job.pagesChecked > 0 && <p className="mt-3 text-sm text-black/55">{job.pagesChecked} page{job.pagesChecked === 1 ? "" : "s"} read so far.</p>}
    </section>
  );
}

function FailedState({ job }: { job: PublicJob }) {
  return (
    <section className="mt-10 rounded-2xl border border-black/10 bg-[#F9FAFB] p-6 md:p-8">
      <h2 className="font-serif text-2xl text-[#111111]">We could not analyse that site.</h2>
      <p className="mt-3 text-[#111111]/80">{job.error ?? "The homepage could not be fetched."}</p>
      <p className="mt-2 text-sm text-black/55">Nothing about the site is scored when it cannot be read. Check the address, or try again in a few minutes.</p>
    </section>
  );
}

function Result({ job }: { job: PublicJob }) {
  const band = job.band!;
  return (
    <section className="mt-12">
      <div className="rounded-2xl border border-black/10 p-6 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">{job.preliminary ? "First finding, from the homepage" : "The finding that matters most"}</p>
        {job.headline ? (
          <>
            <h2 className="mt-3 font-serif text-2xl md:text-4xl tracking-tight leading-[1.15] text-[#111111]">{job.headline.statement}</h2>
            <p className="mt-4 text-lg text-[#111111]/80 leading-relaxed">{job.headline.consequence}</p>
          </>
        ) : (
          <h2 className="mt-3 font-serif text-2xl md:text-4xl tracking-tight text-[#111111]">Nothing failed on the checks that ran.</h2>
        )}
        <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-black/10 pt-6">
          <span className="font-serif text-2xl text-[#111111]">Your site is {bandLabelFor(band, job.headline !== null)}.</span>
          <span className="text-[#111111]/75">{bandMeaningFor(band, job.headline !== null)}</span>
        </div>
        {job.preliminary && job.state !== "failed" && (
          <p className="mt-4 text-sm text-[#188bf6]">Still checking the rest of the site. This result will update as the remaining pages, speed and copy checks finish.</p>
        )}
      </div>

      {job.specifics.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {job.specifics.map((s) => (
            <div key={`${s.dimension}-${s.statement.slice(0, 24)}`} className="rounded-2xl bg-[#F9FAFB] border border-black/10 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-black/50">{s.label}</p>
              <p className="mt-2 text-[15px] text-[#111111] leading-snug">{s.statement}</p>
              <p className="mt-2 text-sm text-[#111111]/65">{s.consequence}</p>
            </div>
          ))}
        </div>
      )}

      <WhatWasChecked job={job} />
    </section>
  );
}

function WhatWasChecked({ job }: { job: PublicJob }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-10">
      <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-black/55">The five jobs a website can do</h3>
      <p className="mt-2 text-[15px] text-[#111111]/75">
        {job.pagesChecked} page{job.pagesChecked === 1 ? "" : "s"} read, {job.checksRun} checks ran. How the site does on each job, with the checks behind it.
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {job.jobs.map((j) => (
          <li key={j.job} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-[15px]">
            <span className="text-[#111111]">
              {j.label}.{" "}
              <span className={`font-medium ${j.verdict === "Working" ? "text-[#0d9488]" : j.verdict === "Not yet" && j.measured ? "text-[#b42318]" : "text-black/60"}`}>{j.measured ? j.verdict : job.preliminary ? "Still checking" : "Could not measure"}</span>
            </span>
            <span className="text-black/60 text-sm whitespace-nowrap">
              {j.measured ? `${j.counts.pass} passed, ${j.counts.partial + j.counts.uncertain} partial, ${j.counts.fail} failed` : ""}
            </span>
          </li>
        ))}
      </ul>
      {job.couldNotCheck.length > 0 && (
        <div className="mt-4">
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-sm text-[#188bf6] hover:underline">
            {open ? "Hide" : "Show"} the {job.couldNotCheck.length} check{job.couldNotCheck.length === 1 ? "" : "s"} that could not run
          </button>
          {open && (
            <ul className="mt-3 space-y-1.5 text-sm text-black/65">
              {job.couldNotCheck.map((c, i) => (
                <li key={`${c.scope}-${i}`}>{c.reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function EmailOffer({ job, onSaved }: { job: PublicJob; onSaved: (j: PublicJob) => void }) {
  const [email, setEmail] = useState("");
  const [showNumbers, setShowNumbers] = useState(false);
  const [enquiries, setEnquiries] = useState("");
  const [value, setValue] = useState("");
  const [closeRate, setCloseRate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(job.hasEmail ? "done" : "idle");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/analyzer/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: job.token, email, costInputs: showNumbers && enquiries && value && closeRate ? { enquiries, value, closeRate } : null }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("done");
        track("analyzer_email", { host: job.host, withNumbers: showNumbers });
        onSaved({ ...job, hasEmail: true });
      } else {
        setStatus("error");
        setMessage(data.error || "Could not save that. Try again shortly.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again shortly.");
    }
  };

  return (
    <section className="mt-14 rounded-2xl bg-[#111111] text-white p-6 md:p-10">
      <h3 className="font-serif text-2xl md:text-3xl tracking-tight">The full report, by email.</h3>
      <p className="mt-3 text-white/75 leading-relaxed">
        Each of the five jobs explained, where to start, what the site looks like fixed, and every check with its evidence. Nothing is sent to anyone but you.
      </p>
      {status === "done" ? (
        <p className="mt-6 text-white font-medium">Done. The full report for {job.host} is on its way to your inbox.</p>
      ) : (
        <form onSubmit={submit} className="mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Email address" className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[15px] text-white placeholder-white/50 focus:outline-none focus:border-white/60 transition" />
            <button type="submit" disabled={status === "loading"} className="rounded-full bg-white text-[#111111] px-6 py-3 text-sm font-medium hover:bg-white/90 transition disabled:opacity-50 whitespace-nowrap">
              {status === "loading" ? "Saving…" : "Send me the full report"}
            </button>
          </div>
          <button type="button" onClick={() => setShowNumbers((s) => !s)} className="mt-4 text-sm text-white/70 hover:text-white underline-offset-2 hover:underline">
            {showNumbers ? "Skip the numbers" : "Add your numbers to see what the gaps are costing (optional)"}
          </button>
          {showNumbers && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm text-white/70">
                Enquiries per month
                <input type="number" min={1} value={enquiries} onChange={(e) => setEnquiries(e.target.value)} className="mt-1 w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-white/60" />
              </label>
              <label className="text-sm text-white/70">
                Average client value
                <input type="number" min={1} value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-white/60" />
              </label>
              <label className="text-sm text-white/70">
                Share that become clients (%)
                <input type="number" min={0.1} max={100} step={0.1} value={closeRate} onChange={(e) => setCloseRate(e.target.value)} className="mt-1 w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-white focus:outline-none focus:border-white/60" />
              </label>
              <p className="sm:col-span-3 text-xs text-white/55">Only used to work out a range, with every step shown. If you skip this, the report still comes without the money.</p>
            </div>
          )}
          {status === "error" && <p className="mt-3 text-sm text-white/80" role="alert">{message}</p>}
        </form>
      )}
    </section>
  );
}
