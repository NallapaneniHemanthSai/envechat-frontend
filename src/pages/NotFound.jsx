import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-[#07111f] to-[#040d1a] px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        That route does not exist. Head back to EnveChat and keep the conversation
        going.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/chat"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
        >
          Open chat
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-slate-200 transition hover:bg-white/5"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
