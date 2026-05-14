import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export default function CommandPalette({ onClose, actions }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return actions
    return actions.filter((a) => a.label.toLowerCase().includes(s) || a.hint?.toLowerCase().includes(s))
  }, [actions, q])

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4">
      <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b1524]/98 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to…"
            className="flex-1 bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
          />
          <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline">esc</kbd>
        </div>
        <ul className="max-h-[min(50vh,360px)] overflow-y-auto py-1">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  a.run()
                  onClose()
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/[0.06]"
              >
                <span>{a.label}</span>
                {a.hint && <span className="text-[11px] text-slate-500">{a.hint}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">No matches</li>
          )}
        </ul>
      </motion.div>
    </div>
  )
}
