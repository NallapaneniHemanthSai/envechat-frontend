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
      className={`flex shrink-0 select-none items-center justify-center font-black text-[#1C1C1C] bg-[#BEF355] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.4,
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
    <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-[#1C1C1C] bg-white px-5 py-3 motion-safe:animate-[messageSlide_0.35s_ease-out_both]">
      <div className="flex min-w-0 items-center gap-3 text-sm font-bold text-[#1C1C1C]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="2.5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="min-w-0 leading-snug">
          Server cold-start —{' '}
          <strong className="text-[#1C1C1C] bg-[#BEF355] px-2 py-0.5 border-2 border-[#1C1C1C] rounded-md">
            {elapsed >= TOTAL
              ? 'should be ready; try reconnect'
              : `~${m}:${String(sec).padStart(2, '0')} remaining`}
          </strong>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="h-3 w-32 overflow-hidden rounded-full border-2 border-[#1C1C1C] bg-[#F8F7F3]">
          <div
            className="h-full bg-[#BEF355] border-r-2 border-[#1C1C1C] transition-[width] duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          className="rounded-lg border-2 border-[#1C1C1C] p-1 font-black text-[#1C1C1C] hover:bg-[#BEF355] hover:shadow-[2px_2px_0px_0px_#1C1C1C] transition-all"
          onClick={onDismiss}
          title="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
    <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-[#1C1C1C] bg-[#1C1C1C] px-5 py-3 text-sm font-bold text-white">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border-2 border-[#1C1C1C] bg-[#BEF355] text-[#1C1C1C] px-3 py-1 text-xs font-black shadow-[2px_2px_0px_0px_#FFFFFF] hover:-translate-y-0.5 transition-all"
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
      className={`group/msg flex gap-3 py-1 ${own ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-10 shrink-0 pt-1 md:w-[40px]">
        <Avatar name={first.senderUsername} avatarUrl={avatarUrl} size={40} radius={12} />
      </div>
      <div
        className={`flex min-w-0 max-w-[min(92vw,640px)] flex-col gap-1.5 ${own ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`mb-0.5 flex items-center gap-2 text-xs font-bold text-[#6B7280] ${own ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className="text-[#1C1C1C]">
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
              ? 'rounded-[18px] rounded-br-md'
              : isLast
                ? 'rounded-[18px] rounded-tr-md'
                : 'rounded-[18px] rounded-r-md'
            : isFirst
              ? 'rounded-[18px] rounded-bl-md'
              : isLast
                ? 'rounded-[18px] rounded-tl-md'
                : 'rounded-[18px] rounded-l-md'

          return (
            <div key={mk} className="relative max-w-full">
              <div
                className={`relative border-[3px] px-4 py-2.5 text-[14.5px] leading-relaxed shadow-[4px_4px_0px_0px_#1C1C1C] transition-all font-medium ${br} ${
                  own
                    ? 'border-[#1C1C1C] bg-[#BEF355] text-[#1C1C1C]'
                    : 'border-[#1C1C1C] bg-white text-[#1C1C1C]'
                } ${msg._optimistic ? 'opacity-70 border-dashed' : ''}`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#6B7280]">
                  {msg._optimistic && <span className="text-[#1C1C1C]">Sending…</span>}
                  {msg.edited && <span className="italic">(edited)</span>}
                </div>
              </div>
              <div
                className={`pointer-events-none absolute bottom-1 flex gap-1 opacity-0 transition group-hover/msg:pointer-events-auto group-hover/msg:opacity-100 ${own ? '-left-6 -translate-x-full' : '-right-6 translate-x-full'}`}
              >
                <div className="flex rounded-xl border-[3px] border-[#1C1C1C] bg-white p-1 shadow-[4px_4px_0px_0px_#1C1C1C]">
                  {QUICK_REACTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="rounded-lg px-2 py-1 text-sm hover:bg-[#F8F7F3] hover:-translate-y-0.5 transition-all"
                      onClick={() => onToggleReaction(mk, em)}
                    >
                      {em}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded-lg px-3 font-bold text-xs text-[#1C1C1C] hover:bg-[#BEF355] transition-all"
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
                <div className={`mt-2 flex flex-wrap gap-2 ${own ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(rmap).map(([em, n]) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => onToggleReaction(mk, em)}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#1C1C1C] bg-white px-2.5 py-1 text-xs font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] hover:-translate-y-0.5 hover:bg-[#BEF355] transition-all"
                    >
                      <span>{em}</span>
                      <span>{n}</span>
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
    <div className="flex items-center gap-3 py-3 text-xs font-bold text-[#6B7280]">
      <div className="h-[2px] flex-1 bg-[#1C1C1C] opacity-10 border-dashed" />
      <span className="shrink-0">{children}</span>
      <div className="h-[2px] flex-1 bg-[#1C1C1C] opacity-10 border-dashed" />
    </div>
  )
}

export function DateSeparator({ label }) {
  return (
    <div className="sticky top-0 z-10 flex justify-center py-4">
      <span className="rounded-xl border-[3px] border-[#1C1C1C] bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#1C1C1C] shadow-[4px_4px_0px_0px_#1C1C1C]">
        {label}
      </span>
    </div>
  )
}

export function TypingRow({ names }) {
  if (!names?.length) return null
  return (
    <div className="flex items-center gap-3 py-2 pl-[52px] text-[13px] font-bold text-[#6B7280]">
      <div className="flex gap-1 rounded-full border-2 border-[#1C1C1C] bg-white px-2.5 py-1.5 shadow-[2px_2px_0px_0px_#1C1C1C]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#1C1C1C]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span>
        <span className="text-[#1C1C1C]">{names.map(displayName).join(', ')}</span> {names.length === 1 ? 'is' : 'are'} typing…
      </span>
    </div>
  )
}

export function UnreadSeparator() {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-[3px] flex-1 bg-[#BEF355] border-t border-b border-[#1C1C1C]" />
      <span className="shrink-0 rounded-lg border-2 border-[#1C1C1C] bg-[#BEF355] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C]">
        New messages
      </span>
      <div className="h-[3px] flex-1 bg-[#BEF355] border-t border-b border-[#1C1C1C]" />
    </div>
  )
}
