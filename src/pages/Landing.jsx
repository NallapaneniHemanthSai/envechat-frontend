import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import heroPreview from '../assets/hero.png'
import { APP_NAME, GITHUB_URL, REAL_FEATURES, TECH_STACK } from '../constants/app'

const architecture = [
  ['React client', 'Route-split Vite app with guarded auth screens and a responsive chat workspace.'],
  ['STOMP socket', 'Authenticated room subscriptions, reconnect state, and live message delivery.'],
  ['Spring Boot API', 'JWT authentication, room creation, message history, and websocket endpoints.'],
  ['MongoDB', 'Persistent rooms and chat history served back into the realtime interface.'],
]

export default function Landing() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#070b16] text-white">
      <section className="relative min-h-[94svh] overflow-hidden bg-[#1d4ed8]">
        <img
          src={heroPreview}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-[0.18] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[#1d4ed8]/88" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070b16] to-transparent" />

        <div className="relative mx-auto flex min-h-[94svh] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between rounded-full border border-white/[0.18] bg-white/[0.12] px-3 py-2 backdrop-blur-xl">
            <Link to="/" className="flex items-center gap-3 text-white no-underline">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#1d4ed8] shadow-lg">
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-base font-black tracking-tight">{APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-2">
              <a href={GITHUB_URL} className="hidden rounded-full px-4 py-2 text-sm font-bold text-white/80 no-underline hover:bg-white/[0.12] hover:text-white sm:inline-flex">
                GitHub
              </a>
              <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#12357c] no-underline transition hover:bg-blue-50">
                Launch App
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-3xl"
            >
              <p className="mb-5 inline-flex rounded-full border border-white/[0.22] bg-white/[0.12] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-50">
                Realtime rooms, cleanly engineered
              </p>
              <h1 className="text-balance text-6xl font-black leading-[0.88] tracking-tight text-white sm:text-7xl lg:text-8xl">
                Chat that feels alive.
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-blue-50/90">
                EnveChat is a polished realtime chat app powered by JWT auth, Spring Boot, MongoDB, and authenticated STOMP WebSockets.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/login" className="rounded-full bg-white px-6 py-3.5 text-sm font-black text-[#12357c] no-underline shadow-xl shadow-blue-950/20 transition hover:bg-blue-50">
                  Open EnveChat
                </Link>
                <a href={GITHUB_URL} className="rounded-full border border-white/[0.22] bg-white/[0.12] px-6 py-3.5 text-sm font-black text-white no-underline backdrop-blur transition hover:bg-white/[0.18]">
                  View GitHub
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="rounded-[28px] border border-white/[0.24] bg-white/[0.14] p-2 shadow-2xl shadow-blue-950/30 backdrop-blur-xl"
            >
              <img
                src={heroPreview}
                alt="EnveChat app preview"
                className="aspect-[16/10] w-full rounded-[22px] object-cover object-top"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Implemented features</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white">Only real product surface. No fake activity.</h2>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REAL_FEATURES.map((feature) => (
            <div key={feature} className="rounded-2xl border border-blue-300/12 bg-blue-300/[0.045] p-5">
              <div className="mb-5 grid h-9 w-9 place-items-center rounded-full bg-blue-400 text-[#06101f]">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-base font-black text-white">{feature}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-blue-300/10 bg-blue-300/[0.035]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Architecture</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-white">A realtime path from browser to database.</h2>
            <p className="mt-5 leading-7 text-slate-300">
              REST handles authentication, rooms, and history. STOMP WebSockets keep active room messaging synchronized without inventing client-only data.
            </p>
          </div>
          <div className="grid gap-3">
            {architecture.map(([title, body], index) => (
              <div key={title} className="grid gap-3 rounded-2xl border border-blue-300/12 bg-[#091122] p-5 sm:grid-cols-[132px_1fr]">
                <div className="font-mono text-xs font-black uppercase tracking-wider text-blue-300">
                  0{index + 1} / {title}
                </div>
                <p className="text-sm leading-6 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">Actual stack</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span key={tech} className="rounded-full border border-blue-300/14 bg-blue-300/[0.05] px-3 py-1.5 text-sm font-bold text-blue-50">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">Engineering focus</h2>
          <p className="mt-6 leading-7 text-slate-300">
            The frontend prioritizes stable socket lifecycles, clean empty states, guarded routes, route-level splitting, and a chat interface that only exposes working interactions.
          </p>
        </div>
      </section>

      <footer className="border-t border-blue-300/10 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>(c) {new Date().getFullYear()} EnveChat</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/login" className="text-blue-100 hover:text-white">App</Link>
            <a href={GITHUB_URL} className="text-blue-100 hover:text-white">GitHub</a>
            <span>React / Spring Boot / STOMP</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
