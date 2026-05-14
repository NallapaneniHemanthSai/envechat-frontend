import { useEffect, useRef, useState } from 'react'

const MAX_LEN = 4000

export default function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  sending,
  roomName,
  replyTo,
  onClearReply,
}) {
  const taRef = useRef(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !sending) onSend()
    }
  }

  const remaining = MAX_LEN - (value?.length || 0)
  const over = remaining < 0

  return (
    <div className="shrink-0 border-t border-white/[0.08] bg-[#080d1a]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:px-5 md:pb-4">
      {replyTo && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-blue-300/20 bg-blue-300/5 px-4 py-2.5 text-[12px] font-medium text-slate-300">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Replying to {replyTo.sender}
            </span>
            <p className="truncate text-slate-400">{replyTo.excerpt}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            onClick={onClearReply}
            aria-label="Cancel reply"
          >
            ×
          </button>
        </div>
      )}
      <div
        className={`flex items-end gap-2 rounded-xl border bg-white/[0.04] px-3 py-2 shadow-sm transition-all duration-200 ${
          focused ? 'border-blue-300/40 bg-white/[0.06] ring-2 ring-blue-300/10' : 'border-white/10'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <textarea
          ref={taRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LEN))}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={roomName ? `Message #${roomName}…` : 'Select a channel'}
          className="custom-scroll max-h-40 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-[14px] font-medium leading-relaxed text-white placeholder:text-slate-600 focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex shrink-0 items-center gap-2 pb-1">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-200 disabled:opacity-40"
            title="Emoji"
            onClick={() => onChange((value || '') + '🙂')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <button
            type="button"
            disabled={disabled || sending || !value?.trim() || over}
            onClick={onSend}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-400 px-3 text-sm font-bold text-[#06101f] transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
          >
            Send
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
        <span>
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">↵</kbd> send ·{' '}
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">⇧↵</kbd> newline ·{' '}
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">⌘K</kbd> palette
        </span>
        <span className={over ? 'font-medium text-red-400' : ''}>
          {value?.length || 0}/{MAX_LEN}
        </span>
      </div>
    </div>
  )
}
