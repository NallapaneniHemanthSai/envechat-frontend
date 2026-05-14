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
      <button type="button" className="absolute inset-0 bg-[#F8F7F3]/80 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-[24px] border-[3px] border-[#1C1C1C] bg-white shadow-[8px_8px_0px_0px_#1C1C1C]"
      >
        <div className="flex items-center gap-3 border-b-[3px] border-[#1C1C1C] px-5 py-4">
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-[#1C1C1C]" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to…"
            className="flex-1 bg-transparent py-1 text-lg font-bold text-[#1C1C1C] placeholder-[#9CA3AF] focus:outline-none"
          />
          <kbd className="hidden rounded-lg border-2 border-[#1C1C1C] bg-white px-2 py-1 font-mono text-[11px] font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] sm:inline">esc</kbd>
        </div>
        <ul className="custom-scroll max-h-[min(50vh,360px)] overflow-y-auto p-2">
          {filtered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  a.run()
                  onClose()
                }}
                className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-transparent px-4 py-3 text-left transition-all hover:border-[#1C1C1C] hover:bg-[#BEF355] hover:shadow-[2px_2px_0px_0px_#1C1C1C] active:translate-y-0.5 active:shadow-none"
              >
                <span className="font-bold text-[#1C1C1C]">{a.label}</span>
                {a.hint && <span className="text-xs font-bold text-[#6B7280]">{a.hint}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm font-bold text-[#6B7280]">No matches found</li>
          )}
        </ul>
      </motion.div>
    </div>
  )
}
