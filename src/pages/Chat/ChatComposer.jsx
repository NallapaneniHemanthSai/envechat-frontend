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
    <div className="shrink-0 border-t border-white/[0.06] bg-[#050c14]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:px-5 md:pb-4">
      {replyTo && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-2.5 text-[12px] font-medium text-slate-300">
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
        className={`flex items-end gap-2 rounded-2xl border bg-[#0a1624]/80 px-3 py-2 shadow-sm transition-all duration-200 ${
          focused ? 'border-blue-500/40 ring-2 ring-blue-500/10 bg-[#0a1624]' : 'border-white/10'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <div className="flex shrink-0 flex-col gap-1 pb-1">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-300 disabled:opacity-40"
            title="Attachments (coming soon)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
        </div>
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
        <div className="flex shrink-0 flex-col items-end gap-1 pb-1">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-300 disabled:opacity-40"
            title="Emoji (foundation)"
            onClick={() => onChange((value || '') + '🙂')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => !disabled && !sending && onSend()}
            disabled={disabled || sending || !value?.trim() || over}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-white transition ${
              !disabled && value?.trim() && !over
                ? 'border-transparent bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/30 hover:brightness-110 active:scale-95'
                : 'cursor-not-allowed border-white/10 bg-white/5 text-slate-600'
            }`}
            title="Send"
          >
            {sending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
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
