import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = 'https://envechat.onrender.com'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password) { setError('All fields are required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Signup failed. Try again.')
        return
      }
      navigate('/login')
    } catch {
      setError('Could not reach server. It may still be starting — try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => e.key === 'Enter' && handleSubmit()

  const fields = [
    { key: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
    { key: 'email',    label: 'Email',    type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <>
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

          <h1 style={s.heading}>Create account</h1>
          <p style={s.sub}>Join and start chatting in seconds</p>

          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {fields.map(f => (
            <div key={f.key} style={s.fieldWrap}>
              <label style={s.label}>{f.label}</label>
              <input
                style={{ ...s.input, ...(focused === f.key ? s.inputFocus : {}) }}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                onFocus={() => setFocused(f.key)}
                onBlur={() => setFocused('')}
                onKeyDown={handleKey}
              />
            </div>
          ))}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span style={s.btnInner}>
                <span style={s.spinner} /> Creating account…
              </span>
            ) : 'Create Account'}
          </button>

          <p style={s.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}

const s = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Sora', sans-serif", position:'relative', overflow:'hidden', background:'#030712' },
  bg: { position:'absolute', inset:0, background:'radial-gradient(ellipse at 80% 50%, #0f172a 0%, #030712 60%)' },
  glowA: { position:'absolute', top:'-20%', right:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents:'none' },
  glowB: { position:'absolute', bottom:'-20%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents:'none' },
  card: { position:'relative', zIndex:1, width:'100%', maxWidth:420, padding:'40px 36px', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(148,163,184,0.1)', borderRadius:20, backdropFilter:'blur(24px)', boxShadow:'0 25px 50px rgba(0,0,0,0.5)', animation:'fadeIn 0.5s ease' },
  brand: { display:'flex', alignItems:'center', gap:10, marginBottom:28 },
  brandIcon: { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#8b5cf6,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center' },
  brandName: { fontSize:20, fontWeight:700, color:'#f1f5f9', letterSpacing:'-0.02em' },
  heading: { fontSize:26, fontWeight:700, color:'#f8fafc', letterSpacing:'-0.03em', margin:'0 0 6px' },
  sub: { fontSize:13, color:'#64748b', margin:'0 0 28px' },
  errorBox: { display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontSize:12, padding:'10px 12px', borderRadius:10, marginBottom:20 },
  fieldWrap: { marginBottom:18 },
  label: { display:'block', fontSize:12, fontWeight:500, color:'#94a3b8', marginBottom:6, letterSpacing:'0.02em' },
  input: { width:'100%', boxSizing:'border-box', background:'rgba(30,41,59,0.8)', border:'1px solid rgba(148,163,184,0.15)', borderRadius:10, padding:'11px 14px', fontSize:14, color:'#f1f5f9', outline:'none', fontFamily:"'Sora', sans-serif", transition:'border-color 0.2s, box-shadow 0.2s' },
  inputFocus: { borderColor:'rgba(139,92,246,0.5)', boxShadow:'0 0 0 3px rgba(139,92,246,0.1)' },
  btn: { width:'100%', padding:'13px', marginTop:8, background:'linear-gradient(135deg,#8b5cf6,#6366f1)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Sora',sans-serif", letterSpacing:'0.01em', transition:'opacity 0.2s' },
  btnInner: { display:'flex', alignItems:'center', justifyContent:'center', gap:8 },
  spinner: { width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' },
  switchText: { textAlign:'center', marginTop:20, fontSize:13, color:'#64748b' },
  link: { color:'#a78bfa', textDecoration:'none', fontWeight:500 },
}
