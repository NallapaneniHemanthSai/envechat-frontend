import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dateDividerLabel, displayName } from './chatUtils'
import {
  Avatar,
  DateSeparator,
  MessageCluster,
  SystemRow,
  TypingRow,
  UnreadSeparator,
} from './ChatPrimitives'

function buildGroups(messages) {
  const groups = []
  messages.forEach((msg) => {
    if (msg.type === 'JOIN' || msg.type === 'LEAVE') {
      groups.push({ kind: 'system', msg })
      return
    }
    if (msg.type === 'TYPING') return
    const last = groups[groups.length - 1]
    if (last && last.kind === 'cluster' && last.sender === msg.senderUsername) {
      last.msgs.push(msg)
    } else {
      groups.push({ kind: 'cluster', sender: msg.senderUsername, msgs: [msg] })
    }
  })
  return groups
}

function flattenWithDates(groups) {
  const rows = []
  let lastDay = null
  groups.forEach((g, idx) => {
    if (g.kind === 'system') {
      rows.push({ kind: 'system', key: `sys-${idx}`, msg: g.msg })
      return
    }
    const ts = g.msgs[0]?.sentAt
    if (ts) {
      const day = new Date(ts).toDateString()
      if (day !== lastDay) {
        lastDay = day
        rows.push({ kind: 'date', key: `d-${day}-${idx}`, label: dateDividerLabel(ts) })
      }
    }
    rows.push({ kind: 'cluster', key: `c-${idx}`, ...g })
  })
  return rows
}

export default function ChatMessageList({
  messages,
  username,
  typingUsers,
  welcomeRoomName,
  hasRoom,
  onScrollState,
  currentUserAvatarUrl,
}) {
  const scrollerRef = useRef(null)
  const endRef = useRef(null)
  const [atBottom, setAtBottom] = useState(true)
  const [showUnreadLine, setShowUnreadLine] = useState(false)
  const prevLen = useRef(0)

  const groups = useMemo(() => buildGroups(messages), [messages])
  const rows = useMemo(() => flattenWithDates(groups), [groups])

  const checkBottom = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return true
    const threshold = 120
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    const fn = () => scrollToBottom()
    window.addEventListener('envechat:scroll-bottom', fn)
    return () => window.removeEventListener('envechat:scroll-bottom', fn)
  }, [scrollToBottom])

  const onScroll = useCallback(() => {
    const bottom = checkBottom()
    setAtBottom(bottom)
    onScrollState?.(bottom)
    if (bottom) setShowUnreadLine(false)
  }, [checkBottom, onScrollState])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [onScroll])

  useEffect(() => {
    if (messages.length > prevLen.current && prevLen.current > 0) {
      if (checkBottom()) scrollToBottom()
      else {
        setShowUnreadLine(true)
      }
    }
    prevLen.current = messages.length
  }, [messages, checkBottom, scrollToBottom])

  useEffect(() => {
    scrollToBottom('auto')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- room switch
  }, [welcomeRoomName])

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollerRef}
        className="custom-scroll h-full overflow-y-auto overscroll-contain px-3 pb-2 pt-3 md:px-5"
      >
        {!hasRoom && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-600" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-300">No channel selected</p>
            <p className="max-w-xs text-sm text-slate-500">Pick a channel from the sidebar or create one.</p>
          </div>
        )}

        {hasRoom && messages.length === 0 && (
          <div className="border-b border-white/[0.06] pb-6">
            <p className="font-mono text-5xl font-extrabold text-[#0f2744]">#</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
              Welcome to #{welcomeRoomName}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
              This is the start of <span className="font-medium text-slate-400">#{welcomeRoomName}</span>.
              Send a message to kick things off.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <Avatar name={username} avatarUrl={currentUserAvatarUrl} size={40} radius={10} />
              <div className="text-left text-sm text-slate-400">
                <span className="font-medium text-slate-200">Tip:</span> Press{' '}
                <kbd className="rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
                  Enter
                </kbd>{' '}
                to send,{' '}
                <kbd className="rounded border border-white/15 bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
                  Shift+Enter
                </kbd>{' '}
                for a new line.
              </div>
            </div>
          </div>
        )}

        {hasRoom &&
          rows.map((row) => {
            if (row.kind === 'date') {
              return <DateSeparator key={row.key} label={row.label} />
            }
            if (row.kind === 'system') {
              const { msg } = row
              const text =
                msg.type === 'JOIN'
                  ? `${displayName(msg.senderUsername)} joined`
                  : `${displayName(msg.senderUsername)} left`
              return <SystemRow key={row.key}>{text}</SystemRow>
            }
            return (
              <MessageCluster
                key={row.key}
                msgs={row.msgs}
                own={row.sender === username}
                avatarUrl={row.sender === username ? currentUserAvatarUrl : null}
              />
            )
          })}

        {showUnreadLine && !atBottom && <UnreadSeparator />}
        <TypingRow names={typingUsers} />
        <div ref={endRef} className="h-2 shrink-0" />
      </div>

      {hasRoom && !atBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0b1524]/95 text-slate-200 shadow-lg backdrop-blur transition hover:border-blue-500/40 hover:text-white"
          title="Jump to latest"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
