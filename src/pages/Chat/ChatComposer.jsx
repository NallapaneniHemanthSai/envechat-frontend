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
    <div className="shrink-0 border-t-[3px] border-[#1C1C1C] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6">
      {replyTo && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F8F7F3] px-4 py-2.5 shadow-[2px_2px_0px_0px_#1C1C1C]">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1C1C1C]">
              Replying to {replyTo.sender}
            </span>
            <p className="truncate text-xs font-bold text-[#6B7280]">{replyTo.excerpt}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border-2 border-transparent p-1 text-[#1C1C1C] transition-all hover:border-[#1C1C1C] hover:bg-[#BEF355] hover:shadow-[2px_2px_0px_0px_#1C1C1C]"
            onClick={onClearReply}
            aria-label="Cancel reply"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
      <div
        className={`flex items-end gap-2 rounded-[20px] border-[3px] border-[#1C1C1C] bg-[#F8F7F3] px-3 py-2 transition-all md:px-4 ${
          focused ? 'shadow-[6px_6px_0px_0px_#1C1C1C] -translate-y-[2px]' : 'shadow-[4px_4px_0px_0px_#1C1C1C]'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <div className="flex shrink-0 flex-col gap-1 pb-1">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg border-2 border-transparent p-2 text-[#1C1C1C] transition-all hover:border-[#1C1C1C] hover:bg-white hover:shadow-[2px_2px_0px_0px_#1C1C1C] disabled:opacity-40"
            title="Attachments (coming soon)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          className="custom-scroll max-h-40 min-h-[44px] w-full resize-none bg-transparent py-3 text-[14.5px] font-bold leading-relaxed text-[#1C1C1C] placeholder-[#9CA3AF] focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex shrink-0 flex-col items-end gap-1 pb-1">
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg border-2 border-transparent p-2 text-[#1C1C1C] transition-all hover:border-[#1C1C1C] hover:bg-white hover:shadow-[2px_2px_0px_0px_#1C1C1C] disabled:opacity-40"
            title="Emoji"
            onClick={() => onChange((value || '') + '🙂')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => !disabled && !sending && onSend()}
            disabled={disabled || sending || !value?.trim() || over}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-all ${
              !disabled && value?.trim() && !over
                ? 'border-[#1C1C1C] bg-[#BEF355] text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#1C1C1C] active:translate-y-0 active:shadow-none'
                : 'cursor-not-allowed border-[#1C1C1C]/20 bg-[#F8F7F3] text-[#1C1C1C]/40'
            }`}
            title="Send"
          >
            {sending ? (
              <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#1C1C1C]/30 border-t-[#1C1C1C]" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 text-[11px] font-bold text-[#6B7280]">
        <span className="flex items-center gap-1">
          <kbd className="rounded-md border-2 border-[#1C1C1C] bg-white px-1.5 py-0.5 text-[10px] text-[#1C1C1C] shadow-[1px_1px_0px_0px_#1C1C1C]">↵</kbd> to send
          <span className="mx-1">·</span>
          <kbd className="rounded-md border-2 border-[#1C1C1C] bg-white px-1.5 py-0.5 text-[10px] text-[#1C1C1C] shadow-[1px_1px_0px_0px_#1C1C1C]">⇧↵</kbd> for newline
          <span className="mx-1">·</span>
          <kbd className="rounded-md border-2 border-[#1C1C1C] bg-white px-1.5 py-0.5 text-[10px] text-[#1C1C1C] shadow-[1px_1px_0px_0px_#1C1C1C]">⌘K</kbd> palette
        </span>
        <span className={over ? 'font-black text-red-500' : ''}>
          {value?.length || 0}/{MAX_LEN}
        </span>
      </div>
    </div>
  )
}
