import { useState } from 'react'
import { login } from '../services/api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      navigate('/chat')
    } catch (err) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>⚡ EnveChat</h1>
        <p style={styles.subtitle}>Welcome back</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div style={styles.field}>
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={styles.link}>
          No account?{' '}
          <Link to="/signup" style={styles.a}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  card: { background: '#16213e', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  logo: { fontSize: '28px', fontWeight: '700', color: '#7c6aff', marginBottom: '6px' },
  subtitle: { color: '#888', fontSize: '14px', marginBottom: '24px' },
  field: { marginBottom: '14px' },
  btn: { width: '100%', background: '#7c6aff', color: '#fff', padding: '12px', fontSize: '15px', marginTop: '6px' },
  error: { background: '#ff4d4d22', border: '1px solid #ff4d4d55', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px' },
  link: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' },
  a: { color: '#7c6aff', textDecoration: 'none' },
}