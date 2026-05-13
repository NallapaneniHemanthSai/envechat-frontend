import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API_BASE = 'https://envechat.onrender.com'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const [showCold, setShowCold] = useState(false)
  const [coldElapsed, setColdElapsed] = useState(0)
  const navigate = useNavigate()

  // If already logged in, redirect
  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/chat')
  }, [navigate])

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    const timeoutId = setTimeout(() => setShowCold(true), 8000)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      clearTimeout(timeoutId)
      setShowCold(false)
      if (!res.ok) { setError('Invalid email or password.'); return }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      navigate('/chat')
    } catch {
      clearTimeout(timeoutId)
      setShowCold(false)
      setError('Could not reach server. It may still be starting — try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  // Cold start timer
  useEffect(() => {
    if (!showCold) { setColdElapsed(0); return }
    const t = setInterval(() => setColdElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [showCold])

  const handleKey = e => e.key === 'Enter' && handleSubmit()

  return (
    <>
      <div style={s.page}>
        {/* Background elements */}
        <div style={s.bgGrad} />
        <div style={s.orbA} />
        <div style={s.orbB} />
        <div style={s.orbC} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            ...s.particle,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 1.2}s`,
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
          }} />
        ))}

        <div style={s.wrapper}>
          {/* Left side — branding (hidden on small screens via max-width) */}
          <div style={s.leftPanel}>
            <div style={s.leftContent}>
              <div style={s.logoMark}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={s.leftTitle}>Welcome to EnveChat</h2>
              <p style={s.leftSub}>Your space to connect, chat, and build communities in real time.</p>
              
              <div style={s.featureList}>
                {[
                  { icon: '⚡', text: 'Real-time messaging' },
                  { icon: '🎯', text: 'Channel-based conversations' },
                  { icon: '👥', text: 'See who\'s online' },
                  { icon: '✨', text: 'Rich chat experience' },
                ].map((f, i) => (
                  <div key={i} style={{ ...s.featureItem, animationDelay: `${0.3 + i * 0.1}s` }}>
                    <span style={s.featureIcon}>{f.icon}</span>
                    <span style={s.featureText}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side — form */}
          <div style={s.rightPanel}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                {/* Mobile logo */}
                <div style={s.mobileLogo}>
                  <div style={s.mobileLogoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span style={s.mobileLogoText}>EnveChat</span>
                </div>
                <h1 style={s.heading}>Welcome back!</h1>
                <p style={s.sub}>We're so excited to see you again!</p>
              </div>

              {error && (
                <div style={s.errorBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div style={s.fieldGroup}>
                <label style={s.label}>EMAIL <span style={s.required}>*</span></label>
                <div style={{ ...s.inputWrap, ...(focused === 'email' ? s.inputFocused : {}) }}>
                  <input
                    id="login-email"
                    style={s.input}
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    onKeyDown={handleKey}
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>PASSWORD <span style={s.required}>*</span></label>
                <div style={{ ...s.inputWrap, ...(focused === 'password' ? s.inputFocused : {}) }}>
                  <input
                    id="login-password"
                    style={s.input}
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    onKeyDown={handleKey}
                  />
                </div>
              </div>

              <button
                id="login-submit"
                style={{ ...s.btn, ...(loading ? { opacity: 0.7 } : {}) }}
                onClick={handleSubmit}
                disabled={loading}
                onMouseEnter={e => { if (!loading) e.target.style.background = '#4752c4' }}
                onMouseLeave={e => { if (!loading) e.target.style.background = '#5865f2' }}
              >
                {loading ? (
                  <span style={s.btnInner}>
                    <span style={s.spinner} /> Logging In...
                  </span>
                ) : 'Log In'}
              </button>

              <p style={s.switchText}>
                Need an account?{' '}
                <Link to="/signup" style={s.link}>Register</Link>
              </p>

              {/* Cold start notice */}
              <div style={s.notice}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5865f2" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>First login may take ~2 min while the server cold-starts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cold Start Overlay */}
        {showCold && (
          <div style={s.coldOverlay}>
            <div style={s.coldCard}>
              <div style={s.coldIconWrap}>
                <div style={s.coldSpinRing} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5865f2" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 style={s.coldTitle}>Server Warming Up</h3>
              <p style={s.coldSub}>The backend is waking from sleep. This typically takes 1–2 minutes.</p>
              <div style={s.coldTimerRow}>
                <span style={s.coldTimerLabel}>Elapsed</span>
                <span style={s.coldTimerValue}>
                  {Math.floor(coldElapsed / 60)}:{String(coldElapsed % 60).padStart(2, '0')}
                </span>
              </div>
              <div style={s.coldBar}>
                <div style={{ ...s.coldBarFill, width: `${Math.min((coldElapsed / 120) * 100, 95)}%` }} />
              </div>
              <button style={s.coldBtn} onClick={() => setShowCold(false)}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.6; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -30px); }
          66% { transform: translate(-15px, 15px); }
        }
        @keyframes coldSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    background: '#1e1f22',
  },
  bgGrad: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 30% 20%, rgba(88,101,242,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(35,165,89,0.05) 0%, transparent 50%)',
  },
  orbA: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(88,101,242,0.1) 0%, transparent 70%)',
    top: '-15%', left: '-10%', filter: 'blur(60px)', pointerEvents: 'none',
    animation: 'orbDrift 12s ease-in-out infinite',
  },
  orbB: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(114,137,218,0.08) 0%, transparent 70%)',
    bottom: '-15%', right: '-10%', filter: 'blur(60px)', pointerEvents: 'none',
    animation: 'orbDrift 15s ease-in-out infinite reverse',
  },
  orbC: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(240,178,50,0.05) 0%, transparent 70%)',
    top: '40%', right: '20%', filter: 'blur(50px)', pointerEvents: 'none',
    animation: 'orbDrift 10s ease-in-out infinite',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(88, 101, 242, 0.4)',
    pointerEvents: 'none',
    animation: 'particleFloat 6s ease-in-out infinite',
  },
  wrapper: {
    position: 'relative', zIndex: 1,
    display: 'flex',
    width: '100%',
    maxWidth: 820,
    minHeight: 520,
    margin: '20px',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    animation: 'slideUp 0.5s ease',
  },
  leftPanel: {
    width: '45%',
    background: 'linear-gradient(135deg, #5865f2 0%, #4752c4 50%, #3c45a5 100%)',
    padding: '48px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    position: 'relative', zIndex: 1,
  },
  logoMark: {
    width: 52, height: 52,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    border: '1px solid rgba(255,255,255,0.2)',
  },
  leftTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: 10,
    lineHeight: 1.2,
  },
  leftSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
    marginBottom: 28,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'slideUp 0.5s ease backwards',
  },
  featureIcon: {
    fontSize: 16,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 500,
  },
  rightPanel: {
    flex: 1,
    background: '#313338',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 36px',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: 24,
  },
  mobileLogo: {
    display: 'none', // Show only when leftPanel is hidden
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  mobileLogoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: '#5865f2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  mobileLogoText: {
    fontSize: 18, fontWeight: 700, color: '#f2f3f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#f2f3f5',
    letterSpacing: '-0.02em',
    margin: '0 0 8px',
  },
  sub: {
    fontSize: 14,
    color: '#949ba4',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(242, 63, 67, 0.1)',
    border: '1px solid rgba(242, 63, 67, 0.3)',
    color: '#f23f43',
    fontSize: 13,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 16,
    animation: 'slideUp 0.2s ease',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#b5bac1',
    marginBottom: 8,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  required: {
    color: '#f23f43',
  },
  inputWrap: {
    background: '#1e1f22',
    borderRadius: 4,
    border: '1px solid #1e1f22',
    transition: 'border-color 0.15s',
  },
  inputFocused: {
    borderColor: '#5865f2',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 15,
    color: '#dbdee1',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
  },
  btn: {
    width: '100%',
    padding: '12px',
    marginTop: 4,
    background: '#5865f2',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.17s ease, opacity 0.17s',
  },
  btnInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'coldSpin 0.7s linear infinite',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    color: '#949ba4',
  },
  link: {
    color: '#00a8fc',
    textDecoration: 'none',
    fontWeight: 500,
  },
  notice: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: '10px 12px',
    background: 'rgba(88,101,242,0.06)',
    border: '1px solid rgba(88,101,242,0.12)',
    borderRadius: 8,
    fontSize: 12,
    color: '#949ba4',
  },
  // Cold start overlay
  coldOverlay: {
    position: 'fixed', inset: 0, zIndex: 999,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  coldCard: {
    background: '#2b2d31',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: '32px',
    width: 380,
    textAlign: 'center',
    boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
    animation: 'slideUp 0.3s ease',
  },
  coldIconWrap: {
    position: 'relative',
    width: 60, height: 60,
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coldSpinRing: {
    position: 'absolute', inset: -4,
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTopColor: '#5865f2',
    animation: 'coldSpin 1s linear infinite',
  },
  coldTitle: {
    fontSize: 18, fontWeight: 700, color: '#f2f3f5',
    margin: '0 0 8px',
    fontFamily: "'Inter', sans-serif",
  },
  coldSub: {
    fontSize: 13, color: '#949ba4', lineHeight: 1.6,
    margin: '0 0 20px',
    fontFamily: "'Inter', sans-serif",
  },
  coldTimerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  coldTimerLabel: {
    fontSize: 12, color: '#949ba4', fontFamily: "'Inter', sans-serif",
  },
  coldTimerValue: {
    fontSize: 14, fontWeight: 600, color: '#5865f2',
    fontVariantNumeric: 'tabular-nums',
    fontFamily: "'Inter', sans-serif",
  },
  coldBar: {
    height: 4, background: '#404249', borderRadius: 99,
    overflow: 'hidden', marginBottom: 20,
  },
  coldBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #5865f2, #7289da, #5865f2)',
    backgroundSize: '200% 100%',
    borderRadius: 99,
    transition: 'width 1s ease',
    animation: 'shimmer 2s linear infinite',
  },
  coldBtn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #404249',
    borderRadius: 4,
    color: '#b5bac1',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.15s, color 0.15s',
  },
}
