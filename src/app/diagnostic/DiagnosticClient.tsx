"use client";

// AI Marketing Diagnostic — primary client component.
//
// Manages: session bootstrap (start or recover), message send loop,
// email-capture → report generation transition, and report rendering.
// Storage: sessionToken kept in sessionStorage so a tab refresh survives
// without exposing it across tabs.

import { useCallback, useEffect, useRef, useState } from "react";
import DiagnosticHeader from "@/components/diagnostic/DiagnosticHeader";
import ChatArea from "@/components/diagnostic/ChatArea";
import InputBar from "@/components/diagnostic/InputBar";
import ReportView from "@/components/diagnostic/ReportView";
import type { DiagnosticReport } from "@/lib/diagnostic-prompts";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SESSION_STORAGE_KEY = "diagnostic_token";

export default function DiagnosticClient() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const bootstrapped = useRef(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // ── Bootstrap ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const stored =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem(SESSION_STORAGE_KEY)
        : null;

    if (stored) {
      void recoverSession(stored);
    } else {
      void startNewSession();
    }
  }, []);

  const startNewSession = useCallback(async () => {
    setErrorBanner(null);
    try {
      const res = await fetch("/api/diagnostic/start", { method: "POST" });
      const data = (await res.json()) as {
        sessionToken?: string;
        message?: string;
        questionIndex?: number;
        error?: string;
      };
      if (!res.ok || !data.sessionToken || !data.message) {
        setErrorBanner(
          data.error ||
            "Could not start the diagnostic. Please try again in a moment."
        );
        return;
      }
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, data.sessionToken);
      setSessionToken(data.sessionToken);
      setMessages([{ role: "assistant", content: data.message }]);
      setQuestionIndex(data.questionIndex ?? 1);
    } catch {
      setErrorBanner("Network error. Please refresh and try again.");
    }
  }, []);

  const recoverSession = useCallback(async (token: string) => {
    try {
      const res = await fetch(
        `/api/diagnostic/session?token=${encodeURIComponent(token)}`
      );
      const data = (await res.json()) as {
        session?: {
          questionIndex: number;
          isComplete: boolean;
          conversationHistory: ChatMessage[];
          report: DiagnosticReport | null;
        } | null;
        expired?: boolean;
      };
      if (!data.session) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        await startNewSession();
        return;
      }
      setSessionToken(token);
      setMessages(data.session.conversationHistory);
      setQuestionIndex(data.session.questionIndex);
      if (data.session.report) {
        setReport(data.session.report);
      } else if (data.session.questionIndex >= 19) {
        // Email was captured but report never persisted. Most likely a
        // network blip on the last turn or a transient LLM crash. Kick
        // off report generation now rather than leaving the user stuck.
        setTimeout(() => void generateReport(token), 200);
      }
    } catch {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      await startNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startNewSession]);

  // ── Send a user message ──────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const userMessage = draft.trim();
    if (!userMessage || !sessionToken || isLoading || isGeneratingReport)
      return;

    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setErrorBanner(null);

    let isEmailCapturedNow = false;
    try {
      const res = await fetch("/api/diagnostic/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, userMessage }),
      });
      const data = (await res.json()) as {
        message?: string;
        questionIndex?: number;
        isEmailCaptured?: boolean;
        error?: string;
      };

      if (!res.ok || !data.message) {
        // Surface a recoverable error but keep the user's message in place.
        setErrorBanner(
          data.error ||
            "Something went wrong sending your answer. Please try again."
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message! },
      ]);
      setQuestionIndex(data.questionIndex ?? questionIndex);
      isEmailCapturedNow = Boolean(data.isEmailCaptured);
    } catch {
      setErrorBanner("Network error. Please try sending again.");
    } finally {
      setIsLoading(false);
    }

    if (isEmailCapturedNow) {
      void generateReport();
    }
  }, [draft, sessionToken, isLoading, isGeneratingReport, questionIndex]);

  // ── Trigger report generation ────────────────────────────────────────
  // Accepts an explicit token so it can be triggered from the recovery
  // path before the sessionToken state has settled.
  const generateReport = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride ?? sessionToken;
    if (!token || isGeneratingReport) return;
    setIsGeneratingReport(true);
    setErrorBanner(null);

    try {
      const res = await fetch("/api/diagnostic/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken: token }),
      });
      const data = (await res.json()) as {
        report?: DiagnosticReport;
        error?: string;
      };
      if (!res.ok || !data.report) {
        setErrorBanner(
          data.error ||
            "We couldn't generate your report. Please refresh and try again."
        );
        return;
      }
      setReport(data.report);
      setQuestionIndex(20);
      // Smooth-scroll to the report once it renders.
      requestAnimationFrame(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch {
      setErrorBanner("Network error while generating the report.");
    } finally {
      setIsGeneratingReport(false);
    }
  }, [sessionToken, isGeneratingReport]);

  // ── Render ───────────────────────────────────────────────────────────
  const inputDisabled =
    isLoading || isGeneratingReport || report !== null || !sessionToken;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <DiagnosticHeader
        questionIndex={questionIndex}
        showProgress={report === null}
      />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            isGeneratingReport={isGeneratingReport}
          />
          {errorBanner && (
            <div className="mx-auto max-w-3xl px-6 mb-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                {errorBanner}
              </div>
            </div>
          )}
          {report && (
            <div ref={reportRef} className="scroll-mt-24">
              <ReportView
                report={report}
                firstName={extractFirstName(messages) ?? "there"}
              />
            </div>
          )}
        </div>
        {!report && (
          <div className="sticky bottom-0 z-10">
            <InputBar
              value={draft}
              onChange={setDraft}
              onSubmit={sendMessage}
              disabled={inputDisabled}
              placeholder={
                isGeneratingReport
                  ? "Generating your report..."
                  : "Type your answer here..."
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Best-effort first-name extraction from the captured conversation. The
// server stores the canonical firstName once Q1 is captured; this is a
// lightweight client-side fallback used purely for the report header.
function extractFirstName(messages: ChatMessage[]): string | null {
  // Q1 is "what is your first name?" — the user's first message is the
  // answer.
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return null;
  const cleaned = firstUser.content.trim();
  // Take the first word only if the user answered conversationally
  // ("It's Sarah" / "Sarah here").
  const match = cleaned.match(/^[A-Z][a-z'-]{1,30}/);
  return match ? match[0] : cleaned.split(/\s+/)[0] ?? null;
}
