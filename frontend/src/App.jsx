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

function LoginPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPass, setFocusedPass] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError("Both fields required"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setSuccess("Check your email to confirm.");
      }
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };
  const reveal = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#080808", fontFamily: "'DM Mono', monospace", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(232,255,90,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,90,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%,black 30%,transparent 100%)" }} />
      <div style={{ position: "absolute", top: "25%", left: "35%", transform: "translate(-50%,-50%)", width: 700, height: 700, pointerEvents: "none", background: "radial-gradient(circle,rgba(232,255,90,0.045) 0%,transparent 65%)" }} />

      <motion.div variants={stagger} initial="hidden" animate="show" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px", position: "relative", zIndex: 1 }}>
        <motion.div variants={reveal} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 72 }}>
          <div style={{ width: 32, height: 32, background: "#e8ff5a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#000" }}>UFC</div>
          <span style={{ fontSize: 11, color: "#333", letterSpacing: "0.16em" }}>FIGHT PREDICTOR</span>
        </motion.div>
        <motion.p variants={reveal} style={{ fontSize: 10, color: "#e8ff5a", letterSpacing: "0.2em", marginBottom: 14 }}>ML-POWERED &middot; XGBOOST &middot; 64.2% CV</motion.p>
        <motion.h1 variants={reveal} style={{ fontSize: "clamp(3.2rem,5vw,6rem)", lineHeight: 1.02, fontWeight: 700, letterSpacing: "-0.03em", color: "#f0f0ec", marginBottom: 24, maxWidth: 540 }}>
          Who wins<br />the <em style={{ fontStyle: "normal", color: "#e8ff5a" }}>fight?</em>
        </motion.h1>
        <motion.p variants={reveal} style={{ fontSize: 14, color: "#333", lineHeight: 1.85, maxWidth: 380, marginBottom: 64 }}>
          19-feature XGBoost trained on 10,006 fights &mdash; striking, grappling, style matchup, SHAP explanations. Sign in to run predictions.
        </motion.p>
        <motion.div variants={reveal} style={{ display: "flex", gap: 40, paddingTop: 32, borderTop: "1px solid #111" }}>
          {[["64.2%","CV ACCURACY"],["10k","FIGHTS TRAINED"],["4,229","FIGHTERS"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize: "1.7rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#e8ff5a" }}>{v}</div>
              <div style={{ fontSize: 9, color: "#282828", letterSpacing: "0.14em", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div style={{ width: 1, background: "#141414", margin: "80px 0" }} />

      <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.25, ease }} style={{ width: 420, display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 56px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", background: "#0a0a0a", borderRadius: 8, padding: 3, marginBottom: 28, border: "1px solid #141414" }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, padding: "9px 0", border: "none", borderRadius: 6, background: mode === m ? "#1a1a1a" : "transparent", color: mode === m ? "#f0f0ec" : "#333", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.15s" }}>{m === "login" ? "SIGN IN" : "SIGN UP"}</button>
          ))}
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.18em", marginBottom: 6 }}>EMAIL</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} onFocus={() => setFocusedEmail(true)} onBlur={() => setFocusedEmail(false)}
            style={{ width: "100%", padding: "13px 14px", background: "#080808", border: `1px solid ${focusedEmail ? "#e8ff5a" : "#1e1e1e"}`, borderRadius: 8, color: "#f0f0ec", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.18em", marginBottom: 6 }}>PASSWORD</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} onFocus={() => setFocusedPass(true)} onBlur={() => setFocusedPass(false)}
            style={{ width: "100%", padding: "13px 14px", background: "#080808", border: `1px solid ${focusedPass ? "#e8ff5a" : "#1e1e1e"}`, borderRadius: 8, color: "#f0f0ec", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s" }} />
        </div>

        <AnimatePresence mode="wait">
          {error && <motion.div key="e" initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} style={{ color: "#D85A30", fontSize: 11, marginBottom: 10 }}>{error}</motion.div>}
          {success && <motion.div key="s" initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} style={{ color: "#4ade80", fontSize: 11, marginBottom: 10 }}>{success}</motion.div>}
        </AnimatePresence>

        <motion.button onClick={submit} disabled={loading} whileHover={{ opacity: loading ? 1 : 0.88 }} whileTap={{ scale: loading ? 1 : 0.97 }}
          style={{ width: "100%", padding: "14px 0", background: loading ? "#111" : "#e8ff5a", color: loading ? "#333" : "#000", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.14em", marginBottom: 28 }}
        >{loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</motion.button>

        <div style={{ borderTop: "1px solid #111", paddingTop: 20 }}>
          <div style={{ fontSize: 10, color: "#222", lineHeight: 1.9 }}>Data: ufcstats.com via Kaggle 2015&ndash;2025<br />XGBoost + Optuna + SHAP TreeExplainer</div>
        </div>
      </motion.div>
    </div>
  );
}

function FighterInput({ label, color, value, onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const search = useCallback(async (q) => {
    onChange(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    try {
      const r = await fetch(`/api/fighters?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setResults(data); setOpen(data.length > 0);
    } catch { setOpen(false); }
  }, [onChange]);
  const pick = (name) => { onSelect(name); onChange(name); setOpen(false); setResults([]); };
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const accent = color === "blue" ? "#378ADD" : "#D85A30";
  return (
    <div ref={ref} style={{ flex: 1, position: "relative" }}>
      <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.18em", marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>
        {label}
        <span style={{ padding: "1px 6px", borderRadius: 20, fontSize: 8, fontWeight: 700, background: color === "blue" ? "rgba(55,138,221,0.12)" : "rgba(216,90,48,0.12)", color: accent }}>{color.toUpperCase()}</span>
      </div>
      <input value={value} onChange={e => search(e.target.value)} onFocus={() => { setFocused(true); if (value.length >= 2) setOpen(results.length > 0); }} onBlur={() => setFocused(false)} onKeyDown={e => { if (e.key === "Enter" && results.length) pick(results[0]); }} placeholder="search fighter..." autoComplete="off"
        style={{ width: "100%", padding: "13px 16px", background: "#0a0a0a", border: `1px solid ${focused ? accent : "#1e1e1e"}`, borderRadius: 8, color: "#f0f0ec", fontSize: 14, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s" }} />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}
            style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 8, zIndex: 200, overflow: "hidden", maxHeight: 210, overflowY: "auto" }}>
            {results.map(name => (
              <div key={name} onMouseDown={() => pick(name)}
                style={{ padding: "10px 16px", fontSize: 13, cursor: "pointer", color: "#f0f0ec", borderBottom: "1px solid #111", fontFamily: "'DM Mono', monospace", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >{name}</div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyzerPage({ user }) {
  const [f1, setF1] = useState(""); const [f2, setF2] = useState("");
  const [f1sel, setF1sel] = useState(""); const [f2sel, setF2sel] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predict = async () => {
    const n1 = f1sel || f1.trim(); const n2 = f2sel || f2.trim();
    if (!n1 || !n2) { setError("Select both fighters"); return; }
    if (n1 === n2) { setError("Select two different fighters"); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ f1: n1, f2: n2 }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const pct1 = result ? Math.round(result.f1_win_prob * 100) : 0;
  const pct2 = 100 - pct1;
  const winnerIsF1 = result?.predicted_winner === result?.f1_name;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "13px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #0f0f0f", background: "rgba(8,8,8,0.96)", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 24, height: 24, background: "#e8ff5a", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: "#000" }}>UFC</div>
          <span style={{ fontSize: 11, color: "#282828", letterSpacing: "0.12em" }}>FIGHT PREDICTOR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 10, color: "#222" }}>{user?.email}</span>
          <button onClick={() => supabase.auth.signOut()}
            style={{ background: "none", border: "1px solid #1e1e1e", borderRadius: 5, color: "#333", fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#D85A30"; e.currentTarget.style.color = "#D85A30"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#333"; }}
          >SIGN OUT</button>
        </div>
      </nav>
      <div style={{ flex: 1, maxWidth: 880, margin: "0 auto", width: "100%", padding: "40px 24px 64px" }}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 12 }}>
            <FighterInput label="FIGHTER 1" color="blue" value={f1} onChange={v => { setF1(v); setF1sel(""); }} onSelect={v => { setF1sel(v); setF1(v); }} />
            <div style={{ paddingBottom: 13, color: "#222", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>VS</div>
            <FighterInput label="FIGHTER 2" color="red" value={f2} onChange={v => { setF2(v); setF2sel(""); }} onSelect={v => { setF2sel(v); setF2(v); }} />
          </div>
          {error && <div style={{ color: "#D85A30", fontSize: 11, marginBottom: 10 }}>{error}</div>}
          <motion.button onClick={predict} disabled={loading} whileHover={{ opacity: loading ? 1 : 0.88 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{ width: "100%", padding: "14px 0", marginBottom: 36, background: loading ? "#0f0f0f" : "#e8ff5a", color: loading ? "#333" : "#000", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.14em", transition: "background 0.2s, color 0.2s" }}
          >{loading ? "ANALYZING..." : "PREDICT WINNER"}</motion.button>
        </motion.div>

        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ textAlign: "center", padding: "80px 0", fontSize: 10, color: "#181818", letterSpacing: "0.2em" }}>TYPE TWO NAMES &middot; HIT PREDICT</motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div key="r" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={{ background: "#0b0b0b", border: "1px solid #161616", borderRadius: 10, padding: "24px 24px 20px" }}>
                <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.2em", marginBottom: 10 }}>PREDICTED WINNER</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 700, letterSpacing: "-0.02em", color: winnerIsF1 ? "#378ADD" : "#D85A30" }}>{result.predicted_winner}</span>
                  <span style={{ fontSize: 9, letterSpacing: "0.12em", padding: "3px 10px", borderRadius: 20, background: result.confidence === "high" ? "rgba(74,222,128,0.06)" : result.confidence === "medium" ? "rgba(232,255,90,0.06)" : "rgba(255,255,255,0.03)", color: result.confidence === "high" ? "#4ade80" : result.confidence === "medium" ? "#e8ff5a" : "#333", border: `1px solid ${result.confidence === "high" ? "rgba(74,222,128,0.15)" : result.confidence === "medium" ? "rgba(232,255,90,0.15)" : "#1e1e1e"}` }}>{result.confidence?.toUpperCase()} CONFIDENCE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6, color: "#282828" }}>
                  <span style={{ color: "#378ADD" }}>{result.f1_name.split(" ").slice(-1)[0]}</span>
                  <span>win probability</span>
                  <span style={{ color: "#D85A30" }}>{result.f2_name.split(" ").slice(-1)[0]}</span>
                </div>
                <div style={{ height: 5, background: "#080808", borderRadius: 3, overflow: "hidden", display: "flex" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct1}%` }} transition={{ duration: 0.9, ease }} style={{ background: "#378ADD" }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct2}%` }} transition={{ duration: 0.9, ease }} style={{ background: "#D85A30" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 12, fontWeight: 700 }}>
                  <span style={{ color: "#378ADD" }}>{pct1}%</span>
                  <span style={{ color: "#D85A30" }}>{pct2}%</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginTop: 1 }}>
                {result.shap_breakdown?.length > 0 && (
                  <div style={{ background: "#0b0b0b", border: "1px solid #161616", borderRadius: 10, padding: 22 }}>
                    <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.2em", marginBottom: 16 }}>SHAP BREAKDOWN</div>
                    {result.shap_breakdown.slice(0, 6).map((item, i) => {
                      const pos = item.contrib > 0;
                      const color = pos ? "#378ADD" : "#D85A30";
                      const name = pos ? result.f1_name.split(" ").slice(-1)[0] : result.f2_name.split(" ").slice(-1)[0];
                      const pct = Math.min(Math.abs(item.contrib) * 55, 100);
                      return (
                        <motion.div key={item.feature} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ color: "#333" }}>{FEAT_LABELS[item.feature] || item.feature}</span>
                            <span style={{ color: "#282828", fontSize: 10 }}>{item.contrib > 0 ? "+" : ""}{item.contrib.toFixed(3)} &middot; {name}</span>
                          </div>
                          <div style={{ height: 3, background: "#080808", borderRadius: 2, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease }} style={{ height: "100%", background: color, borderRadius: 2 }} />
                          </div>
                        </motion.div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 9, color: "#282828" }}>
                      <span>&#9632; <span style={{ color: "#378ADD" }}>{result.f1_name.split(" ").slice(-1)[0]}</span></span>
                      <span>&#9632; <span style={{ color: "#D85A30" }}>{result.f2_name.split(" ").slice(-1)[0]}</span></span>
                    </div>
                  </div>
                )}
                {result.stats?.length > 0 && (
                  <div style={{ background: "#0b0b0b", border: "1px solid #161616", borderRadius: 10, padding: 22 }}>
                    <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.2em", marginBottom: 16 }}>STAT COMPARISON</div>
                    {result.stats.map((s, i) => {
                      const total = (s.f1 + s.f2) || 1;
                      const p1 = Math.round(s.f1 / total * 100);
                      return (
                        <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07, duration: 0.4 }} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: "#378ADD" }}>{s.f1}{s.unit}</span>
                            <span style={{ color: "#282828" }}>{s.label}</span>
                            <span style={{ color: "#D85A30" }}>{s.f2}{s.unit}</span>
                          </div>
                          <div style={{ height: 3, background: "#080808", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${p1}%` }} transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease }} style={{ background: "#378ADD" }} />
                            <motion.div initial={{ width: 0 }} animate={{ width: `${100 - p1}%` }} transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease }} style={{ background: "#D85A30" }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center", paddingTop: 20, fontSize: 9, color: "#181818" }}>64.2% CV &middot; 10,006 fights &middot; ufcstats.com via Kaggle 2015&ndash;2025</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);
  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#1a1a1a", letterSpacing: "0.2em" }}>...</motion.div>
    </div>
  );
  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}><AnalyzerPage user={user} /></motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}><LoginPage onAuth={setUser} /></motion.div>
      )}
    </AnimatePresence>
  );
}
