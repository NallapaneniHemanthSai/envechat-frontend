import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { APP_NAME, GITHUB_URL, TECH_STACK } from '../constants/app'
import './Landing.css'

import heroImg from '../assets/landing-hero.png'
import msgImg from '../assets/landing-messaging.png'
import voiceImg from '../assets/landing-voice.png'
import roomsImg from '../assets/landing-rooms.png'
import presenceImg from '../assets/landing-presence.png'
import multiImg from '../assets/landing-multidevice.png'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } }

const FEATURES = [
  {
    tag: 'Live', title: 'Make your chats come alive', reverse: false,
    desc: 'Send messages in real-time with instant delivery powered by authenticated STOMP WebSockets. React to messages, share thoughts, and keep conversations flowing without a single refresh.',
    img: msgImg,
  },
  {
    tag: 'Coming Soon', title: 'Voice & Video that feels real', reverse: true,
    desc: 'Crystal-clear voice and video calls are on the way. Jump into a voice channel, share your screen, and hang out — just like being in the same room. We\'ll roll out this feature soon!',
    img: voiceImg,
  },
  {
    tag: 'Live', title: 'Organized rooms for everything', reverse: false,
    desc: 'Create dedicated rooms for every topic, team, or interest. Keep conversations organized with room-based chat architecture — each with its own message history and member list.',
    img: roomsImg,
  },
  {
    tag: 'Coming Soon', title: 'See who\'s around to chill', reverse: true,
    desc: 'Online presence indicators, custom statuses, and activity feeds are in development. Soon you\'ll see who\'s active, idle, or busy at a glance. We\'ll roll out this feature soon!',
    img: presenceImg,
  },
  {
    tag: 'Live', title: 'Chat from anywhere, anytime', reverse: false,
    desc: 'EnveChat runs beautifully in any modern browser — desktop, tablet, or mobile. Your messages sync instantly across all your devices through our scalable cloud architecture.',
    img: multiImg,
  },
]

