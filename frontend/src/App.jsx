import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ease = [0.22, 1, 0.36, 1];

const FEAT_LABELS = {
  net_strike_edge: "Net strike edge", sub_diff: "Submission threat",
  slpm_diff: "Strike output", def_ratio: "Defense ratio",
  td_diff: "Takedown diff", str_acc_diff: "Strike accuracy",
  td_def_diff: "TD defense", sapm_diff: "Strikes absorbed",
  striker_diff: "Striker score", ko_rate_diff: "KO rate",
  sub_rate_diff: "Sub rate", absorption_ratio: "Absorption ratio",
  grapple_dominance: "Grapple dominance", net_grapple_edge: "Net grapple edge",
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [fe, setFe] = useState(false);
  const [fp, setFp] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError("enter both fields"); return; }
    setLoading(true); setError(""); setMsg("");
    try {
      if (mode === "login") {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setMsg("check your email to confirm");
      }
    } catch (e) { setError(e.message.toLowerCase()); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ width: 340 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48, justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, background: "#e8ff5a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#000" }}>UFC</div>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.14em" }}>FIGHT PREDICTOR</span>
        </div>

        <div style={{ display: "flex", background: "#0d0d0d", borderRadius: 7, padding: 3, marginBottom: 24, border: "1px solid #1a1a1a" }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMsg(""); }} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 5, background: mode === m ? "#1e1e1e" : "transparent", color: mode === m ? "#f0f0ec" : "#444", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}>
              {m === "login" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 9, color: "#444", letterSpacing: "0.16em", marginBottom: 5, display: "block" }}>EMAIL</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} onFocus={() => setFe(true)} onBlur={() => setFe(false)} autoComplete="email"
          style={{ display: "block", width: "100%", padding: "12px 14px", background: "#0d0d0d", border: `1px solid ${fe ? "#e8ff5a" : "#1e1e1e"}`, borderRadius: 7, color: "#f0f0ec", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s", marginBottom: 12, boxSizing: "border-box" }} />

        <label style={{ fontSize: 9, color: "#444", letterSpacing: "0.16em", marginBottom: 5, display: "block" }}>PASSWORD</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} onFocus={() => setFp(true)} onBlur={() => setFp(false)} autoComplete="current-password"
          style={{ display: "block", width: "100%", padding: "12px 14px", background: "#0d0d0d", border: `1px solid ${fp ? "#e8ff5a" : "#1e1e1e"}`, borderRadius: 7, color: "#f0f0ec", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s", marginBottom: 6, boxSizing: "border-box" }} />

        <AnimatePresence mode="wait">
          {error && <motion.p key="e" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "#D85A30", fontSize: 11, margin: "8px 0" }}>{error}</motion.p>}
          {msg && <motion.p key="m" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "#4ade80", fontSize: 11, margin: "8px 0" }}>{msg}</motion.p>}
        </AnimatePresence>

        <button onClick={submit} disabled={loading} style={{ display: "block", width: "100%", padding: "13px", marginTop: 8, background: loading ? "#141414" : "#e8ff5a", color: loading ? "#444" : "#000", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.12em", transition: "all 0.2s" }}>
          {loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── FIGHTER INPUT ─────────────────────────────────────────────────────────────
function FighterInput({ label, color, value, onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const accent = color === "blue" ? "#378ADD" : "#D85A30";

  const search = useCallback(async (q) => {
    onChange(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    try {
      const r = await fetch(`/api/fighters?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      setResults(d); setOpen(d.length > 0);
    } catch { setOpen(false); }
  }, [onChange]);

  const pick = (n) => { onSelect(n); onChange(n); setOpen(false); setResults([]); };

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ flex: 1, position: "relative" }}>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.14em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        {label}
        <span style={{ padding: "2px 7px", borderRadius: 20, fontSize: 9, fontWeight: 700, background: color === "blue" ? "rgba(55,138,221,0.12)" : "rgba(216,90,48,0.12)", color: accent, letterSpacing: "0.08em" }}>{color.toUpperCase()}</span>
      </div>
      <input value={value} onChange={e => search(e.target.value)}
        onFocus={() => { setFocused(true); if (value.length >= 2) setOpen(results.length > 0); }}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === "Enter" && results.length) pick(results[0]); }}
        placeholder="search fighter..."
        autoComplete="off"
        style={{ width: "100%", padding: "14px 16px", background: "#0d0d0d", border: `1.5px solid ${focused ? accent : "#1e1e1e"}`, borderRadius: 8, color: "#f0f0ec", fontSize: 15, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
      />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, zIndex: 200, overflow: "hidden", maxHeight: 210, overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
            {results.map(n => (
              <div key={n} onMouseDown={() => pick(n)}
                style={{ padding: "11px 16px", fontSize: 13, cursor: "pointer", color: "#d0d0cc", borderBottom: "1px solid #161616", fontFamily: "'DM Mono', monospace", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >{n}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ANALYZER ──────────────────────────────────────────────────────────────────
function AnalyzerPage({ user, onSignOut }) {
  const [f1, setF1] = useState(""); const [f1sel, setF1sel] = useState("");
  const [f2, setF2] = useState(""); const [f2sel, setF2sel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predict = async () => {
    const n1 = f1sel || f1.trim(), n2 = f2sel || f2.trim();
    if (!n1 || !n2) { setError("select both fighters"); return; }
    if (n1 === n2) { setError("select two different fighters"); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ f1: n1, f2: n2 }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d);
    } catch (e) { setError(e.message.toLowerCase()); }
    finally { setLoading(false); }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const pct1 = result ? Math.round(result.f1_win_prob * 100) : 0;
  const pct2 = 100 - pct1;
  const wIsF1 = result?.predicted_winner === result?.f1_name;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column" }}>

      {/* NAV */}
      <nav style={{ padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #141414", background: "rgba(8,8,8,0.96)", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, background: "#e8ff5a", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: "#000" }}>UFC</div>
          <span style={{ fontSize: 11, color: "#333", letterSpacing: "0.14em" }}>FIGHT PREDICTOR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 10, color: "#282828" }}>{user?.email}</span>
          <button onClick={handleSignOut}
            style={{ padding: "6px 14px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 6, color: "#555", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#D85A30"; e.currentTarget.style.color = "#D85A30"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#555"; }}
          >SIGN OUT</button>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ flex: 1, maxWidth: 880, margin: "0 auto", width: "100%", padding: "48px 24px 80px" }}>

        {/* Fighter inputs */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 16 }}>
          <FighterInput label="FIGHTER 1" color="blue" value={f1} onChange={v => { setF1(v); setF1sel(""); }} onSelect={v => { setF1sel(v); setF1(v); }} />
          <div style={{ paddingBottom: 14, color: "#282828", fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: "0.08em" }}>VS</div>
          <FighterInput label="FIGHTER 2" color="red" value={f2} onChange={v => { setF2(v); setF2sel(""); }} onSelect={v => { setF2sel(v); setF2(v); }} />
        </div>

        {error && <div style={{ color: "#D85A30", fontSize: 11, marginBottom: 12 }}>{error}</div>}

        <motion.button onClick={predict} disabled={loading}
          whileHover={{ opacity: loading ? 1 : 0.88 }} whileTap={{ scale: loading ? 1 : 0.98 }}
          style={{ width: "100%", padding: "15px", marginBottom: 40, background: loading ? "#111" : "#e8ff5a", color: loading ? "#333" : "#000", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.16em", transition: "background 0.2s, color 0.2s" }}
        >{loading ? "ANALYZING..." : "PREDICT WINNER"}</motion.button>

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "80px 0", fontSize: 10, color: "#1a1a1a", letterSpacing: "0.22em" }}>SEARCH TWO FIGHTERS &middot; HIT PREDICT</div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Winner card */}
              <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 10, padding: "28px 28px 24px" }}>
                <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.22em", marginBottom: 12 }}>PREDICTED WINNER</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 700, letterSpacing: "-0.025em", color: wIsF1 ? "#378ADD" : "#D85A30", lineHeight: 1 }}>{result.predicted_winner}</span>
                  <span style={{ fontSize: 9, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 20, background: result.confidence === "high" ? "rgba(74,222,128,0.07)" : result.confidence === "medium" ? "rgba(232,255,90,0.07)" : "rgba(255,255,255,0.03)", color: result.confidence === "high" ? "#4ade80" : result.confidence === "medium" ? "#e8ff5a" : "#3a3a3a", border: `1px solid ${result.confidence === "high" ? "rgba(74,222,128,0.18)" : result.confidence === "medium" ? "rgba(232,255,90,0.18)" : "#1e1e1e"}` }}>{result.confidence?.toUpperCase()} CONFIDENCE</span>
                </div>

                {/* Prob bar */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 8, color: "#2a2a2a" }}>
                  <span style={{ color: "#378ADD", fontWeight: 600 }}>{result.f1_name.split(" ").slice(-1)[0]}</span>
                  <span style={{ letterSpacing: "0.1em" }}>WIN PROBABILITY</span>
                  <span style={{ color: "#D85A30", fontWeight: 600 }}>{result.f2_name.split(" ").slice(-1)[0]}</span>
                </div>
                <div style={{ height: 6, background: "#080808", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct1}%` }} transition={{ duration: 1, ease }} style={{ background: "#378ADD" }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct2}%` }} transition={{ duration: 1, ease }} style={{ background: "#D85A30" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ color: "#378ADD" }}>{pct1}%</span>
                  <span style={{ color: "#D85A30" }}>{pct2}%</span>
                </div>
              </div>

              {/* SHAP + Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

                {result.shap_breakdown?.length > 0 && (
                  <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 10, padding: 24 }}>
                    <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.22em", marginBottom: 18 }}>SHAP BREAKDOWN</div>
                    {result.shap_breakdown.slice(0, 6).map((item, i) => {
                      const pos = item.contrib > 0;
                      const col = pos ? "#378ADD" : "#D85A30";
                      const nm = pos ? result.f1_name.split(" ").slice(-1)[0] : result.f2_name.split(" ").slice(-1)[0];
                      const pct = Math.min(Math.abs(item.contrib) * 55, 100);
                      return (
                        <motion.div key={item.feature} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "#444" }}>{FEAT_LABELS[item.feature] || item.feature}</span>
                            <span style={{ color: "#2a2a2a", fontSize: 10 }}>{item.contrib > 0 ? "+" : ""}{item.contrib.toFixed(3)} &middot; {nm}</span>
                          </div>
                          <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.05 + 0.15, duration: 0.45, ease }} style={{ height: "100%", background: col, borderRadius: 2 }} />
                          </div>
                        </motion.div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 10, color: "#2a2a2a" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#378ADD", borderRadius: 2, display: "inline-block" }}></span>{result.f1_name.split(" ").slice(-1)[0]}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, background: "#D85A30", borderRadius: 2, display: "inline-block" }}></span>{result.f2_name.split(" ").slice(-1)[0]}</span>
                    </div>
                  </div>
                )}

                {result.stats?.length > 0 && (
                  <div style={{ background: "#0c0c0c", border: "1px solid #1a1a1a", borderRadius: 10, padding: 24 }}>
                    <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.22em", marginBottom: 18 }}>STAT COMPARISON</div>
                    {result.stats.map((s, i) => {
                      const total = (s.f1 + s.f2) || 1;
                      const p1 = Math.round(s.f1 / total * 100);
                      return (
                        <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06, duration: 0.35 }} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "#378ADD", fontWeight: 600 }}>{s.f1}{s.unit}</span>
                            <span style={{ color: "#333" }}>{s.label}</span>
                            <span style={{ color: "#D85A30", fontWeight: 600 }}>{s.f2}{s.unit}</span>
                          </div>
                          <div style={{ height: 3, background: "#0a0a0a", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${p1}%` }} transition={{ delay: i * 0.06 + 0.15, duration: 0.45, ease }} style={{ background: "#378ADD" }} />
                            <motion.div initial={{ width: 0 }} animate={{ width: `${100 - p1}%` }} transition={{ delay: i * 0.06 + 0.15, duration: 0.45, ease }} style={{ background: "#D85A30" }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center", paddingTop: 24, fontSize: 9, color: "#1a1a1a", letterSpacing: "0.1em" }}>64.2% CV &middot; 10,006 fights &middot; ufcstats.com via Kaggle 2015&ndash;2025</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1a1a", letterSpacing: "0.2em" }}>...</motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {user
        ? <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <AnalyzerPage user={user} onSignOut={() => setUser(null)} />
          </motion.div>
        : <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <LoginPage onAuth={setUser} />
          </motion.div>
      }
    </AnimatePresence>
  );
}
