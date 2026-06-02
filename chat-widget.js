cat > /home/claude/chatbot/chat-widget.js << 'ENDOFFILE'
/* ============================================================
   chat-widget.js — Liga Squasha WPC
   Wstaw przed </body> na każdej stronie:
   <script src="chat-widget.js"></script>
   ============================================================ */

const GEMINI_API_KEY = "WKLEJ_TUTAJ_KLUCZ_AIzaSy...";
const QA_FILE = "qa.json";

(function () {

const STYLE = `
#cw-btn {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  width:56px; height:56px; border-radius:50%;
  background:#0e1318; border:2px solid #c8ff00;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 18px rgba(200,255,0,0.35);
  transition:transform .2s, box-shadow .2s;
  font-size:24px; line-height:1;
}
#cw-btn:hover { transform:scale(1.1); box-shadow:0 0 28px rgba(200,255,0,0.6); }
#cw-badge {
  position:absolute; top:3px; right:3px;
  width:11px; height:11px; background:#ff4d4d;
  border-radius:50%; border:2px solid #0e1318;
}
#cw-panel {
  position:fixed; bottom:90px; right:24px; z-index:9999;
  width:340px; max-height:520px;
  background:#0e1318; border:1.5px solid rgba(255,255,255,0.12);
  border-radius:18px;
  box-shadow:0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,255,0,0.08);
  display:flex; flex-direction:column; overflow:hidden;
  font-family:'Rajdhani','Arial',sans-serif;
  transform:scale(0.88) translateY(16px); opacity:0; pointer-events:none;
  transition:transform .22s cubic-bezier(.34,1.56,.64,1), opacity .18s;
}
#cw-panel.open { transform:scale(1) translateY(0); opacity:1; pointer-events:all; }
#cw-head {
  padding:14px 16px; display:flex; align-items:center; gap:10px;
  background:linear-gradient(135deg,rgba(200,255,0,0.08),transparent);
  border-bottom:1px solid rgba(255,255,255,0.08);
}
#cw-head .av {
  width:34px; height:34px; border-radius:50%; flex-shrink:0;
  background:rgba(200,255,0,0.12); border:1.5px solid rgba(200,255,0,0.4);
  display:flex; align-items:center; justify-content:center; font-size:16px;
}
#cw-head .info .title {
  font-family:'Bebas Neue',cursive; font-size:16px; letter-spacing:1.5px;
  color:#c8ff00; line-height:1;
}
#cw-head .info .sub { font-size:12px; color:#5a6680; font-weight:600; margin-top:2px; }
#cw-head .close {
  margin-left:auto; background:none; border:none; cursor:pointer;
  color:#5a6680; font-size:18px; line-height:1; transition:color .15s;
}
#cw-head .close:hover { color:#dde4f0; }
#cw-msgs {
  flex:1; overflow-y:auto; padding:14px;
  display:flex; flex-direction:column; gap:10px;
  background:rgba(0,0,0,0.2); min-height:180px;
  scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.1) transparent;
}
.cw-msg {
  max-width:84%; padding:9px 13px; font-size:14px;
  line-height:1.55; border-radius:14px; word-break:break-word; font-weight:500;
}
.cw-bot {
  background:rgba(255,255,255,0.05); color:#dde4f0;
  border:1px solid rgba(255,255,255,0.08); border-bottom-left-radius:4px;
  align-self:flex-start;
}
.cw-user {
  background:#c8ff00; color:#0a0f08; font-weight:700;
  border-bottom-right-radius:4px; align-self:flex-end;
}
.cw-typing { color:#5a6680; font-style:italic; }
#cw-inp-row {
  display:flex; gap:8px; padding:10px 12px;
  border-top:1px solid rgba(255,255,255,0.07);
  background:#080c10;
}
#cw-inp {
  flex:1; background:rgba(255,255,255,0.05);
  border:1.5px solid rgba(255,255,255,0.10);
  border-radius:20px; padding:8px 14px;
  font-size:14px; color:#dde4f0; outline:none;
  font-family:'Rajdhani',sans-serif; font-weight:600;
  transition:border-color .15s;
}
#cw-inp::placeholder { color:#5a6680; }
#cw-inp:focus { border-color:rgba(200,255,0,0.5); }
#cw-send {
  width:36px; height:36px; border-radius:50%; flex-shrink:0;
  background:#c8ff00; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; transition:box-shadow .15s, transform .15s;
}
#cw-send:hover { box-shadow:0 0 14px rgba(200,255,0,0.5); transform:scale(1.08); }
@media(max-width:400px){
  #cw-panel{width:calc(100vw - 24px); right:12px; bottom:78px;}
  #cw-btn{right:12px; bottom:16px;}
}
`;

// Wstrzyknięcie fontu Bebas Neue jeśli jeszcze nie załadowany
if (!document.querySelector('link[href*="Bebas+Neue"]')) {
  const lnk = document.createElement("link");
  lnk.rel = "stylesheet";
  lnk.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@600;700&display=swap";
  document.head.appendChild(lnk);
}

const styleEl = document.createElement("style");
styleEl.textContent = STYLE;
document.head.appendChild(styleEl);

document.body.insertAdjacentHTML("beforeend", `
  <button id="cw-btn" aria-label="Czat — pytania o ligę">
    🎾
    <span id="cw-badge"></span>
  </button>
  <div id="cw-panel" role="dialog" aria-label="Asystent Ligi Squasha WPC">
    <div id="cw-head">
      <div class="av">🏆</div>
      <div class="info">
        <div class="title">Liga Squasha WPC</div>
        <div class="sub">Asystent · odpowie na pytania</div>
      </div>
      <button class="close" id="cw-close" aria-label="Zamknij">✕</button>
    </div>
    <div id="cw-msgs"></div>
    <div id="cw-inp-row">
      <input id="cw-inp" type="text" placeholder="Napisz pytanie o ligę…" autocomplete="off"/>
      <button id="cw-send" aria-label="Wyślij">➤</button>
    </div>
  </div>
`);

let qa = null;
let open = false;
const panel = document.getElementById("cw-panel");
const msgs  = document.getElementById("cw-msgs");
const inp   = document.getElementById("cw-inp");

function addMsg(text, cls) {
  const d = document.createElement("div");
  d.className = "cw-msg " + cls;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function toggle() {
  open = !open;
  panel.classList.toggle("open", open);
  document.getElementById("cw-badge").style.display = open ? "none" : "";
  if (open && msgs.children.length === 0) {
    addMsg("Cześć! 👋 Mam pytanie o Ligę Squasha WPC? Zapytaj o zapisy, koszty, terminy lub zasady.", "cw-bot");
  }
  if (open) setTimeout(() => inp.focus(), 250);
}

document.getElementById("cw-btn").addEventListener("click", toggle);
document.getElementById("cw-close").addEventListener("click", toggle);

async function loadQA() {
  if (qa) return qa;
  try { qa = await (await fetch(QA_FILE)).json(); } catch { qa = []; }
  return qa;
}

async function send() {
  const q = inp.value.trim();
  if (!q) return;
  inp.value = "";
  addMsg(q, "cw-user");
  const typing = addMsg("Piszę…", "cw-bot cw-typing");

  const data = await loadQA();
  const context = data.length
    ? data.map(x => `P: ${x.q}\nO: ${x.a}`).join("\n\n")
    : "";

  const prompt = `Jesteś pomocnym asystentem Ligi Squasha WPC w Warszawie (Warsaw Padel Club, ul. Annopol 3).
Odpowiadaj po polsku, zwięźle i przyjaźnie. Używaj naturalnego języka bez formalności.

${context ? "Baza wiedzy o lidze:\n" + context : ""}

Jeśli pytanie wykracza poza bazę wiedzy, odpowiedz ogólnie lub zasugeruj kontakt: m.me/karol.kreczmanski lub tel. 511 915 628.
Nie wymyślaj dat ani danych których nie ma w bazie.

Pytanie: ${q}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const json = await res.json();
    const answer = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Przepraszam, coś poszło nie tak.";
    typing.className = "cw-msg cw-bot";
    typing.textContent = answer;
  } catch {
    typing.className = "cw-msg cw-bot";
    typing.textContent = "Błąd połączenia. Spróbuj ponownie.";
  }
  msgs.scrollTop = msgs.scrollHeight;
}

document.getElementById("cw-send").addEventListener("click", send);
inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
loadQA();

})();
ENDOFFILE
echo "OK"