const TECH_CARDS = [
  { name: 'React', desc: 'Modern UI library', icon: '⚛️', bg: 'rgba(97,218,251,0.1)' },
  { name: 'Spring Boot', desc: 'Backend framework', icon: '🍃', bg: 'rgba(109,179,63,0.1)' },
  { name: 'WebSockets', desc: 'Real-time protocol', icon: '⚡', bg: 'rgba(6,214,160,0.1)' },
  { name: 'JWT Auth', desc: 'Secure sessions', icon: '🔐', bg: 'rgba(124,58,237,0.1)' },
  { name: 'MongoDB', desc: 'NoSQL database', icon: '🍃', bg: 'rgba(77,175,80,0.1)' },
  { name: 'Vite', desc: 'Lightning builds', icon: '⚡', bg: 'rgba(189,147,249,0.1)' },
  { name: 'STOMP', desc: 'Message protocol', icon: '📡', bg: 'rgba(59,130,246,0.1)' },
  { name: 'Vercel', desc: 'Edge deployment', icon: '▲', bg: 'rgba(255,255,255,0.06)' },
]

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.querySelector('.landing')
    if (!el) return
    const handler = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  return (
    <main className="landing">
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <span className="landing-logo-icon"><ChatIcon /></span>
            <span className="landing-logo-text">{APP_NAME}</span>
          </Link>
          <div className="landing-nav-links">
            <a href={GITHUB_URL} className="landing-nav-link" target="_blank" rel="noreferrer">GitHub</a>
            <Link to="/login" className="landing-nav-link">Login</Link>
            <Link to="/signup" className="landing-nav-cta">Open {APP_NAME}</Link>
          </div>
          <Link to="/login" className="landing-nav-mobile-btn landing-nav-cta">Launch</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-orb landing-hero-orb-1" />
          <div className="landing-hero-orb landing-hero-orb-2" />
          <div className="landing-hero-orb landing-hero-orb-3" />
          <div className="landing-hero-grid" />
        </div>
        <div className="landing-hero-inner">
          <div>
            <div className="landing-hero-badge">
              <span className="landing-hero-badge-dot" />
              Realtime · Secure · Open Source
            </div>
            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              Group chat that's all{' '}
              <span className="gradient-text">fun & games.</span>
            </motion.h1>
            <motion.p className="landing-hero-desc" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }}>
              {APP_NAME} is a modern real-time chat platform built for communities. Create rooms, invite your crew, and start chatting — powered by WebSockets, secured by JWT.
            </motion.p>
            <motion.div className="landing-hero-actions" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}>
              <Link to="/signup" className="landing-btn-primary">
                Open {APP_NAME} in Browser <ArrowIcon />
              </Link>
              <a href={GITHUB_URL} className="landing-btn-secondary" target="_blank" rel="noreferrer">
                <GithubIcon /> Star on GitHub
              </a>
            </motion.div>
          </div>
          <motion.div className="landing-hero-image" initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="landing-hero-image-wrapper">
              <img src={heroImg} alt={`${APP_NAME} app preview`} />
            </div>
            <div className="landing-hero-image-glow" />
          </motion.div>
        </div>
      </section>

      {/* ── Feature Sections ── */}
      {FEATURES.map((f, i) => (
        <section key={i} className={`landing-feature ${f.reverse ? 'reverse' : ''}`}>
          <div className="landing-feature-inner">
            <motion.div className="landing-feature-content"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6 }}
            >
              <span className={`landing-feature-tag ${f.tag === 'Live' ? 'live' : 'soon'}`}>
                {f.tag === 'Live' ? '✓' : '🔜'} {f.tag}
              </span>
              <h2>{f.title}</h2>
              <p className="landing-feature-desc">{f.desc}</p>
            </motion.div>
            <motion.div className="landing-feature-visual"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp} transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="landing-feature-img-wrap">
                <img src={f.img} alt={f.title} />
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* ── Stats ── */}
      <motion.section className="landing-stats"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeIn} transition={{ duration: 0.6 }}
      >
        <div className="landing-stats-inner">
          {[
            ['∞', 'Messages Delivered'],
            ['< 50ms', 'Avg Latency'],
            ['24/7', 'Uptime Target'],
            ['100%', 'Open Source'],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="landing-stat-value">{val}</div>
              <div className="landing-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Tech Stack ── */}
      <section className="landing-tech">
        <div className="landing-tech-inner">
          <p className="landing-section-label">Tech Stack</p>
          <h2 className="landing-section-title">Built with modern tools</h2>
          <p className="landing-section-desc">
            From the frontend to the database, every layer is chosen for performance, developer experience, and production readiness.
          </p>
          <div className="landing-tech-grid">
            {TECH_CARDS.map((t) => (
              <motion.div key={t.name} className="landing-tech-card"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.4 }}
              >
                <div className="landing-tech-card-icon" style={{ background: t.bg }}>
                  {t.icon}
                </div>
                <div className="landing-tech-card-name">{t.name}</div>
                <div className="landing-tech-card-desc">{t.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="landing-cta">
        <div className="landing-cta-bg" />
        <div className="landing-cta-inner">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2>Ready to start chatting?</h2>
            <p className="landing-cta-desc">
              Join {APP_NAME} today and experience real-time communication at its finest. It's free, open source, and built with love.
            </p>
            <div className="landing-cta-actions">
              <Link to="/signup" className="landing-btn-primary">
                Get Started — It's Free <ArrowIcon />
              </Link>
              <a href={GITHUB_URL} className="landing-btn-secondary" target="_blank" rel="noreferrer">
                <GithubIcon /> View Source Code
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-footer-brand-logo">
              <span className="landing-logo-icon" style={{ width: 36, height: 36, borderRadius: 10 }}>
                <ChatIcon />
              </span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{APP_NAME}</span>
            </Link>
            <p>A modern real-time chat platform for communities. Built with React, Spring Boot, and WebSockets.</p>
          </div>
          <div className="landing-footer-col">
            <h4>Product</h4>
            <Link to="/login">Launch App</Link>
            <Link to="/signup">Sign Up</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">Download</a>
          </div>
          <div className="landing-footer-col">
            <h4>Resources</h4>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">Bug Reports</a>
            <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noreferrer">Documentation</a>
          </div>
          <div className="landing-footer-col">
            <h4>Stack</h4>
            {TECH_STACK.slice(0, 5).map(t => (
              <span key={t} style={{ display: 'block', padding: '5px 0', fontSize: 14, color: '#94a3b8' }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} {APP_NAME}. Open source under MIT.</span>
          <div className="landing-footer-socials">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubIcon />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
