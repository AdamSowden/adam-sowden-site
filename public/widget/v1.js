/* ────────────────────────────────────────────────────────────────────────
 * Adam Sowden chat widget — embeddable loader (v1)
 *
 * Drops a floating chat bubble bottom-right on any page. Click → opens
 * a chat panel that talks to https://adamsowden.com/api/chat. Renders
 * entirely inside a shadow DOM so the host site's CSS can never touch
 * it, and vice versa.
 *
 * Embed snippet (paste into the host site's <head> or footer):
 *   <script src="https://adamsowden.com/widget/v1.js" async></script>
 *
 * Designed to validate that the script-tag pattern works on third-party
 * sites (specifically GHL) before any productisation work. This is the
 * MVP, not the final productised loader.
 * ──────────────────────────────────────────────────────────────────── */

(function () {
  // Guard against double-loading
  if (window.__adamSowdenChatWidget) return;
  window.__adamSowdenChatWidget = true;

  // Resolve the API origin from the script src so the widget works no
  // matter where it's hosted (adamsowden.com, vercel preview URL, etc.)
  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="/widget/v1.js"]');
  var origin = "https://adamsowden.com";
  var clientSlug = null;
  if (currentScript) {
    if (currentScript.src) {
      try {
        origin = new URL(currentScript.src).origin;
      } catch (e) {
        /* fall back to hardcoded origin */
      }
    }
    // data-client="virtus" → "virtus". Sent on every chat request so
    // the server loads the matching per-client config. Without a
    // data-client attribute, the chat falls back to Adam's default.
    if (currentScript.dataset && currentScript.dataset.client) {
      clientSlug = currentScript.dataset.client;
    }
  }
  var API_URL = origin + "/api/chat";
  var WIDGET_CONFIG_URL = clientSlug
    ? origin + "/api/widget-config?client=" + encodeURIComponent(clientSlug)
    : null;

  // Defaults if no per-client config is loaded. Per-client overrides
  // come from /api/widget-config and patch this object before the
  // panel renders.
  //
  // CTA defaults reproduce the original behaviour: the model emits
  // [BOOK_QUICK_CHAT], the button reads "Book a chat", and clicking it
  // opens bookingUrl in a new tab. A per-client `cta` override can change
  // the marker + label and, if `ctaScrollToId` is set, scroll the host
  // page to that element instead of navigating away.
  var config = {
    eyebrow: "ASK THE AI",
    title: "Got a marketing question?",
    description:
      "Trained on Adam Sowden's methodology, voice, and proof points. Ask anything about autonomous AI marketing systems that run without you.",
    openingMessage: "What do you help with today?",
    accentColor: "#188bf6",
    accentColorHover: "#0d78dc",
    bookingUrl: origin + "/book",
    ctaMarker: "[BOOK_QUICK_CHAT]",
    ctaLabel: "Book a chat",
    ctaScrollToId: null,
  };

  // ── DOM scaffolding ───────────────────────────────────────────────────

  var host = document.createElement("div");
  host.id = "adam-sowden-chat-widget";
  host.style.cssText =
    "position:fixed;bottom:0;right:0;z-index:2147483647;width:0;height:0;";
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: "open" });

  // All widget CSS lives inside the shadow root, scoped away from the
  // host site. Accent color is driven by CSS variables so per-client
  // configs can override without regenerating the stylesheet.
  var style = document.createElement("style");
  style.textContent =
    ":host{--ah-accent:#188bf6;--ah-accent-hover:#0d78dc;}" +
    "*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;}" +
    ".bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:9999px;background:var(--ah-accent);color:#fff;border:none;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;}" +
    ".bubble:hover{background:var(--ah-accent-hover);transform:translateY(-1px);}" +
    ".bubble svg{width:26px;height:26px;}" +
    ".panel{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 128px);background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,0.18);display:flex;flex-direction:column;overflow:hidden;}" +
    ".header{padding:18px 20px 14px;border-bottom:1px solid rgba(0,0,0,0.06);background:#F9FAFB;}" +
    ".eyebrow{font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--ah-accent);margin:0 0 6px;}" +
    ".title{font-family:Georgia,serif;font-size:18px;color:#111;margin:0;font-weight:600;}" +
    ".sub{font-size:13px;color:rgba(0,0,0,0.6);margin:6px 0 0;line-height:1.4;}" +
    ".close{position:absolute;top:14px;right:14px;background:transparent;border:none;cursor:pointer;color:rgba(0,0,0,0.4);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;}" +
    ".close:hover{background:rgba(0,0,0,0.05);color:#111;}" +
    ".messages{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px;background:#fff;}" +
    ".row{display:flex;}" +
    ".row.user{justify-content:flex-end;}" +
    ".row.assistant{justify-content:flex-start;}" +
    ".bubble-msg{max-width:85%;padding:10px 14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;}" +
    ".user .bubble-msg{background:var(--ah-accent);color:#fff;border-radius:16px 4px 16px 16px;}" +
    ".assistant .bubble-msg{background:#F9FAFB;color:#111;border:1px solid rgba(0,0,0,0.08);border-radius:4px 16px 16px 16px;}" +
    ".cta-row{display:flex;justify-content:flex-start;margin-top:6px;}" +
    ".cta{display:inline-flex;align-items:center;background:var(--ah-accent);color:#fff;border-radius:9999px;padding:8px 16px;font-size:13px;font-weight:600;text-decoration:none;transition:background .15s;}" +
    ".cta:hover{background:var(--ah-accent-hover);}" +
    ".dots{display:inline-flex;gap:4px;align-items:center;}" +
    ".dot{width:5px;height:5px;border-radius:50%;background:rgba(0,0,0,0.3);animation:dotPulse 1.1s ease-in-out infinite;}" +
    ".dot:nth-child(2){animation-delay:.15s;}" +
    ".dot:nth-child(3){animation-delay:.3s;}" +
    "@keyframes dotPulse{0%,80%,100%{opacity:.25;transform:scale(.85);}40%{opacity:1;transform:scale(1);}}" +
    ".form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid rgba(0,0,0,0.06);background:#fff;}" +
    ".input{flex:1;border:1px solid rgba(0,0,0,0.15);border-radius:9999px;padding:9px 16px;font-size:14px;outline:none;transition:border-color .15s;}" +
    ".input:focus{border-color:var(--ah-accent);}" +
    ".input:disabled{opacity:.6;}" +
    ".send{background:var(--ah-accent);color:#fff;border:none;border-radius:9999px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;}" +
    ".send:hover{background:var(--ah-accent-hover);}" +
    ".send:disabled{opacity:.5;cursor:not-allowed;}" +
    ".hidden{display:none !important;}" +
    "@media (max-width:480px){.panel{right:8px;bottom:80px;width:calc(100vw - 16px);height:calc(100vh - 100px);}.bubble{bottom:16px;right:16px;}}";
  shadow.appendChild(style);

  var bubble = document.createElement("button");
  bubble.className = "bubble";
  bubble.setAttribute("aria-label", "Open chat");
  bubble.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
  shadow.appendChild(bubble);

  var panel = document.createElement("div");
  panel.className = "panel hidden";
  panel.innerHTML =
    '<div class="header">' +
    '<button class="close" aria-label="Close chat">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    "</button>" +
    '<p class="eyebrow" id="ahEyebrow"></p>' +
    '<h3 class="title" id="ahTitle"></h3>' +
    '<p class="sub" id="ahSub"></p>' +
    "</div>" +
    '<div class="messages" id="msgs"></div>' +
    '<form class="form" id="form">' +
    '<input class="input" id="input" type="text" placeholder="Type a question..." maxlength="1800" autocomplete="off" />' +
    '<button class="send" id="send" type="submit">Send</button>' +
    "</form>";
  shadow.appendChild(panel);

  var msgsEl = panel.querySelector("#msgs");
  var formEl = panel.querySelector("#form");
  var inputEl = panel.querySelector("#input");
  var sendBtn = panel.querySelector("#send");
  var closeBtn = panel.querySelector(".close");
  var eyebrowEl = panel.querySelector("#ahEyebrow");
  var titleEl = panel.querySelector("#ahTitle");
  var subEl = panel.querySelector("#ahSub");

  // Apply config to the panel DOM + CSS variables. Called once initially
  // with defaults, then again if per-client config arrives from the
  // server.
  function applyConfig() {
    eyebrowEl.textContent = config.eyebrow;
    titleEl.textContent = config.title;
    subEl.textContent = config.description;
    if (config.accentColor) {
      host.style.setProperty("--ah-accent", config.accentColor);
      // Hover defaults to same colour at 90% lightness, unless explicit
      host.style.setProperty(
        "--ah-accent-hover",
        config.accentColorHover || config.accentColor
      );
    }
  }
  applyConfig();

  // ── State ─────────────────────────────────────────────────────────────

  var history = [
    { id: "opening", role: "assistant", content: config.openingMessage },
  ];
  var streaming = false;
  var hasUserInteracted = false;

  // ── Per-client config fetch ───────────────────────────────────────────
  // If data-client="<slug>" is set on the script tag, pull overrides for
  // panel copy + accent color. Non-blocking — if it fails, the widget
  // still works with defaults and the chat backend's per-client config
  // (loaded from the slug at /api/chat) still kicks in.
  if (WIDGET_CONFIG_URL) {
    fetch(WIDGET_CONFIG_URL)
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        if (!data) return;
        if (data.eyebrow) config.eyebrow = data.eyebrow;
        if (data.title) config.title = data.title;
        if (data.description) config.description = data.description;
        if (data.openingMessage) {
          config.openingMessage = data.openingMessage;
          // Update the seeded opening message if the panel hasn't been
          // used yet (no user messages exchanged).
          if (history.length === 1 && history[0].id === "opening") {
            history[0].content = data.openingMessage;
          }
        }
        if (data.accentColor) config.accentColor = data.accentColor;
        if (data.bookingUrl) config.bookingUrl = data.bookingUrl;
        if (data.cta) {
          if (data.cta.marker) config.ctaMarker = data.cta.marker;
          if (data.cta.label) config.ctaLabel = data.cta.label;
          if (data.cta.scrollToId) config.ctaScrollToId = data.cta.scrollToId;
        }
        applyConfig();
        // If panel is already open, re-render so the change is visible
        if (!panel.classList.contains("hidden")) render();
      })
      .catch(function (err) {
        console.warn("[adam-sowden-chat] widget config fetch failed:", err);
      });
  }

  // ── Render ────────────────────────────────────────────────────────────

  function render() {
    msgsEl.innerHTML = "";
    history.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "row " + m.role;
      var bubble = document.createElement("div");
      bubble.className = "bubble-msg";
      var hasCta =
        m.role === "assistant" && m.content.indexOf(config.ctaMarker) !== -1;
      var cleanContent = m.content.replace(config.ctaMarker, "").trim();
      bubble.textContent = cleanContent || "…";
      row.appendChild(bubble);
      msgsEl.appendChild(row);
      if (hasCta) {
        var ctaRow = document.createElement("div");
        ctaRow.className = "cta-row";
        var cta = document.createElement("a");
        cta.className = "cta";
        cta.textContent = config.ctaLabel;
        // Default: open bookingUrl in a new tab (original behaviour, and
        // the fallback when a scroll target isn't present).
        cta.href = config.bookingUrl;
        cta.target = "_blank";
        cta.rel = "noopener";
        if (config.ctaScrollToId) {
          // Prefer scrolling the HOST page to the target element (e.g. the
          // opt-in form). Works across the shadow DOM boundary because we
          // query the parent document. Falls through to bookingUrl if the
          // element isn't on this page.
          cta.addEventListener("click", function (e) {
            var target = document.getElementById(config.ctaScrollToId);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              panel.classList.add("hidden");
            }
          });
        }
        ctaRow.appendChild(cta);
        msgsEl.appendChild(ctaRow);
      }
    });
    if (streaming) {
      var dots = document.createElement("div");
      dots.className = "row assistant";
      dots.innerHTML =
        '<div class="bubble-msg" style="padding:10px 14px;"><span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span></div>';
      msgsEl.appendChild(dots);
    }
    if (hasUserInteracted) {
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }
  }

  // ── Send message ──────────────────────────────────────────────────────

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function sendMessage(text) {
    var trimmed = (text || "").trim();
    if (!trimmed || streaming) return;
    hasUserInteracted = true;

    history.push({ id: uid(), role: "user", content: trimmed });
    var assistantId = uid();
    history.push({ id: assistantId, role: "assistant", content: "" });
    streaming = true;
    inputEl.value = "";
    inputEl.disabled = true;
    sendBtn.disabled = true;
    render();

    var apiMessages = history
      .filter(function (m) {
        return m.id !== "opening" && m.id !== assistantId;
      })
      .map(function (m) {
        return { role: m.role, content: m.content };
      });

    var requestBody = { messages: apiMessages, article: {} };
    if (clientSlug) requestBody.client = clientSlug;

    fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then(function (res) {
        if (!res.ok || !res.body) {
          throw new Error("Chat request failed: " + res.status);
        }
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var acc = "";

        function pump() {
          return reader.read().then(function (result) {
            if (result.done) {
              streaming = false;
              inputEl.disabled = false;
              sendBtn.disabled = false;
              render();
              inputEl.focus();
              return;
            }
            acc += decoder.decode(result.value, { stream: true });
            history = history.map(function (m) {
              return m.id === assistantId ? { ...m, content: acc } : m;
            });
            render();
            return pump();
          });
        }
        return pump();
      })
      .catch(function (err) {
        console.error("[adam-sowden-chat]", err);
        history = history.map(function (m) {
          return m.id === assistantId
            ? {
                ...m,
                content:
                  "Something went wrong just then. Please try again.\n\n" +
                  config.ctaMarker,
              }
            : m;
        });
        streaming = false;
        inputEl.disabled = false;
        sendBtn.disabled = false;
        render();
      });
  }

  // ── Events ────────────────────────────────────────────────────────────

  bubble.addEventListener("click", function () {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) {
      inputEl.focus();
      render();
    }
  });

  closeBtn.addEventListener("click", function () {
    panel.classList.add("hidden");
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(inputEl.value);
  });

  // Initial render is deferred until panel opens.
})();
