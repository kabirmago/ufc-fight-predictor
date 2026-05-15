import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

  const s = {
    page: { minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace" },
    box: { width: 340 },
    logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 48, justifyContent: "center" },
    mark: { width: 28, height: 28, background: "#e8ff5a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#000" },
    name: { fontSize: 11, color: "#333", letterSpacing: "0.14em" },
    tabs: { display: "flex", background: "#0d0d0d", borderRadius: 7, padding: 3, marginBottom: 24, border: "1px solid #181818" },
    tab: (active) => ({ flex: 1, padding: "8px 0", border: "none", borderRadius: 5, background: active ? "#1a1a1a" : "transparent", color: active ? "#f0f0ec" : "#333", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }),
    label: { fontSize: 9, color: "#333", letterSpacing: "0.16em", marginBottom: 5, display: "block" },
    input: (focused) => ({ display: "block", width: "100%", padding: "12px 14px", background: "#0d0d0d", border: `1px solid ${focused ? "#e8ff5a" : "#1a1a1a"}`, borderRadius: 7, color: "#f0f0ec", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s", marginBottom: 10, boxSizing: "border-box" }),
    btn: (loading) => ({ display: "block", width: "100%", padding: "13px", marginTop: 6, background: loading ? "#141414" : "#e8ff5a", color: loading ? "#333" : "#000", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.12em", transition: "all 0.2s" }),
  };

  const [fe, setFe] = useState(false);
  const [fp, setFp] = useState(false);

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>
          <div style={s.mark}>UFC</div>
          <span style={s.name}>FIGHT PREDICTOR</span>
        </div>

        <div style={s.tabs}>
          {["login","signup"].map(m => (
            <button key={m} style={s.tab(mode===m)} onClick={() => { setMode(m); setError(""); setMsg(""); }}>
              {m === "login" ? "SIGN IN" : "SIGN UP"}
            </button>
          ))}
        </div>

        <label style={s.label}>EMAIL</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          onFocus={() => setFe(true)} onBlur={() => setFe(false)}
          style={s.input(fe)} autoComplete="email" />

        <label style={s.label}>PASSWORD</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          onFocus={() => setFp(true)} onBlur={() => setFp(false)}
          style={s.input(fp)} autoComplete="current-password" />

        <AnimatePresence mode="wait">
          {error && <motion.p key="e" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{color:"#D85A30",fontSize:11,margin:"6px 0 0"}}>{error}</motion.p>}
          {msg   && <motion.p key="m" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{color:"#4ade80",fontSize:11,margin:"6px 0 0"}}>{msg}</motion.p>}
        </AnimatePresence>

        <button onClick={submit} disabled={loading} style={s.btn(loading)}>
          {loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

// ── FIGHTER SEARCH ────────────────────────────────────────────────────────────
import { useRef, useCallback } from "react";

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
      <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.16em", marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
        {label}
        <span style={{ padding: "1px 6px", borderRadius: 20, fontSize: 8, fontWeight: 700, background: color==="blue" ? "rgba(55,138,221,0.12)" : "rgba(216,90,48,0.12)", color: accent }}>{color.toUpperCase()}</span>
      </div>
      <input value={value} onChange={e => search(e.target.value)}
        onFocus={() => { setFocused(true); if (value.length >= 2) setOpen(results.length > 0); }}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === "Enter" && results.length) pick(results[0]); }}
        placeholder="search fighter..." autoComplete="off"
        style={{ width: "100%", padding: "12px 14px", background: "#0d0d0d", border: `1px solid ${focused ? accent : "#1a1a1a"}`, borderRadius: 7, color: "#f0f0ec", fontSize: 14, fontFamily: "'DM Mono', monospace", outline: "none", transition: "border-color 0.2s" }}
      />
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.12}}
            style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#111", border: "1px solid #1a1a1a", borderRadius: 7, zIndex: 200, overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
            {results.map(n => (
              <div key={n} onMouseDown={() => pick(n)}
                style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#d0d0cc", borderBottom: "1px solid #111", fontFamily: "'DM Mono', monospace", transition: "background 0.1s" }}
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
function AnalyzerPage({ user }) {
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

  const pct1 = result ? Math.round(result.f1_win_prob * 100) : 0;
  const pct2 = 100 - pct1;
  const wIsF1 = result?.predicted_winner === result?.f1_name;
  const ease = [0.22,1,0.36,1];

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #111", position: "sticky", top: 0, zIndex: 50, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "#e8ff5a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6, fontWeight: 800, color: "#000" }}>UFC</div>
          <span style={{ fontSize: 10, color: "#282828", letterSpacing: "0.14em" }}>FIGHT PREDICTOR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 10, color: "#1e1e1e" }}>{user?.email}</span>
          <button onClick={() => supabase.auth.signOut()}
            style={{ background: "none", border: "1px solid #1a1a1a", borderRadius: 5, color: "#2a2a2a", fontSize: 9, padding: "3px 9px", cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#D85A30"; e.currentTarget.style.color="#D85A30"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#1a1a1a"; e.currentTarget.style.color="#2a2a2a"; }}
          >SIGN OUT</button>
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: 860, margin: "0 auto", width: "100%", padding: "36px 20px 60px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 10 }}>
          <FighterInput label="FIGHTER 1" color="blue" value={f1} onChange={v=>{setF1(v);setF1sel("");}} onSelect={v=>{setF1sel(v);setF1(v);}} />
          <div style={{ paddingBottom: 12, color: "#1e1e1e", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>VS</div>
          <FighterInput label="FIGHTER 2" color="red" value={f2} onChange={v=>{setF2(v);setF2sel("");}} onSelect={v=>{setF2sel(v);setF2(v);}} />
        </div>

        {error && <div style={{ color: "#D85A30", fontSize: 11, marginBottom: 8 }}>{error}</div>}

        <button onClick={predict} disabled={loading} style={{ width: "100%", padding: "13px", marginBottom: 28, background: loading ? "#111" : "#e8ff5a", color: loading ? "#282828" : "#000", border: "none", borderRadius: 7, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.14em", transition: "all 0.2s" }}>
          {loading ? "ANALYZING..." : "PREDICT WINNER"}
        </button>

        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0", fontSize: 9, color: "#141414", letterSpacing: "0.2em" }}>TYPE TWO NAMES &middot; HIT PREDICT</div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div key="r" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.45,ease}}
              style={{ display: "flex", flexDirection: "column", gap: 1 }}>

              <div style={{ background: "#0c0c0c", border: "1px solid #161616", borderRadius: 9, padding: "22px 22px 18px" }}>
                <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: "0.18em", marginBottom: 8 }}>PREDICTED WINNER</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 700, letterSpacing: "-0.02em", color: wIsF1 ? "#378ADD" : "#D85A30" }}>{result.predicted_winner}</span>
                  <span style={{ fontSize: 9, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 20, background: result.confidence==="high" ? "rgba(74,222,128,0.06)" : result.confidence==="medium" ? "rgba(232,255,90,0.06)" : "rgba(255,255,255,0.02)", color: result.confidence==="high" ? "#4ade80" : result.confidence==="medium" ? "#e8ff5a" : "#2a2a2a", border: `1px solid ${result.confidence==="high" ? "rgba(74,222,128,0.15)" : result.confidence==="medium" ? "rgba(232,255,90,0.15)" : "#161616"}` }}>{result.confidence?.toUpperCase()} CONFIDENCE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 5, color: "#1e1e1e" }}>
                  <span style={{ color: "#378ADD" }}>{result.f1_name.split(" ").slice(-1)[0]}</span>
                  <span>win probability</span>
                  <span style={{ color: "#D85A30" }}>{result.f2_name.split(" ").slice(-1)[0]}</span>
                </div>
                <div style={{ height: 4, background: "#080808", borderRadius: 2, overflow: "hidden", display: "flex" }}>
                  <motion.div initial={{width:0}} animate={{width:`${pct1}%`}} transition={{duration:0.9,ease}} style={{background:"#378ADD"}} />
                  <motion.div initial={{width:0}} animate={{width:`${pct2}%`}} transition={{duration:0.9,ease}} style={{background:"#D85A30"}} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, fontWeight: 700 }}>
                  <span style={{ color: "#378ADD" }}>{pct1}%</span>
                  <span style={{ color: "#D85A30" }}>{pct2}%</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginTop: 1 }}>
                {result.shap_breakdown?.length > 0 && (
                  <div style={{ background: "#0c0c0c", border: "1px solid #161616", borderRadius: 9, padding: 20 }}>
                    <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: "0.18em", marginBottom: 14 }}>SHAP BREAKDOWN</div>
                    {result.shap_breakdown.slice(0,6).map((item,i) => {
                      const pos = item.contrib > 0;
                      const col = pos ? "#378ADD" : "#D85A30";
                      const nm  = pos ? result.f1_name.split(" ").slice(-1)[0] : result.f2_name.split(" ").slice(-1)[0];
                      const pct = Math.min(Math.abs(item.contrib)*55,100);
                      return (
                        <motion.div key={item.feature} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:i*0.05,duration:0.35}} style={{marginBottom:9}}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                            <span style={{color:"#2a2a2a"}}>{FEAT_LABELS[item.feature]||item.feature}</span>
                            <span style={{color:"#1a1a1a",fontSize:10}}>{item.contrib>0?"+":""}{item.contrib.toFixed(3)} &middot; {nm}</span>
                          </div>
                          <div style={{height:2,background:"#080808",borderRadius:1,overflow:"hidden"}}>
                            <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:i*0.05+0.15,duration:0.45,ease}} style={{height:"100%",background:col,borderRadius:1}} />
                          </div>
                        </motion.div>
                      );
                    })}
                    <div style={{display:"flex",gap:14,marginTop:12,fontSize:9,color:"#1e1e1e"}}>
                      <span>&#9632; <span style={{color:"#378ADD"}}>{result.f1_name.split(" ").slice(-1)[0]}</span></span>
                      <span>&#9632; <span style={{color:"#D85A30"}}>{result.f2_name.split(" ").slice(-1)[0]}</span></span>
                    </div>
                  </div>
                )}
                {result.stats?.length > 0 && (
                  <div style={{ background: "#0c0c0c", border: "1px solid #161616", borderRadius: 9, padding: 20 }}>
                    <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: "0.18em", marginBottom: 14 }}>STAT COMPARISON</div>
                    {result.stats.map((s,i) => {
                      const total = (s.f1+s.f2)||1;
                      const p1 = Math.round(s.f1/total*100);
                      return (
                        <motion.div key={s.label} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.06,duration:0.35}} style={{marginBottom:11}}>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                            <span style={{color:"#378ADD"}}>{s.f1}{s.unit}</span>
                            <span style={{color:"#1e1e1e"}}>{s.label}</span>
                            <span style={{color:"#D85A30"}}>{s.f2}{s.unit}</span>
                          </div>
                          <div style={{height:2,background:"#080808",borderRadius:1,overflow:"hidden",display:"flex"}}>
                            <motion.div initial={{width:0}} animate={{width:`${p1}%`}} transition={{delay:i*0.06+0.15,duration:0.45,ease}} style={{background:"#378ADD"}} />
                            <motion.div initial={{width:0}} animate={{width:`${100-p1}%`}} transition={{delay:i*0.06+0.15,duration:0.45,ease}} style={{background:"#D85A30"}} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{textAlign:"center",paddingTop:18,fontSize:9,color:"#111"}}>64.2% CV &middot; 10,006 fights &middot; ufcstats.com via Kaggle 2015&ndash;2025</div>
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
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setChecking(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <motion.div animate={{opacity:[0.1,0.4,0.1]}} transition={{duration:1.5,repeat:Infinity}}
        style={{fontFamily:"'DM Mono', monospace",fontSize:10,color:"#1a1a1a",letterSpacing:"0.2em"}}>...</motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {user
        ? <motion.div key="app" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}><AnalyzerPage user={user} /></motion.div>
        : <motion.div key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}><LoginPage onAuth={setUser} /></motion.div>
      }
    </AnimatePresence>
  );
}
