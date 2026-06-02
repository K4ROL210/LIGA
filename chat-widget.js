/* ============================================================
   chat-widget.js  —  floating chatbot dla strony turnieju
   Użycie: <script src="chat-widget.js"></script>
   przed zamknięciem </body> na każdej stronie.

   Uzupełnij:
     ANTHROPIC_API_KEY  —  twój klucz z console.anthropic.com
     QA_FILE            —  ścieżka do pliku qa.json
   ============================================================ */

const ANTHROPIC_API_KEY = "AQ.Ab8RN6JE41-zWFW25238jNMAHm1CpiFGL8NrFH6kM2Bt6f84DQ";
const QA_FILE = "qa.json";

(function () {
  /* ---------- style ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #cw-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: #1a1a2e; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #cw-btn:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(0,0,0,0.32); }
    #cw-btn svg { width: 26px; height: 26px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #cw-btn .cw-badge {
      position: absolute; top: 4px; right: 4px;
      width: 10px; height: 10px; background: #e63946; border-radius: 50%;
      border: 2px solid #fff;
    }
    #cw-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 340px; max-height: 500px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column;
      overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;
      transform: scale(0.85) translateY(20px); opacity: 0;
      pointer-events: none;
      transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), opacity 0.18s;
    }
    #cw-panel.cw-open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    #cw-header {
      background: #1a1a2e; color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #cw-header .cw-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #e63946; display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    #cw-header .cw-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
    #cw-header .cw-sub { font-size: 11px; opacity: 0.7; }
    #cw-header .cw-close {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: #fff; opacity: 0.7; font-size: 20px; line-height: 1; padding: 0 2px;
    }
    #cw-header .cw-close:hover { opacity: 1; }
    #cw-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      background: #f8f9fb; min-height: 200px;
    }
    .cw-msg {
      max-width: 82%; padding: 9px 13px; font-size: 13.5px;
      line-height: 1.55; border-radius: 14px; word-break: break-word;
    }
    .cw-msg.cw-bot {
      background: #fff; color: #1a1a2e;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      align-self: flex-start;
    }
    .cw-msg.cw-user {
      background: #1a1a2e; color: #fff;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }
    .cw-msg.cw-typing { color: #888; font-style: italic; }
    #cw-input-row {
      display: flex; gap: 8px; padding: 10px 12px;
      border-top: 1px solid #eee; background: #fff;
    }
    #cw-input {
      flex: 1; border: 1px solid #ddd; border-radius: 20px;
      padding: 8px 14px; font-size: 13px; outline: none;
      font-family: inherit; background: #f8f9fb;
    }
    #cw-input:focus { border-color: #1a1a2e; background: #fff; }
    #cw-send {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: #1a1a2e; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    #cw-send:hover { background: #e63946; }
    #cw-send svg { width: 16px; height: 16px; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
    @media (max-width: 400px) {
      #cw-panel { width: calc(100vw - 24px); right: 12px; bottom: 80px; }
      #cw-btn  { right: 12px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- HTML ---------- */
  document.body.insertAdjacentHTML("beforeend", `
    <button id="cw-btn" aria-label="Otwórz czat z asystentem">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="cw-badge"></span>
    </button>
    <div id="cw-panel" role="dialog" aria-label="Czat z asystentem turnieju">
      <div id="cw-header">
        <div class="cw-avatar">🏆</div>
        <div>
          <div class="cw-title">Asystent turnieju</div>
          <div class="cw-sub">Odpowiada na pytania o zawody</div>
        </div>
        <button class="cw-close" id="cw-close" aria-label="Zamknij czat">✕</button>
      </div>
      <div id="cw-messages"></div>
      <div id="cw-input-row">
        <input id="cw-input" type="text" placeholder="Napisz pytanie…" autocomplete="off" />
        <button id="cw-send" aria-label="Wyślij">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `);

  /* ---------- logika ---------- */
  let qaLoaded = null;
  let isOpen = false;

  const panel    = document.getElementById("cw-panel");
  const btn      = document.getElementById("cw-btn");
  const closeBtn = document.getElementById("cw-close");
  const input    = document.getElementById("cw-input");
  const sendBtn  = document.getElementById("cw-send");
  const msgs     = document.getElementById("cw-messages");

  function addMsg(text, cls) {
    const d = document.createElement("div");
    d.className = "cw-msg " + cls;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle("cw-open", isOpen);
    document.querySelector("#cw-btn .cw-badge").style.display = isOpen ? "none" : "";
    if (isOpen && msgs.children.length === 0) {
      addMsg("Cześć! 👋 Masz pytanie o turniej? Chętnie pomogę — zapytaj o zasady, terminarz, rejestrację lub wyniki.", "cw-bot");
    }
    if (isOpen) setTimeout(() => input.focus(), 250);
  }

  btn.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", togglePanel);

  /* ładowanie qa.json */
  async function loadQA() {
    if (qaLoaded) return qaLoaded;
    try {
      const r = await fetch(QA_FILE);
      qaLoaded = await r.json();
    } catch {
      qaLoaded = [];
    }
    return qaLoaded;
  }

  /* wyślij pytanie */
  async function send() {
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    addMsg(q, "cw-user");
    const typing = addMsg("Piszę…", "cw-bot cw-typing");

    const qa = await loadQA();
    const context = qa.length
      ? qa.map(x => `P: ${x.q}\nO: ${x.a}`).join("\n\n")
      : "(brak danych — odpowiadaj ogólnie o turniejach)";

    const systemPrompt = `Jesteś pomocnym asystentem turnieju/zawodów. Odpowiadaj po polsku, zwięźle i przyjaźnie.
Masz dostęp do następującej bazy wiedzy o turnieju:

${context}

Jeśli pytanie jest spoza bazy wiedzy, odpowiedz ogólnie lub powiedz że nie masz tej informacji.
Nie wymyślaj dat, wyników ani danych których nie ma w bazie.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: q }]
        })
      });
      const data = await res.json();
      const answer = data.content?.map(b => b.text || "").join("") || "Przepraszam, wystąpił błąd.";
      typing.className = "cw-msg cw-bot";
      typing.textContent = answer;
    } catch {
      typing.className = "cw-msg cw-bot";
      typing.textContent = "Błąd połączenia. Spróbuj ponownie.";
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", e => { if (e.key === "Enter") send(); });

  /* preload QA żeby pierwsza odpowiedź była szybsza */
  loadQA();
})();
