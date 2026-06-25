import type { Metadata } from "next";
import Script from "next/script";

// Sandbox page for validating the embeddable chat widget (public/widget/v1.js)
// in isolation. The page deliberately uses no SiteNav / SiteFooter and no
// Tailwind classes that the widget might collide with. If the widget works
// here, it will work on a third-party site (e.g. GHL).
//
// Internal use only. noindex.

export const metadata: Metadata = {
  title: "Widget embed test — Adam Sowden",
  robots: { index: false, follow: false },
};

export default function EmbedTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "48px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
        color: "#111",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 28,
            margin: "0 0 12px",
          }}
        >
          Widget embed test
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#444" }}>
          This page does not include the site nav, footer, or any of the
          adamsowden.com Tailwind styles. It exists only to verify that
          the embed loader at <code>/widget/v1.js</code> works in
          isolation. If the chat bubble appears bottom-right and a real
          conversation works here, the same script tag will work when
          pasted into a GHL site, a WordPress site, or any other
          third-party hosting platform.
        </p>

        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            margin: "32px 0 12px",
          }}
        >
          Embed snippet
        </h2>
        <pre
          style={{
            background: "#F9FAFB",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 13,
            overflowX: "auto",
          }}
        >
          {`<script src="https://adamsowden.com/widget/v1.js" async></script>`}
        </pre>

        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            margin: "32px 0 12px",
          }}
        >
          What to check
        </h2>
        <ul style={{ fontSize: 15, lineHeight: 1.7, color: "#444" }}>
          <li>
            A blue circular chat bubble is visible bottom-right of the
            viewport.
          </li>
          <li>
            Clicking it opens a chat panel with the prompt &ldquo;What do
            you help with today?&rdquo;
          </li>
          <li>
            Typing a question and hitting Send streams a real response
            from the Adam Sowden chat backend (no CORS errors in the
            console).
          </li>
          <li>
            Closing the panel via the X button works and the bubble stays
            visible.
          </li>
        </ul>
      </div>

      {/* The actual embed under test. This is exactly what would go on
          a GHL site, just with strategy="afterInteractive" so Next.js
          loads it cleanly. On a static GHL page it would be a plain
          <script> tag in the custom code section. */}
      <Script src="/widget/v1.js" strategy="afterInteractive" />
    </main>
  );
}
