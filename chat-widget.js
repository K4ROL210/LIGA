/* ============================================================
   chat-widget.js — Liga Squasha WPC
   ============================================================ */

const QA_FILE = "qa.json";
console.log('CHAT WIDGET ZAŁADOWANY - wersja 1');
(function () {

const SCRIPT_URL = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';

const styleEl = document.createElement("style");
styleEl.textContent = `
#cw-btn {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  width:56px; height:56px; border-radius:50%;
  background:#0e1318; border:2px solid #c8ff00;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 18px rgba(200,255,0,0.35);
  transition:transform .2s, box-shadow .2s;
  font-size:24px; line-height:1; color: white;
}
#cw-btn:hover { transform:scale(1.1); box-shadow:0 0 28px rgba(200,255,0,0.6); }
#cw-badge {
  position:absolute; top:3px; right:3px;
  width:11px; height:11px; background:#ff4d4d;
  border-radius:50%; border:2px solid #0e1318;
}
#cw-panel {
  position:fixed; bottom:90px; right:24px; z-index:9999;
  width:340px; max-height: min(520px, 60dvh);
  background:#0e1318; border:1.5px solid rgba(255,255,255,0.12);
  border-radius:18px;
  box-shadow:0 8px 40px rgba(0,0,0,0.5);
  display:flex; flex-direction:column; overflow:hidden;
  font-family:'Rajdhani','Arial',sans-serif;
  transform:scale(0.88) translateY(16px); opacity:0; pointer-events:none;
  transition:transform .22s cubic-bezier(.34,1.56,.64,1), opacity .18s, bottom .15s;
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
#cw-head .ti { font-family:'Bebas Neue',cursive; font-size:16px; letter-spacing:1.5px; color:#c8ff00; line-height:1; }
#cw-head .su { font-size:12px; color:#5a6680; font-weight:600; margin-top:2px; }
#cw-head .cl {
  margin-left:auto; background:none; border:none; cursor:pointer;
  color:#5a6680; font-size:18px; line-height:1; transition:color .15s;
}
#cw-head .cl:hover { color:#dde4f0; }
#cw-msgs {
  flex:1; overflow-y:auto; padding:14px;
  display:flex; flex-direction:column; gap:10px;
  background:rgba(0,0,0,0.2); min-height:180px;
}
.cwm {
  max-width:84%; padding:9px 13px; font-size:14px;
  line-height:1.55; border-radius:14px; word-break:break-word; font-weight:500;
}
.cwm.bot {
  background:rgba(255,255,255,0.05); color:#dde4f0;
  border:1px solid rgba(255,255,255,0.08); border-bottom-left-radius:4px;
  align-self:flex-start;
}
.cwm.usr {
  background:#c8ff00; color:#0a0f08; font-weight:700;
  border-bottom-right-radius:4px; align-self:flex-end;
}
.cwm.typ { color:#5a6680; font-style:italic; }
#cw-irow {
  display:flex; flex-direction:column; gap:8px; padding:10px 12px;
  border-top:1px solid rgba(255,255,255,0.07);
  background:#080c10;
}
#cw-irow-fields {
  display:flex; gap:8px;
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
#cw-snd {
  width:36px; height:36px; border-radius:50%; flex-shrink:0;
  background:#c8ff00; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; transition:box-shadow .15s;
}
#cw-snd:hover { box-shadow:0 0 14px rgba(200,255,0,0.5); }

.cwm-info-row { display:flex; flex-direction:column; gap:8px; margin-top:4px; max-width:88%; }
.cwm-info-inp {
  background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.10);
  border-radius:20px; padding:8px 14px; font-size:14px; color:#dde4f0; outline:none;
  font-family:'Rajdhani',sans-serif; font-weight:600; transition:border-color .15s;
}
.cwm-info-inp::placeholder { color:#5a6680; }
.cwm-info-inp:focus { border-color:rgba(200,255,0,0.5); }
.cwm-info-inp.err { border-color:#ff4d4d; }
.cwm-info-btn {
  align-self:flex-start; padding:8px 16px; border-radius:20px; border:none;
  background:#c8ff00; color:#0a0f08; font-family:'Rajdhani',sans-serif;
  font-weight:700; font-size:14px; cursor:pointer; transition:box-shadow .15s;
}
.cwm-info-btn:hover { box-shadow:0 0 14px rgba(200,255,0,0.5); }

@media(max-width:400px){
  #cw-panel{width:calc(100vw - 24px);right:12px;bottom:78px;}
  #cw-btn{right:12px;bottom:16px;}
}
`;
document.head.appendChild(styleEl);

if (!document.querySelector('link[href*="Bebas+Neue"]')) {
  const lnk = document.createElement("link");
  lnk.rel = "stylesheet";
  lnk.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@600;700&display=swap";
  document.head.appendChild(lnk);
}

document.body.insertAdjacentHTML("beforeend", `
  <button id="cw-btn" aria-label="Czat"><span>ASK</span><span id="cw-badge"></span></button>
  <div id="cw-panel">
    <div id="cw-head">
      <div class="av">🏆</div>
      <div><div class="ti">Liga Squasha WPC</div><div class="su">Asystent · pytania o ligę</div></div>
      <button class="cl" id="cw-cl">✕</button>
    </div>
    <div id="cw-msgs"></div>
    <div id="cw-irow">
      <input id="cw-inp" type="text" placeholder="Napisz pytanie o ligę…" autocomplete="off"/>
      <div id="cw-irow-fields">
        <button id="cw-snd">➤</button>
      </div>
    </div>
  </div>
`);

let qa = null;
let isOpen = false;
let regState = null;
let infoGateActive = false;

const USER_INFO_KEY = 'cw_userInfo';
function getUserInfo() {
  try { return JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null'); } catch { return null; }
}
function saveUserInfo(info) {
  try { localStorage.setItem(USER_INFO_KEY, JSON.stringify(info)); } catch {}
}
let userInfo = getUserInfo();

const panel   = document.getElementById("cw-panel");
const msgs    = document.getElementById("cw-msgs");
const inp     = document.getElementById("cw-inp");
const irow    = document.getElementById("cw-irow");

function msg(text, cls) {
  const d = document.createElement("div");
  d.className = "cwm " + cls;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function addButtons(opcje) {
   console.log('addButtons:', opcje.map(o => o.label));
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;';
  opcje.forEach(function(o) {
    const b = document.createElement('button');
    b.textContent = o.label;
    b.style.cssText = 'padding:6px 14px;border-radius:20px;border:1.5px solid #c8ff00;background:transparent;color:#c8ff00;font-family:Rajdhani,sans-serif;font-weight:700;font-size:13px;cursor:pointer;';
    b.addEventListener('click', function() {
      wrap.remove();
      msg(o.label, 'usr');
      o.action();
    });
    wrap.appendChild(b);
  });
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function toggle() {
  isOpen = !isOpen;
  panel.classList.toggle("open", isOpen);
  document.getElementById("cw-badge").style.display = isOpen ? "none" : "";
  if (isOpen && msgs.children.length === 0) {
    msg("Cześć! 👋 Jeśli masz jakies pytanie na temat Ligi Squasha to śmiało zadawaj, postaram sie pomóc :)", "bot");
  }
  if (isOpen) setTimeout(() => inp.focus(), 250);
}

function addInfoForm(onSubmit) {
  const wrap = document.createElement('div');
  wrap.className = 'cwm-info-row';

  const nameInp = document.createElement('input');
  nameInp.className = 'cwm-info-inp';
  nameInp.type = 'text';
  nameInp.placeholder = 'Imię i nazwisko';

  const mailInp = document.createElement('input');
  mailInp.className = 'cwm-info-inp';
  mailInp.type = 'email';
  mailInp.placeholder = 'E-mail (opcjonalnie)';

  const btn = document.createElement('button');
  btn.className = 'cwm-info-btn';
  btn.textContent = 'Dalej';

  function submit() {
    const name = nameInp.value.trim();
    if (!name) { nameInp.classList.add('err'); nameInp.focus(); return; }
    const email = mailInp.value.trim();
    wrap.remove();
    msg(email ? (name + ' · ' + email) : name, 'usr');
    onSubmit({ name: name, email: email });
  }

  nameInp.addEventListener('input', () => nameInp.classList.remove('err'));
  nameInp.addEventListener('keydown', e => { if (e.key === 'Enter') mailInp.focus(); });
  mailInp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  btn.addEventListener('click', submit);

  wrap.appendChild(nameInp);
  wrap.appendChild(mailInp);
  wrap.appendChild(btn);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => nameInp.focus(), 50);
}

// Pyta o dane tylko przy zwykłym otwarciu czatu (nie przy flow "Dopisz mnie do listy"),
// i tylko raz na przeglądarkę — zapamiętane w localStorage. Jeśli dane już są zapamiętane,
// wypisuje je ponownie jako wiadomość, żeby było widać kto pisze też przy kolejnych wizytach.
let infoRevealedThisSession = false;
function maybeAskUserInfo() {
  if (infoGateActive) return;

  if (userInfo && userInfo.name) {
    if (!infoRevealedThisSession) {
      infoRevealedThisSession = true;
      setTimeout(function() {
        msg(userInfo.email ? (userInfo.name + ' · ' + userInfo.email) : userInfo.name, 'usr');
      }, 350);
    }
    return;
  }

  infoGateActive = true;
  irow.style.display = 'none';
  setTimeout(function() {
    msg('Zanim przejdziemy do rozmowy — podaj Imię i Nazwisko (opcjonalnie e-mail):', 'bot');
    addInfoForm(function(info) {
      userInfo = info;
      saveUserInfo(info);
      infoGateActive = false;
      infoRevealedThisSession = true;
      irow.style.display = '';
      inp.focus();
    });
  }, 350);
}

document.getElementById("cw-btn").addEventListener("click", function() {
  toggle();
  if (isOpen) maybeAskUserInfo();
});
document.getElementById("cw-cl").addEventListener("click", toggle);

async function loadQA() {
  if (qa) return qa;
  try { qa = await (await fetch(QA_FILE)).json(); } catch { qa = []; }
  return qa;
}

async function send() {
  if (infoGateActive) return;
  const q = inp.value.trim();
  if (!q) return;
  inp.value = "";
  msg(q, "usr");
  const t = msg("Piszę…", "bot typ");

  const data = await loadQA();
  const ctx = data.length ? data.map(x => "P: " + x.q + "\nO: " + x.a).join("\n\n") : "";

  try {
    const res = await fetch("https://squash-chat.karol-kreczmanski.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, context: ctx })
    });
    const json = await res.json();
    t.className = "cwm bot";
    t.textContent = json?.answer || "Przepraszam, coś poszło nie tak.";
  } catch {
    t.className = "cwm bot";
    t.textContent = "Błąd połączenia. Spróbuj ponownie.";
  }
  msgs.scrollTop = msgs.scrollHeight;
}

document.getElementById("cw-snd").addEventListener("click", send);
inp.addEventListener("keydown", function(e) {
  if (e.key !== "Enter") return;
  send();
});


// ── Flow rejestracji ──────────────────────────────────────────
window.startRejestracja = function(imie, dayKey) {
   console.log('startRejestracja:', imie, dayKey);
  if (!isOpen) toggle();
  regState = { imie: imie, dayKey: dayKey };

  setTimeout(function() {
    msg('Chcesz dołączyć do listy graczy jako "' + imie + '"?', 'bot');
    setTimeout(function() {
      addButtons([
        {
          label: '✓ Tak, to ja',
          action: function() { krokFB(); }
        },
        {
          label: '✗ Anuluj',
          action: function() {
            regState = null;
            msg('Rejestracja anulowana.', 'bot');
          }
        }
      ]);
    }, 300);
  }, 400);
};

function krokFB() {
   console.log('krokFB start, regState:', regState);
  msg('Czy napisałeś wiadomość do organizatora na FB lub na numer telefonu?', 'bot');
  setTimeout(function() {
    addButtons([
      {
        label: '✓ Tak',
        action: function() { krokZapis(); }
      },
      {
        label: '✗ Nie',
        action: function() {
          msg('Najpierw napisz wiadomość do organizatora: m.me/karol.kreczmanski lub SMS 511 915 628 — a potem wróć i kliknij "DOPISZ MNIE" ponownie.', 'bot');
          regState = null;
        }
      }
    ]);
  }, 300);
}

function krokZapis() {
   console.log('krokZapis start, regState:', regState);
  msg('Zapisuję…', 'bot');

  const cbName = 'jsonp_reg_' + Math.random().toString(36).slice(2);
  const script = document.createElement('script');

  window[cbName] = function(data) {
    console.log('JSONP callback otrzymany:', data);
    delete window[cbName];
    script.remove();
    if (data.ok) {
      const imie   = regState.imie;
      const dayKey = regState.dayKey;
      msg('✅ Gotowe! "' + imie + '" dodany do listy graczy. Zapisuję Cię teraz na ligę...', 'bot');
      regState = null;
      if (dayKey && typeof state !== 'undefined' && typeof addPlayer === 'function') {
        state.inputs[dayKey] = imie;
        setTimeout(function() {
          addPlayer(dayKey).then(function(res) {
            if (state.errors[dayKey]) {
              msg('Coś poszło nie tak przy zapisie na ligę — wpisz się ręcznie w formularzu, dane już masz dodane do listy graczy.', 'bot');
            } else {
              msg('🎾 Zapisano na ligę! Do zobaczenia.', 'bot');
            }
          });
        }, 1500);
      }
    } else {
      msg('❌ Błąd: ' + (data.error || 'Spróbuj ponownie.'), 'bot');
      regState = null;
    }
  };

  const params = new URLSearchParams({
    action:   'registerPlayer',
    name:     regState.imie,
    callback: cbName
  });

  script.src = SCRIPT_URL + '?' + params.toString();
  script.onerror = function() {
    delete window[cbName];
    msg('❌ Błąd połączenia. Spróbuj ponownie.', 'bot');
    regState = null;
  };

  document.head.appendChild(script);
}
loadQA();
function fixIOSKeyboard() {
  if (!window.visualViewport) return;
  function update() {
    const vv = window.visualViewport;
    const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
    if (keyboardHeight > 100) {
      panel.style.bottom = (keyboardHeight + 10) + "px";
      panel.style.maxHeight = (vv.height - 110) + "px";
    } else {
      panel.style.bottom = "90px";
      panel.style.maxHeight = "520px";
    }
  }
  window.visualViewport.addEventListener("resize", update);
  window.visualViewport.addEventListener("scroll", update);
}
fixIOSKeyboard();

})();
