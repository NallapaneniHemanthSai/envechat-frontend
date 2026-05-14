import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../config/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCold, setShowCold] = useState(false)
  const [coldElapsed, setColdElapsed] = useState(0)
  const navigate = useNavigate()
  const { login } = useAuth()

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
      login(data.token, data.username)
      navigate('/chat', { replace: true })
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F7F3] font-sans relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-[#BEF355] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-[#121212] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo Mark */}
        <div className="flex justify-center mb-8 animate-pop-in">
          <div className="w-16 h-16 bg-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BEF355" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <div className="bg-white border-[3px] border-[#1C1C1C] rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-black text-[#1C1C1C] mb-2 tracking-tight">Welcome back!</h1>
            <p className="text-[#6B7280] font-medium">Ready to dive into the conversation?</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 font-bold flex items-center gap-3 animate-slide-up">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block font-heading text-sm font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onKeyDown={handleKey}
                className="w-full bg-[#F8F7F3] border-2 border-[#1C1C1C] rounded-xl px-4 py-3.5 text-[#1C1C1C] font-medium placeholder-[#9CA3AF] focus:outline-none focus:ring-0 focus:border-[#BEF355] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>

            <div>
              <label className="block font-heading text-sm font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={handleKey}
                className="w-full bg-[#F8F7F3] border-2 border-[#1C1C1C] rounded-xl px-4 py-3.5 text-[#1C1C1C] font-medium placeholder-[#9CA3AF] focus:outline-none focus:ring-0 focus:border-[#BEF355] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 bg-[#BEF355] border-2 border-[#1C1C1C] rounded-full py-4 px-6 font-heading font-black text-xl text-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-[#1C1C1C] border-t-transparent rounded-full animate-spin"></div>
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>

          <p className="text-center mt-8 text-[#6B7280] font-medium">
            Need an account?{' '}
            <Link to="/signup" className="text-[#1C1C1C] font-bold underline decoration-2 decoration-[#BEF355] underline-offset-4 hover:bg-[#BEF355] transition-colors">
              Register here
            </Link>
          </p>
        </div>

        {/* Cold Start Notice */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-[#6B7280]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>First login may take ~2 min while the server cold-starts</span>
        </div>
      </div>

      {/* Cold Start Overlay */}
      {showCold && (
        <div className="fixed inset-0 z-50 bg-[#F8F7F3]/80 backdrop-blur-sm flex items-center justify-center p-6 animate-pop-in">
          <div className="bg-white border-[3px] border-[#1C1C1C] rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#BEF355] border-2 border-[#1C1C1C] rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              <div className="w-8 h-8 border-4 border-[#1C1C1C] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="font-heading text-2xl font-black text-[#1C1C1C] mb-3">Server Warming Up</h3>
            <p className="text-[#6B7280] font-medium mb-6">
              The backend is waking from sleep. This typically takes 1–2 minutes.
            </p>
            <div className="bg-[#F8F7F3] border-2 border-[#1C1C1C] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center font-bold text-[#1C1C1C] mb-2">
                <span>Elapsed Time</span>
                <span className="text-[#BEF355] drop-shadow-[1px_1px_0px_#1C1C1C] text-xl font-black">
                  {Math.floor(coldElapsed / 60)}:{String(coldElapsed % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="h-3 bg-white border-2 border-[#1C1C1C] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#BEF355] border-r-2 border-[#1C1C1C] transition-all duration-1000"
                  style={{ width: `${Math.min((coldElapsed / 120) * 100, 95)}%` }}
                />
              </div>
            </div>
            <button 
              onClick={() => setShowCold(false)}
              className="px-6 py-3 bg-white border-2 border-[#1C1C1C] rounded-full font-bold text-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Hide Timer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
