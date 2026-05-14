import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroPreview from '../assets/hero.png'
import { APP_NAME, GITHUB_URL, REAL_FEATURES, TECH_STACK } from '../constants/app'

const architecture = [
  ['React + Vite', 'Route-split frontend, guarded app shell, responsive chat UI'],
  ['STOMP WebSocket', 'Room subscriptions, reconnect handling, live message events'],
  ['Spring Boot API', 'Authentication, room APIs, chat history, websocket broker'],
  ['MongoDB', 'Persistent rooms and message history'],
]

export default function Landing() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#070b12] text-slate-100">
      <section className="relative isolate min-h-[92svh] overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(34,197,94,0.14),transparent_28%),linear-gradient(135deg,#07111f_0%,#0a101b_48%,#111827_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070b12] to-transparent" />

        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-white no-underline">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/20">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-base font-bold tracking-tight">{APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-2">
              <a href={GITHUB_URL} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white sm:inline-flex">
                GitHub
              </a>
              <Link to="/login" className="rounded-lg bg-white px-3.5 py-2 text-sm font-bold text-slate-950 no-underline transition hover:bg-blue-100">
                Launch App
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <p className="mb-4 inline-flex rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-200">
                Realtime communication platform
              </p>
              <h1 className="text-balance text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                EnveChat
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                A production-focused chat interface built on React, Spring Boot, JWT authentication, MongoDB, and STOMP WebSockets.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login" className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
                  Launch App
                </Link>
                <a href={GITHUB_URL} className="rounded-lg border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-white/10">
                  View GitHub
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30"
            >
              <img
                src={heroPreview}
                alt="EnveChat application preview"
                className="aspect-[16/10] w-full object-cover object-top"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {REAL_FEATURES.map((feature) => (
          <div key={feature} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 h-1.5 w-10 rounded-full bg-blue-400" />
            <h2 className="text-base font-bold text-white">{feature}</h2>
          </div>
        ))}
      </section>

      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">Architecture</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Built around real backend events.</h2>
            <p className="mt-4 leading-7 text-slate-400">
              The frontend uses authenticated REST APIs for rooms and history, then synchronizes active chat state through STOMP subscriptions.
            </p>
          </div>
          <div className="grid gap-3">
            {architecture.map(([title, body], index) => (
              <div key={title} className="grid gap-3 rounded-lg border border-white/10 bg-[#0b1220] p-5 sm:grid-cols-[140px_1fr]">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-blue-300">
                  0{index + 1} · {title}
                </div>
                <p className="text-sm leading-6 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Tech stack</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-semibold text-slate-200">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Developer focus</h2>
          <p className="mt-6 leading-7 text-slate-400">
            EnveChat emphasizes realtime reliability, guarded authenticated routes, empty states over demo data, modular React composition, and responsive chat ergonomics.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} EnveChat</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white">App</Link>
            <a href={GITHUB_URL} className="text-slate-300 hover:text-white">GitHub</a>
            <span>React · Spring Boot · STOMP</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
