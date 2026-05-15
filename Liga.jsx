import { useState, useEffect } from "react";

const DAYS = [
  { key: "tue", label: "Wtorek",       short: "Wt", dow: 2 },
  { key: "thu", label: "Czwartek",     short: "Czw", dow: 4 },
  { key: "sat", label: "Sobota",       short: "Sob", dow: 6 },
  { key: "mon", label: "Poniedziałek", short: "Pn",  dow: 1 },
];

const COLORS = ["#e8ff47", "#47ffe8", "#ff8547", "#a847ff"];
const CUTOFF = 22;
const ADMIN_PASSWORD = "squash2024"; // ← zmień na swoje hasło

function getNextDate(dow) {
  const now = new Date();
  const today = now.getDay();
  const hour = now.getHours();
  let diff = (dow - today + 7) % 7;
  if (diff === 0 && hour >= CUTOFF) diff = 7;
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(d) {
  return d.toISOString().split("T")[0];
}

function formatPL(d) {
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function storKey(dayKey, date) {
  return `liga:${dayKey}:${dateKey(date)}`;
}

export default function App() {
  const days = DAYS.map((d, i) => ({ ...d, date: getNextDate(d.dow), color: COLORS[i] }));

  const [lists, setLists] = useState({});
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [adminMode, setAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => {
    (async () => {
      const result = {};
      for (const day of days) {
        const k = storKey(day.key, day.date);
        try {
          const r = await window.storage.get(k, true);
          result[k] = r ? JSON.parse(r.value) : [];
        } catch {
          result[k] = [];
        }
      }
      setLists(result);
      setLoading(false);
    })();
  }, []);

  async function addPlayer(day) {
    const name = (inputs[day.key] || "").trim();
    if (!name) return;
    const k = storKey(day.key, day.date);
    const current = lists[k] || [];
    if (current.includes(name)) return;
    const updated = [...current, name];
    setSaving(s => ({ ...s, [day.key]: true }));
    try {
      await window.storage.set(k, JSON.stringify(updated), true);
      setLists(l => ({ ...l, [k]: updated }));
      setInputs(i => ({ ...i, [day.key]: "" }));
    } catch (e) { console.error(e); }
    setSaving(s => ({ ...s, [day.key]: false }));
  }

  async function removePlayer(day, idx) {
    const k = storKey(day.key, day.date);
    const updated = (lists[k] || []).filter((_, i) => i !== idx);
    try {
      await window.storage.set(k, JSON.stringify(updated), true);
      setLists(l => ({ ...l, [k]: updated }));
    } catch (e) { console.error(e); }
  }

  async function saveEdit(day) {
    if (!editing) return;
    const k = storKey(day.key, day.date);
    const updated = [...(lists[k] || [])];
    updated[editing.idx] = editVal.trim();
    try {
      await window.storage.set(k, JSON.stringify(updated), true);
      setLists(l => ({ ...l, [k]: updated }));
      setEditing(null);
    } catch (e) { console.error(e); }
  }

  function tryLogin() {
    if (passInput === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowLogin(false);
      setPassInput("");
      setPassError(false);
    } else {
      setPassError(true);
    }
  }

  const s = {
    wrap: { padding: "20px 12px 40px", fontFamily: "system-ui, sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#eef0f6" },
    header: { textAlign: "center", marginBottom: 20 },
    tag: { display: "inline-block", background: "#e8ff47", color: "#000", fontSize: 10, fontWeight: 700, letterSpacing: 3, padding: "3px 10px", borderRadius: 4, marginBottom: 10 },
    h1: { fontSize: "clamp(28px,7vw,48px)", fontWeight: 900, lineHeight: 1, margin: "0 0 4px" },
    sub: { fontSize: 12, color: "#6b7394" },
    topBar: { display: "flex", justifyContent: "flex-end", marginBottom: 12, gap: 8 },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 },
    card: (color) => ({ background: "#13161f", border: `1px solid #252a38`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }),
    cardHead: (color) => ({ borderBottom: `2px solid ${color}`, padding: "10px 12px", background: color + "14" }),
    dayLabel: (color) => ({ fontWeight: 800, fontSize: 15, color }),
    dateLabel: { fontSize: 11, color: "#6b7394", marginTop: 2 },
    playerList: { flex: 1, padding: "6px 0", minHeight: 50 },
    playerRow: { display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderBottom: "1px solid #1a1e2a" },
    num: (color) => ({ fontSize: 11, color, minWidth: 16, textAlign: "right", opacity: .7, fontWeight: 700 }),
    playerName: { flex: 1, fontSize: 13, fontWeight: 500 },
    empty: { textAlign: "center", padding: "14px 8px", color: "#6b7394", fontSize: 12 },
    inputRow: { padding: "8px 10px", borderTop: "1px solid #1a1e2a", display: "flex", gap: 6 },
    input: { flex: 1, background: "#1a1e2a", border: "1px solid #252a38", borderRadius: 7, color: "#eef0f6", padding: "6px 8px", fontSize: 12, outline: "none" },
    addBtn: (color) => ({ background: color, color: "#000", border: "none", borderRadius: 7, padding: "6px 10px", fontWeight: 800, cursor: "pointer", fontSize: 14 }),
    iconBtn: (color) => ({ background: "transparent", color, border: `1px solid ${color}`, borderRadius: 5, width: 20, height: 20, cursor: "pointer", fontSize: 11, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }),
    adminBar: { background: "#102010", border: "1px solid #3ddc84", borderRadius: 8, padding: "6px 12px", marginBottom: 10, fontSize: 12, color: "#3ddc84" },
    loginBox: { background: "#13161f", border: "1px solid #252a38", borderRadius: 10, padding: 14, marginBottom: 12 },
    btn: (bg, fg = "#eef0f6") => ({ background: bg, color: fg, border: "none", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }),
    footer: { textAlign: "center", fontSize: 11, color: "#3b4060", marginTop: 20 },
  };

  if (loading) return (
    <div style={{ ...s.wrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#6b7394", fontSize: 14 }}>Ładowanie…</span>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.tag}>🎾 LIGA SQUASHA</div>
        <h1 style={s.h1}>ZAPISY NA <span style={{ color: "#e8ff47" }}>MECZE</span></h1>
        <p style={s.sub}>Lista rotuje się automatycznie o 22:00 każdego tygodnia</p>
      </div>

      <div style={s.topBar}>
        {adminMode
          ? <button style={s.btn("#3b1414", "#ff8080")} onClick={() => setAdminMode(false)}>Wyłącz admina</button>
          : <button style={s.btn("#1a1e2a")} onClick={() => setShowLogin(v => !v)}>🔐 Admin</button>
        }
      </div>

      {showLogin && !adminMode && (
        <div style={s.loginBox}>
          <p style={{ fontSize: 12, color: "#6b7394", marginBottom: 8 }}>Hasło administratora:</p>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="password" value={passInput}
              onChange={e => { setPassInput(e.target.value); setPassError(false); }}
              onKeyDown={e => e.key === "Enter" && tryLogin()}
              placeholder="Wpisz hasło…"
              style={{ ...s.input, borderColor: passError ? "#ff4747" : "#252a38" }}
            />
            <button style={s.btn("#e8ff47", "#000")} onClick={tryLogin}>OK</button>
            <button style={s.btn("#1a1e2a")} onClick={() => { setShowLogin(false); setPassInput(""); setPassError(false); }}>✕</button>
          </div>
          {passError && <p style={{ fontSize: 11, color: "#ff4747", marginTop: 6 }}>Błędne hasło</p>}
        </div>
      )}

      {adminMode && <div style={s.adminBar}>✓ Tryb administratora — możesz edytować i usuwać wpisy</div>}

      <div style={s.grid}>
        {days.map(day => {
          const k = storKey(day.key, day.date);
          const players = lists[k] || [];
          const isEditing = (idx) => editing?.dayKey === day.key && editing?.idx === idx;

          return (
            <div key={day.key} style={s.card(day.color)}>
              <div style={s.cardHead(day.color)}>
                <div style={s.dayLabel(day.color)}>{day.label}</div>
                <div style={s.dateLabel}>{formatPL(day.date)}</div>
              </div>

              <div style={s.playerList}>
                {players.length === 0
                  ? <div style={s.empty}>Brak zapisanych</div>
                  : players.map((name, i) => (
                    <div key={i} style={{ ...s.playerRow, borderBottom: i < players.length - 1 ? "1px solid #1a1e2a" : "none" }}>
                      <span style={s.num(day.color)}>{i + 1}</span>
                      {adminMode && isEditing(i) ? (
                        <input
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(day); if (e.key === "Escape") setEditing(null); }}
                          autoFocus
                          style={{ ...s.input, flex: 1, fontSize: 12, padding: "3px 6px" }}
                        />
                      ) : (
                        <span style={s.playerName}>{name}</span>
                      )}
                      {adminMode && (
                        <div style={{ display: "flex", gap: 3 }}>
                          {isEditing(i) ? (
                            <button style={s.iconBtn("#3ddc84")} onClick={() => saveEdit(day)}>✓</button>
                          ) : (
                            <button style={s.iconBtn("#e8ff47")} onClick={() => { setEditing({ dayKey: day.key, idx: i }); setEditVal(name); }}>✎</button>
                          )}
                          <button style={s.iconBtn("#ff4747")} onClick={() => removePlayer(day, i)}>✕</button>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>

              <div style={s.inputRow}>
                <input
                  type="text"
                  placeholder="Imię i nazwisko…"
                  value={inputs[day.key] || ""}
                  onChange={e => setInputs(p => ({ ...p, [day.key]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addPlayer(day)}
                  style={s.input}
                />
                <button
                  style={s.addBtn(day.color)}
                  onClick={() => addPlayer(day)}
                  disabled={saving[day.key]}
                >
                  {saving[day.key] ? "…" : "+"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={s.footer}>
        Dane zapisywane w chmurze i widoczne dla wszystkich • Automatyczna rotacja o 22:00
      </p>
    </div>
  );
}