import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FEAT_LABELS = {
  net_strike_edge: 'Net strike edge', sub_diff: 'Submission threat',
  slpm_diff: 'Strike output', def_ratio: 'Defense ratio',
  td_diff: 'Takedown diff', str_acc_diff: 'Strike accuracy',
  td_def_diff: 'TD defense', sapm_diff: 'Strikes absorbed',
  net_grapple_edge: 'Net grapple edge', str_def_diff: 'Strike defense',
  striker_diff: 'Striker score', ko_rate_diff: 'KO rate',
  sub_rate_diff: 'Sub rate', absorption_ratio: 'Absorption ratio',
  grapple_dominance: 'Grapple dominance',
};

function AuthPage({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handle = async () => {
    if (!email || !password) { setError('Fill in both fields'); return; }
    setLoading(true); setError(''); setMsg('');
    try {
      if (mode === 'login') {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onAuth(data.user);
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setMsg('Check your email to confirm your account.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    padding: '12px 14px', background: '#0d0d0d', border: '1px solid #222',
    borderRadius: 8, color: '#f0f0ec', fontSize: 13,
    fontFamily: "'DM Mono', monospace", outline: 'none', width: '100%',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#080808', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', monospace", position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(232,255,90,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,255,90,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(232,255,90,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, background: '#e8ff5a', borderRadius: 7,
            fontSize: 9, fontWeight: 800, color: '#000', marginBottom: 14,
          }}>UFC</div>
          <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: '0.2em' }}>FIGHT PREDICTOR</div>
        </div>
        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, padding: 28 }}>
          <div style={{ display: 'flex', background: '#080808', borderRadius: 7, padding: 3, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMsg(''); }} style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 5, cursor: 'pointer',
                background: mode === m ? '#1a1a1a' : 'transparent',
                color: mode === m ? '#f0f0ec' : '#2a2a2a',
                fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em',
                transition: 'all 0.15s',
              }}>{m.toUpperCase()}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email"
              type="email" onKeyDown={e => e.key === 'Enter' && handle()} style={inp}
              onFocus={e => e.target.style.borderColor = '#e8ff5a'}
              onBlur={e => e.target.style.borderColor = '#222'} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password"
              type="password" onKeyDown={e => e.key === 'Enter' && handle()} style={inp}
              onFocus={e => e.target.style.borderColor = '#e8ff5a'}
              onBlur={e => e.target.style.borderColor = '#222'} />
          </div>
          {error && <div style={{ color: '#D85A30', fontSize: 11, marginTop: 10 }}>{error}</div>}
          {msg && <div style={{ color: '#4ade80', fontSize: 11, marginTop: 10 }}>{msg}</div>}
          <button onClick={handle} disabled={loading} style={{
            width: '100%', marginTop: 16, padding: '12px 0',
            background: loading ? '#1a1a1a' : '#e8ff5a',
            color: loading ? '#333' : '#000', border: 'none', borderRadius: 7,
            fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
            cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.1em',
            transition: 'all 0.2s',
          }}>{loading ? '...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: '#1e1e1e' }}>
          64.2% CV &middot; 10,006 fights &middot; 4,229 fighters
        </div>
      </div>
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
      setResults(data);
      setOpen(data.length > 0);
    } catch { setOpen(false); }
  }, [onChange]);

  const pick = (name) => { onSelect(name); onChange(name); setOpen(false); setResults([]); };

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const accent = color === 'blue' ? '#378ADD' : '#D85A30';

  return (
    <div ref={ref} style={{ flex: 1, position: 'relative' }}>
      <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.18em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
        {label}
        <span style={{
          padding: '1px 6px', borderRadius: 20, fontSize: 8, fontWeight: 700,
          background: color === 'blue' ? 'rgba(55,138,221,0.1)' : 'rgba(216,90,48,0.1)',
          color: accent,
        }}>{color.toUpperCase()}</span>
      </div>
      <input
        value={value}
        onChange={e => search(e.target.value)}
        onFocus={() => { setFocused(true); if (value.length >= 2 && results.length) setOpen(true); }}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === 'Enter' && results.length) pick(results[0]); }}
        placeholder="search fighter..."
        autoComplete="off"
        style={{
          width: '100%', padding: '13px 16px',
          background: '#0a0a0a',
          border: `1px solid ${focused ? accent : '#1a1a1a'}`,
          borderRadius: 8, color: '#f0f0ec', fontSize: 14,
          fontFamily: "'DM Mono', monospace", outline: 'none',
          transition: 'border-color 0.2s',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#111', border: '1px solid #1a1a1a', borderRadius: 8,
          zIndex: 100, overflow: 'hidden', maxHeight: 200, overflowY: 'auto',
        }}>
          {results.map(name => (
            <div key={name} onMouseDown={() => pick(name)}
              style={{
                padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                color: '#f0f0ec', borderBottom: '1px solid #111',
                fontFamily: "'DM Mono', monospace",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShapBar({ item, f1, f2 }) {
  const pos = item.contrib > 0;
  const color = pos ? '#378ADD' : '#D85A30';
  const name = pos ? f1.split(' ').slice(-1)[0] : f2.split(' ').slice(-1)[0];
  const pct = Math.min(Math.abs(item.contrib) * 55, 100);
  const label = FEAT_LABELS[item.feature] || item.feature;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, fontFamily: "'DM Mono', monospace" }}>
        <span style={{ color: '#3a3a3a' }}>{label}</span>
        <span style={{ color: '#2a2a2a' }}>{item.contrib > 0 ? '+' : ''}{item.contrib.toFixed(3)} &middot; {name}</span>
      </div>
      <div style={{ height: 3, background: '#0d0d0d', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function Predictor({ user }) {
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f1sel, setF1sel] = useState('');
  const [f2sel, setF2sel] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predict = async () => {
    const name1 = f1sel || f1.trim();
    const name2 = f2sel || f2.trim();
    if (!name1 || !name2) { setError('Select both fighters'); return; }
    if (name1 === name2) { setError('Select two different fighters'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/predict', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ f1: name1, f2: name2 }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult(d);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const pct1 = result ? Math.round(result.f1_win_prob * 100) : 50;
  const pct2 = 100 - pct1;
  const winnerIsF1 = result?.predicted_winner === result?.f1_name;
  const conf = result?.confidence;

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: "'DM Mono', monospace", display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        padding: '14px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid #0f0f0f',
        background: 'rgba(8,8,8,0.98)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 24, height: 24, background: '#e8ff5a', borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, fontWeight: 800, color: '#000',
          }}>UFC</div>
          <span style={{ fontSize: 11, color: '#222', letterSpacing: '0.12em' }}>FIGHT PREDICTOR</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 10, color: '#1e1e1e' }}>{user?.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{
            background: 'none', border: '1px solid #1a1a1a', borderRadius: 5,
            color: '#2a2a2a', fontSize: 10, padding: '4px 10px', cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em',
          }}>SIGN OUT</button>
        </div>
      </nav>

      <div style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '40px 24px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 12 }}>
          <FighterInput label="FIGHTER 1" color="blue" value={f1}
            onChange={v => { setF1(v); setF1sel(''); }} onSelect={v => { setF1sel(v); setF1(v); }} />
          <div style={{ paddingBottom: 13, color: '#1e1e1e', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>VS</div>
          <FighterInput label="FIGHTER 2" color="red" value={f2}
            onChange={v => { setF2(v); setF2sel(''); }} onSelect={v => { setF2sel(v); setF2(v); }} />
        </div>

        {error && <div style={{ color: '#D85A30', fontSize: 11, marginBottom: 10 }}>{error}</div>}

        <button onClick={predict} disabled={loading} style={{
          width: '100%', padding: '13px', marginBottom: 32,
          background: loading ? '#0f0f0f' : '#e8ff5a',
          color: loading ? '#222' : '#000', border: 'none', borderRadius: 7,
          fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
          cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.12em',
          transition: 'all 0.2s',
        }}>{loading ? 'ANALYZING...' : 'PREDICT WINNER →'}</button>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Winner */}
            <div style={{ background: '#0c0c0c', border: '1px solid #161616', borderRadius: 10, padding: '24px 24px 20px' }}>
              <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.2em', marginBottom: 10 }}>PREDICTED WINNER</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 700, letterSpacing: '-0.02em',
                  color: winnerIsF1 ? '#378ADD' : '#D85A30',
                }}>{result.predicted_winner}</span>
                <span style={{
                  fontSize: 9, letterSpacing: '0.12em', padding: '3px 9px', borderRadius: 20,
                  background: conf === 'high' ? 'rgba(74,222,128,0.06)' : conf === 'medium' ? 'rgba(232,255,90,0.06)' : 'rgba(255,255,255,0.03)',
                  color: conf === 'high' ? '#4ade80' : conf === 'medium' ? '#e8ff5a' : '#2a2a2a',
                  border: `1px solid ${conf === 'high' ? 'rgba(74,222,128,0.15)' : conf === 'medium' ? 'rgba(232,255,90,0.15)' : '#1a1a1a'}`,
                }}>{conf?.toUpperCase()} CONFIDENCE</span>
              </div>
              <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between', marginBottom: 5, color: '#1e1e1e' }}>
                <span style={{ color: '#378ADD' }}>{result.f1_name.split(' ').slice(-1)[0]}</span>
                <span>win probability</span>
                <span style={{ color: '#D85A30' }}>{result.f2_name.split(' ').slice(-1)[0]}</span>
              </div>
              <div style={{ height: 5, background: '#080808', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${pct1}%`, background: '#378ADD', transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                <div style={{ width: `${pct2}%`, background: '#D85A30', transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, fontWeight: 700 }}>
                <span style={{ color: '#378ADD' }}>{pct1}%</span>
                <span style={{ color: '#D85A30' }}>{pct2}%</span>
              </div>
            </div>

            {/* SHAP + Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 1 }}>
              {result.shap_breakdown?.length > 0 && (
                <div style={{ background: '#0c0c0c', border: '1px solid #161616', borderRadius: 10, padding: 22 }}>
                  <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.2em', marginBottom: 14 }}>SHAP BREAKDOWN</div>
                  {result.shap_breakdown.slice(0, 6).map(item => (
                    <ShapBar key={item.feature} item={item} f1={result.f1_name} f2={result.f2_name} />
                  ))}
                  <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 9, color: '#1e1e1e' }}>
                    <span>&#9632; <span style={{ color: '#378ADD' }}>{result.f1_name.split(' ').slice(-1)[0]}</span></span>
                    <span>&#9632; <span style={{ color: '#D85A30' }}>{result.f2_name.split(' ').slice(-1)[0]}</span></span>
                  </div>
                </div>
              )}
              {result.stats?.length > 0 && (
                <div style={{ background: '#0c0c0c', border: '1px solid #161616', borderRadius: 10, padding: 22 }}>
                  <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.2em', marginBottom: 14 }}>STAT COMPARISON</div>
                  {result.stats.map(s => {
                    const total = (s.f1 + s.f2) || 1;
                    const p1 = Math.round(s.f1 / total * 100);
                    return (
                      <div key={s.label} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: '#378ADD' }}>{s.f1}{s.unit}</span>
                          <span style={{ color: '#222' }}>{s.label}</span>
                          <span style={{ color: '#D85A30' }}>{s.f2}{s.unit}</span>
                        </div>
                        <div style={{ height: 3, background: '#080808', borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: `${p1}%`, background: '#378ADD' }} />
                          <div style={{ width: `${100-p1}%`, background: '#D85A30' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', paddingTop: 20, fontSize: 9, color: '#151515' }}>
              64.2% CV &middot; 10,006 fights &middot; ufcstats.com via Kaggle 2015–2025
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', fontSize: 10, color: '#151515', letterSpacing: '0.2em' }}>
            TYPE TWO NAMES · HIT PREDICT
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#1a1a1a', letterSpacing: '0.2em' }}>...</div>
    </div>
  );

  return user ? <Predictor user={user} /> : <AuthPage onAuth={setUser} />;
}
