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
  if (currentScript && currentScript.src) {
    try {
      origin = new URL(currentScript.src).origin;
    } catch (e) {
      /* fall back to hardcoded origin */
    }
  }
  var API_URL = origin + "/api/chat";
  var BOOK_MARKER = "[BOOK_QUICK_CHAT]";
  // BOOKING_URL is not loaded from server config in this MVP. Hardcoded
  // here matches what the production /book page resolves to.
  var BOOKING_URL = origin + "/book";

  var OPENING_MESSAGE = "What do you help with today?";

  // ── DOM scaffolding ───────────────────────────────────────────────────

  var host = document.createElement("div");
  host.id = "adam-sowden-chat-widget";
  host.style.cssText =
    "position:fixed;bottom:0;right:0;z-index:2147483647;width:0;height:0;";
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: "open" });

  // All widget CSS lives inside the shadow root, scoped away from the
  // host site. Brand palette matches adamsowden.com.
  var style = document.createElement("style");
  style.textContent =
    "*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;}" +
    ".bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:9999px;background:#188bf6;color:#fff;border:none;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;}" +
    ".bubble:hover{background:#0d78dc;transform:translateY(-1px);}" +
    ".bubble svg{width:26px;height:26px;}" +
    ".panel{position:fixed;bottom:96px;right:24px;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 128px);background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,0.18);display:flex;flex-direction:column;overflow:hidden;}" +
    ".header{padding:18px 20px 14px;border-bottom:1px solid rgba(0,0,0,0.06);background:#F9FAFB;}" +
    ".eyebrow{font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#188bf6;margin:0 0 6px;}" +
    ".title{font-family:Georgia,serif;font-size:18px;color:#111;margin:0;font-weight:600;}" +
    ".sub{font-size:13px;color:rgba(0,0,0,0.6);margin:6px 0 0;line-height:1.4;}" +
    ".close{position:absolute;top:14px;right:14px;background:transparent;border:none;cursor:pointer;color:rgba(0,0,0,0.4);width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;}" +
    ".close:hover{background:rgba(0,0,0,0.05);color:#111;}" +
    ".messages{flex:1;overflow-y:auto;padding:16px 18px;display:flex;flex-direction:column;gap:10px;background:#fff;}" +
    ".row{display:flex;}" +
    ".row.user{justify-content:flex-end;}" +
    ".row.assistant{justify-content:flex-start;}" +
    ".bubble-msg{max-width:85%;padding:10px 14px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;}" +
    ".user .bubble-msg{background:#188bf6;color:#fff;border-radius:16px 4px 16px 16px;}" +
    ".assistant .bubble-msg{background:#F9FAFB;color:#111;border:1px solid rgba(0,0,0,0.08);border-radius:4px 16px 16px 16px;}" +
    ".cta-row{display:flex;justify-content:flex-start;margin-top:6px;}" +
    ".cta{display:inline-flex;align-items:center;background:#188bf6;color:#fff;border-radius:9999px;padding:8px 16px;font-size:13px;font-weight:600;text-decoration:none;transition:background .15s;}" +
    ".cta:hover{background:#0d78dc;}" +
    ".dots{display:inline-flex;gap:4px;align-items:center;}" +
    ".dot{width:5px;height:5px;border-radius:50%;background:rgba(0,0,0,0.3);animation:dotPulse 1.1s ease-in-out infinite;}" +
    ".dot:nth-child(2){animation-delay:.15s;}" +
    ".dot:nth-child(3){animation-delay:.3s;}" +
    "@keyframes dotPulse{0%,80%,100%{opacity:.25;transform:scale(.85);}40%{opacity:1;transform:scale(1);}}" +
    ".form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid rgba(0,0,0,0.06);background:#fff;}" +
    ".input{flex:1;border:1px solid rgba(0,0,0,0.15);border-radius:9999px;padding:9px 16px;font-size:14px;outline:none;transition:border-color .15s;}" +
    ".input:focus{border-color:#188bf6;}" +
    ".input:disabled{opacity:.6;}" +
    ".send{background:#188bf6;color:#fff;border:none;border-radius:9999px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;}" +
    ".send:hover{background:#0d78dc;}" +
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
    '<p class="eyebrow">Ask the AI</p>' +
    '<h3 class="title">Got a marketing question?</h3>' +
    '<p class="sub">Trained on Adam Sowden\'s methodology, voice, and proof points. Ask anything about marketing systems or the Owner Trap.</p>' +
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

  // ── State ─────────────────────────────────────────────────────────────

  var history = [
    { id: "opening", role: "assistant", content: OPENING_MESSAGE },
  ];
  var streaming = false;
  var hasUserInteracted = false;

  // ── Render ────────────────────────────────────────────────────────────

  function render() {
    msgsEl.innerHTML = "";
    history.forEach(function (m) {
      var row = document.createElement("div");
      row.className = "row " + m.role;
      var bubble = document.createElement("div");
      bubble.className = "bubble-msg";
      var hasBookCta =
        m.role === "assistant" && m.content.indexOf(BOOK_MARKER) !== -1;
      var cleanContent = m.content.replace(BOOK_MARKER, "").trim();
      bubble.textContent = cleanContent || "…";
      row.appendChild(bubble);
      msgsEl.appendChild(row);
      if (hasBookCta) {
        var ctaRow = document.createElement("div");
        ctaRow.className = "cta-row";
        var cta = document.createElement("a");
        cta.className = "cta";
        cta.href = BOOKING_URL;
        cta.target = "_blank";
        cta.rel = "noopener";
        cta.textContent = "Book a Quick Chat with Adam";
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

    fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, article: {} }),
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
                  "Something went wrong with the conversation. Please try again, or book a Quick Chat directly.\n\n" +
                  BOOK_MARKER,
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
