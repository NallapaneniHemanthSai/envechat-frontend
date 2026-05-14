import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../config/api'

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F7F3] font-sans relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-[#BEF355] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#121212] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo Mark */}
        <div className="flex justify-center mb-8 animate-pop-in">
          <div className="w-16 h-16 bg-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform cursor-default">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BEF355" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <div className="bg-white border-[3px] border-[#1C1C1C] rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-black text-[#1C1C1C] mb-2 tracking-tight">Create Account</h1>
            <p className="text-[#6B7280] font-medium">Join and start chatting in seconds</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-600 font-bold flex items-center gap-3 animate-slide-up">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block font-heading text-sm font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({...form, [f.key]: e.target.value})}
                  onKeyDown={handleKey}
                  className="w-full bg-[#F8F7F3] border-2 border-[#1C1C1C] rounded-xl px-4 py-3.5 text-[#1C1C1C] font-medium placeholder-[#9CA3AF] focus:outline-none focus:ring-0 focus:border-[#BEF355] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-2 bg-[#BEF355] border-2 border-[#1C1C1C] rounded-full py-4 px-6 font-heading font-black text-xl text-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-[#1C1C1C] border-t-transparent rounded-full animate-spin"></div>
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <p className="text-center mt-8 text-[#6B7280] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1C1C1C] font-bold underline decoration-2 decoration-[#BEF355] underline-offset-4 hover:bg-[#BEF355] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
