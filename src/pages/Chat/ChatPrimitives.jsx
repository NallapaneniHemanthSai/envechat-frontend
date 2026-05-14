import { displayName, fmtTime, getGrad, initials, messageKey } from './chatUtils'
import { motion } from 'framer-motion'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉']

export function Avatar({ name, avatarUrl, size = 34, radius = 9, className = '' }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={`shrink-0 select-none object-cover ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
        }}
        onError={(e) => {
          // Fallback to gradient if image fails to load
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'flex';
          }
        }}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 select-none items-center justify-center font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: getGrad(name),
        fontSize: size * 0.33,
        letterSpacing: '-0.02em',
        display: avatarUrl ? 'none' : 'flex'
      }}
    >
      {initials(name)}
    </div>
  )
}

export function ColdStartBanner({ elapsed, onDismiss }) {
  const TOTAL = 120
  const pct = Math.min((elapsed / TOTAL) * 100, 100)
  const remaining = TOTAL - elapsed
  const m = Math.floor(remaining / 60)
  const sec = remaining % 60
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-blue-500/20 bg-blue-950/40 px-4 py-2.5 backdrop-blur-md duration-300 motion-safe:animate-[messageSlide_0.35s_ease-out_both]">
      <div className="flex min-w-0 items-center gap-2 text-xs text-blue-200">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="min-w-0 leading-snug">
          Server cold-start —{' '}
          <strong className="text-blue-100">
            {elapsed >= TOTAL
              ? 'should be ready; try reconnect from the banner'
              : `~${m}:${String(sec).padStart(2, '0')} remaining`}
          </strong>
          <span className="text-slate-500"> · Free-tier wakeup</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-slate-300"
          onClick={onDismiss}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function ReconnectBanner({ visible, phase, onRetry }) {
  if (!visible) return null
  const label =
    phase === 'error'
      ? 'Realtime connection error'
      : phase === 'disconnected'
        ? 'Disconnected — retrying…'
        : 'Connecting to realtime…'
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/25 bg-amber-950/50 px-4 py-2 text-xs text-amber-100 backdrop-blur">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-amber-500/40 px-2.5 py-1 text-[11px] font-medium text-amber-50 transition hover:bg-amber-500/20"
      >
        Reconnect now
      </button>
    </div>
  )
}

export function MessageCluster({
  msgs,
  own,
  avatarUrl,
  reactions,
  onToggleReaction,
  onReply,
}) {
  const first = msgs[0]
  const showHoverTime = true

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`group/msg flex gap-2.5 py-0.5 ${own ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-9 shrink-0 pt-1 md:w-[34px]">
        <Avatar name={first.senderUsername} avatarUrl={avatarUrl} size={34} radius={9} />
      </div>
      <div
        className={`flex min-w-0 max-w-[min(92vw,640px)] flex-col gap-0.5 ${own ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`mb-0.5 flex items-center gap-2 text-[11px] text-slate-500 ${own ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className={`font-semibold ${own ? 'text-blue-300' : 'text-slate-400'}`}>
            {own ? 'You' : displayName(first.senderUsername)}
          </span>
          {showHoverTime && (
            <span className="opacity-0 transition group-hover/msg:opacity-100">{fmtTime(first.sentAt)}</span>
          )}
        </div>
        {msgs.map((msg, i) => {
          const isFirst = i === 0
          const isLast = i === msgs.length - 1
          const mk = messageKey(msg, i)
          const rmap = reactions[mk] || {}
          const br = own
            ? isFirst
              ? 'rounded-2xl rounded-br-md'
              : isLast
                ? 'rounded-2xl rounded-tr-md'
                : 'rounded-2xl rounded-r-md'
            : isFirst
              ? 'rounded-2xl rounded-bl-md'
              : isLast
                ? 'rounded-2xl rounded-tl-md'
                : 'rounded-2xl rounded-l-md'

          return (
            <div key={mk} className="relative max-w-full">
              <div
                className={`relative border px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm transition ${br} ${
                  own
                    ? 'border-blue-500/25 bg-blue-500/15 text-slate-100'
                    : 'border-white/[0.07] bg-white/[0.04] text-slate-100'
                } ${msg._optimistic ? 'opacity-80 ring-1 ring-blue-400/30' : ''}`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                  {msg._optimistic && <span className="text-blue-300/90">Sending…</span>}
                  {msg.edited && <span className="italic">(edited)</span>}
                </div>
              </div>
              <div
                className={`pointer-events-none absolute bottom-1 flex gap-1 opacity-0 transition group-hover/msg:pointer-events-auto group-hover/msg:opacity-100 ${own ? 'left-1' : 'right-1'}`}
              >
                <div className="flex rounded-full border border-white/10 bg-[#0a1624]/95 p-0.5 shadow-lg backdrop-blur">
                  {QUICK_REACTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="rounded-full px-1.5 py-0.5 text-sm hover:bg-white/10"
                      onClick={() => onToggleReaction(mk, em)}
                    >
                      {em}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded-full px-2 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    onClick={() =>
                      onReply({
                        id: mk,
                        sender: displayName(msg.senderUsername),
                        excerpt: msg.content?.slice(0, 120),
                      })
                    }
                  >
                    Reply
                  </button>
                </div>
              </div>
              {Object.keys(rmap).length > 0 && (
                <div className={`mt-1 flex flex-wrap gap-1 ${own ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(rmap).map(([em, n]) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => onToggleReaction(mk, em)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[12px] text-slate-200 hover:bg-white/10"
                    >
                      <span>{em}</span>
                      <span className="text-[10px] text-slate-400">{n}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export function SystemRow({ children }) {
  return (
    <div className="flex items-center gap-3 py-2 text-[11px] text-slate-500">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="shrink-0">{children}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  )
}

export function DateSeparator({ label }) {
  return (
    <div className="sticky top-0 z-10 flex justify-center py-3">
      <span className="rounded-full border border-white/10 bg-[#050c16]/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 shadow-sm backdrop-blur">
        {label}
      </span>
    </div>
  )
}

export function TypingRow({ names }) {
  if (!names?.length) return null
  return (
    <div className="flex items-center gap-2 py-1 pl-11 text-[12px] italic text-slate-500">
      <div className="flex gap-0.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span>
        {names.map(displayName).join(', ')} {names.length === 1 ? 'is' : 'are'} typing…
      </span>
    </div>
  )
}

export function UnreadSeparator() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-red-500/40" />
      <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300">
        New messages
      </span>
      <div className="h-px flex-1 bg-red-500/40" />
    </div>
  )
}
