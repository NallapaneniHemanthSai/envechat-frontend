import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = 'https://envechat.onrender.com'

// Cold-start splash — shown while backend wakes up
function ColdStartSplash({ onDismiss }) {
  const [elapsed, setElapsed] = useState(0)
  const TOTAL = 120
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, TOTAL)), 1000)
    return () => clearInterval(t)
  }, [])
  const pct = Math.min((elapsed / TOTAL) * 100, 100)
  const minutes = Math.floor((TOTAL - elapsed) / 60)
  const seconds = (TOTAL - elapsed) % 60

  return (
    <div style={splash.overlay}>
      <div style={splash.card}>
        <div style={splash.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={splash.title}>Server Warming Up</h2>
        <p style={splash.sub}>
          Free-tier backend is starting from sleep. This takes up to 2 minutes — hang tight!
        </p>

        <div style={splash.timerRow}>
          <span style={splash.timerLabel}>Estimated wait</span>
          <span style={splash.timerValue}>
            {elapsed >= TOTAL ? '✓ Should be ready!' : `~${minutes}:${String(seconds).padStart(2,'0')}`}
          </span>
        </div>

        <div style={splash.barTrack}>
          <div style={{ ...splash.barFill, width: `${pct}%` }} />
        </div>

        <div style={splash.dots}>
          {[0,1,2].map(i => (
            <span key={i} style={{ ...splash.dot, animationDelay: `${i * 0.3}s` }} />
          ))}
          <span style={splash.dotsLabel}>Connecting to server…</span>
        </div>

        <button style={splash.btn} onClick={onDismiss}>
          I'll wait on the page
        </button>
      </div>
    </div>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [focused, setFocused] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    const timeoutId = setTimeout(() => setShowSplash(true), 8000)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      clearTimeout(timeoutId)
      setShowSplash(false)
      if (!res.ok) { setError('Invalid email or password.'); return }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      navigate('/chat')
    } catch {
      clearTimeout(timeoutId)
      setShowSplash(false)
      setError('Could not reach server. It may still be starting — try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => e.key === 'Enter' && handleSubmit()

  return (
    <>
      {showSplash && <ColdStartSplash onDismiss={() => setShowSplash(false)} />}
      <div style={s.page}>
        <div style={s.bg} />
        <div style={s.glowA} />
        <div style={s.glowB} />

        <div style={s.card}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span style={s.brandName}>EnveChat</span>
          </div>

          <h1 style={s.heading}>Welcome back</h1>
          <p style={s.sub}>Sign in to your account to continue</p>

          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input
              style={{ ...s.input, ...(focused === 'email' ? s.inputFocus : {}) }}
              type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              onKeyDown={handleKey}
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input
              style={{ ...s.input, ...(focused === 'password' ? s.inputFocus : {}) }}
              type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              onKeyDown={handleKey}
            />
          </div>

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span style={s.btnInner}>
                <span style={s.spinner} /> Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          <p style={s.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={s.link}>Create one</Link>
          </p>

          <div style={s.notice}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            First login may take 1–2 min while the server cold-starts
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
      `}</style>
    </>
  )
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora', sans-serif", position:'relative', overflow:'hidden', background:'#030712' },
  bg: { position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 50%, #0f172a 0%, #030712 60%)' },
  glowA: { position:'absolute', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents:'none' },
  glowB: { position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents:'none' },
  card: { position:'relative', zIndex:1, width:'100%', maxWidth:420, padding:'40px 36px', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(148,163,184,0.1)', borderRadius:20, backdropFilter:'blur(24px)', boxShadow:'0 25px 50px rgba(0,0,0,0.5)', animation:'fadeIn 0.5s ease' },
  brand: { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  brandIcon: { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandName: { fontSize:20, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.02em' },
  heading: { fontSize:26, fontWeight:700, color:'#f8fafc', letterSpacing:'-0.03em', margin:'0 0 6px' },
  sub: { fontSize:13, color:'#64748b', margin:'0 0 28px' },
  errorBox: { display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontSize:12, padding:'10px 12px', borderRadius:10, marginBottom:20 },
  fieldWrap: { marginBottom:18 },
  label: { display:'block', fontSize:12, fontWeight:500, color:'#94a3b8', marginBottom:6, letterSpacing:'0.02em' },
  input: { width:'100%', boxSizing:'border-box', background:'rgba(30,41,59,0.8)', border:'1px solid rgba(148,163,184,0.15)', borderRadius:10, padding:'11px 14px', fontSize:14, color:'#f1f5f9', outline:'none', fontFamily:"'Sora', sans-serif", transition:'border-color 0.2s, box-shadow 0.2s' },
  inputFocus: { borderColor:'rgba(59,130,246,0.5)', boxShadow:'0 0 0 3px rgba(59,130,246,0.1)' },
  btn: { width:'100%', padding:'13px', marginTop:8, background:'linear-gradient(135deg,#3b82f6,#6366f1)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Sora',sans-serif", letterSpacing:'0.01em', transition:'opacity 0.2s, transform 0.1s' },
  btnInner: { display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  spinner: { width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' },
  switchText: { textAlign:'center', marginTop:20, fontSize:13, color:'#64748b' },
  link: { color:'#60a5fa', textDecoration:'none', fontWeight:500 },
  notice: { display:'flex', alignItems:'center', gap:6, marginTop:20, padding:'10px 12px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:8, fontSize:11, color:'#93c5fd' },
}

const splash = {
  overlay: { position:'fixed', inset:0, zIndex:999, background:'rgba(3,7,18,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' },
  card: { background:'#0f172a', border:'1px solid rgba(148,163,184,0.15)', borderRadius:20, padding:'36px 32px', width:360, textAlign:'center', boxShadow:'0 30px 60px rgba(0,0,0,0.6)' },
  iconWrap: { width:64, height:64, borderRadius:16, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' },
  title: { fontSize:20, fontWeight:700, color:'#f1f5f9', margin:'0 0 8px', fontFamily:"'Sora',sans-serif" },
  sub: { fontSize:13, color:'#64748b', lineHeight:1.6, margin:'0 0 24px', fontFamily:"'Sora',sans-serif" },
  timerRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  timerLabel: { fontSize:12, color:'#64748b', fontFamily:"'Sora',sans-serif" },
  timerValue: { fontSize:14, fontWeight:600, color:'#60a5fa', fontFamily:"'Sora',sans-serif" },
  barTrack: { height:6, background:'rgba(148,163,184,0.1)', borderRadius:99, overflow:'hidden', marginBottom:20 },
  barFill: { height:'100%', background:'linear-gradient(90deg,#3b82f6,#8b5cf6)', borderRadius:99, transition:'width 1s linear' },
  dots: { display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:24 },
  dot: { width:7, height:7, borderRadius:'50%', background:'#3b82f6', display:'inline-block', animation:'bounce 1.4s ease-in-out infinite' },
  dotsLabel: { fontSize:12, color:'#475569', fontFamily:"'Sora',sans-serif", marginLeft:4 },
  btn: { background:'transparent', border:'1px solid rgba(148,163,184,0.2)', borderRadius:8, color:'#94a3b8', fontSize:13, padding:'9px 20px', cursor:'pointer', fontFamily:"'Sora',sans-serif" },
}
